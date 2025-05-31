const documentManager = require('../core/document-manager');
const configManager = require('../core/config-manager');
const output = require('../cli/output');

/**
 * Execute the add command
 * This command adds objects from the main document to the active document.
 * It supports both individual mode names and group names.
 * When a group name is provided, all modes in that group (including nested groups)
 * will be resolved and added.
 *
 * @param {string[]} names - Names of objects or groups to add
 * @param {object} options - Command options
 */
async function execute(names, options) {
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

  output.info(`Adding objects with names: ${names.join(', ')}`);
  output.info(`From: ${mainPath}`);
  output.info(`To: ${activePath}`);

  // Add objects to active document
  const success = documentManager.addObjectsToActiveDocument(names, mainPath, activePath);

  if (success) {
    output.success(`Added ${names.length} object(s) to active document`);
    
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