# Tailwind Dictionary

Tailwind Dictionary is a package based on [Style Dictionary](https://github.com/amzn/style-dictionary) that allows creating a Tailwind Theme from design tokens.

## Installation

```bash
$ npm install tailwind-dictionary --save-dev
# or
$ yarn add tailwind-dictionary --dev
```

## Usage

```bash
$ tailwind-dictionary
```

| Flag              | Short Flag | Description                                      |
| ----------------- | ---------- | ------------------------------------------------ |
| --config \[path\] | -c         | Set the config file to use. Must be a .json file |

## Example

As an example of usage, you can look at the [pbstyles](https://github.com/prosazhin/pbstyles) style library.

### config.json

```json
{
  "source": ["tokens/**/*.json"],
  "output": "./styles",
  "themeAliases": { ... }
}
```

| Property     | Type   | Description                                                                                                                                                                             |
| :----------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| source       | Array  | An array of file path [globs](https://github.com/isaacs/node-glob) to design token files. Exactly like [Style Dictionary](https://github.com/amzn/style-dictionary).                    |
| output       | String | Base path to build the files, must end with a trailing slash. By default is "./styles".                                                                                                 |
| themeAliases | Object | Aliases for the Tailwind Theme. [Complete theme](https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/config.full.js) and [documentation](https://tailwindcss.com/docs/theme). |

### Example of theme aliases

The entire list of keys for the Tailwind theme can be found in the [documentation](https://tailwindcss.com/docs/theme) or [the full default theme](https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/config.full.js). The most important thing is to use the same keys in the config for the theme as in the original theme, such as “fontFamily”.

Aliases must include a category for CTI, for example `rounded`. They can also include both a category and a type, for instance `font/family`, where `font` is the category and `family` is the type.

#### Config

```json
{
  ...
  "themeAliases": {
    "fontFamily": "font/family",
    "fontWeight": "font/weight",
    "lineHeight": "font/leading",
    "borderRadius": "rounded",
    "extend": {
      "opacity": "opacity"
    }
  }
}
```

#### Design-tokens

```json
{
  "font": {
    "family": {
      "sans": { "value": "Inter, sans-serif" }
    },
    "weight": {
      "regular": { "value": 400 },
      "medium": { "value": 600 },
      "bold": { "value": 700 }
    },
    "leading": {
      "none": { "value": 1 },
      "tight": { "value": 1.25 },
      "normal": { "value": 1.5 }
    }
  },
  "rounded": {
    "0": { "value": "0px" },
    "4": { "value": "4px" },
    "6": { "value": "6px" },
    "8": { "value": "8px" },
    "999": { "value": "999px" }
  },
  "opacity": {
    "0": { "value": "0" },
    "50": { "value": "0.5" },
    "100": { "value": "1" }
  }
}
```

#### Tailwind Theme

```javascript
module.exports = {
  fontFamily: {
    sans: 'Inter, sans-serif',
  },
  fontWeight: {
    regular: 400,
    medium: 600,
    bold: 700,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
  },
  borderRadius: {
    0: '0px',
    4: '4px',
    6: '6px',
    8: '8px',
    999: '999px',
  },
  extend: {
    opacity: {
      0: '0',
      50: '0.5',
      100: '1',
    },
  },
};
```

### Usage in a Tailwind theme

```javascript
const theme = require('./styles/tailwind-theme');

module.exports = {
  ...
  theme: {
    ...theme,
    extend: {
      ...theme.extend,
    },
  },
  ...
};
```

### Example of typography mixins

#### Config

```json
{
  ...
  "themeAliases": {
    ...
    "fontSize": "font/size",
    ...
  }
}
```

#### Design-tokens

```json
{
  "font": {
    "size": {
      "12": { "value": "{size.12}" },
      "16": { "value": "{size.16}" },
      "20": { "value": "{size.20}" }
    },
    "h64": {
      "font-size": {
        "value": "64px",
        "mixin": "h64"
      },
      "line-height": {
        "value": "1.25",
        "mixin": "h64"
      },
      "font-weight": {
        "value": "700",
        "mixin": "h64"
      }
    }
  }
}
```

#### Tailwind Theme

```javascript
module.exports = {
  fontSize: {
    12: '12px',
    16: '16px',
    20: '20px',
    h64: ['64px', { lineHeight: 1.25, fontWeight: 700 }],
  },
};
```

### Example of media query

#### Config

```json
{
  ...
  "themeAliases": {
    ...
    "screens": "screen",
    ...
  }
}
```

#### Design-tokens

```json
{
  "screen": {
    "xl": {
      "min": { "value": "1441px" }
    },
    "lg": {
      "max": { "value": "1440px" },
      "min": { "value": "921px" }
    }
  }
}
```

#### Tailwind Theme

```javascript
module.exports = {
  screens: {
    xl: { min: '1441px' },
    lg: { max: '1440px', min: '921px' },
  },
};
```

### Example of animation

#### Config

```json
{
  ...
  "themeAliases": {
    ...
    "extend": {
      "animation": "animation",
      "keyframes": "keyframes"
    }
  }
}
```

#### Design-tokens

```json
{
  "animation": {
    "show": {
      "value": "show 300ms ease-in forwards"
    }
  },
  "keyframes": {
    "show": {
      "from": {
        "opacity": {
          "value": 0,
          "mixin": "show"
        }
      },
      "to": {
        "opacity": {
          "value": 1,
          "mixin": "show"
        }
      }
    }
  }
}
```

#### Tailwind Theme

```javascript
module.exports = {
  extend: {
    animation: {
      show: 'show 300ms ease-in forwards',
    },
    keyframes: {
      show: {
        from: {
          opacity: 0,
        },
        to: {
          opacity: 1,
        },
      },
    },
  },
};
```
