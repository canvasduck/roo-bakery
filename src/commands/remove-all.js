const documentManager = require('../core/document-manager');
const configManager = require('../core/config-manager');
const output = require('../cli/output');

/**
 * Execute the remove-all command
 * @param {object} options - Command options
 */
async function execute(options) {
  // Get document path from options or config
  const activePath = options.active || configManager.getActiveDocumentPath();

  // Validate path
  if (!activePath) {
    output.error('Active document path not specified. Use --active option or set it with config command.');
    return;
  }

  output.info(`Removing all objects from: ${activePath}`);

  // Remove all objects from active document
  const success = documentManager.removeAllObjectsFromActiveDocument(activePath);

  if (success) {
    output.success('Removed all objects from active document');
    
    // Show preview of active document
    const activeDoc = documentManager.getActiveDocument(activePath);
    if (activeDoc) {
      output.yamlPreview('Active Document', activeDoc);
    }
  } else {
    output.error('Failed to remove all objects from active document');
  }
}

module.exports = { execute };