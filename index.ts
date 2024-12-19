import * as dotenv from 'dotenv';
import express from 'express';
import { portfolioRoutes } from './src/api/routes/portfolio.routes.js';
import cors from 'cors';
// Load environment variables before anything else
dotenv.config();

// Verify environment variables are loaded
console.log('Environment Check:');
console.log('GITHUB_TOKEN exists:', !!process.env.GITHUB_TOKEN);
console.log('GITHUB_USERNAME:', process.env.GITHUB_USERNAME);

const app = express();

// Configure CORS
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Configure request size limits - set to 10MB for files
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api', portfolioRoutes);

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});