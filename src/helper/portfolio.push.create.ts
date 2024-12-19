import fs from 'fs/promises';
import path from 'path';
import { deployToVercel } from './vercel.deployment.js';
import { Octokit } from '@octokit/rest';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { developerPrompt } from '../utils/prompt/developer.js';
import { GoogleGenerativeAI } from "@google/generative-ai"

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    request: {
        timeout: 20000,
        retries: 3,
    },
    headers: {
        accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
    }
});
export async function readTemplateFiles(templateDir: string): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    
    async function readDir(currentPath: string, baseDir: string) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            const relativePath = path.relative(baseDir, fullPath);
            
            if (entry.isDirectory()) {
                await readDir(fullPath, baseDir);
            } else {
                const content = await fs.readFile(fullPath, 'utf-8');
                files.set(relativePath, content);
            }
        }
    }
    
    await readDir(templateDir, templateDir);
    return files;
}

async function injectDataIntoTemplate(templateFiles: Map<string, string>, formattedData: any): Promise<Map<string, string>> {
    const updatedFiles = new Map<string, string>();

    // First, handle the base template files
    for (const [filePath, content] of templateFiles) {
        if (!filePath.startsWith('components/developer/')) {
            updatedFiles.set(filePath, content);
        }
    }

    // Create the main page components in the app directory
    const pageComponents = {
        'app/page.tsx': `
import { content } from '../content/data'
import HomeComponent from '../components/Home'

export default function HomePage() {
    return <HomeComponent content={content.home} />
}`,
        'app/about/page.tsx': `
import { content } from '../../content/data'
import AboutMeComponent from '../../components/AboutMe'

export default function AboutPage() {
    return <AboutMeComponent content={content.aboutMe} />
}`,
        'app/skills/page.tsx': `
import { content } from '../../content/data'
import SkillsComponent from '../../components/Skills'

export default function SkillsPage() {
    return <SkillsComponent content={content.skills} />
}`,
        'app/work/page.tsx': `
import { content } from '../../content/data'
import WorkComponent from '../../components/Work'

export default function WorkPage() {
    return <WorkComponent content={content.work} />
}`,
        'app/contact/page.tsx': `
import { content } from '../../content/data'
import ContactComponent from '../../components/Contact'

export default function ContactPage() {
    return <ContactComponent content={content.contact} />
}`
    };

    // Add the page components
    for (const [filePath, content] of Object.entries(pageComponents)) {
        updatedFiles.set(filePath, content);
    }

    // Move developer components to components folder (without the 'developer' subfolder)
    for (const [filePath, content] of templateFiles) {
        if (filePath.startsWith('components/developer/')) {
            const newPath = 'components/' + filePath.replace('components/developer/', '');
            updatedFiles.set(newPath, content);
        }
    }

    // Add the data file
    updatedFiles.set('content/data.ts', `
export const content = ${JSON.stringify(formattedData, null, 2)}
`);

    // Update layout.tsx to include navigation
    updatedFiles.set('app/layout.tsx', `
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal Portfolio Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              {'<Portfolio />'}
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/about" className="text-sm hover:text-gray-300">
                About
              </Link>
              <Link href="/skills" className="text-sm hover:text-gray-300">
                Skills
              </Link>
              <Link href="/work" className="text-sm hover:text-gray-300">
                Work
              </Link>
              <Link href="/contact" className="text-sm hover:text-gray-300">
                Contact
              </Link>
              <Button className="bg-white text-black hover:bg-gray-200">
                Download CV
              </Button>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}`);

    return updatedFiles;
}

export const createPortfolio = async (req: Request, res: Response) => {
    let hasResponded = false;
    try {
        if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_USERNAME) {
            throw new Error('GitHub credentials are not properly configured');
        }

        const data = req.body.data;
        const prompt = developerPrompt(data);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/```json\s*([\s\S]*)\s*```/);
        const formattedData = jsonMatch ? JSON.parse(jsonMatch[1]) : {};

        // Read template files from both base and developer components
        const baseTemplateDir = path.join(process.cwd(), 'src', 'utils', 'baseComponents');
        const developerTemplateDir = path.join(process.cwd(), 'src', 'utils', 'portfolio_Components', 'developer');

        const baseFiles = await readTemplateFiles(baseTemplateDir);
        const developerFiles = await readTemplateFiles(developerTemplateDir);

        // Merge and structure the files
        const templateFiles = new Map<string, string>();
        
        // Add base files
        for (const [filePath, content] of baseFiles) {
            templateFiles.set(filePath, content);
        }

        // Add developer components to the correct structure
        for (const [filePath, content] of developerFiles) {
            templateFiles.set(`components/developer/${filePath}`, content);
        }

        // Inject the formatted data
        const updatedFiles = await injectDataIntoTemplate(templateFiles, formattedData);

        // Create template repository
        const templateRepoName = `portfolio-${Date.now()}`;
        await octokit.repos.createForAuthenticatedUser({
            name: templateRepoName,
            private: false,
            auto_init: true,
            description: 'Personal Portfolio Website'
        });

        // Wait a bit for repository initialization
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Push files to repository
        for (const [filePath, content] of updatedFiles) {
            try {
                // Skip empty files
                if (!content.trim()) {
                    console.log(`Skipping empty file: ${filePath}`);
                    continue;
                }

                // Try to get existing file's SHA
                let sha: string | undefined;
                try {
                    const { data } = await octokit.repos.getContent({
                        owner: process.env.GITHUB_USERNAME!,
                        repo: templateRepoName,
                        path: filePath,
                    });

                    if (!Array.isArray(data) && 'sha' in data) {
                        sha = data.sha;
                    }
                } catch (error: any) {
                    if (error.status !== 404) {
                        throw error;
                    }
                    // File doesn't exist yet, which is fine
                }

                // Create or update the file
                await octokit.repos.createOrUpdateFileContents({
                    owner: process.env.GITHUB_USERNAME!,
                    repo: templateRepoName,
                    path: filePath,
                    message: `Add ${filePath}`,
                    content: Buffer.from(content).toString('base64'),
                    ...(sha ? { sha } : {})
                });

                console.log(`Successfully pushed: ${filePath}`);
            } catch (error) {
                console.error(`Error pushing file ${filePath}:`, error);
                throw error;
            }
        }

        const templateRepoUrl = `https://github.com/${process.env.GITHUB_USERNAME}/${templateRepoName}`;

        console.log('Repository created successfully. Starting Vercel deployment...');

        // Get deployment result without sending response
        const vercelDeploymentResult = await deployToVercel({
            body: { repoUrl: templateRepoUrl },
        } as Request, {} as Response);

        // Only send response if we haven't already
        if (!hasResponded && !res.headersSent) {
            hasResponded = true;
            res.status(200).json({
                success: true,
                message: 'Template repository created and deployment initiated',
                templateRepoUrl,
                vercelDeployment: vercelDeploymentResult
            });
        }

    } catch (error) {
        console.error('Error creating portfolio:', error);
        // Only send error response if we haven't already sent a response
        if (!hasResponded && !res.headersSent) {
            hasResponded = true;
            res.status(500).json({
                success: false,
                message: 'Failed to create portfolio',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};  