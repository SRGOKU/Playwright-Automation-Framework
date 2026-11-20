
const fs = require('fs');
const path = require('path');

const { readMemory, saveMemory } = require('./agent/memory');

const memoryPath = path.join(__dirname, 'agent', 'memory.json');

const originalMemory = fs.existsSync(memoryPath)
  ? fs.readFileSync(memoryPath, 'utf8')
  : null;

try {
  console.log('\nTEST 1: Invalid JSON handling');

  fs.writeFileSync(memoryPath, '{invalid json');

  let corruptedJsonDetected = false;

  try {
    readMemory();
  } catch (error) {
    corruptedJsonDetected = error.message.includes('Memory read failed');
  }

  if (!corruptedJsonDetected) {
    throw new Error('Corrupted JSON was not detected.');
  }

  console.log('Corrupted JSON detection: PASSED');

  console.log('\nTEST 2: Invalid record handling');

  fs.writeFileSync(memoryPath, JSON.stringify([null]));

  let invalidRecordDetected = false;

  try {
    readMemory();
  } catch (error) {
    invalidRecordDetected = error.message.includes('invalid record');
  }

  if (!invalidRecordDetected) {
    throw new Error('Invalid memory record was not detected.');
  }

  console.log('Invalid record detection: PASSED');

  console.log('\nTEST 3: Invalid save input');

  let invalidInputRejected = false;

  try {
    saveMemory(null);
  } catch (error) {
    invalidInputRejected = error.message.includes('valid object');
  }

  if (!invalidInputRejected) {
    throw new Error('Invalid save input was not rejected.');
  }

  console.log('Invalid save input: PASSED');

  console.log('\nALL MEMORY ERROR TESTS PASSED');

} catch (error) {
  console.error('\nTEST FAILED:', error.message);
  process.exitCode = 1;

} finally {
  if (originalMemory !== null) {
    fs.writeFileSync(memoryPath, originalMemory);
  } else if (fs.existsSync(memoryPath)) {
    fs.unlinkSync(memoryPath);
  }
}
