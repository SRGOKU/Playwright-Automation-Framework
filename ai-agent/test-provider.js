
require('dotenv').config();

const { generateText } = require('./providerManager');

async function main() {
  const result = await generateText('Say hello from the AI testing agent.');
  console.log('Provider response:', result);
}

main().catch(console.error);
