import { Request, Response } from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

interface VercelError {
    message: string;
}

interface GitHubRepo {
    id: number;
}

interface VercelDeployment {
    id: string;
    url: string;
    readyState: 'INITIALIZING' | 'BUILDING' | 'ERROR' | 'READY' | 'CANCELED';
    name: string;
}

interface VercelDeploymentStatus {
    readyState: 'INITIALIZING' | 'BUILDING' | 'ERROR' | 'READY' | 'CANCELED';
    url: string;
}

export const deployToVercel = async (req: Request, res: Response) => {
    try {
        if (!process.env.VERCEL_TOKEN || !process.env.GITHUB_TOKEN) {
            throw new Error('Vercel token or GitHub token is not configured');
        }

        const { repoUrl } = req.body;

        if (!repoUrl) {
            throw new Error('Repository URL is required');
        }

        console.log('Starting Vercel deployment...');
        console.log('Repository URL:', repoUrl);

        // Extract owner and repo name from GitHub URL
        const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');

        // First, fetch the repository ID from GitHub
        const githubResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!githubResponse.ok) {
            throw new Error('Failed to fetch repository information from GitHub');
        }

        const githubRepo = await githubResponse.json() as GitHubRepo
        const repoId = githubRepo.id;

        // Create deployment using Vercel API
        const response = await fetch('https://api.vercel.com/v13/deployments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: repo,
                gitSource: {
                    type: 'github',
                    repo: `${owner}/${repo}`,
                    ref: 'main',
                    repoId: repoId.toString() // Add the repoId here
                },
                projectSettings: {
                    framework: 'nextjs',
                    buildCommand: 'npm run build',
                    outputDirectory: '.next',
                    installCommand: 'npm install'
                },
                target: 'production'
            })
        });

        if (!response.ok) {
            const error = await response.json() as VercelError;
            console.error('Vercel API Error:', error);
            throw new Error(`Vercel API error: ${error.message || 'Unknown error'}`);
        }

        const deployment = await response.json() as VercelDeployment;
        console.log('Deployment created:', deployment);

        // Poll deployment status
        let status = deployment.readyState;
        let deploymentUrl = deployment.url;

        while (status === 'INITIALIZING' || status === 'BUILDING') {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

            const statusResponse = await fetch(`https://api.vercel.com/v13/deployments/${deployment.id}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
                }
            });

            if (!statusResponse.ok) {
                console.warn('Failed to check deployment status');
                break;
            }

            const statusData = await statusResponse.json() as VercelDeploymentStatus;
            status = statusData.readyState;
            deploymentUrl = statusData.url;
            console.log('Deployment status:', status);
        }

        return {
            success: true,
            message: 'Deployment initiated successfully',
            deploymentUrl: `https://${deploymentUrl}`,
            deploymentId: deployment.id,
            status
        };

    } catch (error) {
        throw error;
    }
};