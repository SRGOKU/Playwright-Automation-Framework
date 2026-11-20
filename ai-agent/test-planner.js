
require('dotenv').config();

const {
  connectMCP,
  disconnectMCP
} = require('./agent/mcpClient');

const { observeWebsite } = require('./agent/observer');
const { createNextAction } = require('./agent/planner');

function getSnapshotText(result) {
  if (typeof result === 'string') {
    return result;
  }

  return (result.content || [])
    .map(item => item.text || '')
    .join('\n');
}

async function main() {
  try {
    console.log('\nConnecting to Playwright MCP...');

    await connectMCP();

    console.log('\nObserving website...');

    const observation = await observeWebsite(
      'https://automationexercise.com'
    );

    const snapshot = getSnapshotText(observation);

    const goal = 'Verify that the Products navigation link is available.';

    console.log('\nGenerating next AI action...');

    const action = await createNextAction(
      snapshot,
      goal,
      []
    );

    console.log('\n===== GEMINI GENERATED NEXT ACTION =====');
    console.log(JSON.stringify(action, null, 2));

  } catch (error) {
    console.error('\nPlanner error:', error.message);
    process.exitCode = 1;

  } finally {
    try {
      await disconnectMCP();
    } catch (cleanupError) {
      console.error('MCP cleanup failed:', cleanupError.message);
    }
  }
}

main();
