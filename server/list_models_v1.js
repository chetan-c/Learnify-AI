import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function listModels() {
    try {
        const list = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await list.json();
        fs.writeFileSync('models_list.json', JSON.stringify(data, null, 2));
        console.log("Models list saved to models_list.json");

        const names = data.models.map(m => m.name);
        console.log("MODEL NAMES FOUND:", names);
    } catch (e) {
        console.log("FETCH ERROR:", e.message);
    }
}

listModels();
