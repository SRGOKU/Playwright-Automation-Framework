
const fs = require('fs');
const path = require('path');

const { saveMemory, readMemory } = require('./agent/memory');

const memoryPath = path.join(__dirname, 'agent', 'memory.json');

async function main() {
  let originalMemory = null;
  const existedBefore = fs.existsSync(memoryPath);

  try {
    // Preserve existing memory.
    if (existedBefore) {
      originalMemory = fs.readFileSync(memoryPath, 'utf8');
    }

    console.log('\nTEST 1: Save memory');

    const testRecord = {
      goal: 'Test memory persistence',
      action: 'navigate',
      result: 'success'
    };

    saveMemory(testRecord);

    console.log('Memory saved.');

    console.log('\nTEST 2: Read memory');

    const history = readMemory();

    const lastRecord = history[history.length - 1];

    if (
      !lastRecord ||
      lastRecord.goal !== testRecord.goal ||
      lastRecord.action !== testRecord.action ||
      lastRecord.result !== testRecord.result
    ) {
      throw new Error('Saved memory does not match retrieved memory.');
    }

    console.log('Memory retrieved successfully.');

    console.log('\nTEST 3: Timestamp validation');

    if (!lastRecord.timestamp || Number.isNaN(Date.parse(lastRecord.timestamp))) {
      throw new Error('Memory timestamp is invalid.');
    }

    console.log('Timestamp verified.');

    console.log('\n===== MEMORY TEST RESULTS =====');
    console.log('Save memory: PASSED');
    console.log('Read memory: PASSED');
    console.log('Timestamp: PASSED');

  } catch (error) {
    console.error('\nMEMORY TEST FAILED:', error.message);
    process.exitCode = 1;

  } finally {
    // Restore original memory file.
    if (existedBefore) {
      fs.writeFileSync(memoryPath, originalMemory);
    } else if (fs.existsSync(memoryPath)) {
      fs.unlinkSync(memoryPath);
    }
  }
}

main();
