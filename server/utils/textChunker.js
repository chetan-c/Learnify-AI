// server/utils/textChunker.js

export const chunkText = (text, chunkSize = 1000) => {
  const chunks = [];

  if (!text) return chunks;

  let startIndex = 0;

  while (startIndex < text.length) {
    chunks.push(text.slice(startIndex, startIndex + chunkSize));
    startIndex += chunkSize;
  }

  return chunks;
};
