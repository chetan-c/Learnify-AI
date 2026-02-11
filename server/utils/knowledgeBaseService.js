// server/utils/knowledgeBaseService.js

import { generateGroqText, isGroqConfigured } from '../config/groq.js';
import { generateKnowledgeBasePrompt } from './promptEngine.js';

/**
 * Extracts structured data from PDF text using AI.
 * @param {string} text - Raw extracted text from PDF
 * @returns {Promise<Object>} - Topics, concepts, and summary
 */
export const extractKnowledgeBase = async (text) => {
    try {
        console.log(`[KB Service] Starting extraction. Text sample size: ${text.length} chars`);
        const sampleText = text.substring(0, 25000);
        const prompt = generateKnowledgeBasePrompt(sampleText);

        if (!isGroqConfigured()) {
            console.warn('[KB Service] GROQ_API_KEY not configured. Skipping knowledge base extraction.');
            return { topics: [], concepts: [], summary: '' };
        }

        console.log(`[KB Service] Calling Groq...`);
        const responseText = await generateGroqText(prompt);
        console.log(`[KB Service] AI Response received.`);

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log(`[KB Service] Successfully parsed KB data: ${parsed.topics?.length} topics found.`);
            return parsed;
        }

        console.warn(`[KB Service] No JSON block found in AI response.`);
        return { topics: [], concepts: [], summary: '' };
    } catch (error) {
        console.error('[KB Service] CRITICAL ERROR:', error.message);
        return { topics: [], concepts: [], summary: 'Extraction failed: ' + error.message };
    }
};
