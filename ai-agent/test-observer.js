
const {
  connectMCP,
  disconnectMCP
} = require('./agent/mcpClient');

const { observeWebsite } = require('./agent/observer');

async function main() {
  try {
    await connectMCP();

    const pageState = await observeWebsite(
      'https://automationexercise.com'
    );

    console.log('\n===== WEBSITE OBSERVATION =====\n');
    console.log(pageState);

  } catch (error) {
    console.error('Observer failed:', error);
    process.exitCode = 1;
  } finally {
    await disconnectMCP();
  }
}

main();
