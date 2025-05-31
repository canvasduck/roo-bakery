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

  return yamlHandler.parseYamlFile(activeDocPath);
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
 * Find objects in a document by slug
 * @param {object} document - The document to search
 * @param {string[]} slugs - Array of slugs to find
 * @returns {object[]} Array of found objects
 */
function findObjectsBySlug(document, slugs) {
  if (!document || !Array.isArray(document)) {
    return [];
  }

  // Filter objects that have a matching slug
  return document.filter(obj => {
    if (!obj || typeof obj !== 'object' || !obj.slug) {
      return false;
    }
    return slugs.includes(obj.slug);
  });
}

/**
 * Add objects to the active document
 * @param {string[]} slugs - Slugs of objects to add
 * @param {string} [mainPath] - Optional custom path to the main document
 * @param {string} [activePath] - Optional custom path to the active document
 * @returns {boolean} True if successful, false otherwise
 */
function addObjectsToActiveDocument(slugs, mainPath, activePath) {
  // Validate slugs
  if (!validation.validateSlugs(slugs)) {
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
  const objectsToAdd = findObjectsBySlug(mainDoc, slugs);
  
  if (objectsToAdd.length === 0) {
    warning('No matching objects found in the main document.');
    return false;
  }

  if (objectsToAdd.length < slugs.length) {
    const foundSlugs = objectsToAdd.map(obj => obj.slug);
    const missingSlugs = slugs.filter(slug => !foundSlugs.includes(slug));
    warning(`Some objects not found: ${missingSlugs.join(', ')}`);
  }

  // Check for duplicates
  const existingSlugs = activeDoc.map(obj => obj.slug);
  const newObjects = objectsToAdd.filter(obj => !existingSlugs.includes(obj.slug));
  const duplicates = objectsToAdd.filter(obj => existingSlugs.includes(obj.slug));

  if (duplicates.length > 0) {
    warning(`Some objects already exist in active document: ${duplicates.map(obj => obj.slug).join(', ')}`);
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
 * @param {string[]} slugs - Slugs of objects to remove
 * @param {string} [activePath] - Optional custom path to the active document
 * @returns {boolean} True if successful, false otherwise
 */
function removeObjectsFromActiveDocument(slugs, activePath) {
  // Validate slugs
  if (!validation.validateSlugs(slugs)) {
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
  const existingSlugs = activeDoc.map(obj => obj.slug);
  const slugsToRemove = slugs.filter(slug => existingSlugs.includes(slug));
  const nonExistentSlugs = slugs.filter(slug => !existingSlugs.includes(slug));

  if (slugsToRemove.length === 0) {
    warning('None of the specified objects exist in the active document.');
    return false;
  }

  if (nonExistentSlugs.length > 0) {
    warning(`Some objects not found in active document: ${nonExistentSlugs.join(', ')}`);
  }

  // Remove objects from active document
  const updatedActiveDoc = activeDoc.filter(obj => !slugsToRemove.includes(obj.slug));
  
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
  findObjectsBySlug,
  addObjectsToActiveDocument,
  removeObjectsFromActiveDocument,
  removeAllObjectsFromActiveDocument
};