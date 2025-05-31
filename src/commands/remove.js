const documentManager = require('../core/document-manager');
const configManager = require('../core/config-manager');
const output = require('../cli/output');

/**
 * Execute the remove command
 * This command removes objects from the active document.
 * It supports both individual mode names and group names.
 * When a group name is provided, all modes in that group (including nested groups)
 * will be resolved and removed.
 *
 * Note: When removing groups, the --main option is required to properly
 * resolve the group's modes from the main document.
 *
 * @param {string[]} names - Names of objects or groups to remove
 * @param {object} options - Command options
 */
async function execute(names, options) {
  // Get document paths from options or config
  const mainPath = options.main || configManager.getMainDocumentPath();
  const activePath = options.active || configManager.getActiveDocumentPath();

  // Validate paths
  if (!activePath) {
    output.error('Active document path not specified. Use --active option or set it with config command.');
    return;
  }

  if (!mainPath) {
    output.error('Main document path not specified. Use --main option or set it with config command.');
    return;
  }

  output.info(`Removing objects with names: ${names.join(', ')}`);
  output.info(`From: ${activePath}`);

  // Remove objects from active document
  const success = documentManager.removeObjectsFromActiveDocument(names, mainPath, activePath);

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