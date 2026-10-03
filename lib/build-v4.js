import { tokensUnder } from './tokens/read-tokens.js';
import { isSemanticToken } from './tokens/themes.js';
import { customFormatting, getSemanticName, getSemanticVariable } from './utils/helpers.js';
import { EXCEPTION_PROPS_V4 } from './const.js';

// Семантические токены (переопределяемые темами) выносятся в `@theme inline`
// и ссылаются на обычные CSS-переменные (`--<prefix>-<key>-<name>`), объявленные в `:root`.
// Так утилиты компилируются в `var(--<prefix>-<key>-<name>)` и переопределение работает
// каскадом на любом элементе и при любом Tailwind-префиксе.
function buildInlineTheme({ tokens, themeAliases, semantic, prefix }) {
  const semanticTokens = tokens.filter((token) => isSemanticToken(token, semantic));

  let result = '';

  themeAliases.forEach(({ key }) => {
    let block = '';

    semanticTokens.forEach((token) => {
      const name = getSemanticName(token.path, themeAliases);

      if (name && name.key === key) {
        block += `--${key}-${name.name}: var(${getSemanticVariable(name, prefix)});\n`;
      }
    });

    if (block) {
      result += `\n${block}`;
    }
  });

  return result;
}

// Тело блока с отступом в 2 пробела, без пустых строк в начале и подряд — как после prettier.
function indentBlock(content) {
  const lines = content.split('\n').reduce((acc, line) => {
    const isEmpty = !line.trim();

    if (isEmpty && (!acc.length || !acc[acc.length - 1])) {
      return acc;
    }

    return [...acc, isEmpty ? '' : `  ${line}`];
  }, []);

  while (lines.length && !lines[lines.length - 1]) {
    lines.pop();
  }

  return `${lines.join('\n')}\n`;
}

// Возвращает блоки `@theme` (и `@theme inline`, если есть семантические токены) для `tailwind/theme.css`.
export default function buildV4({ tokens, themeAliases, groups, semantic = new Set(), prefix, logger }) {
  const skip = semantic.size ? semantic : null;

  let result = `--*: initial;\n`;

  themeAliases.forEach(({ key, aliases }) => {
    result += '\n';

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
      tokensUnder(tokens, aliases)
        .filter((token) => !(skip && isSemanticToken(token, skip)))
        .forEach(({ path, value }) => {
          result += `--${key}-${path.slice(aliases.length).join('-')}: ${value};\n`;
        });
    }

    if (customFormatting[key] !== undefined) {
      groups
        .filter(({ category }) => category === aliases[0])
        .forEach(({ name, tokens: groupTokens }) => {
          result += customFormatting[key](groupTokens, key, name, logger);
        });
    }
  });

  let content = `@theme {\n${indentBlock(result)}}\n`;

  if (skip) {
    const inline = buildInlineTheme({ tokens, themeAliases, semantic, prefix });

    if (inline) {
      content += `\n@theme inline {\n${indentBlock(inline)}}\n`;
    }
  }

  return content;
}
