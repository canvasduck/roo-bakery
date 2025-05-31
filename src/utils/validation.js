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

  // Validate group objects
  const groups = document.filter(item => item && typeof item === 'object' && item.name && item.modes);
  for (const group of groups) {
    if (!validateGroupObject(group, document)) {
      return false;
    }
  }

  return true;
}

/**
 * Validate a group object
 * @param {object} group - The group object to validate
 * @param {object} document - The full document (for circular reference detection)
 * @param {Set} [visitedGroups] - Set of already visited groups (for circular reference detection)
 * @returns {boolean} True if valid, false otherwise
 */
function validateGroupObject(group, document, visitedGroups = new Set()) {
  // Check if group has a name property
  if (!group.name || typeof group.name !== 'string') {
    error('Group must have a valid name property');
    return false;
  }

  // Check if group has a modes property
  if (!group.modes) {
    error(`Group '${group.name}' must have a modes property`);
    return false;
  }

  // Parse modes into an array
  let modeNames = [];
  if (Array.isArray(group.modes)) {
    modeNames = group.modes;
  } else if (typeof group.modes === 'string') {
    modeNames = group.modes.split(',').map(mode => mode.trim());
  } else {
    error(`Group '${group.name}' modes property must be a string or an array`);
    return false;
  }

  // Check if modes is empty
  if (modeNames.length === 0) {
    error(`Group '${group.name}' must have at least one mode`);
    return false;
  }

  // Check for circular references
  if (visitedGroups.has(group.name)) {
    error(`Circular reference detected in group: ${group.name}`);
    return false;
  }

  // Mark this group as visited
  visitedGroups.add(group.name);

  // Check each mode in the group
  for (const modeName of modeNames) {
    // Find the mode in the document
    const mode = document.find(item => item && item.name === modeName);
    
    // If mode is not found, it's not a circular reference
    if (!mode) {
      continue;
    }
    
    // If mode is a group, recursively validate it
    if (mode.modes) {
      if (!validateGroupObject(mode, document, new Set(visitedGroups))) {
        return false;
      }
    }
  }

  return true;
}

module.exports = {
  validateFilePath,
  validateNames,
  validateDocumentStructure,
  validateGroupObject
};