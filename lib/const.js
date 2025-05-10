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
];

const DEFAULT_VALUE = {
  source: ['tokens/**/*.json'],
  output: './styles',
  themeAliases: {},
  version: 4,
};

const CUSTOM_FORMATTING_LIST = ['fontSize'];

const EXCEPTION_PROPS_V4 = ['breakpoint', 'keyframes'];

const FONT_PROPS_V4 = {
  'font-size': false,
  'line-height': true,
  'letter-spacing': true,
  'font-weight': true,
};

export { DEFAULT_OPTIONS, DEFAULT_VALUE, CUSTOM_FORMATTING_LIST, EXCEPTION_PROPS_V4, FONT_PROPS_V4 };
