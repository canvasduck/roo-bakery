const { program } = require('commander');
const commands = require('./commands');
const output = require('./output');
const packageJson = require('../../package.json');

/**
 * Set up and run the CLI
 */
function run() {
  program
    .name('roo-bake')
    .description('CLI tool for editing YAML documents')
    .version(packageJson.version);

  // Register all commands
  commands.register(program);

  // Handle errors
  program.on('command:*', () => {
    output.error(`Invalid command: ${program.args.join(' ')}`);
    output.info('See --help for a list of available commands.');
    process.exit(1);
  });

  // Parse arguments
  program.parse(process.argv);

  // Show help if no arguments provided
  if (program.args.length === 0) {
    program.help();
  }
}

module.exports = { run };