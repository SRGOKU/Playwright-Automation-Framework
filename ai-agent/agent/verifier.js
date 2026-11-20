
const { generateText } = require('../providerManager');

function extractJSON(response) {
  if (typeof response !== 'string') {
    throw new Error('Verifier response must be a string.');
  }

  const cleaned = response
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('Verifier returned invalid JSON.');
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new Error('Verifier returned malformed JSON.');
  }
}

function normalizeSnapshot(pageSnapshot) {
  if (typeof pageSnapshot === 'string') {
    return pageSnapshot;
  }

  if (pageSnapshot && Array.isArray(pageSnapshot.content)) {
    return pageSnapshot.content
      .map(item => item.text || '')
      .join('\n');
  }

  return JSON.stringify(pageSnapshot ?? '');
}

function validateResult(result) {
  if (
    !result ||
    typeof result.complete !== 'boolean' ||
    !Array.isArray(result.verified) ||
    !Array.isArray(result.remaining)
  ) {
    throw new Error('Verifier returned an invalid result structure.');
  }

  const validStrings = values =>
    values.every(
      value => typeof value === 'string' && value.trim().length > 0
    );

  if (
    !validStrings(result.verified) ||
    !validStrings(result.remaining)
  ) {
    throw new Error('Verifier returned invalid verification entries.');
  }

  // Never allow completion without verified evidence.
  if (
    result.remaining.length > 0 ||
    result.verified.length === 0
  ) {
    result.complete = false;
  }

  return result;
}

function verifyGoalResponse(response) {
  const result = extractJSON(response);
  return validateResult(result);
}

async function verifyGoal(goal, pageSnapshot, history = []) {
  const snapshot = normalizeSnapshot(pageSnapshot);

  const prompt = `
You are an independent QA test verifier.

ORIGINAL USER GOAL:
${goal}

LATEST WEBSITE SNAPSHOT:
${snapshot.slice(0, 14000)}

EXECUTION HISTORY:
${JSON.stringify(history).slice(0, 5000)}

Evaluate every requirement in the original user goal.

Rules:
1. Identify all separate requested outcomes.
2. Mark an outcome verified only when supported by actual website evidence.
3. An executed click does not prove the requested outcome.
4. Never invent product names, prices or quantities.
5. If information is missing, mark it as remaining.
6. Set complete=true only when every requested outcome is verified.
7. If no outcomes are verified, complete must be false.
8. Be conservative when evidence is unclear.

Return JSON only:

{
  "complete": false,
  "verified": [],
  "remaining": ["Open cart"],
  "reason": "The cart has not been inspected yet."
}
`;

  const response = await generateText(prompt);

  return verifyGoalResponse(response);
}

module.exports = {
  verifyGoal,
  verifyGoalResponse,
  extractJSON,
  normalizeSnapshot
};
