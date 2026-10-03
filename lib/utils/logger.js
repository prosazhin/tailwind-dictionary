import chalk from 'chalk';

function log(message) {
  return console.log(chalk.bold(message));
}

function greenLog(message) {
  return console.log(chalk.green.bold(`✔︎ ${message}`));
}

function redLog(message, value = '') {
  return console.log(chalk.red.bold(`✘ ${message}`), value);
}

function yellowLog(message) {
  return console.warn(chalk.yellow.bold(`⚠ ${message}`));
}

function divider(before = '', after = '') {
  return log(`${before}==========${after}`);
}

// Логгер для generate(): предупреждения о токенах.
const cliLogger = { warn: yellowLog };

export { log, greenLog, redLog, yellowLog, divider, cliLogger };
