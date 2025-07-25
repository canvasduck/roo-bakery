const yaml = require('js-yaml');
const fs = require('fs-extra');
const path = require('path');
const { error } = require('../cli/output');
const configManager = require('./config-manager');

/**
 * Parse a YAML file
 * @param {string} filePath - Path to the YAML file
 * @returns {object|null} Parsed YAML data or null if an error occurred
 */
function parseYamlFile(filePath) {
  try {
    // Ensure the file exists
    if (!fs.existsSync(filePath)) {
      error(`File not found: ${filePath}`);
      return null;
    }

    // Read and parse the YAML file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContent) || {};
  } catch (err) {
    error(`Error parsing YAML file: ${err.message}`);
    return null;
  }
}

/**
 * Write data to a YAML file
 * @param {string} filePath - Path to the YAML file
 * @param {object} data - Data to write
 * @returns {boolean} True if successful, false otherwise
 */
function writeYamlFile(filePath, data) {
  try {
    // Ensure the directory exists
    fs.ensureDirSync(path.dirname(filePath));

    // Convert data to YAML
    const yamlContent = yaml.dump(data, {
      indent: 2,
      lineWidth: -1, // Don't wrap lines
      noRefs: true,  // Don't use references
      sortKeys: false // Preserve key order
    });

    // Check if this is an active document by comparing with the configured active document path
    const activeDocPath = configManager.getActiveDocumentPath();
    const isActiveDocument = activeDocPath && path.resolve(filePath) === path.resolve(activeDocPath);
    
    // For active documents, wrap the content in a customModes property
    let finalContent = yamlContent;
    if (isActiveDocument) {
      if (Array.isArray(data)) {
        if (data.length === 0) {
          // Handle empty array case
          finalContent = 'customModes: []';
        } else {
          // Handle non-empty array case
          finalContent = 'customModes:\n' + yamlContent;
        }
      }
    }

    fs.writeFileSync(filePath, finalContent, 'utf8');
    return true;
  } catch (err) {
    error(`Error writing YAML file: ${err.message}`);
    return false;
  }
}

module.exports = {
  parseYamlFile,
  writeYamlFile
};