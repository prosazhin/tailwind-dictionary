const DEFAULT_OPTIONS = [
  {
    name: 'Source',
    value: 'source',
  },
  {
    name: 'Output',
    value: 'output',
  },
  {
    name: 'Theme aliases',
    value: 'themeAliases',
  },
  {
    name: 'Tailwind version',
    value: 'version',
  },
  {
    name: 'Themes',
    value: 'themes',
    optional: true,
  },
  {
    name: 'Number unit',
    value: 'numberUnit',
    optional: true,
  },
];

const DEFAULT_VALUE = {
  source: ['tokens/**/*.json'],
  output: './styles',
  themeAliases: {},
  version: 4,
  themes: null,
  numberUnit: 'px',
};

const CUSTOM_FORMATTING_LIST = ['fontSize'];

const EXCEPTION_PROPS_V4 = ['breakpoint', 'keyframes'];

// Префикс «сырых» CSS-переменных семантических токенов в v4, если themes.prefix не задан
const DEFAULT_SEMANTIC_PREFIX = 'theme';

// Ключи темы, значения которых — длины: голое число (`$type: number`, FLOAT из Figma) получает единицу.
// `leading`, `font-weight`, `opacity`, `z-index`, `aspect` и т. п. в списки не входят.
const DIMENSION_KEYS_V4 = ['spacing', 'radius', 'text', 'breakpoint', 'container', 'blur'];

const DIMENSION_KEYS_V3 = [
  'spacing',
  'borderRadius',
  'borderWidth',
  'fontSize',
  'screens',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'size',
  'blur',
  'inset',
  'gap',
  'margin',
  'padding',
];

// Подсвойства типографики внутри `text` / `fontSize`, которые не являются размером шрифта.
const NON_SIZE_FONT_PROPS = [
  'line-height',
  'lineHeight',
  'font-weight',
  'fontWeight',
  'letter-spacing',
  'letterSpacing',
];

// Базовый размер шрифта для `numberUnit: "rem"`.
const ROOT_FONT_SIZE = 16;

const FONT_PROPS_V4 = {
  'font-size': false,
  'line-height': true,
  'letter-spacing': true,
  'font-weight': true,
};

export {
  DEFAULT_OPTIONS,
  DEFAULT_VALUE,
  CUSTOM_FORMATTING_LIST,
  EXCEPTION_PROPS_V4,
  FONT_PROPS_V4,
  DEFAULT_SEMANTIC_PREFIX,
  DIMENSION_KEYS_V3,
  DIMENSION_KEYS_V4,
  NON_SIZE_FONT_PROPS,
  ROOT_FONT_SIZE,
};
