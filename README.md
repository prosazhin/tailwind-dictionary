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
  "version": 4,
  "source": ["tokens/**/*.json"],
  "output": "./styles",
  "themeAliases": { ... }
}
```

| Property     | Type   | Description                                                                                                                                                                                     |
| :----------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version      | Number | Tailwind CSS version (3 or 4). Default is 4.                                                                                                                                                    |
| source       | Array  | An array of file path [globs](https://github.com/isaacs/node-glob) to design token files. Exactly like [Style Dictionary](https://github.com/amzn/style-dictionary).                            |
| output       | String | Base path to build the files, must end with a trailing slash. By default is "./styles".                                                                                                         |
| themeAliases | Object | Aliases for the Tailwind Theme. [Complete theme](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css) and [documentation](https://tailwindcss.com/docs/theme). |

### Example of theme aliases

The entire list of keys for the Tailwind theme can be found in the [documentation](https://tailwindcss.com/docs/theme) or [the full default theme](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css). The most important thing is to use the same keys in the config for the theme as in the original theme, such as “fontFamily”.

Aliases must include a category for CTI, for example `rounded`. They can also include both a category and a type, for instance `font/family`, where `font` is the category and `family` is the type.

#### Config for Tailwind version 4

```json
{
  ...
  "themeAliases": {
    "font": "font/family",
    "font-weight": "font/weight",
    "leading": "font/leading",
    "text": "font/size",
    "color": "color",
    "spacing": "1",
    "radius": "rounded",
    "shadow": "shadow",
    "breakpoint": "screen",
    "animation": "animation",
    "keyframes": "keyframes"
  }
}
```

#### Config for Tailwind version 3

```json
{
  ...
  "themeAliases": {
    "fontFamily": "font/family",
    "fontWeight": "font/weight",
    "lineHeight": "font/leading",
    "fontSize": "font/size",
    "colors": "color",
    "screens": "screen",
    "spacing": "size",
    "borderRadius": "rounded",
    "borderWidth": "stroke",
    "extend": {
      "opacity": "opacity",
      "boxShadow": "shadow",
      "spacing": "container"
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
  }
}
```

#### Tailwind Theme version 4

```css
@theme {
  --*: initial;

  --font-sans: 'Inter', sans-serif;

  --font-weight-regular: 400;
  --font-weight-medium: 600;
  --font-weight-bold: 700;

  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-normal: 1.5;

  --spacing: 1;

  --radius-0: 0px;
  --radius-4: 4px;
  --radius-6: 6px;
  --radius-8: 8px;
  --radius-999: 999px;
}
```

#### Tailwind Theme version 3

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
};
```

---

### Usage in a Tailwind theme version 4

```css
@import 'tailwindcss';
@import './styles/tailwind/theme.css';
```

### Example of typography mixins

#### Config

```json
{
  ...
  "themeAliases": {
    ...
    "text": "font/size",
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

```css
@theme {
  --text-12: 12px;
  --text-16: 16px;
  --text-20: 20px;

  --text-h64: 64px;
  --text-h64--line-height: 1.25;
  --text-h64--font-weight: 700;
}
```

### Example of media query

#### Config

```json
{
  ...
  "themeAliases": {
    ...
    "breakpoint": "screen",
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

```css
@theme {
  --breakpoint-xl: 1441px;
  --breakpoint-lg-max: 1440px;
  --breakpoint-lg-min: 921px;
}
```

### Example of animation

#### Config

```json
{
  ...
  "themeAliases": {
    ...
    "animation": "animation",
    "keyframes": "keyframes"
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

```css
@theme {
  --animation-show: show 300ms ease-in forwards;

  @keyframes show {
    from: {
      opacity: 0;
    }
    to: {
      opacity: 1;
    }
  }
}
```

---

### Usage in a Tailwind theme version 3

```javascript
const theme = require('./styles/tailwind');

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
