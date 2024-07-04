import fs from 'fs-extra';
import { getThemeAliasList } from './helpers.js';
import { log, greenLog, redLog } from './logger.js';
import { DEFAULT_OPTIONS, DEFAULT_VALUE } from '../const.js';

const checking = {
  source: (value) => {
    let result = [...value];

    if (!value.length || value.every((item) => !item.length)) {
      redLog('Folder with your design tokens is not specified. Default value will be used: ', DEFAULT_VALUE.source);
      result = [...DEFAULT_VALUE.source];
    }

    if (result.some((item) => fs.existsSync(item))) {
      redLog('Folder with your design tokens is not specified');
      process.exit(1);
    }

    return result;
  },
  output: (value) => {
    if (!value.length) {
      redLog('Folder for saving the final result is not specified. Default value will be used: ', DEFAULT_VALUE.output);
      return DEFAULT_VALUE.output;
    }

    return value;
  },
  themeAliases: (value) => {
    const result = getThemeAliasList(value, false);

    if (!result.length) {
      redLog('Aliases for your design tokens for the Tailwind Theme are not specified');
      process.exit(1);
    }

    return result;
  },
};

export default function getConfig(options) {
  log('Start checking config');

  let configPath = options.config;

  if (!configPath) {
    if (fs.existsSync('./config.json')) {
      configPath = './config.json';
    } else {
      redLog('Build completed with an error, check config');
      process.exit(1);
    }
  }

  const config = fs.readJsonSync(configPath) || {};

  DEFAULT_OPTIONS.forEach(({ name, value }) => {
    if (!config.hasOwnProperty(value)) {
      redLog(`${name} empty value. Default value will be used: `, DEFAULT_VALUE[value]);
      config[value] = DEFAULT_VALUE[value];
    }

    config[value] = checking[value](config[value]);
  });

  greenLog('Config check completed successfully');

  return config;
}
