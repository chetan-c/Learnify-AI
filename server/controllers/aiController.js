// server/controllers/aiController.js

import PDF from '../models/PDF.js';
import { generateGroqText, isGroqConfigured, isGroqHealthy } from '../config/groq.js';
import * as Prompts from '../utils/promptEngine.js';

// Helper to get PDF and validate context
const getPDFContext = async (pdfId) => {
  console.log(`[AI Controller] Fetching PDF context for ID: ${pdfId}`);
  const pdf = await PDF.findById(pdfId);
  if (!pdf) {
    console.error(`[AI Controller] PDF not found: ${pdfId}`);
    throw new Error('PDF not found');
  }
  if (!pdf.extractedText || pdf.extractedText.trim().length === 0) {
    console.error(`[AI Controller] PDF text is empty or missing for ID: ${pdfId}`);
    throw new Error('PDF text not processed yet or empty');
  }
  console.log(`[AI Controller] PDF found. Extracted text length: ${pdf.extractedText.length} chars`);
  return pdf;
};

// Helper to extract JSON from AI response robustly
const parseAIJSON = (text) => {
  try {
    console.log(`[AI Controller] Attempting to parse JSON from AI response...`);
    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn(`[AI Controller] No JSON structure found in AI response.`);
      return null;
    }
    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`[AI Controller] JSON parsed successfully.`);
    return parsed;
  } catch (e) {
    console.error(`[AI Controller] JSON Parse Error:`, e.message);
    console.error(`[AI Controller] Raw AI text that failed parsing:`, text.substring(0, 500));
    return null;
  }
};

// @route   POST /api/ai/ask
// @access  Private (Subscription/Trial required)
export const askAI = async (req, res) => {
  try {
    // Check if Groq is configured
    if (!isGroqConfigured()) {
      return res.status(500).json({ message: 'AI service configuration error. Please contact administrator.' });
    }

    // Circuit / health guard
    const health = await isGroqHealthy();
    if (!health.healthy) {
      return res.status(503).json({ message: 'AI temporarily unavailable. Try again later.' });
    }

    const { pdfId, question } = req.body;
    if (!pdfId || !question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ message: 'PDF ID and a non-empty question are required' });
    }

    console.log(`[AI Chat] User Question: "${question}"`);
    const pdf = await getPDFContext(pdfId);
    const context = (pdf.extractedText || '').substring(0, 20000);

    if (!context || context.trim().length === 0) {
      return res.status(400).json({
        message: 'PDF has no readable text',
        error: 'EMPTY_CONTEXT',
      });
    }

    console.log(`[AI Chat] Generating prompt with context window...`);
    const prompt = Prompts.generateTutorPrompt(question, context);

    const response = await generateGroqText({ system: Prompts.generateTutorPrompt('', context), user: question });
    console.log(`[AI Chat] Response received.`);
    res.json({ answer: response });
  } catch (error) {
    console.error(`[AI Chat] Error:`, error);
    const status = error?.status || error?.statusCode || 500;
    const code = error?.code || 'UNKNOWN_ERROR';

    if (code === 'API_KEY_INVALID' || code === 'API_KEY_MISSING') {
      return res.status(401).json({ message: 'Invalid AI configuration' });
    }
    if (code === 'RATE_LIMIT' || status === 429) {
      return res.status(429).json({ message: 'Rate limit exceeded. Try later.' });
    }
    if (code === 'QUOTA_EXCEEDED') {
      return res.status(403).json({ message: 'AI quota exhausted. Please try later.' });
    }
    if (code === 'MODEL_DECOMMISSIONED') {
      return res.status(503).json({ message: 'AI model unavailable. Try again later.' });
    }
    if (code === 'SERVICE_UNAVAILABLE' || status === 503) {
      return res.status(503).json({ message: 'AI temporarily unavailable. Try again later.' });
    }

    // PDF-specific
    if (error.message && error.message.toLowerCase().includes('pdf')) {
      if (error.message.toLowerCase().includes('not found')) return res.status(404).json({ message: 'PDF not found' });
      if (error.message.toLowerCase().includes('empty')) return res.status(400).json({ message: 'PDF has no readable text' });
    }

    res.status(500).json({ message: 'AI Tutor encountered an error. Please ensure your PDF has readable text.' });
  }
};

// @route   POST /api/ai/generate-mcqs
export const generateMCQs = async (req, res) => {
  try {
    if (!isGroqConfigured()) return res.status(500).json({ message: 'AI service configuration error.' });
    const health = await isGroqHealthy();
    if (!health.healthy) return res.status(503).json({ message: 'AI temporarily unavailable. Try again later.' });

    const { pdfId, difficulty = 'medium', count = 5 } = req.body;

    if (!pdfId) {
      return res.status(400).json({ message: 'PDF ID is required' });
    }

    const safeCount = Number.isFinite(Number(count)) && Number(count) > 0 ? Math.min(Number(count), 50) : 5;
    const safeDifficulty = typeof difficulty === 'string' && difficulty.trim()
      ? difficulty.trim().toLowerCase()
      : 'medium';

    console.log(`[AI MCQs] Request - Difficulty: ${safeDifficulty}, Count: ${safeCount}`);
    const pdf = await getPDFContext(pdfId);

    const context = (pdf.extractedText || '').substring(0, 30000);
    if (!context || context.trim().length === 0) {
      return res.status(400).json({
        message: 'PDF has no readable text',
        error: 'EMPTY_CONTEXT',
      });
    }
    const prompt = Prompts.generateMCQPrompt(context, safeDifficulty, safeCount);

    console.log(`[AI MCQs] Calling Groq...`);
    const text = await generateGroqText({
      system: `You are an MCQ generator. GENERATE QUESTIONS ONLY FROM THE PDF CONTENT PROVIDED.
⚠️  MANDATORY RULES:
1. Every question and option MUST come from the PDF.
2. NEVER invent questions, facts, or use external knowledge.
3. If insufficient content, generate fewer questions.
4. Output ONLY valid JSON array. No markdown.`,
      user: prompt
    });

    const mcqs = parseAIJSON(text);
    if (!mcqs || (Array.isArray(mcqs) && mcqs.length === 0)) {
      console.warn('[AI MCQs] Parsed JSON was empty or invalid.');
      return res.status(500).json({
        message: 'Failed to generate valid MCQs from the document content. Please try again or use a different PDF.',
      });
    }

    res.json(mcqs);
  } catch (error) {
    console.error(`[AI MCQs] Error:`, error);
    const status = error?.status || 500;
    const code = error?.code || 'UNKNOWN_ERROR';
    if (code === 'API_KEY_INVALID' || code === 'API_KEY_MISSING') return res.status(401).json({ message: 'Invalid AI configuration' });
    if (code === 'RATE_LIMIT') return res.status(429).json({ message: 'Rate limit exceeded. Try later.' });
    if (code === 'QUOTA_EXCEEDED') return res.status(403).json({ message: 'AI quota exhausted. Try again later.' });
    if (code === 'MODEL_DECOMMISSIONED' || status === 503) return res.status(503).json({ message: 'AI temporarily unavailable. Try again later.' });
    if (error.message && error.message.toLowerCase().includes('pdf')) {
      if (error.message.toLowerCase().includes('not found')) return res.status(404).json({ message: 'PDF not found' });
      if (error.message.toLowerCase().includes('empty')) return res.status(400).json({ message: 'PDF has no readable text' });
    }
    return res.status(500).json({ message: 'Failed to generate MCQs from document content.' });
  }
};

// @route   POST /api/ai/generate-exam
export const generateExam = async (req, res) => {
  try {
    if (!isGroqConfigured()) return res.status(500).json({ message: 'AI service configuration error.' });
    const health = await isGroqHealthy();
    if (!health.healthy) return res.status(503).json({ message: 'AI temporarily unavailable. Try again later.' });

    const { pdfId, duration = 30, count = 10, difficulty = 'medium' } = req.body;

    if (!pdfId) {
      return res.status(400).json({ message: 'PDF ID is required' });
    }

    const safeDuration = Number.isFinite(Number(duration)) && Number(duration) > 0
      ? Math.min(Number(duration), 180)
      : 30;
    const safeCount = Number.isFinite(Number(count)) && Number(count) > 0
      ? Math.min(Number(count), 50)
      : 10;
    const safeDifficulty = typeof difficulty === 'string' && difficulty.trim()
      ? difficulty.trim().toLowerCase()
      : 'medium';

    console.log(`[AI Exam] Request - Duration: ${safeDuration}, Count: ${safeCount}, Difficulty: ${safeDifficulty}`);
    const pdf = await getPDFContext(pdfId);

    const context = (pdf.extractedText || '').substring(0, 30000);
    if (!context || context.trim().length === 0) {
      return res.status(400).json({
        message: 'PDF has no readable text',
        error: 'EMPTY_CONTEXT',
      });
    }

    const prompt = Prompts.generateExamPrompt(context, {
      duration: safeDuration,
      count: safeCount,
      difficulty: safeDifficulty,
    });

    console.log(`[AI Exam] Calling Groq...`);
    const text = await generateGroqText({
      system: `You are an exam generator. CREATE EXAMS ONLY FROM THE PDF CONTENT PROVIDED.
⚠️  MANDATORY RULES:
1. All questions and answers MUST come from the PDF.
2. NEVER hallucinate, assume, or use external knowledge.
3. If insufficient content, generate fewer questions.
4. Output ONLY valid JSON. No markdown.`,
      user: prompt
    });

    const exam = parseAIJSON(text);
    if (!exam || Object.keys(exam).length === 0) {
      console.warn('[AI Exam] Parsed JSON was empty or invalid.');
      return res.status(500).json({
        message: 'Failed to generate a valid exam paper from the document content. Please try again or use a different PDF.',
      });
    }

    res.json(exam);
  } catch (error) {
    console.error(`[AI Exam] Error:`, error);
    const status = error?.status || 500;
    const code = error?.code || 'UNKNOWN_ERROR';
    if (code === 'API_KEY_INVALID' || code === 'API_KEY_MISSING') return res.status(401).json({ message: 'Invalid AI configuration' });
    if (code === 'RATE_LIMIT') return res.status(429).json({ message: 'Rate limit exceeded. Try later.' });
    if (code === 'QUOTA_EXCEEDED') return res.status(403).json({ message: 'AI quota exhausted. Try again later.' });
    if (code === 'MODEL_DECOMMISSIONED' || status === 503) return res.status(503).json({ message: 'AI temporarily unavailable. Try again later.' });
    if (error.message && error.message.toLowerCase().includes('pdf')) {
      if (error.message.toLowerCase().includes('not found')) return res.status(404).json({ message: 'PDF not found' });
      if (error.message.toLowerCase().includes('empty')) return res.status(400).json({ message: 'PDF has no readable text' });
    }
    return res.status(500).json({ message: 'Failed to generate exam from document content.' });
  }
};

// @route   POST /api/ai/generate-notes
export const generateNotes = async (req, res) => {
  try {
    if (!isGroqConfigured()) return res.status(500).json({ message: 'AI service configuration error.' });
    const health = await isGroqHealthy();
    if (!health.healthy) return res.status(503).json({ message: 'AI temporarily unavailable. Try again later.' });

    const { pdfId, type = 'summary' } = req.body; // type: 'summary' or 'short'

    if (!pdfId) {
      return res.status(400).json({ message: 'PDF ID is required' });
    }

    const safeType = type === 'short' ? 'short' : 'summary';

    console.log(`[AI Notes] Request - Type: ${safeType}`);
    const pdf = await getPDFContext(pdfId);

    const context = (pdf.extractedText || '').substring(0, 30000);
    if (!context || context.trim().length === 0) {
      return res.status(400).json({
        message: 'PDF has no readable text',
        error: 'EMPTY_CONTEXT',
      });
    }

    const prompt = Prompts.generateNotesPrompt(context, safeType);

    console.log(`[AI Notes] Calling Groq...`);
    const notesText = await generateGroqText({
      system: `You are a note generator. CREATE NOTES ONLY FROM THE PDF CONTENT PROVIDED.
⚠️  MANDATORY RULES:
1. All content MUST come from the PDF.
2. NEVER use external knowledge or invent facts.
3. Use clear headings and bullet points.
4. Simple, student-friendly language only.
5. No emojis, marketing language, or self-references.`,
      user: prompt
    });

    if (!notesText || notesText.trim().length < 50) {
      return res.status(500).json({
        message: 'Generated notes were too brief or invalid. Try again with more content or a different PDF.',
      });
    }

    res.json({ notes: notesText });
  } catch (error) {
    console.error(`[AI Notes] Error:`, error);
    const status = error?.status || 500;
    const code = error?.code || 'UNKNOWN_ERROR';
    if (code === 'API_KEY_INVALID' || code === 'API_KEY_MISSING') return res.status(401).json({ message: 'Invalid AI configuration' });
    if (code === 'RATE_LIMIT') return res.status(429).json({ message: 'Rate limit exceeded. Try later.' });
    if (code === 'QUOTA_EXCEEDED') return res.status(403).json({ message: 'AI quota exhausted. Try again later.' });
    if (code === 'MODEL_DECOMMISSIONED' || status === 503) return res.status(503).json({ message: 'AI temporarily unavailable. Try again later.' });
    if (error.message && error.message.toLowerCase().includes('pdf')) {
      if (error.message.toLowerCase().includes('not found')) return res.status(404).json({ message: 'PDF not found' });
      if (error.message.toLowerCase().includes('empty')) return res.status(400).json({ message: 'PDF has no readable text' });
    }
    return res.status(500).json({ message: 'Failed to generate notes from document content.' });
  }
};

// Health endpoint for frontend
export const aiHealth = async (req, res) => {
  try {
    const health = await isGroqHealthy();
    if (!health.healthy) return res.status(503).json({ healthy: false, reason: health.reason || 'unhealthy' });
    return res.json({ healthy: true });
  } catch (error) {
    return res.status(503).json({ healthy: false, reason: 'error' });
  }
};
