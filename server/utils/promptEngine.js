// server/utils/promptEngine.js

export const generateTutorPrompt = (question, context) => `
You are a PDF-based educational assistant. Answer ONLY using content from the provided PDF.

⚠️  MANDATORY RULES (NEVER VIOLATE):
1. ONLY use text explicitly in the PDF.
2. NEVER use external knowledge or assumptions.
3. NEVER invent facts or details.
4. If answer is NOT in PDF, respond: "Not found in the PDF"
5. If PDF is empty, respond: "Insufficient content in the provided PDF."
6. Quote directly from PDF when possible.

PDF CONTENT:
${context}

QUESTION:
${question}
`;

export const generateMCQPrompt = (context, difficulty = 'medium', count = 5) => `
You are an MCQ generator. Create questions ONLY from the provided PDF.

⚠️  MANDATORY RULES (NEVER VIOLATE):
1. EVERY question MUST come from PDF content.
2. EVERY option MUST be sourced from PDF.
3. NEVER invent questions, options, or facts.
4. NEVER use external knowledge.
5. If insufficient content for ${count} questions, generate fewer.
6. Output ONLY valid JSON array. No markdown or code blocks.

JSON FORMAT (ONLY):
[
  {
    "question": "Question from PDF",
    "options": ["A) From PDF", "B) From PDF", "C) From PDF", "D)From PDF"],
    "answer": "A",
    "explanation": "Explanation from PDF"
  }
]

DIFFICULTY: ${difficulty}
TARGET COUNT: ${count}

PDF CONTENT:
${context}
`;

export const generateExamPrompt = (context, params) => `
You are an exam generator. Create a professional exam ONLY from the provided PDF content.

⚠️  MANDATORY RULES (NEVER VIOLATE):
1. All questions and answers MUST come from PDF.
2. NEVER hallucinate, assume, or use external knowledge.
3. NEVER invent facts not in PDF.
4. Question mix:
   - Multiple-choice (MCQs): 4 options, one correct answer
   - Short-answer: Answerable using only PDF, clearly scorable
5. If insufficient content for ${params.count} questions, generate fewer.
6. Output ONLY valid JSON. No markdown.

EXAM PARAMETERS:
- Duration: ${params.duration} minutes
- Target Questions: ${params.count}
- Difficulty: ${params.difficulty}

JSON FORMAT:
{
  "title": "Document Proficiency Exam",
  "instructions": "Answer using only information from the provided PDF.",
  "duration": ${params.duration},
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Question from PDF",
      "options": ["A) From PDF", "B) From PDF", "C) From PDF", "D) From PDF"],
      "answer": "A",
      "points": 2
    },
    {
      "id": 2,
      "type": "short",
      "question": "Short-answer question from PDF",
      "answerKey": "Expected answer sourced from PDF",
      "points": 5
    }
  ]
}

PDF CONTEXT:
${context}
`;

export const generateNotesPrompt = (context, type = 'summary') => `
You are a note generator. Create ${type} study notes ONLY from the provided PDF.

⚠️  MANDATORY RULES (NEVER VIOLATE):
1. All content MUST come from PDF.
2. NEVER use external knowledge or invent facts.
3. NEVER include details not in PDF.
4. Format using clear headings and bullet points.
5. Simple, student-friendly language.
${type === 'short' ? '6. Keep extremely concise (essential points only, 1-2 min read time).' : '6. Comprehensive overview including key concepts and main points.'}
7. No emojis, marketing language, or self-references.

OUTPUT NOTES FROM PDF ONLY:
${context}
`;

export const generateKnowledgeBasePrompt = (text) => `
Analyze the provided text and extract its core structure. Use ONLY information in the text.

** RULES **
1. List main topics directly from the text.
2. List key concepts and definitions as they appear in the text.
3. Summarize using only text content (3-5 sentences).
4. Do NOT add external knowledge or assumptions.

OUTPUT FORMAT (valid JSON):
{
  "topics": ["Topic 1 from text", "Topic 2 from text"],
  "concepts": ["Concept 1: definition", "Concept 2: definition"],
  "summary": "3-5 sentence summary using only text content"
}

TEXT TO ANALYZE:
${text}
`;
