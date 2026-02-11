// server/utils/examEvaluator.js
// Simple semantic evaluator: term-frequency cosine similarity and sentence suggestions

const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
};

const termFreq = (tokens) => {
  const freq = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  return freq;
};

const dotProduct = (a, b) => {
  let s = 0;
  for (const k in a) if (b[k]) s += a[k] * b[k];
  return s;
};

const magnitude = (v) => Math.sqrt(Object.values(v).reduce((s, x) => s + x * x, 0));

const cosineSim = (aTokens, bTokens) => {
  const A = termFreq(aTokens);
  const B = termFreq(bTokens);
  const denom = magnitude(A) * magnitude(B);
  if (denom === 0) return 0;
  return dotProduct(A, B) / denom;
};

export const evaluateAnswer = (answerText, pdfText) => {
  const answerTokens = tokenize(answerText).slice(0, 500);
  const pdfTokens = tokenize(pdfText).slice(0, 5000);

  const similarity = cosineSim(answerTokens, pdfTokens);

  // Find top 3 sentence suggestions from PDF
  const sentences = pdfText.split(/(?<=[.!?])\s+/).filter(Boolean);
  const scored = sentences.map((s) => ({ s, score: cosineSim(answerTokens, tokenize(s)) }));
  scored.sort((a, b) => b.score - a.score);
  const suggestions = scored.slice(0, 3).map(x => x.s.trim());

  // Convert similarity to 0-100 score
  const score = Math.round(Math.min(1, similarity) * 100);

  // Feedback heuristics
  let feedback = 'Answer evaluated against document content.';
  if (score >= 85) feedback = 'Excellent — closely matches document content.';
  else if (score >= 60) feedback = 'Good — covers several relevant points from the document.';
  else if (score >= 35) feedback = 'Partial — includes some relevant points but misses key content.';
  else feedback = 'Insufficient — key information appears missing from your answer.';

  return { score, similarity, feedback, suggestions };
};

export default { evaluateAnswer };
