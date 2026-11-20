
const OpenAI = require('openai');
const config = require('../config/provider.config');

async function generateText(prompt) {
  if (!config.allowPaidProviders) {
    throw new Error('OpenAI is disabled until free API credits are confirmed.');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing from .env');
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await client.chat.completions.create({
    model: config.openai.model,
    messages: [{ role: 'user', content: prompt }]
  });

  return response.choices[0].message.content;
}

module.exports = { generateText };
