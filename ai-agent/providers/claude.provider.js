
const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config/provider.config');

async function generateText(prompt) {
  if (!config.allowPaidProviders) {
    throw new Error('Claude is disabled until free API credits are confirmed.');
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is missing from .env');
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const response = await client.messages.create({
    model: config.claude.model,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }]
  });

  return response.content
    .filter(item => item.type === 'text')
    .map(item => item.text)
    .join('\n');
}

module.exports = { generateText };
