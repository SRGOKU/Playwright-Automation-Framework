
const config = require('./config/provider.config');

const providers = {
  mock: require('./providers/mock.provider'),
  gemini: require('./providers/gemini.provider'),
  claude: require('./providers/claude.provider'),
  openai: require('./providers/openai.provider')
};

async function generateText(prompt) {
  const providerName = config.activeProvider;
  const provider = providers[providerName];

  if (!provider) {
    throw new Error(`Unknown AI provider: ${providerName}`);
  }

  return provider.generateText(prompt);
}

module.exports = { generateText };
