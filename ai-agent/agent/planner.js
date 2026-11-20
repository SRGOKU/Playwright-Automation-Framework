
const { generateText } = require('../providerManager');

function extractJSON(response) {
  if (typeof response !== 'string') {
    throw new Error('Planner response must be a string.');
  }

  const cleaned = response
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('Planner did not return valid JSON.');
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new Error('Planner returned malformed JSON.');
  }
}

async function createNextAction(
  pageSnapshot,
  goal,
  history = [],
  memoryContext = []
) {
  const snapshot = typeof pageSnapshot === 'string'
    ? pageSnapshot
    : JSON.stringify(pageSnapshot ?? '');

  const prompt = `
You are an autonomous AI QA testing agent.

USER TESTING GOAL:
${goal}

CURRENT WEBSITE SNAPSHOT:
${snapshot.slice(0, 7000)}

PREVIOUS ACTIONS:
${JSON.stringify(history).slice(-2000)}

Your task:
1. Understand the complete user testing goal.
2. Inspect the current website snapshot.
3. Decide the SINGLE best next action.
4. Continue toward all requested outcomes.
5. Never assume an action succeeded without observing the result.
6. Return done only when every requested outcome is verified.

RELEVANT PREVIOUS EXECUTION MEMORY:
${JSON.stringify(memoryContext).slice(-3000)}

IMPORTANT MEMORY RULES:
- Use previous memory as background context only.
- The current website snapshot is the source of truth.
- Never assume an old action succeeded in the current session.
- Do not repeat previously failed approaches without a reason.
- Verify every outcome again using current website evidence.

Allowed actions:
- click
- navigate
- fill
- snapshot
- assert
- done

Rules:
- For click, fill and assert, use exact element refs from the current snapshot.
- For fill, provide a string value.
- For navigate, provide a valid HTTP or HTTPS URL.
- Never invent element refs, selectors or URLs.
- Use only evidence from the current snapshot.
- Do not repeat completed actions without a reason.
- After every action, inspect the updated snapshot.
- Never claim information that is not present in the snapshot.
- Break the user's goal into all requested outcomes.
- Complete every requested outcome before returning done.
- An executed click does not prove the requested outcome.
- Do not make purchases, payments, submit orders, create accounts,
  or perform destructive actions.
- Ask for user authorization before such actions.
- If the goal cannot be completed safely, explain why in the reason.
- Return exactly one action per response.

Return JSON only:

{
  "action": "click",
  "target": "Products link",
  "ref": "e17",
  "reason": "Open the products page"
}
`;

  const response = await generateText(prompt);
  const action = extractJSON(response);

  const allowedActions = [
    'click',
    'navigate',
    'fill',
    'snapshot',
    'assert',
    'done'
  ];

  if (
    !action ||
    typeof action !== 'object' ||
    Array.isArray(action)
  ) {
    throw new Error('Planner returned an invalid action object.');
  }

  if (!allowedActions.includes(action.action)) {
    throw new Error(`Unsupported action: ${action.action}`);
  }

  if (['click', 'fill', 'assert'].includes(action.action)) {
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(action.ref || '')) {
      throw new Error(`Invalid or missing element ref: ${action.ref}`);
    }
  }

  if (action.action === 'navigate') {
    if (!/^https?:\/\//i.test(action.target || '')) {
      throw new Error('Invalid navigation URL.');
    }
  }

  if (action.action === 'fill' && typeof action.value !== 'string') {
    throw new Error('Fill action requires a string value.');
  }

  return action;
}

module.exports = {
  createNextAction,
  extractJSON
};
