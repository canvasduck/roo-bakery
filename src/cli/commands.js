const addCommand = require('../commands/add');
const removeCommand = require('../commands/remove');
const removeAllCommand = require('../commands/remove-all');
const removeAllAddCommand = require('../commands/remove-all-add');
const configCommand = require('../commands/config');

/**
 * Register all commands with the CLI program
 * @param {object} program - The commander program instance
 */
function register(program) {
  // Register the add command
  program
    .command('add')
    .description('Add objects from main document to active document by slug')
    .argument('<slugs...>', 'Slugs of objects to add (space-separated)')
    .option('-m, --main <path>', 'Path to main document')
    .option('-a, --active <path>', 'Path to active document')
    .action(addCommand.execute);

  // Register the remove command
  program
    .command('remove')
    .description('Remove objects from active document by slug')
    .argument('<slugs...>', 'Slugs of objects to remove (space-separated)')
    .option('-a, --active <path>', 'Path to active document')
    .action(removeCommand.execute);

  // Register the remove-all command
  program
    .command('remove-all')
    .description('Remove all objects from active document')
    .option('-a, --active <path>', 'Path to active document')
    .action(removeAllCommand.execute);

  // Register the remove-all-and-add command
  program
    .command('remove-all-and-add')
    .description('Remove all objects from active document and add specified objects')
    .argument('<slugs...>', 'Slugs of objects to add (space-separated)')
    .option('-m, --main <path>', 'Path to main document')
    .option('-a, --active <path>', 'Path to active document')
    .action(removeAllAddCommand.execute);

  // Register the config command
  program
    .command('config')
    .description('Manage configuration settings')
    .option('--set-main <path>', 'Set path to main document')
    .option('--set-active <path>', 'Set path to active document')
    .option('--show', 'Show current configuration')
    .option('--reset', 'Reset configuration to defaults')
    .action(configCommand.execute);
}

module.exports = { register };