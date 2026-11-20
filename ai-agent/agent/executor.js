
const { callMCPTool } = require('./mcpClient');

async function executeStep(step) {
  console.log(`Executing: ${step.action} → ${step.target || ''}`);

  switch (step.action) {
    case 'navigate': {
      if (!/^https?:\/\//i.test(step.target || '')) {
        throw new Error('Invalid navigation URL');
      }
      return callMCPTool('browser_navigate', { url: step.target });
    }

    case 'click': {
      if (!/^[A-Za-z][A-Za-z0-9]*$/.test(step.ref || '')) {
        throw new Error('Invalid element reference');
      }
      return callMCPTool('browser_click', {
        target: step.ref,
        element: step.target
      });
    }

    case 'fill': {
      if (
        !/^[A-Za-z][A-Za-z0-9]*$/.test(step.ref || '') ||
        typeof step.value !== 'string'
      ) {
        throw new Error('Invalid fill action');
      }
      return callMCPTool('browser_type', {
        target: step.ref,
        element: step.target,
        text: step.value
      });
    }

    case 'snapshot':
      return callMCPTool('browser_snapshot', {});

    case 'assert': {
      if (!/^[A-Za-z][A-Za-z0-9]*$/.test(step.ref || '')) {
        throw new Error('Invalid assertion reference');
      }

      const result = await callMCPTool('browser_snapshot', {});
      const snapshot = (result.content || [])
        .map(item => item.text || '')
        .join('\n');

      if (!snapshot.includes(step.ref)) {
        throw new Error(`Assertion failed: reference not found: ${step.ref}`);
      }

      if (
        typeof step.expectedText === 'string' &&
        !snapshot.toLowerCase().includes(step.expectedText.toLowerCase())
      ) {
        throw new Error(
          `Assertion failed: expected text not found: ${step.expectedText}`
        );
      }

      console.log(`Assertion passed: ${step.target}`);
      return result;
    }

    default:
      throw new Error(`Unsupported action: ${step.action}`);
  }
}

async function executePlan(plan) {
  const results = [];

  for (const step of plan.steps) {
    results.push(await executeStep(step));
  }

  return results;
}

module.exports = { executePlan, executeStep };
