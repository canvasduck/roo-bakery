const chalk = require('chalk');

/**
 * Print an info message
 * @param {string} message - The message to print
 */
function info(message) {
  console.log(chalk.blue('ℹ ') + message);
}

/**
 * Print a success message
 * @param {string} message - The message to print
 */
function success(message) {
  console.log(chalk.green('✓ ') + message);
}

/**
 * Print a warning message
 * @param {string} message - The message to print
 */
function warning(message) {
  console.log(chalk.yellow('⚠ ') + message);
}

/**
 * Print an error message
 * @param {string} message - The message to print
 */
function error(message) {
  console.error(chalk.red('✗ ') + message);
}

/**
 * Print a debug message (only in debug mode)
 * @param {string} message - The message to print
 */
function debug(message) {
  if (process.env.DEBUG) {
    console.log(chalk.gray('🔍 ') + message);
  }
}

/**
 * Print a YAML object preview
 * @param {string} title - The title for the preview
 * @param {object} data - The data to preview
 */
function yamlPreview(title, data) {
  if (data && Object.keys(data).length > 0) {
    console.log(chalk.cyan(`\n${title}:`));
    console.log(chalk.cyan('----------------------------------------'));
    
    // For simplicity, just show the first few properties
    const preview = Object.entries(data)
      .slice(0, 5)
      .map(([key, value]) => `  ${key}: ${typeof value === 'object' ? '[Object]' : value}`)
      .join('\n');
    
    console.log(preview);
    
    if (Object.keys(data).length > 5) {
      console.log(chalk.cyan('  ... (more properties not shown)'));
    }
    
    console.log(chalk.cyan('----------------------------------------\n'));
  } else {
    console.log(chalk.cyan(`\n${title}: Empty or not available\n`));
  }
}

module.exports = {
  info,
  success,
  warning,
  error,
  debug,
  yamlPreview
};