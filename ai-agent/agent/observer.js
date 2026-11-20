
const { callMCPTool } = require('./mcpClient');

async function observeWebsite(url) {
  console.log(`Opening website: ${url}`);

  await callMCPTool('browser_navigate', { url });

  const snapshot = await callMCPTool('browser_snapshot', {});

  return snapshot;
}

module.exports = { observeWebsite };
