# Tailwind Dictionary

[![npm version](https://img.shields.io/npm/v/tailwind-dictionary.svg)](https://www.npmjs.com/package/tailwind-dictionary)
[![npm downloads](https://img.shields.io/npm/dm/tailwind-dictionary.svg)](https://www.npmjs.com/package/tailwind-dictionary)
[![node](https://img.shields.io/node/v/tailwind-dictionary.svg)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/tailwind-dictionary.svg)](./LICENSE)

**English** · [Русский](https://github.com/prosazhin/tailwind-dictionary/blob/main/README.ru.md)

Build a Tailwind CSS theme (v3 and v4) from design tokens — DTCG or the legacy Style Dictionary format — with light,
dark and any other themes. Based on [Style Dictionary](https://github.com/style-dictionary/style-dictionary).

📖 [Documentation](https://prosazhin.dev/docs/tailwind-dictionary?lang=en) ·
🧪 [Playground](https://prosazhin.dev/docs/tailwind-dictionary/playground?lang=en) ·
📝 [Changelog](./CHANGELOG.md)

## Contents

- [Features](#features)
- [Installation](#installation)
- [Quick start](#quick-start)
- [CLI](#cli)
- [Programmatic API](#programmatic-api)
- [Config](#config)
- [Example](#example)
- [Themes](#themes)
- [From Figma](#from-figma)
- [Documentation](#documentation)
- [Comparison](#comparison)
- [Related projects](#related-projects)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

## Features

- **JSON config, no code.** One `config.json` with token paths and theme aliases — no JS/TS build script to maintain.
  JSON Schema gives autocompletion and validation in the editor.
- **DTCG and the legacy format.** Reads
  [W3C Design Tokens (DTCG 2025.10)](https://www.designtokens.org/tr/2025.10/format/) (`$value`, `$type`, composite
  `typography` and `shadow`) as exported by Figma, Tokens Studio and Terrazzo, and the legacy Style Dictionary format
  (`value`) with the same output.
- **Themes on any DOM level.** Light, dark and any other themes (`high-contrast`, brands, …) switch with `data-theme` on
  `<html>` or on any nested container; light/dark also follow `prefers-color-scheme`. Works with a Tailwind prefix.
- **Tailwind 3 and 4.** `theme.css` with `@theme` for v4, `theme.js` for v3.
- **Native Figma export.** Variables exported from Figma work without conversion.
- **CLI, watch mode and API.** `--watch` rebuilds on changes; `build()` and the browser-friendly `generate()` come with
  TypeScript types.

## Installation

Requires Node.js 22 or newer.

```bash
npm install tailwind-dictionary --save-dev
```

## Quick start

1. Create `config.json`:

   ```json
   {
     "$schema": "./node_modules/tailwind-dictionary/schema/config.schema.json",
     "version": 4,
     "source": ["tokens/**/*.json"],
     "output": "./styles",
     "themeAliases": { "color": "color", "spacing": "1px", "radius": "rounded" }
   }
   ```

2. Build the theme:

   ```bash
   npx tailwind-dictionary
   ```

3. Import it **after** Tailwind:

   ```css
   @import 'tailwindcss';
   @import './styles/tailwind/theme.css';
   ```

   For Tailwind v3, spread `styles/tailwind/theme.js` into `tailwind.config.js`:

   ```javascript
   const theme = require('./styles/tailwind/theme.js');

   module.exports = {
     theme: {
       ...theme,
       extend: {
         ...theme.extend,
       },
     },
   };
   ```

## CLI

```bash
npx tailwind-dictionary [options]
```

| Flag              | Short | Description                                                        |
| :---------------- | :---- | :----------------------------------------------------------------- |
| `--config [path]` | `-c`  | Config file to use (`.json`). Default is `./config.json`           |
| `--watch`         | `-w`  | Rebuild when token files (`source`, `themes`) or the config change |
| `--version`       | `-v`  | Output the current version                                         |

Config and token errors are printed as one line with the file and the token path; the exit code is `1`.

## Programmatic API

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

More in the [API docs](https://prosazhin.dev/docs/tailwind-dictionary/api?lang=en).

## Config

| Property       | Type   | Required | Description                                                                                                                                                                    |
| :------------- | :----- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`      | Number | yes      | Tailwind CSS version (`3` or `4`). Default is `4`.                                                                                                                             |
| `source`       | Array  | yes      | Globs or paths of token files, e.g. `["tokens/*.json"]`. JSON, JSON5 and JS are supported. Default is `["tokens/**/*.json"]`.                                                  |
| `output`       | String | yes      | Output folder, created if missing. Default is `"./styles"`.                                                                                                                    |
| `themeAliases` | Object | yes      | Tailwind theme keys mapped to token paths. See [the default theme](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css) for the list of keys. |
| `themes`       | Object | no       | Theme token files (`light`, `dark`, any name), the `default` theme and the `prefix` of semantic CSS variables (v4). See [Themes](#themes).                                     |
| `numberUnit`   | String | no       | Unit for bare numbers in dimension keys: `"px"` (default), `"rem"` (value / 16) or `false`. See [From Figma](#from-figma).                                                     |

An alias is a path to the tokens separated by `/`: a category (`rounded`) or a category and a type (`font/family`).
Use the same keys as in the Tailwind theme of your version:

<table>
<tr><th>Tailwind 4</th><th>Tailwind 3</th></tr>
<tr>
<td>

```json
{
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

</td>
<td>

```json
{
  "themeAliases": {
    "fontFamily": "font/family",
    "fontWeight": "font/weight",
    "lineHeight": "font/leading",
    "fontSize": "font/size",
    "colors": "color",
    "screens": "screen",
    "spacing": "size",
    "borderRadius": "rounded",
    "extend": {
      "boxShadow": "shadow",
      "opacity": "opacity"
    }
  }
}
```

</td>
</tr>
</table>

In v4 `themeAliases.spacing` is the base unit (`"1px"` or `"0.25rem"`), not a path to tokens.

Full reference: [Config](https://prosazhin.dev/docs/tailwind-dictionary/config?lang=en).

## Example

Tokens in [DTCG](https://prosazhin.dev/docs/tailwind-dictionary/dtcg?lang=en) (`$type` is inherited from the group):

```json
{
  "font": {
    "family": {
      "$type": "fontFamily",
      "sans": { "$value": ["Inter", "sans-serif"] }
    },
    "h64": {
      "$type": "typography",
      "$value": { "fontSize": "64px", "lineHeight": 1.25, "fontWeight": 700 }
    }
  },
  "rounded": {
    "$type": "dimension",
    "4": { "$value": { "value": 4, "unit": "px" } },
    "8": { "$value": { "value": 8, "unit": "px" } }
  },
  "shadow": {
    "$type": "shadow",
    "card": { "$value": { "color": "#0000001a", "offsetX": "0px", "offsetY": "1px", "blur": "2px", "spread": "0px" } }
  }
}
```

<table>
<tr><th>Tailwind 4 — <code>theme.css</code></th><th>Tailwind 3 — <code>theme.js</code></th></tr>
<tr>
<td>

```css
@theme {
  --*: initial;

  --font-sans: 'Inter', sans-serif;

  --text-h64: 64px;
  --text-h64--line-height: 1.25;
  --text-h64--font-weight: 700;

  --spacing: 1px;

  --radius-4: 4px;
  --radius-8: 8px;

  --shadow-card: 0px 1px 2px 0px #0000001a;
}
```

</td>
<td>

```javascript
module.exports = {
  fontFamily: {
    sans: "'Inter', sans-serif",
  },
  fontSize: {
    h64: ['64px', { lineHeight: 1.25, fontWeight: 700 }],
  },
  borderRadius: {
    4: '4px',
    8: '8px',
  },
  extend: {
    boxShadow: {
      card: '0px 1px 2px 0px #0000001a',
    },
  },
};
```

</td>
</tr>
</table>

The same output comes from the [legacy format](https://prosazhin.dev/docs/tailwind-dictionary/legacy?lang=en)
(`value`, the `mixin` field for text styles). Breakpoints (`screen.lg.{min,max}`) and keyframes
(`keyframes.<name>.<frame>.<property>`) are built from the token structure.

A real project: the [pbstyles](https://github.com/prosazhin/pbstyles) style library
([config](https://github.com/prosazhin/pbstyles/blob/main/config-tailwind-dictionary.json),
[tokens](https://github.com/prosazhin/pbstyles/tree/main/tokens)).

## Themes

```json
{
  "source": ["tokens/*.json"],
  "themes": {
    "default": "light",
    "light": ["tokens/themes/light.json"],
    "dark": ["tokens/themes/dark.json"],
    "high-contrast": ["tokens/themes/high-contrast.json"]
  }
}
```

> [!NOTE]
> `source` must not include the theme files — use `tokens/*.json` instead of `tokens/**/*.json`.

Tokens defined in the themes other than `default` become semantic: in v4 they are CSS variables `--theme-<key>-<name>`
(the prefix is set by `themes.prefix`) mapped into `@theme inline`, in v3 — `var()` references in `theme.js` plus
`theme.css`.

```css
:root {
  --theme-color-background: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']):not([data-theme='high-contrast']) {
    --theme-color-background: #0f0f0f;
  }
}

[data-theme='dark'] {
  --theme-color-background: #0f0f0f;
}

/* [data-theme='high-contrast'] { … } [data-theme='light'] { … } */

@theme inline {
  --color-background: var(--theme-color-background);
}
```

- no attribute — `:root` gets the `default` theme, light/dark follow the system `prefers-color-scheme`;
- `data-theme="<name>"` forces the theme on the element and its subtree — on `<html>` or on any nested container.

Details: [Themes](https://prosazhin.dev/docs/tailwind-dictionary/themes?lang=en).

## From Figma

**Variables → right click on a collection → Export modes** gives one `*.tokens.json` file per mode. Put the primitives
into `source` and the modes into `themes`:

```json
{
  "version": 4,
  "source": ["tokens/Primitives.tokens.json"],
  "themes": {
    "light": ["tokens/Light.tokens.json"],
    "dark": ["tokens/Dark.tokens.json"]
  },
  "output": "./styles",
  "themeAliases": { "color": "color", "radius": "radius", "spacing": "1px", "text": "font/size" }
}
```

Figma exports numbers without units, so bare numbers in dimension keys (`radius`, `text`, `breakpoint`, …) get `px`
by default (`numberUnit`). Details: [From Figma](https://prosazhin.dev/docs/tailwind-dictionary/figma?lang=en).

## Documentation

| Page                                                                            | What's inside                                                   |
| :------------------------------------------------------------------------------ | :-------------------------------------------------------------- |
| [Getting started](https://prosazhin.dev/docs/tailwind-dictionary?lang=en)       | Overview and quick start                                        |
| [Config](https://prosazhin.dev/docs/tailwind-dictionary/config?lang=en)         | All config options and theme aliases                            |
| [DTCG](https://prosazhin.dev/docs/tailwind-dictionary/dtcg?lang=en)             | `$type` values, typography, shadows, breakpoints, `$extensions` |
| [Legacy format](https://prosazhin.dev/docs/tailwind-dictionary/legacy?lang=en)  | Style Dictionary `value` format and `mixin`                     |
| [Themes](https://prosazhin.dev/docs/tailwind-dictionary/themes?lang=en)         | Light, dark and custom themes, generated CSS                    |
| [From Figma](https://prosazhin.dev/docs/tailwind-dictionary/figma?lang=en)      | Native Figma Variables export, `numberUnit`                     |
| [API](https://prosazhin.dev/docs/tailwind-dictionary/api?lang=en)               | `build()`, `generate()`, TypeScript types                       |
| [Playground](https://prosazhin.dev/docs/tailwind-dictionary/playground?lang=en) | Try it in the browser                                           |

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

## Related projects

- [mixin-dictionary](https://github.com/prosazhin/mixin-dictionary) — the same tokens as CSS variables and LESS/SCSS
  variables and mixins.
- [pbstyles](https://github.com/prosazhin/pbstyles) — a style library built with both packages.
- [pbcomponents](https://github.com/prosazhin/pbcomponents) — React components on top of pbstyles.

## Contributing

Bug reports and ideas are welcome in [issues](https://github.com/prosazhin/tailwind-dictionary/issues). Before opening a
pull request, read [CONTRIBUTING.md](./CONTRIBUTING.md).

## Author

**Evgenii Sazhin**, frontend developer & designer — [prosazhin.dev](https://prosazhin.dev?lang=en) ·
[GitHub](https://github.com/prosazhin) · [Telegram](https://t.me/prosazhin) ·
[LinkedIn](https://www.linkedin.com/in/prosazhin)

If the package is useful to you, give it a ⭐ on [GitHub](https://github.com/prosazhin/tailwind-dictionary).

## License

[MIT](./LICENSE) © Evgenii Sazhin
