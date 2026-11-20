const {
  connectMCP,
  getMCPTools,
  disconnectMCP
} = require('./agent/mcpClient');

async function main() {
  try {
    await connectMCP();

    const tools = await getMCPTools();

    const toolNames = [
      'browser_navigate',
      'browser_snapshot'
    ];

    for (const name of toolNames) {
      const tool = tools.find(item => item.name === name);

      console.log(`\n${name.toUpperCase()} SCHEMA:`);
      console.log(JSON.stringify(tool, null, 2));
    }
  } catch (error) {
    console.error('Inspection failed:', error.message);
  } finally {
    await disconnectMCP();
  }
}

main();