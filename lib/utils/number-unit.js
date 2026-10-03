import { DIMENSION_KEYS_V3, DIMENSION_KEYS_V4, NON_SIZE_FONT_PROPS, ROOT_FONT_SIZE, DEFAULT_VALUE } from '../const.js';
import { getSemanticName } from './helpers.js';

const FONT_KEYS = ['text', 'fontSize'];

function isBareNumber({ type, value }) {
  return typeof value === 'number' && (type === 'number' || type === undefined);
}

function withUnit(value, numberUnit) {
  if (value === 0) {
    return value;
  }

  if (numberUnit === 'rem') {
    return `${Number((value / ROOT_FONT_SIZE).toFixed(4))}rem`;
  }

  return `${value}px`;
}

// Голые числа в размерных ключах темы (`radius`, `text`, `borderRadius`, …) → число с единицей.
// FLOAT-переменная Figma выгружается как `$type: number` без единицы, а в CSS `--radius-4: 4` недействительно.
// Не размерные ключи (`leading`, `opacity`, `z`, …), ноль и строки не меняются.
// `numberUnit`: "px" (по умолчанию), "rem" (значение / 16) или false (как есть).
function applyNumberUnit(tokens, themeAliases, { version = 4, numberUnit = DEFAULT_VALUE.numberUnit } = {}) {
  if (numberUnit !== 'px' && numberUnit !== 'rem') {
    return tokens;
  }

  const dimensionKeys = version === 3 ? DIMENSION_KEYS_V3 : DIMENSION_KEYS_V4;

  return tokens.map((token) => {
    if (!isBareNumber(token)) {
      return token;
    }

    const name = getSemanticName(token.path, themeAliases);

    if (!name || !dimensionKeys.includes(name.key)) {
      return token;
    }

    if (FONT_KEYS.includes(name.key) && NON_SIZE_FONT_PROPS.includes(token.path[token.path.length - 1])) {
      return token;
    }

    return { ...token, value: withUnit(token.value, numberUnit) };
  });
}

export { applyNumberUnit };
