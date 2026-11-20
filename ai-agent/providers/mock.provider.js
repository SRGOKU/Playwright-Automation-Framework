
async function generateText(prompt) {
  // Handle verification requests.
  if (prompt.includes('independent QA test verifier')) {
    console.log('Mock AI is verifying the website evidence...');

    const snapshotMatch = prompt.match(
      /LATEST WEBSITE SNAPSHOT:\s*([\s\S]*?)\nEXECUTION HISTORY:/
    );

    const snapshot = snapshotMatch ? snapshotMatch[1] : '';
    const found = /Products/i.test(snapshot);

    return JSON.stringify({
      complete: found,
      verified: found
        ? ['Products navigation link is visible in the website snapshot']
        : [],
      remaining: found ? [] : ['Products navigation link visibility'],
      reason: found
        ? 'The latest website snapshot contains the Products navigation link.'
        : 'The latest snapshot does not contain the Products navigation link.'
    });
  }

  // Handle planner requests.
  console.log('Mock AI is analysing the website...');

  const historyMatch = prompt.match(
    /PREVIOUS ACTIONS:\s*([\s\S]*?)\n\nYour task:/
  );

  const history = historyMatch ? historyMatch[1] : '';

  if (/"action"\s*:\s*"assert"/i.test(history)) {
    return JSON.stringify({
      action: 'done',
      target: 'Products',
      reason: 'The Products navigation assertion has been executed.'
    });
  }

  const snapshotMatch = prompt.match(
    /CURRENT WEBSITE SNAPSHOT:\s*([\s\S]*?)\n\nPREVIOUS ACTIONS:/
  );

  const snapshot = snapshotMatch ? snapshotMatch[1] : '';

  const productsLine = snapshot
    .split('\n')
    .find(line => /Products/i.test(line) && /\[ref=/.test(line));

  const refMatch = productsLine?.match(/\[ref=([A-Za-z][A-Za-z0-9]*)\]/);

  if (!refMatch) {
    throw new Error(
      'Mock AI could not find the Products link reference in the current snapshot.'
    );
  }

  return JSON.stringify({
    action: 'assert',
    target: 'Products navigation link',
    ref: refMatch[1],
    expectedText: 'Products',
    reason: 'Verify the Products link exists in the current snapshot.'
  });
}

module.exports = { generateText };
