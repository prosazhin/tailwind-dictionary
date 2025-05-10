import fs from 'fs-extra';
import { objectToVariables, customFormatting } from './utils/helpers.js';
import { EXCEPTION_PROPS_V4 } from './const.js';

export default function buildV4({ output, themeFolderPath, themeAliases, variables, mixins }) {
  let result = `--*: initial;\n`;

  themeAliases.forEach(({ key, aliases }) => {
    result += '\n';

    let categoryValue = { ...variables };

    aliases.forEach((alias) => {
      categoryValue = categoryValue[alias];
    });

    if (key === 'spacing') {
      if (typeof aliases[0] === 'string') {
        result += `--${key}: ${aliases[0]};\n`;
      }

      return;
    }

    if (key === 'color') {
      result += '--color-*: initial;\n';
    }

    if (key === 'breakpoint') {
      result += '--breakpoint-*: initial;\n';
    }

    if (!EXCEPTION_PROPS_V4.includes(key)) {
      result += objectToVariables(categoryValue, key);
    }

    if (mixins.length) {
      mixins.forEach(({ name, category, tokens }) => {
        if (category === aliases[0]) {
          if (customFormatting[key] !== undefined) {
            result += customFormatting[key](tokens, key, name);
          }
        }
      });
    }
  });

  if (fs.existsSync(themeFolderPath)) {
    fs.removeSync(themeFolderPath);
  }

  fs.mkdirSync(themeFolderPath);

  fs.appendFileSync(`${output}/tailwind/theme.css`, `@theme {\n${result}}\n`);
}
