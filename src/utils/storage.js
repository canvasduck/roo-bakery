const fs = require('fs-extra');
const path = require('path');
const { error } = require('../cli/output');

/**
 * Check if a file exists
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if the file exists, false otherwise
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    error(`Error checking if file exists: ${err.message}`);
    return false;
  }
}

/**
 * Create a directory if it doesn't exist
 * @param {string} dirPath - Path to the directory
 * @returns {boolean} True if successful, false otherwise
 */
function ensureDirectoryExists(dirPath) {
  try {
    fs.ensureDirSync(dirPath);
    return true;
  } catch (err) {
    error(`Error creating directory: ${err.message}`);
    return false;
  }
}

/**
 * Read a file
 * @param {string} filePath - Path to the file
 * @returns {string|null} File content or null if an error occurred
 */
function readFile(filePath) {
  try {
    if (!fileExists(filePath)) {
      error(`File not found: ${filePath}`);
      return null;
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    error(`Error reading file: ${err.message}`);
    return null;
  }
}

/**
 * Write to a file
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to write
 * @returns {boolean} True if successful, false otherwise
 */
function writeFile(filePath, content) {
  try {
    // Ensure the directory exists
    ensureDirectoryExists(path.dirname(filePath));
    
    // Write the file
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (err) {
    error(`Error writing file: ${err.message}`);
    return false;
  }
}

/**
 * Create a backup of a file
 * @param {string} filePath - Path to the file
 * @returns {string|null} Path to the backup file or null if an error occurred
 */
function createBackup(filePath) {
  try {
    if (!fileExists(filePath)) {
      error(`Cannot create backup, file not found: ${filePath}`);
      return null;
    }
    
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.copySync(filePath, backupPath);
    return backupPath;
  } catch (err) {
    error(`Error creating backup: ${err.message}`);
    return null;
  }
}

module.exports = {
  fileExists,
  ensureDirectoryExists,
  readFile,
  writeFile,
  createBackup
};