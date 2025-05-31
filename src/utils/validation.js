const { error } = require('../cli/output');

/**
 * Validate a file path
 * @param {string} filePath - The file path to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateFilePath(filePath) {
  if (!filePath) {
    error('File path is required');
    return false;
  }

  // Basic validation - could be extended with more specific checks
  if (typeof filePath !== 'string') {
    error('File path must be a string');
    return false;
  }

  return true;
}

/**
 * Validate an array of names
 * @param {string[]} names - The names to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateNames(names) {
  if (!names || !Array.isArray(names) || names.length === 0) {
    error('At least one name is required');
    return false;
  }

  // Check if all names are valid strings
  const invalidNames = names.filter(name => !name || typeof name !== 'string');
  if (invalidNames.length > 0) {
    error('All names must be non-empty strings');
    return false;
  }

  return true;
}

/**
 * Validate a YAML document structure
 * @param {object} document - The document to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateDocumentStructure(document) {
  if (!document) {
    error('Document is required');
    return false;
  }

  if (!Array.isArray(document)) {
    error('Document must be an array');
    return false;
  }

  // Check if all items have a name property
  const invalidItems = document.filter(item => !item || typeof item !== 'object' || !item.name);
  if (invalidItems.length > 0) {
    error('All document items must be objects with a name property');
    return false;
  }

  return true;
}

module.exports = {
  validateFilePath,
  validateNames,
  validateDocumentStructure
};