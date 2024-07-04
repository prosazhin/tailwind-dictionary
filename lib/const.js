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
];

const DEFAULT_VALUE = {
  source: ['tokens/**/*.json'],
  output: './styles',
  themeAliases: {},
};

const CUSTOM_FORMATTING_LIST = ['fontSize'];

export { DEFAULT_OPTIONS, DEFAULT_VALUE, CUSTOM_FORMATTING_LIST };
