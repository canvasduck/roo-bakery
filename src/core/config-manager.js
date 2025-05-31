const Conf = require('conf');
const path = require('path');
const os = require('os');

// Create a configuration instance with the specified options
const config = new Conf({
  projectName: 'roo-bakery',
  configName: 'config',
  cwd: path.join(os.homedir(), '.roo-bakery'),
  schema: {
    mainDocumentPath: {
      type: 'string',
      default: ''
    },
    activeDocumentPath: {
      type: 'string',
      default: ''
    }
  }
});

/**
 * Get the path to the main document
 * @returns {string} The path to the main document
 */
function getMainDocumentPath() {
  return config.get('mainDocumentPath');
}

/**
 * Set the path to the main document
 * @param {string} path - The path to the main document
 */
function setMainDocumentPath(path) {
  config.set('mainDocumentPath', path);
}

/**
 * Get the path to the active document
 * @returns {string} The path to the active document
 */
function getActiveDocumentPath() {
  return config.get('activeDocumentPath');
}

/**
 * Set the path to the active document
 * @param {string} path - The path to the active document
 */
function setActiveDocumentPath(path) {
  config.set('activeDocumentPath', path);
}

/**
 * Get all configuration settings
 * @returns {object} All configuration settings
 */
function getAllConfig() {
  return {
    mainDocumentPath: getMainDocumentPath(),
    activeDocumentPath: getActiveDocumentPath()
  };
}

/**
 * Reset configuration to defaults
 */
function resetConfig() {
  config.clear();
}

module.exports = {
  getMainDocumentPath,
  setMainDocumentPath,
  getActiveDocumentPath,
  setActiveDocumentPath,
  getAllConfig,
  resetConfig
};