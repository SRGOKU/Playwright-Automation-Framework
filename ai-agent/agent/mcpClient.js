
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

let client;
let transport;

async function connectMCP() {
  if (client) return client;

  client = new Client(
    {
      name: 'ai-testing-agent',
      version: '1.0.0'
    },
    {
      capabilities: {}
    }
  );

  transport = new StdioClientTransport({
    command: 'cmd',
    args: ['/c', 'npx', '-y', '@playwright/mcp@latest'],
    cwd: process.cwd()
  });

  await client.connect(transport);

  console.log('Connected to Playwright MCP');

  return client;
}

async function getMCPTools() {
  const mcp = await connectMCP();
  const result = await mcp.listTools();

  return result.tools;
}

async function callMCPTool(name, args = {}) {
  const mcp = await connectMCP();

  return mcp.callTool({
    name,
    arguments: args
  });
}

async function disconnectMCP() {
  if (client) {
    await client.close();
    client = null;
    transport = null;
  }
}

module.exports = {
  connectMCP,
  getMCPTools,
  callMCPTool,
  disconnectMCP
};
