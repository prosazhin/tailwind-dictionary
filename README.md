# Tailwind Dictionary

[![npm version](https://img.shields.io/npm/v/tailwind-dictionary.svg)](https://www.npmjs.com/package/tailwind-dictionary)
[![npm downloads](https://img.shields.io/npm/dm/tailwind-dictionary.svg)](https://www.npmjs.com/package/tailwind-dictionary)
[![CI](https://github.com/prosazhin/tailwind-dictionary/actions/workflows/ci.yml/badge.svg)](https://github.com/prosazhin/tailwind-dictionary/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/tailwind-dictionary.svg)](./LICENSE)

[Documentation](https://prosazhin.dev/docs/tailwind-dictionary)

Tailwind Dictionary builds a Tailwind CSS theme (v3 and v4) from design tokens. It is based on [Style Dictionary](https://github.com/style-dictionary/style-dictionary).

## Why this package

- **JSON config, no code.** One `config.json` with token paths and theme aliases — no JS/TS build script to maintain.
- **DTCG and the legacy format.** Reads [W3C Design Tokens (DTCG 2025.10)](https://www.designtokens.org/tr/2025.10/format/) (`$value`, `$type`, composite `typography` and `shadow`) as exported by Figma, Tokens Studio and Terrazzo, and the legacy Style Dictionary format (`value`) with the same output.
- **Themes on any DOM level.** Light, dark and any other themes (`high-contrast`, brands, …) switch with `data-theme` on `<html>` or on any nested container, light/dark also follow `prefers-color-scheme`. Works with a Tailwind prefix.

## Quick start

```bash
npm install tailwind-dictionary --save-dev
```

```json
{
  "$schema": "./node_modules/tailwind-dictionary/schema/config.schema.json",
  "version": 4,
  "source": ["tokens/**/*.json"],
  "output": "./styles",
  "themeAliases": { "color": "color", "spacing": "1px", "radius": "rounded" }
}
```

```bash
npx tailwind-dictionary
```

```css
@import 'tailwindcss';
@import './styles/tailwind/theme.css';
```

## Usage

```bash
$ tailwind-dictionary
```

| Flag              | Short Flag | Description                                                        |
| ----------------- | ---------- | ------------------------------------------------------------------ |
| --config \[path\] | -c         | Set the config file to use. Must be a .json file                   |
| --watch           | -w         | Rebuild when token files (`source`, `themes`) or the config change |
| --version         | -v         | Output the current version                                         |

Config and token errors are printed as one line with the file and the token path, the exit code is `1`.

### Programmatic API

```js
import { build } from 'tailwind-dictionary';

// Same options as config.json. Or: await build({ config: './config.json' })
const files = await build({
  version: 4,
  source: ['tokens/**/*.json'],
  output: './styles',
  themeAliases: { color: 'color' },
});
```

`generate()` does not touch the file system and works in the browser: it takes token objects and returns file contents.

```js
import { generate } from 'tailwind-dictionary/generate';

const files = await generate({
  tokens: { color: { $type: 'color', white: { $value: '#ffffff' } } },
  themes: { dark: { color: { white: { $value: '#000000' } } } }, // optional
  themeAliases: { color: 'color' },
  version: 4,
});

files['tailwind/theme.css']; // v4; v3 returns 'tailwind/theme.js' (+ 'tailwind/theme.css' with themes)
```

TypeScript types are included.

## Example

As an example of usage, you can look at the [pbstyles](https://github.com/prosazhin/pbstyles) style library.

### config.json

```json
{
  "$schema": "./node_modules/tailwind-dictionary/schema/config.schema.json",
  "version": 4,
  "source": ["tokens/*.json"],
  "output": "./styles",
  "themeAliases": { ... }
}
```

`$schema` enables autocompletion and validation of the config in VS Code and other editors.

| Property     | Type   | Required | Description                                                                                                                                                                                     |
| :----------- | :----- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version      | Number | yes      | Tailwind CSS version (3 or 4). Default is 4.                                                                                                                                                    |
| source       | Array  | yes      | Globs or file paths of design token files, e.g. `["tokens/*.json"]` or `["tokens/base.json"]`. JSON, JSON5 and JS files are supported. Default is `["tokens/**/*.json"]`.                       |
| output       | String | yes      | Folder for the result. The folder is created if it does not exist. Default is "./styles".                                                                                                       |
| themeAliases | Object | yes      | Aliases for the Tailwind Theme. [Complete theme](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css) and [documentation](https://tailwindcss.com/docs/theme). |
| themes       | Object | no       | Theme token files (`light`, `dark`, any other name), `default` theme and `prefix` for semantic CSS variables (v4). See [Themes](#themes).                                                       |
| numberUnit   | String | no       | Unit for bare numbers (`"$type": "number"`) in dimension keys: `"px"` (default), `"rem"` (value / 16) or `false` (keep the number). See [From Figma](#from-figma).                              |

### Example of theme aliases

The entire list of keys for the Tailwind theme can be found in the [documentation](https://tailwindcss.com/docs/theme) or [the full default theme](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css). The most important thing is to use the same keys in the config for the theme as in the original theme, such as “fontFamily”.

An alias is a path to the tokens separated by `/`: a category, for example `rounded`, or a category and a type, for instance `font/family`.

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
    "spacing": "1px",
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

Both formats give the same Tailwind theme. Legacy Style Dictionary format (`value`):

```json
{
  "font": {
    "family": {
      "sans": { "value": "'Inter', sans-serif" }
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

The same tokens in [DTCG](#dtcg) (`$value`, `$type` set once on the group):

```json
{
  "font": {
    "family": {
      "$type": "fontFamily",
      "sans": { "$value": ["Inter", "sans-serif"] }
    },
    "weight": {
      "$type": "fontWeight",
      "regular": { "$value": 400 },
      "medium": { "$value": 600 },
      "bold": { "$value": 700 }
    },
    "leading": {
      "$type": "number",
      "none": { "$value": 1 },
      "tight": { "$value": 1.25 },
      "normal": { "$value": 1.5 }
    }
  },
  "rounded": {
    "$type": "dimension",
    "0": { "$value": { "value": 0, "unit": "px" } },
    "4": { "$value": { "value": 4, "unit": "px" } },
    "6": { "$value": { "value": 6, "unit": "px" } },
    "8": { "$value": { "value": 8, "unit": "px" } },
    "999": { "$value": { "value": 999, "unit": "px" } }
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

  --spacing: 1px;

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
    sans: "'Inter', sans-serif",
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

## DTCG

Token files in the [DTCG 2025.10](https://www.designtokens.org/tr/2025.10/format/) format (`$value`, `$type`) are detected automatically. One build uses one format: mixing `value` and `$value` in the same set of files is an error.

| DTCG value                                                         | Output                                                                                 |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| `dimension` `{ "value": 16, "unit": "px" }`                        | `16px`                                                                                 |
| `color` `{ "colorSpace": "srgb", "components": […], "hex": "#…" }` | `#…`, with `alpha` — `rgba(…)`, other color spaces — `oklch(…)`, `color(display-p3 …)` |
| `fontFamily` `["Inter", "sans-serif"]`                             | `'Inter', sans-serif`                                                                  |
| `shadow` (object or array of layers)                               | `0px 1px 2px 0px #000000, inset …`                                                     |
| `duration`, `cubicBezier`, `border`, `transition`                  | `150ms`, `cubic-bezier(…)`, `1px solid #…`, …                                          |
| string values                                                      | as is                                                                                  |

`$type` is inherited from the parent group. A reference `{group.token}` must point to an existing token, otherwise the build stops with the token path and the file name.

### Simple tokens

```json
{
  "color": {
    "$type": "color",
    "white": { "$value": { "colorSpace": "srgb", "components": [1, 1, 1], "hex": "#ffffff" } },
    "text": { "$value": "{color.white}" }
  },
  "size": {
    "$type": "dimension",
    "16": { "$value": { "value": 16, "unit": "px" } }
  }
}
```

### Typography

A composite `typography` token becomes a text style named after the token (`font.h64` → `h64`), no `mixin` field needed:

```json
{
  "font": {
    "h64": {
      "$type": "typography",
      "$value": {
        "fontSize": "{font.size.64}",
        "lineHeight": "{font.leading.tight}",
        "fontWeight": "{font.weight.bold}"
      }
    }
  }
}
```

```css
@theme {
  --text-h64: 64px;
  --text-h64--line-height: 1.25;
  --text-h64--font-weight: 700;
}
```

Tailwind v4 `--text-*` supports `line-height`, `letter-spacing` and `font-weight`. Other properties (for example `fontFamily`) are skipped with a warning that names the token. `fontSize` is required.

### Shadow

```json
{
  "shadow": {
    "$type": "shadow",
    "card": {
      "$value": [
        { "color": "#0000001a", "offsetX": "0px", "offsetY": "1px", "blur": "2px", "spread": "0px" },
        { "color": "#0000001a", "offsetX": "0px", "offsetY": "4px", "blur": "8px", "spread": "-2px", "inset": true }
      ]
    }
  }
}
```

```css
--shadow-card: 0px 1px 2px 0px #0000001a, inset 0px 4px 8px -2px #0000001a;
```

### Breakpoints and keyframes without `mixin`

Groups are built from the token structure:

- tokens under the `breakpoint` / `screens` alias: `screen.lg.{min,max}` → breakpoint `lg`, `screen.sm` → breakpoint `sm`;
- tokens under the `keyframes` alias: `keyframes.<name>.<frame>.<property>` → `@keyframes <name>`.

```json
{
  "screen": {
    "$type": "dimension",
    "lg": {
      "min": { "$value": { "value": 921, "unit": "px" } },
      "max": { "$value": { "value": 1440, "unit": "px" } }
    }
  },
  "keyframes": {
    "$type": "number",
    "show": {
      "from": { "opacity": { "$value": 0 } },
      "to": { "opacity": { "$value": 1 } }
    }
  }
}
```

### Group name via `$extensions`

The group (text style, breakpoint, keyframes) name can be set explicitly:

```json
{
  "font": {
    "body": {
      "$type": "typography",
      "$extensions": { "dev.prosazhin.mixin": "body-lg" },
      "$value": { "fontSize": "16px", "lineHeight": 1.5 }
    }
  }
}
```

The legacy `mixin` field still works and has the highest priority.

## From Figma

The native Figma export works without conversion: **Variables → right click on a collection → Export modes** gives one
`*.tokens.json` file per mode (DTCG).

1. Put the file with the primitives (the collection without modes) into `source`.
2. Put the files of the modes into `themes`: one file per theme (`light`, `dark`, …). The file name does not matter.

```json
{
  "version": 4,
  "source": ["tokens/Primitives.tokens.json"],
  "themes": {
    "light": ["tokens/Light.tokens.json"],
    "dark": ["tokens/Dark.tokens.json"]
  },
  "output": "./styles",
  "themeAliases": {
    "color": "color",
    "radius": "radius",
    "spacing": "1px",
    "font": "font/family",
    "text": "font/size"
  }
}
```

Colors given as objects (`colorSpace`, `components`, `hex`), aliases (`"{color.blue.600}"`) and the service
`$extensions` (`com.figma.*`) are handled. Figma exports a FLOAT variable as a number without a unit, which is not a
valid CSS length, so bare numbers (`"$type": "number"`) in dimension keys get a unit:

| Key                                                                                                         | `numberUnit: "px"` (default) | `numberUnit: "rem"` | `numberUnit: false` |
| :---------------------------------------------------------------------------------------------------------- | :--------------------------- | :------------------ | :------------------ |
| `radius`, `text`, `breakpoint`, `container`, `blur` (v3: `borderRadius`, `fontSize`, `screens`, `width`, …) | `4` → `4px`                  | `4` → `0.25rem`     | `4` → `4`           |

Other keys (`leading`, `font-weight`, `opacity`, `z-index`, …) and `0` stay numbers.

`themeAliases.spacing` in v4 is the base unit (`"1px"` or `"0.25rem"`), not a path to a token; otherwise the build prints a warning.

Limits of the native export: Figma does not export the variable `description`, and composite styles (typography,
shadows) are incomplete.

## Themes

### Config

```json
{
  ...
  "themes": {
    "light": ["tokens/themes/light.json"],
    "dark": ["tokens/themes/dark.json"]
  }
}
```

| Property      | Type       | Description                                                                                                                     |
| :------------ | :--------- | :------------------------------------------------------------------------------------------------------------------------------ |
| themes.<name> | `string[]` | Token files of a theme: `light`, `dark` or any other name (`high-contrast`, `brand`, …).                                        |
| default       | `string`   | Theme whose values go to `:root`. Default is `light`. Without `light` files, `light` means the base tokens from `source`.       |
| prefix        | `string`   | Prefix of semantic CSS variables in v4: `--<prefix>-<key>-<name>`. Default is `theme`, e.g. `"app"` → `--app-color-background`. |

> **Note:** `source` must not include the theme files themselves — use `tokens/*.json` instead of `tokens/**/*.json`.

Semantic tokens are the tokens defined in the themes other than `default`. If a semantic token is missing in one of the themes, the build prints a warning with the token paths.

Theme switching:

- no attribute — `:root` gets the `default` theme, `light`/`dark` follow the system `prefers-color-scheme`;
- `data-theme="<name>"` — forces the theme on the element and its subtree, on `<html>` or on any nested container;
- `data-theme="light"` on `<html>` overrides a dark system scheme; on a nested element it creates a light container inside a dark page.

#### Design-tokens

Legacy format (`value`). `tokens/themes/light.json`:

```json
{
  "color": {
    "background": { "value": "#ffffff" },
    "foreground": { "value": "#0f0f0f" }
  }
}
```

`tokens/themes/dark.json`:

```json
{
  "color": {
    "background": { "value": "#0f0f0f" },
    "foreground": { "value": "#ffffff" }
  }
}
```

The same themes in [DTCG](#dtcg) — the output below does not change. `tokens/themes/light.json`:

```json
{
  "color": {
    "$type": "color",
    "background": { "$value": { "colorSpace": "srgb", "components": [1, 1, 1], "hex": "#ffffff" } },
    "foreground": { "$value": { "colorSpace": "srgb", "components": [0.0588, 0.0588, 0.0588], "hex": "#0f0f0f" } }
  }
}
```

`tokens/themes/dark.json`:

```json
{
  "color": {
    "$type": "color",
    "background": { "$value": { "colorSpace": "srgb", "components": [0.0588, 0.0588, 0.0588], "hex": "#0f0f0f" } },
    "foreground": { "$value": { "colorSpace": "srgb", "components": [1, 1, 1], "hex": "#ffffff" } }
  }
}
```

Theme files use the same format as the `source` files: one build uses one format.

#### Tailwind Theme version 4

Semantic tokens are declared as plain CSS variables `--<prefix>-<key>-<name>` in `:root` with theme overrides on the same names, and mapped into the theme via `@theme inline`. Utilities compile to `var(--<prefix>-<key>-<name>)` directly, so themes work on any DOM level (`data-theme="dark"` on a nested container) and with any Tailwind prefix (`@import 'tailwindcss' prefix(tw)`). Non-semantic tokens stay in the regular `@theme` block.

```css
:root {
  --theme-color-background: #ffffff;
  --theme-color-foreground: #0f0f0f;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --theme-color-background: #0f0f0f;
    --theme-color-foreground: #ffffff;
  }
}

[data-theme='dark'] {
  --theme-color-background: #0f0f0f;
  --theme-color-foreground: #ffffff;
}

[data-theme='light'] {
  --theme-color-background: #ffffff;
  --theme-color-foreground: #0f0f0f;
}

@theme {
  --*: initial;

  --color-*: initial;
}

@theme inline {
  --color-background: var(--theme-color-background);
  --color-foreground: var(--theme-color-foreground);
}
```

#### More than two themes

```json
{
  "themes": {
    "default": "light",
    "light": ["tokens/themes/light.json"],
    "dark": ["tokens/themes/dark.json"],
    "high-contrast": ["tokens/themes/high-contrast.json"]
  }
}
```

Each theme gets its own `[data-theme='<name>']` block. The system dark scheme applies only while no other theme is set on `:root`:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']):not([data-theme='high-contrast']) { ... }
}

[data-theme='dark'] { ... }

[data-theme='high-contrast'] { ... }

[data-theme='light'] { ... }
```

#### Tailwind Theme version 3

`theme.js` with semantic tokens replaced by `var()` references (only the semantic tokens: other tokens with the same value keep their values):

```javascript
module.exports = {
  colors: {
    background: 'var(--color-background)',
    foreground: 'var(--color-foreground)',
  },
};
```

`theme.css` generated alongside `theme.js`:

```css
:root {
  --color-background: #ffffff;
  --color-foreground: #0f0f0f;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-background: #0f0f0f;
    --color-foreground: #ffffff;
  }
}

[data-theme='dark'] {
  --color-background: #0f0f0f;
  --color-foreground: #ffffff;
}

[data-theme='light'] {
  --color-background: #ffffff;
  --color-foreground: #0f0f0f;
}
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

Legacy format with the `mixin` field (in DTCG use a [`typography` token](#typography)):

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
        "opacity": { "value": 0 }
      },
      "to": {
        "opacity": { "value": 1 }
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
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
```

---

### Usage in a Tailwind theme version 3

```javascript
const theme = require('./styles/tailwind/theme.js');

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
    h64: ['64px', { lineHeight: '1.25', fontWeight: '700' }],
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
        "opacity": { "value": 0 }
      },
      "to": {
        "opacity": { "value": 1 }
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

## Comparison

|                                                     | tailwind-dictionary | [sd-tailwindcss-transformer](https://github.com/nado1001/style-dictionary-tailwindcss-transformer) | [Terrazzo](https://terrazzo.app) |
| :-------------------------------------------------- | :------------------ | :------------------------------------------------------------------------------------------------- | :------------------------------- |
| DTCG input (`$value`, `$type`, `$type` inheritance) | ✅                  | ✅                                                                                                 | ✅                               |
| Legacy Style Dictionary format (`value`)            | ✅                  | ✅                                                                                                 | ❌                               |
| Composite `typography` → text styles                | ✅                  | —                                                                                                  | ✅                               |
| Composite `shadow` (multi-layer)                    | ✅                  | —                                                                                                  | ✅                               |
| Light and dark themes, `data-theme` on any level    | ✅                  | ❌                                                                                                 | ✅                               |
| More than two themes                                | ✅                  | ❌                                                                                                 | ✅                               |
| Tailwind 3 and 4                                    | ✅                  | ✅                                                                                                 | v4 only                          |
| Config without JS (JSON + JSON Schema)              | ✅                  | ❌                                                                                                 | ❌                               |
| Programmatic API and TypeScript types               | ✅                  | ✅                                                                                                 | ✅                               |
| `--watch`                                           | ✅                  | —                                                                                                  | ✅                               |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).
