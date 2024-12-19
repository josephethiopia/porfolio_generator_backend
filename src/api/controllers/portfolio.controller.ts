import { Request, Response } from 'express';
import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { deployToVercel } from '../../helper/vercel.deployment.js';
import { GoogleGenerativeAI } from "@google/generative-ai"
import { developerPrompt } from '../../utils/prompt/developer.js';

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
export async function create (req: Request, res: Response) {
    try {
        const data = req.body.data;
        if(data.name === 'developer') {
            const prompt = developerPrompt(data.data)
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
        const jsonMatch = responseText.match(/```json\s*([\s\S]*)\s*```/);
        const formattedData = jsonMatch ? JSON.parse(jsonMatch[1]) : {};

            console.log(result);
             res.status(200).json({
                success: true,
                response: formattedData
            })
        }else{
         res.status(400).json({
            success: false,
            message: 'Invalid portfolio type'
        })}
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create portfolio',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function readTemplateFiles(templateDir: string): Promise<Map<string, string>> {
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

export const createPortfolio = async (req: Request, res: Response) => {
    try {
        if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_USERNAME) {
            throw new Error('GitHub credentials are not properly configured');
        }

        const templateDir = path.join(process.cwd(), 'src', 'utils', 'nextJsTemplate');
        const templateFiles = await readTemplateFiles(templateDir);

        // Create template repository
        const templateRepoName = 'nextjs-portfolio-template';
        try {
            await octokit.repos.createForAuthenticatedUser({
                name: templateRepoName,
                private: false,
                auto_init: true,
                description: 'Next.js Portfolio Template'
            });
            
            console.log('Template repository created successfully');
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error: any) {
            if (error.status === 422) {
                console.log('Template repository might already exist, continuing...');
            } else {
                throw error;
            }
        }

        // Push template files
        for (const [filePath, content] of templateFiles) {
            try {
                // First try to get the file's SHA if it exists
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

                // Skip empty files
                if (!content.trim()) {
                    console.log(`Skipping empty file: ${filePath}`);
                    continue;
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
                console.error(`Error pushing template file ${filePath}:`, error);
                throw error;
            }
        }

        const templateRepoUrl = `https://github.com/${process.env.GITHUB_USERNAME}/${templateRepoName}`;

        console.log('Repository created successfully. Starting Vercel deployment...');

        // Call Vercel deployment
        const vercelResponse = await deployToVercel({
            body: { repoUrl: templateRepoUrl },
        } as Request, res);

        res.status(200).json({
            success: true,
            message: 'Template repository created and deployment initiated',
            templateRepoUrl,
            vercelDeployment: vercelResponse
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create template repository',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};