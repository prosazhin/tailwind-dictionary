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

function divider(before = '', after = '') {
  return log(`${before}==========${after}`);
}

export { log, greenLog, redLog, divider };
