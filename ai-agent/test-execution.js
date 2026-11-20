
require('dotenv').config();

const {
  connectMCP,
  disconnectMCP,
  callMCPTool
} = require('./agent/mcpClient');

const { executeStep } = require('./agent/executor');

const WEBSITE_URL = 'https://automationexercise.com';

function getSnapshotText(result) {
  if (typeof result === 'string') return result;

  return (result.content || [])
    .map(item => item.text || '')
    .join('\n');
}

async function main() {
  try {
    await connectMCP();

    console.log('\nOpening Products page...');

    await executeStep({
      action: 'navigate',
      target: `${WEBSITE_URL}/products`
    });

    const initialResult = await callMCPTool('browser_snapshot', {});
    const initialSnapshot = getSnapshotText(initialResult);

    const textboxMatch = initialSnapshot.match(
      /textbox "Search Product" \[ref=([^\]]+)\]/
    );

    if (!textboxMatch) {
      throw new Error('Search Product textbox not found.');
    }

    const buttonMatch = initialSnapshot.match(
      /textbox "Search Product"[^\n]*\n\s*- button[^\n]*\[ref=([^\]]+)\]/
    );

    if (!buttonMatch) {
      throw new Error('Search button not found.');
    }

    console.log(`Textbox ref: ${textboxMatch[1]}`);
    console.log(`Search button ref: ${buttonMatch[1]}`);

    console.log('\nFilling search textbox...');

    await executeStep({
      action: 'fill',
      target: 'Search Product textbox',
      ref: textboxMatch[1],
      value: 'Blue Top'
    });

    console.log('\nClicking Search button...');

    await executeStep({
      action: 'click',
      target: 'Search button',
      ref: buttonMatch[1]
    });

    console.log('\nCapturing search results...');

    const finalResult = await callMCPTool('browser_snapshot', {});
    const finalSnapshot = getSnapshotText(finalResult);

    console.log('\nSEARCH RESULTS SNAPSHOT:');
    console.log(finalSnapshot.slice(0, 7000));

    const headingPassed = /heading "Searched Products"/i.test(finalSnapshot);
    const productPassed = /Blue Top/i.test(finalSnapshot);

    console.log('\n===== TEST RESULTS =====');
    console.log(`Search heading: ${headingPassed ? 'PASSED' : 'FAILED'}`);
    console.log(`Blue Top result: ${productPassed ? 'PASSED' : 'FAILED'}`);

    if (!headingPassed || !productPassed) {
      throw new Error('Search result verification failed.');
    }

    console.log('\nTEST PASSED: Fill and click workflow verified.');

  } catch (error) {
    console.error('\nTEST FAILED:', error.message);
    process.exitCode = 1;

  } finally {
    try {
      await disconnectMCP();
    } catch (error) {
      console.error('MCP cleanup failed:', error.message);
    }
  }
}

main();
