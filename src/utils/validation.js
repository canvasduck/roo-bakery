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
 * Validate an array of slugs
 * @param {string[]} slugs - The slugs to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateSlugs(slugs) {
  if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
    error('At least one slug is required');
    return false;
  }

  // Check if all slugs are valid strings
  const invalidSlugs = slugs.filter(slug => !slug || typeof slug !== 'string');
  if (invalidSlugs.length > 0) {
    error('All slugs must be non-empty strings');
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

  // Check if all items have a slug property
  const invalidItems = document.filter(item => !item || typeof item !== 'object' || !item.slug);
  if (invalidItems.length > 0) {
    error('All document items must be objects with a slug property');
    return false;
  }

  return true;
}

module.exports = {
  validateFilePath,
  validateSlugs,
  validateDocumentStructure
};