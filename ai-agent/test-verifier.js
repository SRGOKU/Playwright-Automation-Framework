
const {
  verifyGoalResponse,
  normalizeSnapshot
} = require('./agent/verifier');

function test(name, callback) {
  try {
    callback();
    console.log(`${name}: PASSED`);
  } catch (error) {
    console.error(`${name}: FAILED - ${error.message}`);
    process.exitCode = 1;
  }
}

console.log('\n===== VERIFIER TESTS =====\n');

test('Incomplete goal detection', () => {
  const result = verifyGoalResponse(JSON.stringify({
    complete: false,
    verified: ['Product added'],
    remaining: ['Open cart'],
    reason: 'Cart not inspected'
  }));

  if (result.complete !== false) {
    throw new Error('Incomplete goal incorrectly marked complete.');
  }
});

test('Complete goal validation', () => {
  const result = verifyGoalResponse(JSON.stringify({
    complete: true,
    verified: ['Product added', 'Cart opened'],
    remaining: [],
    reason: 'All outcomes verified'
  }));

  if (result.complete !== true) {
    throw new Error('Valid completed goal rejected.');
  }
});

test('Completion without evidence rejected', () => {
  const result = verifyGoalResponse(JSON.stringify({
    complete: true,
    verified: [],
    remaining: [],
    reason: 'No evidence'
  }));

  if (result.complete !== false) {
    throw new Error('Completion accepted without evidence.');
  }
});

test('Invalid JSON rejected', () => {
  let rejected = false;

  try {
    verifyGoalResponse('This is not JSON');
  } catch {
    rejected = true;
  }

  if (!rejected) {
    throw new Error('Invalid JSON was accepted.');
  }
});

test('MCP snapshot normalization', () => {
  const result = normalizeSnapshot({
    content: [
      { type: 'text', text: 'Products page' },
      { type: 'text', text: 'Blue Top' }
    ]
  });

  if (!result.includes('Products page') || !result.includes('Blue Top')) {
    throw new Error('MCP snapshot was not normalized correctly.');
  }
});

console.log('\n===== TESTS FINISHED =====');
