
const fs = require('fs');
const path = require('path');

const memoryPath = path.join(__dirname, 'memory.json');

function readMemory() {
  if (!fs.existsSync(memoryPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(memoryPath, 'utf8');
    const history = JSON.parse(content);

    if (!Array.isArray(history)) {
      throw new Error('Memory file must contain an array.');
    }

    if (
      !history.every(
        record =>
          record !== null &&
          typeof record === 'object' &&
          !Array.isArray(record)
      )
    ) {
      throw new Error('Memory contains an invalid record.');
    }

    return history;

  } catch (error) {
    throw new Error(`Memory read failed: ${error.message}`);
  }
}

function saveMemory(data) {
  if (
    data === null ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    throw new Error('Memory data must be a valid object.');
  }

  const history = readMemory();

  const record = {
    ...data,
    timestamp: new Date().toISOString()
  };

  history.push(record);

  const content = JSON.stringify(history, null, 2);
  const tempPath = `${memoryPath}.tmp`;

  try {
    fs.writeFileSync(tempPath, content, 'utf8');
    fs.renameSync(tempPath, memoryPath);

  } catch (error) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    throw new Error(`Memory save failed: ${error.message}`);
  }
}

module.exports = {
  saveMemory,
  readMemory
};
