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
  
  // Handle the case where the active document has a customModes property
  if (parsedData && parsedData.customModes) {
    return parsedData.customModes;
  }
  
  return parsedData;
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
 * Add objects to the active document
 * @param {string[]} names - Names of objects to add
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

  // Find objects in main document
  const objectsToAdd = findObjectsByName(mainDoc, names);
  
  if (objectsToAdd.length === 0) {
    warning('No matching objects found in the main document.');
    return false;
  }

  if (objectsToAdd.length < names.length) {
    const foundNames = objectsToAdd.map(obj => obj.name);
    const missingNames = names.filter(name => !foundNames.includes(name));
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
 * @param {string[]} names - Names of objects to remove
 * @param {string} [activePath] - Optional custom path to the active document
 * @returns {boolean} True if successful, false otherwise
 */
function removeObjectsFromActiveDocument(names, activePath) {
  // Validate names
  if (!validation.validateNames(names)) {
    return false;
  }

  // Get active document
  let activeDoc = getActiveDocument(activePath);
  if (!activeDoc) return false;

  if (!Array.isArray(activeDoc)) {
    error('Active document is not an array. Cannot remove objects.');
    return false;
  }

  // Check if objects exist
  const existingNames = activeDoc.map(obj => obj.name);
  const namesToRemove = names.filter(name => existingNames.includes(name));
  const nonExistentNames = names.filter(name => !existingNames.includes(name));

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
  addObjectsToActiveDocument,
  removeObjectsFromActiveDocument,
  removeAllObjectsFromActiveDocument
};