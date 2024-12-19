import { developerPrompt } from '../../utils/prompt/developer.js'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Request, Response } from 'express';
import dotenv from 'dotenv'
dotenv.config()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export const test = async (req: Request, res: Response) => {
    try {
        const data = req.body.data
        const prompt = developerPrompt(data)
        const result = await model.generateContent(prompt)
        const response = await result.response.text()
        
        console.log('Generated response:', response)
        res.status(200).json({ response: response })
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ error: error })
    }
}