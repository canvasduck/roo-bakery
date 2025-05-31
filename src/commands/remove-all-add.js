const documentManager = require('../core/document-manager');
const configManager = require('../core/config-manager');
const output = require('../cli/output');

/**
 * Execute the remove-all-and-add command
 * @param {string[]} slugs - Slugs of objects to add
 * @param {object} options - Command options
 */
async function execute(slugs, options) {
  // Get document paths from options or config
  const mainPath = options.main || configManager.getMainDocumentPath();
  const activePath = options.active || configManager.getActiveDocumentPath();

  // Validate paths
  if (!mainPath) {
    output.error('Main document path not specified. Use --main option or set it with config command.');
    return;
  }

  if (!activePath) {
    output.error('Active document path not specified. Use --active option or set it with config command.');
    return;
  }

  output.info(`Removing all objects from: ${activePath}`);
  output.info(`Then adding objects with slugs: ${slugs.join(', ')}`);
  output.info(`From: ${mainPath}`);

  // Step 1: Remove all objects from active document
  const removeSuccess = documentManager.removeAllObjectsFromActiveDocument(activePath);

  if (!removeSuccess) {
    output.error('Failed to remove all objects from active document');
    return;
  }

  output.success('Removed all objects from active document');

  // Step 2: Add specified objects to active document
  const addSuccess = documentManager.addObjectsToActiveDocument(slugs, mainPath, activePath);

  if (addSuccess) {
    output.success(`Added ${slugs.length} object(s) to active document`);
    
    // Show preview of active document
    const activeDoc = documentManager.getActiveDocument(activePath);
    if (activeDoc) {
      output.yamlPreview('Active Document', activeDoc);
    }
  } else {
    output.error('Failed to add objects to active document');
  }
}

module.exports = { execute };