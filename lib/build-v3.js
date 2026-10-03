import { tokensUnder } from './tokens/read-tokens.js';
import { customFormatting } from './utils/helpers.js';
import { CUSTOM_FORMATTING_LIST } from './const.js';

// Вложенный объект значений по путям токенов относительно alias.
// Семантические токены (переопределяемые темами) получают `var(--<path>)` — по пути токена,
// а не по совпадению значения, поэтому несемантические токены с тем же значением не задеваются.
function toObject(tokens, depth, themed) {
  const result = {};

  tokens.forEach(({ path, value }) => {
    const keys = path.slice(depth);
    let target = result;

    keys.slice(0, -1).forEach((key) => {
      target[key] = target[key] ?? {};
      target = target[key];
    });

    target[keys[keys.length - 1]] = themed.has(path.join('.')) ? `var(--${path.join('-')})` : value;
  });

  return result;
}

// Возвращает содержимое `tailwind/theme.js`.
export default function buildV3({ tokens, themeAliases, groups, themed = new Set(), logger }) {
  const result = {};

  themeAliases.forEach(({ key, aliases, isExtend }) => {
    if (isExtend) {
      result.extend = result.extend ?? {};
    }

    const target = isExtend ? result.extend : result;

    target[key] = toObject(tokensUnder(tokens, aliases), aliases.length, themed);

    if (CUSTOM_FORMATTING_LIST.includes(key)) {
      groups
        .filter(({ category }) => category === aliases[0])
        .forEach(({ name, tokens: groupTokens }) => {
          target[key] = { ...target[key], [name]: customFormatting[key](groupTokens, key, name, logger) };
        });
    }
  });

  return `module.exports = ${JSON.stringify(result)};\n`;
}
