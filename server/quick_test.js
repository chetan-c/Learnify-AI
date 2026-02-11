import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function quickTest() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Testing key:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');

    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

    for (const modelName of models) {
        try {
            console.log(`Checking ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello.");
            const response = await result.response;
            console.log(`✅ ${modelName} SUCCESS:`, response.text());
            break; // Stop if we find a working one
        } catch (e) {
            console.log(`❌ ${modelName} FAILED:`, e.message);
        }
    }
}

quickTest();
