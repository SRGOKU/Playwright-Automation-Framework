
const { GoogleGenAI } = require('@google/genai');
const config = require('../config/provider.config');

const MAX_RETRIES = 2;
const MAX_REQUESTS_PER_RUN = 8;

let requestCount = 0;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isTemporaryError(error) {
  const message = `${error.message || ''} ${JSON.stringify(error)}`;

  if (
    message.includes('PerDay') ||
    message.includes('per day limit exceeded') ||
    message.includes('GenerateRequestsPerDay')
  ) {
    return false;
  }

  return (
    message.includes('503') ||
    message.includes('UNAVAILABLE') ||
    message.includes('high demand')
  );
}

async function generateText(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from .env');
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (requestCount >= MAX_REQUESTS_PER_RUN) {
      throw new Error('Gemini request budget reached for this run.');
    }

    requestCount++;

    try {
      console.log(
        `Gemini request ${requestCount}/${MAX_REQUESTS_PER_RUN}`
      );

      const response = await ai.models.generateContent({
        model: config.gemini.model,
        contents: prompt
      });

      if (!response.text) {
        throw new Error('Gemini returned an empty response.');
      }

      return response.text;

    } catch (error) {
      if (!isTemporaryError(error) || attempt === MAX_RETRIES) {
        throw error;
      }

      const delay = 2000 * attempt;

      console.log(`Temporary Gemini error. Retrying in ${delay / 1000}s...`);

      await wait(delay);
    }
  }
}

module.exports = { generateText };
