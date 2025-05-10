import fs from 'fs-extra';
import { getObjectValue, customFormatting } from './utils/helpers.js';
import { CUSTOM_FORMATTING_LIST } from './const.js';

export default function buildV3({ output, themeFolderPath, themeAliases, variables, mixins }) {
  const result = {};

  themeAliases.forEach(({ key, aliases, isExtend }) => {
    let categoryValue = { ...variables };

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

  fs.appendFileSync(`${output}/tailwind/theme.js`, `module.exports = ${JSON.stringify(result)};\n`);
}
