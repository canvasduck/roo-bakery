const configManager = require('../core/config-manager');
const output = require('../cli/output');
const fs = require('fs-extra');

/**
 * Execute the config command
 * @param {object} options - Command options
 */
async function execute(options) {
  // Handle --set-main option
  if (options.setMain) {
    const mainPath = options.setMain;
    
    // Validate that the file exists
    if (!fs.existsSync(mainPath)) {
      output.warning(`File does not exist: ${mainPath}`);
      output.info('Creating the file will be attempted when it is first used.');
    }
    
    configManager.setMainDocumentPath(mainPath);
    output.success(`Main document path set to: ${mainPath}`);
  }

  // Handle --set-active option
  if (options.setActive) {
    const activePath = options.setActive;
    
    // Validate that the file exists
    if (!fs.existsSync(activePath)) {
      output.warning(`File does not exist: ${activePath}`);
      output.info('Creating the file will be attempted when it is first used.');
    }
    
    configManager.setActiveDocumentPath(activePath);
    output.success(`Active document path set to: ${activePath}`);
  }

  // Handle --reset option
  if (options.reset) {
    configManager.resetConfig();
    output.success('Configuration reset to defaults');
  }

  // Handle --show option or no options (default to show)
  if (options.show || (!options.setMain && !options.setActive && !options.reset)) {
    const config = configManager.getAllConfig();
    
    output.info('Current Configuration:');
    output.info(`Main Document Path: ${config.mainDocumentPath || 'Not set'}`);
    output.info(`Active Document Path: ${config.activeDocumentPath || 'Not set'}`);
    
    // Check if files exist
    if (config.mainDocumentPath && !fs.existsSync(config.mainDocumentPath)) {
      output.warning(`Main document file does not exist: ${config.mainDocumentPath}`);
    }
    
    if (config.activeDocumentPath && !fs.existsSync(config.activeDocumentPath)) {
      output.warning(`Active document file does not exist: ${config.activeDocumentPath}`);
    }
  }
}

module.exports = { execute };