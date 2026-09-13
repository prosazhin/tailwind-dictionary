import fs from 'fs-extra';
import {
  objectToVariables,
  customFormatting,
  getTokens,
  getSemanticName,
  getSemanticVariable,
} from './utils/helpers.js';
import { EXCEPTION_PROPS_V4 } from './const.js';

// Семантические токены (переопределяемые тёмной темой) выносятся в `@theme inline`
// и ссылаются на обычные CSS-переменные (`--<prefix>-<key>-<name>`), объявленные в `:root`.
// Так утилиты компилируются в `var(--<prefix>-<key>-<name>)` и переопределение работает
// каскадом на любом элементе и при любом Tailwind-префиксе.
function buildInlineTheme({ themeAliases, variables, semantic }) {
  const tokens = getTokens(variables).filter((token) => semantic.paths.has(token.path.join('.')));

  let result = '';

  themeAliases.forEach(({ key }) => {
    let block = '';

    tokens.forEach((token) => {
      const name = getSemanticName(token.path, themeAliases);

      if (name && name.key === key) {
        block += `--${key}-${name.name}: var(${getSemanticVariable(name, semantic.prefix)});\n`;
      }
    });

    if (block) {
      result += `\n${block}`;
    }
  });

  return result;
}

export default function buildV4({ output, themeFolderPath, themeAliases, variables, mixins, semantic }) {
  const skipPaths = semantic?.paths?.size ? semantic.paths : null;

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
      result += objectToVariables(categoryValue, key, '', skipPaths);
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

  let content = `@theme {\n${result}}\n`;

  if (skipPaths) {
    const inline = buildInlineTheme({ themeAliases, variables, semantic });

    if (inline) {
      content += `\n@theme inline {${inline}}\n`;
    }
  }

  fs.appendFileSync(`${output}/tailwind/theme.css`, content);
}
