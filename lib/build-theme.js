import fs from 'fs-extra';
import { join } from 'path';
import { getTokens, getMixins, getObjectValue, customFormatting } from './utils/helpers.js';
import { log, greenLog } from './utils/logger.js';
import { CUSTOM_FORMATTING_LIST } from './const.js';

export default async function buildTheme({ output, themeAliases, __dirname }) {
  const cachePath = join(__dirname, '..', 'cache', 'index.cjs');
  const themeFolderPath = join(output, 'tailwind-theme');

  if (fs.existsSync(cachePath)) {
    const variables = await import(cachePath);
    const allTokenList = getTokens(variables.default);
    const mixins = getMixins(allTokenList.filter((token) => token.hasOwnProperty('mixin')));

    log('Start building Tailwind Theme');

    const result = {};

    themeAliases.forEach(({ key, aliases, isExtend }) => {
      let categoryValue = { ...variables.default };

      aliases.forEach((alias) => {
        categoryValue = categoryValue[alias];
      });

      if (isExtend) {
        result.extend = { ...result.extend };
        result.extend[key] = getObjectValue(categoryValue);
      } else {
        result[key] = getObjectValue(categoryValue);
      }

      if (CUSTOM_FORMATTING_LIST.includes(key) && mixins.length) {
        mixins.forEach(({ name, category, tokens }) => {
          if (category === aliases[0]) {
            if (isExtend) {
              result.extend = { ...result.extend };
              result.extend[key] = {
                ...result.extend[key],
                [name]: customFormatting[key](tokens),
              };
            } else {
              result[key] = {
                ...result[key],
                [name]: customFormatting[key](tokens),
              };
            }
          }
        });
      }
    });

    if (fs.existsSync(themeFolderPath)) {
      fs.removeSync(themeFolderPath);
    }

    fs.mkdirSync(themeFolderPath);
    fs.appendFileSync(`${output}/tailwind-theme/index.js`, `module.exports = ${JSON.stringify(result)};\n`);

    greenLog('Tailwind Theme build completed successfully');
  }

  fs.removeSync(join(__dirname, '..', 'cache'));
}
