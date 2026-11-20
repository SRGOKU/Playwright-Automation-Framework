
require('dotenv').config();

const readline = require('readline/promises');
const { stdin, stdout } = require('process');

const {
  connectMCP,
  callMCPTool,
  disconnectMCP
} = require('./agent/mcpClient');

const { observeWebsite } = require('./agent/observer');
const { createNextAction } = require('./agent/planner');
const { executeStep } = require('./agent/executor');
const { verifyGoal } = require('./agent/verifier');
const { saveMemory, readMemory } = require('./agent/memory');

const playwrightConfig = require('../playwright.config.js');

const MAX_STEPS = 12;

const rl = readline.createInterface({ input: stdin, output: stdout });

function getSnapshotText(result) {
  if (!result || !Array.isArray(result.content)) {
    return '';
  }

  return result.content
    .map(item => item.text || '')
    .join('\n');
}

// Normalize MCP results and text snapshots into one format.
function normalizeSnapshot(result) {
  if (typeof result === 'string') {
    return result;
  }

  return getSnapshotText(result);
}

function getRelevantMemory(websiteUrl, goal) {
  const normalizedGoal = goal.trim().toLowerCase();

  return readMemory()
    .filter(record =>
      record.websiteUrl === websiteUrl &&
      typeof record.goal === 'string' &&
      record.goal.trim().toLowerCase() === normalizedGoal
    )
    .slice(-3)
    .map(record => ({
      timestamp: record.timestamp,
      status: record.status,
      error: typeof record.error === 'string'
        ? record.error.slice(0, 500)
        : '',
      history: Array.isArray(record.history)
        ? record.history.slice(-8)
        : []
    }));
}

async function main() {
  const websiteUrl = playwrightConfig.use?.baseURL;

  let goal = '';
  let currentGoal = '';

  const history = [];
  const recentActions = new Map();

  try {
    console.log('\n================================');
    console.log('      AUTONOMOUS AI TEST AGENT');
    console.log('================================');

    if (!websiteUrl) {
      throw new Error('BASE_URL is missing from .env');
    }

    console.log(`\nWebsite: ${websiteUrl}`);

    goal = (await rl.question('\nWhat would you like me to test? ')).trim();

    if (!goal) {
      throw new Error('Testing instruction cannot be empty.');
    }

    currentGoal = goal;
    const memoryContext = getRelevantMemory(websiteUrl, goal);

    console.log(`Previous matching executions found: ${memoryContext.length}`);

    console.log('\nConnecting to Playwright MCP...');
    await connectMCP();

    console.log('\nObserving website...');

    let snapshot = normalizeSnapshot(
      await observeWebsite(websiteUrl)
    );

    let completed = false;

    for (let stepNumber = 1; stepNumber <= MAX_STEPS; stepNumber++) {
      console.log(`\n========== AI STEP ${stepNumber} ==========`);

      const action = await createNextAction(
        snapshot,
        currentGoal,
        history,
        memoryContext
      );

      console.log('\nGEMINI DECISION:');
      console.log(JSON.stringify(action, null, 2));

      // Independently verify whether all requested outcomes are complete.
      if (action.action === 'done') {
        console.log('\nChecking completion independently...');

        const verification = await verifyGoal(
          goal,
          snapshot,
          history
        );

        console.log('\nVERIFICATION RESULT:');
        console.log(JSON.stringify(verification, null, 2));

        if (verification.complete) {
          completed = true;

          console.log('\nAll requested outcomes are verified.');
          break;
        }

        console.log('\nTask is not complete. Continuing...');

        history.push({
          step: stepNumber,
          action: 'verification',
          result: 'incomplete',
          verified: verification.verified,
          remaining: verification.remaining
        });

        currentGoal = `
Original user goal:
${goal}

The independent verifier found these outstanding requirements:
${verification.remaining.map(item => `- ${item}`).join('\n')}

Continue working on the outstanding requirements.
Do not repeat already verified work.
Do not return done until the outstanding requirements are completed.
`;

        continue;
      }

      // Prevent excessive repetition of identical actions.
      const actionKey = `${action.action}:${action.ref || action.target || ''}`;

      const repeatCount = recentActions.get(actionKey) || 0;

      if (repeatCount >= 2) {
        throw new Error(
          `Repeated action limit reached: ${actionKey}. Stopping to prevent an infinite loop.`
        );
      }

      recentActions.set(actionKey, repeatCount + 1);

      console.log('\nEXECUTING ACTION...');

      const result = await executeStep(action);

      history.push({
        step: stepNumber,
        action: action.action,
        target: action.target || '',
        reason: action.reason || '',
        result: 'executed'
      });

      // Observe the updated website after every action.
      if (action.action === 'snapshot') {
        snapshot = normalizeSnapshot(result);
      } else {
        const updatedPage = await callMCPTool(
          'browser_snapshot',
          {}
        );

        snapshot = normalizeSnapshot(updatedPage);
      }

      console.log('\nUPDATED PAGE OBSERVED.');
    }

    // Save the final agent execution status.
    const status = completed ? 'completed' : 'not_verified';

    saveMemory({
      websiteUrl,
      goal,
      history,
      status
    });

    console.log('\n================================');
    console.log('           AGENT REPORT');
    console.log('================================');

    console.log(`Website: ${websiteUrl}`);
    console.log(`Goal: ${goal}`);

    console.log(
      `Actions executed: ${history.filter(item => item.result === 'executed').length}`
    );

    console.log(`Status: ${status}`);

    if (completed) {
      console.log('\nTEST PASSED: All requested outcomes verified.');
    } else {
      console.log('\nTEST NOT VERIFIED: The agent did not confirm all requested outcomes.');
      process.exitCode = 1;
    }

    console.log('\nACTION HISTORY:');
    console.log(JSON.stringify(history, null, 2));

  } catch (error) {
    console.error('\nAGENT FAILED:', error.message);

    try {
      saveMemory({
        websiteUrl,
        goal,
        history,
        status: 'failed',
        error: error.message
      });
    } catch (memoryError) {
      console.error('Memory save failed:', memoryError.message);
    }

    process.exitCode = 1;

  } finally {
    rl.close();

    try {
      await disconnectMCP();
    } catch (cleanupError) {
      console.error(
        'MCP cleanup failed:',
        cleanupError.message
      );
    }
  }
}

main();
