const yamlHandler = require('./yaml-handler');
const configManager = require('./config-manager');
const { error, warning, info } = require('../cli/output');
const validation = require('../utils/validation');

/**
 * Get the main document
 * @param {string} [customPath] - Optional custom path to the main document
 * @returns {object|null} The main document or null if an error occurred
 */
function getMainDocument(customPath) {
  const mainDocPath = customPath || configManager.getMainDocumentPath();
  
  if (!mainDocPath) {
    error('Main document path not set. Use --main option or set it with config command.');
    return null;
  }

  return yamlHandler.parseYamlFile(mainDocPath);
}

/**
 * Get the active document
 * @param {string} [customPath] - Optional custom path to the active document
 * @returns {object|null} The active document or null if an error occurred
 */
function getActiveDocument(customPath) {
  const activeDocPath = customPath || configManager.getActiveDocumentPath();
  
  if (!activeDocPath) {
    error('Active document path not set. Use --active option or set it with config command.');
    return null;
  }

  const parsedData = yamlHandler.parseYamlFile(activeDocPath);
  
  // Handle different document structures
  if (!parsedData) {
    // If parsing failed, return an empty array
    return [];
  } else if (Array.isArray(parsedData)) {
    // If it's already an array, return it
    return parsedData;
  } else if (parsedData.customModes) {
    // If it has a customModes property, return that (if it's an array) or an empty array
    return Array.isArray(parsedData.customModes) ? parsedData.customModes : [];
  } else {
    // For any other structure, return an empty array
    return [];
  }
}

/**
 * Save the active document
 * @param {object} document - The document to save
 * @param {string} [customPath] - Optional custom path to the active document
 * @returns {boolean} True if successful, false otherwise
 */
function saveActiveDocument(document, customPath) {
  const activeDocPath = customPath || configManager.getActiveDocumentPath();
  
  if (!activeDocPath) {
    error('Active document path not set. Use --active option or set it with config command.');
    return false;
  }

  return yamlHandler.writeYamlFile(activeDocPath, document);
}

/**
 * Find objects in a document by name
 * @param {object} document - The document to search
 * @param {string[]} names - Array of names to find
 * @returns {object[]} Array of found objects
 */
function findObjectsByName(document, names) {
  if (!document || !Array.isArray(document)) {
    return [];
  }

  // Filter objects that have a matching name
  return document.filter(obj => {
    if (!obj || typeof obj !== 'object' || !obj.name) {
      return false;
    }
    return names.includes(obj.name);
  });
}

/**
 * Check if an object is a group
 * A group is an object with a 'name' property and a 'modes' property.
 * The 'modes' property can be a comma-separated string or an array of mode names.
 *
 * @param {object} obj - The object to check
 * @returns {boolean} True if the object is a group, false otherwise
 */
function isGroup(obj) {
  return obj && typeof obj === 'object' && obj.name && obj.modes;
}

/**
 * Parse modes string into an array of mode names
 * This function handles both string and array formats for the modes property.
 * If modes is a string, it splits it by commas and trims each mode name.
 * If modes is already an array, it returns it as is.
 *
 * @param {string|string[]} modes - Modes string (comma-separated) or array of mode names
 * @returns {string[]} Array of mode names
 */
function parseModesString(modes) {
  if (Array.isArray(modes)) {
    return modes;
  }
  
  if (typeof modes === 'string') {
    return modes.split(',').map(mode => mode.trim());
  }
  
  return [];
}

/**
 * Resolve groups into a flattened array of unique mode names
 * This function recursively resolves groups into their constituent mode names.
 * It handles nested groups and prevents circular references.
 *
 * The resolution process works as follows:
 * 1. For each name in the input array:
 *    a. If it's a group, recursively resolve its modes
 *    b. If it's not a group, treat it as a regular mode name
 * 2. Return a flattened, deduplicated array of all resolved mode names
 *
 * @param {object} document - The document to search for groups
 * @param {string[]} names - Array of names (can be group names or mode names)
 * @param {Set} [visitedGroups] - Set of already visited groups (for circular reference detection)
 * @returns {string[]} Flattened array of unique mode names
 */
function resolveGroups(document, names, visitedGroups = new Set()) {
  if (!document || !Array.isArray(document) || !names || !Array.isArray(names)) {
    return [];
  }

  const result = new Set();
  
  for (const name of names) {
    // Skip if we've already visited this group (prevents circular references)
    if (visitedGroups.has(name)) {
      warning(`Circular reference detected in group: ${name}`);
      continue;
    }
    
    // Find the object with this name
    const obj = document.find(item => item && item.name === name);
    
    if (!obj) {
      // If not found, treat as a regular mode
      result.add(name);
      continue;
    }
    
    if (isGroup(obj)) {
      // This is a group, recursively resolve its modes
      const modeNames = parseModesString(obj.modes);
      
      // Mark this group as visited
      const newVisitedGroups = new Set(visitedGroups);
      newVisitedGroups.add(name);
      
      // Recursively resolve the group's modes
      const resolvedModes = resolveGroups(document, modeNames, newVisitedGroups);
      
      // Add all resolved modes to the result
      for (const mode of resolvedModes) {
        result.add(mode);
      }
    } else {
      // This is a regular mode
      result.add(name);
    }
  }
  
  return Array.from(result);
}

/**
 * Add objects to the active document
 * This function adds objects from the main document to the active document.
 * It supports both individual mode names and group names.
 * When a group name is provided, all modes in that group (including nested groups)
 * will be resolved and added.
 *
 * @param {string[]} names - Names of objects or groups to add
 * @param {string} [mainPath] - Optional custom path to the main document
 * @param {string} [activePath] - Optional custom path to the active document
 * @returns {boolean} True if successful, false otherwise
 */
function addObjectsToActiveDocument(names, mainPath, activePath) {
  // Validate names
  if (!validation.validateNames(names)) {
    return false;
  }

  // Get documents
  const mainDoc = getMainDocument(mainPath);
  if (!mainDoc) return false;

  let activeDoc = getActiveDocument(activePath);
  if (!activeDoc) {
    // If active document doesn't exist or is empty, initialize it as an empty array
    activeDoc = [];
  } else if (!Array.isArray(activeDoc)) {
    error('Active document is not an array. Cannot add objects.');
    return false;
  }

  // Resolve groups to get all mode names
  const resolvedNames = resolveGroups(mainDoc, names);
  
  // Find objects in main document
  const objectsToAdd = findObjectsByName(mainDoc, resolvedNames);
  
  if (objectsToAdd.length === 0) {
    warning('No matching objects found in the main document.');
    return false;
  }

  if (objectsToAdd.length < resolvedNames.length) {
    const foundNames = objectsToAdd.map(obj => obj.name);
    const missingNames = resolvedNames.filter(name => !foundNames.includes(name));
    warning(`Some objects not found: ${missingNames.join(', ')}`);
  }

  // Check for duplicates
  const existingNames = activeDoc.map(obj => obj.name);
  const newObjects = objectsToAdd.filter(obj => !existingNames.includes(obj.name));
  const duplicates = objectsToAdd.filter(obj => existingNames.includes(obj.name));

  if (duplicates.length > 0) {
    warning(`Some objects already exist in active document: ${duplicates.map(obj => obj.name).join(', ')}`);
  }

  if (newObjects.length === 0) {
    warning('No new objects to add.');
    return false;
  }

  // Add objects to active document
  const updatedActiveDoc = [...activeDoc, ...newObjects];
  
  // Save active document
  return saveActiveDocument(updatedActiveDoc, activePath);
}

/**
 * Remove objects from the active document
 * This function removes objects from the active document.
 * It supports both individual mode names and group names.
 * When a group name is provided, all modes in that group (including nested groups)
 * will be resolved and removed.
 *
 * Note: When removing groups, the mainPath parameter is required to properly
 * resolve the group's modes from the main document.
 *
 * @param {string[]} names - Names of objects or groups to remove
 * @param {string} [mainPath] - Optional custom path to the main document (required for groups)
 * @param {string} [activePath] - Optional custom path to the active document
 * @returns {boolean} True if successful, false otherwise
 */
function removeObjectsFromActiveDocument(names, mainPath, activePath) {
  // Validate names
  if (!validation.validateNames(names)) {
    return false;
  }

  // Get documents
  const mainDoc = mainPath ? getMainDocument(mainPath) : null;
  
  // Get active document
  let activeDoc = getActiveDocument(activePath);
  if (!activeDoc) return false;

  if (!Array.isArray(activeDoc)) {
    error('Active document is not an array. Cannot remove objects.');
    return false;
  }

  // Resolve groups to get all mode names
  // If mainDoc is provided, use it for resolving groups, otherwise use activeDoc
  const docToResolve = mainDoc || activeDoc;
  const resolvedNames = resolveGroups(docToResolve, names);

  // Check if objects exist
  const existingNames = activeDoc.map(obj => obj.name);
  const namesToRemove = resolvedNames.filter(name => existingNames.includes(name));
  const nonExistentNames = resolvedNames.filter(name => !existingNames.includes(name));

  if (namesToRemove.length === 0) {
    warning('None of the specified objects exist in the active document.');
    return false;
  }

  if (nonExistentNames.length > 0) {
    warning(`Some objects not found in active document: ${nonExistentNames.join(', ')}`);
  }

  // Remove objects from active document
  const updatedActiveDoc = activeDoc.filter(obj => !namesToRemove.includes(obj.name));
  
  // Save active document
  return saveActiveDocument(updatedActiveDoc, activePath);
}

/**
 * Remove all objects from the active document
 * @param {string} [activePath] - Optional custom path to the active document
 * @returns {boolean} True if successful, false otherwise
 */
function removeAllObjectsFromActiveDocument(activePath) {
  // Get active document path
  const activeDocPath = activePath || configManager.getActiveDocumentPath();
  
  if (!activeDocPath) {
    error('Active document path not set. Use --active option or set it with config command.');
    return false;
  }

  // Save empty array to active document
  return yamlHandler.writeYamlFile(activeDocPath, []);
}

module.exports = {
  getMainDocument,
  getActiveDocument,
  saveActiveDocument,
  findObjectsByName,
  isGroup,
  parseModesString,
  resolveGroups,
  addObjectsToActiveDocument,
  removeObjectsFromActiveDocument,
  removeAllObjectsFromActiveDocument
};