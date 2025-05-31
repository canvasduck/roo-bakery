const documentManager = require('../core/document-manager');
const configManager = require('../core/config-manager');
const output = require('../cli/output');

/**
 * Execute the remove command
 * @param {string[]} names - Names of objects to remove
 * @param {object} options - Command options
 */
async function execute(names, options) {
  // Get document path from options or config
  const activePath = options.active || configManager.getActiveDocumentPath();

  // Validate path
  if (!activePath) {
    output.error('Active document path not specified. Use --active option or set it with config command.');
    return;
  }

  output.info(`Removing objects with names: ${names.join(', ')}`);
  output.info(`From: ${activePath}`);

  // Remove objects from active document
  const success = documentManager.removeObjectsFromActiveDocument(names, activePath);

  if (success) {
    output.success(`Removed ${names.length} object(s) from active document`);
    
    // Show preview of active document
    const activeDoc = documentManager.getActiveDocument(activePath);
    if (activeDoc) {
      output.yamlPreview('Active Document', activeDoc);
    }
  } else {
    output.error('Failed to remove objects from active document');
  }
}

module.exports = { execute };