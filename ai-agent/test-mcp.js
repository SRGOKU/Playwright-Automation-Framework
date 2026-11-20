
const {
  connectMCP,
  getMCPTools,
  disconnectMCP
} = require('./agent/mcpClient');

async function main() {
  try {
    await connectMCP();

    const tools = await getMCPTools();

    console.log('\nAvailable Playwright MCP tools:');

    tools.forEach(tool => {
      console.log('-', tool.name);
    });

    console.log('\nTotal tools:', tools.length);
  } catch (error) {
    console.error('MCP connection failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectMCP();
  }
}

main();
