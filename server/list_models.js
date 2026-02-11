import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const list = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await list.json();
        console.log("AVAILABLE MODELS:");
        console.dir(data, { depth: null });
    } catch (e) {
        console.log("FETCH ERROR:");
        console.dir(e, { depth: null });
    }
}

listModels();
