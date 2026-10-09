# Tailwind Dictionary

[![npm version](https://img.shields.io/npm/v/tailwind-dictionary.svg)](https://www.npmjs.com/package/tailwind-dictionary)
[![npm downloads](https://img.shields.io/npm/dm/tailwind-dictionary.svg)](https://www.npmjs.com/package/tailwind-dictionary)
[![node](https://img.shields.io/node/v/tailwind-dictionary.svg)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/tailwind-dictionary.svg)](./LICENSE)

[English](https://github.com/prosazhin/tailwind-dictionary/blob/main/README.md) · **Русский**

Тема Tailwind CSS (v3 и v4) из дизайн-токенов в формате DTCG или старом формате Style Dictionary — со светлой, тёмной
и любыми другими темами. Работает на основе [Style Dictionary](https://github.com/style-dictionary/style-dictionary).

📖 [Документация](https://prosazhin.dev/docs/tailwind-dictionary?lang=ru) ·
🧪 [Плейграунд](https://prosazhin.dev/docs/tailwind-dictionary/playground?lang=ru) ·
📝 [Changelog](./CHANGELOG.md)

## Содержание

- [Возможности](#возможности)
- [Установка](#установка)
- [Быстрый старт](#быстрый-старт)
- [CLI](#cli)
- [Программный API](#программный-api)
- [Конфиг](#конфиг)
- [Пример](#пример)
- [Темы](#темы)
- [Из Figma](#из-figma)
- [Документация](#документация)
- [Сравнение](#сравнение)
- [Связанные проекты](#связанные-проекты)
- [Участие в разработке](#участие-в-разработке)
- [Автор](#автор)
- [Лицензия](#лицензия)

## Возможности

- **JSON-конфиг без кода.** Один `config.json` с путями к токенам и алиасами темы — не нужно поддерживать JS/TS-скрипт
  сборки. JSON Schema даёт автодополнение и проверку в редакторе.
- **DTCG и старый формат.** Читает [W3C Design Tokens (DTCG 2025.10)](https://www.designtokens.org/tr/2025.10/format/)
  (`$value`, `$type`, составные `typography` и `shadow`) из Figma, Tokens Studio и Terrazzo. Старый формат Style
  Dictionary (`value`) тоже поддерживается и даёт тот же результат.
- **Темы на любом уровне DOM.** Светлая, тёмная и любые другие темы (`high-contrast`, бренды) переключаются атрибутом
  `data-theme` на `<html>` или на вложенном контейнере; светлая и тёмная также следуют `prefers-color-scheme`. Работает
  с префиксом утилит Tailwind.
- **Tailwind 3 и 4.** `theme.css` с `@theme` для v4, `theme.js` для v3.
- **Нативный экспорт из Figma.** Переменные, выгруженные из Figma, работают без конвертации.
- **CLI, watch и API.** `--watch` пересобирает тему при изменениях; `build()` и работающий в браузере `generate()`
  поставляются с типами TypeScript.

## Установка

Нужен Node.js 22 или новее.

```bash
npm install tailwind-dictionary --save-dev
```

## Быстрый старт

1. Создайте `config.json`:

   ```json
   {
     "$schema": "./node_modules/tailwind-dictionary/schema/config.schema.json",
     "version": 4,
     "source": ["tokens/**/*.json"],
     "output": "./styles",
     "themeAliases": { "color": "color", "spacing": "1px", "radius": "rounded" }
   }
   ```

2. Соберите тему:

   ```bash
   npx tailwind-dictionary
   ```

3. Подключите её **после** Tailwind:

   ```css
   @import 'tailwindcss';
   @import './styles/tailwind/theme.css';
   ```

   Для Tailwind v3 разверните `styles/tailwind/theme.js` в `tailwind.config.js`:

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

| Флаг              | Коротко | Описание                                                                 |
| :---------------- | :------ | :----------------------------------------------------------------------- |
| `--config [path]` | `-c`    | Путь к конфигу (`.json`). По умолчанию `./config.json`                   |
| `--watch`         | `-w`    | Пересобирать при изменении файлов токенов (`source`, `themes`) и конфига |
| `--version`       | `-v`    | Показать версию                                                          |

Ошибки конфига и токенов выводятся одной строкой с файлом и путём токена; код выхода — `1`.

## Программный API

```js
import { build } from 'tailwind-dictionary';

// Те же опции, что в config.json. Или: await build({ config: './config.json' })
const files = await build({
  version: 4,
  source: ['tokens/**/*.json'],
  output: './styles',
  themeAliases: { color: 'color' },
});
```

`generate()` не обращается к файловой системе и работает в браузере: принимает объекты токенов и возвращает содержимое
файлов.

```js
import { generate } from 'tailwind-dictionary/generate';

const files = await generate({
  tokens: { color: { $type: 'color', white: { $value: '#ffffff' } } },
  themes: { dark: { color: { white: { $value: '#000000' } } } }, // необязательно
  themeAliases: { color: 'color' },
  version: 4,
});

files['tailwind/theme.css']; // v4; v3 возвращает 'tailwind/theme.js' (+ 'tailwind/theme.css' с темами)
```

Подробнее — в [документации API](https://prosazhin.dev/docs/tailwind-dictionary/api?lang=ru).

## Конфиг

| Поле           | Тип    | Обязательное | Описание                                                                                                                                                           |
| :------------- | :----- | :----------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`      | Number | да           | Версия Tailwind CSS (`3` или `4`). По умолчанию `4`.                                                                                                               |
| `source`       | Array  | да           | Глобы или пути к файлам токенов, например `["tokens/*.json"]`. Поддерживаются JSON, JSON5 и JS. По умолчанию `["tokens/**/*.json"]`.                               |
| `output`       | String | да           | Папка для результата, создаётся, если её нет. По умолчанию `"./styles"`.                                                                                           |
| `themeAliases` | Object | да           | Ключи темы Tailwind и пути к токенам. Список ключей — в [теме по умолчанию](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css). |
| `themes`       | Object | нет          | Файлы токенов тем (`light`, `dark`, любое имя), тема `default` и `prefix` CSS-переменных семантических токенов (v4). См. [Темы](#темы).                            |
| `numberUnit`   | String | нет          | Единица для чисел без единиц в размерных ключах: `"px"` (по умолчанию), `"rem"` (значение / 16) или `false`. См. [Из Figma](#из-figma).                            |

Алиас — путь к токенам через `/`: категория (`rounded`) или категория и тип (`font/family`). Ключи должны совпадать с
ключами темы Tailwind вашей версии:

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

В v4 `themeAliases.spacing` — это базовая единица (`"1px"` или `"0.25rem"`), а не путь к токенам.

Полный справочник: [Конфиг](https://prosazhin.dev/docs/tailwind-dictionary/config?lang=ru).

## Пример

Токены в [DTCG](https://prosazhin.dev/docs/tailwind-dictionary/dtcg?lang=ru) (`$type` наследуется от группы):

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

Тот же результат даёт [старый формат](https://prosazhin.dev/docs/tailwind-dictionary/legacy?lang=ru) (`value`, поле
`mixin` для текстовых стилей). Брейкпоинты (`screen.lg.{min,max}`) и keyframes (`keyframes.<name>.<frame>.<property>`)
собираются из структуры токенов.

Пример реального проекта — библиотека стилей [pbstyles](https://github.com/prosazhin/pbstyles)
([конфиг](https://github.com/prosazhin/pbstyles/blob/main/config-tailwind-dictionary.json),
[токены](https://github.com/prosazhin/pbstyles/tree/main/tokens)).

## Темы

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
> `source` не должен включать файлы тем — используйте `tokens/*.json` вместо `tokens/**/*.json`.

Токены, заданные в темах, кроме `default`, становятся семантическими: в v4 это CSS-переменные `--theme-<key>-<name>`
(префикс задаётся в `themes.prefix`), подключённые через `@theme inline`, в v3 — ссылки `var()` в `theme.js` плюс
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

- без атрибута — `:root` получает тему `default`, светлая и тёмная следуют системной `prefers-color-scheme`;
- `data-theme="<имя>"` включает тему на элементе и его поддереве — на `<html>` или на любом вложенном контейнере.

Подробнее: [Темы](https://prosazhin.dev/docs/tailwind-dictionary/themes?lang=ru).

## Из Figma

**Variables → правый клик по коллекции → Export modes** даёт по одному файлу `*.tokens.json` на каждый режим. Положите
примитивы в `source`, а режимы — в `themes`:

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

Figma выгружает числа без единиц, поэтому числа в размерных ключах (`radius`, `text`, `breakpoint`, …) по умолчанию
получают `px` (`numberUnit`). Подробнее: [Из Figma](https://prosazhin.dev/docs/tailwind-dictionary/figma?lang=ru).

## Документация

| Страница                                                                        | Что внутри                                                      |
| :------------------------------------------------------------------------------ | :-------------------------------------------------------------- |
| [Начало работы](https://prosazhin.dev/docs/tailwind-dictionary?lang=ru)         | Обзор и быстрый старт                                           |
| [Конфиг](https://prosazhin.dev/docs/tailwind-dictionary/config?lang=ru)         | Все опции конфига и алиасы темы                                 |
| [DTCG](https://prosazhin.dev/docs/tailwind-dictionary/dtcg?lang=ru)             | Значения `$type`, типографика, тени, брейкпоинты, `$extensions` |
| [Старый формат](https://prosazhin.dev/docs/tailwind-dictionary/legacy?lang=ru)  | Формат Style Dictionary `value` и `mixin`                       |
| [Темы](https://prosazhin.dev/docs/tailwind-dictionary/themes?lang=ru)           | Светлая, тёмная и свои темы, итоговый CSS                       |
| [Из Figma](https://prosazhin.dev/docs/tailwind-dictionary/figma?lang=ru)        | Нативный экспорт Figma Variables, `numberUnit`                  |
| [API](https://prosazhin.dev/docs/tailwind-dictionary/api?lang=ru)               | `build()`, `generate()`, типы TypeScript                        |
| [Плейграунд](https://prosazhin.dev/docs/tailwind-dictionary/playground?lang=ru) | Попробовать в браузере                                          |

## Сравнение

|                                                         | tailwind-dictionary | [sd-tailwindcss-transformer](https://github.com/nado1001/style-dictionary-tailwindcss-transformer) | [Terrazzo](https://terrazzo.app) |
| :------------------------------------------------------ | :------------------ | :------------------------------------------------------------------------------------------------- | :------------------------------- |
| DTCG на входе (`$value`, `$type`, наследование `$type`) | ✅                  | ✅                                                                                                 | ✅                               |
| Старый формат Style Dictionary (`value`)                | ✅                  | ✅                                                                                                 | ❌                               |
| Составной `typography` → текстовые стили                | ✅                  | —                                                                                                  | ✅                               |
| Составной `shadow` (несколько слоёв)                    | ✅                  | —                                                                                                  | ✅                               |
| Светлая и тёмная темы, `data-theme` на любом уровне     | ✅                  | ❌                                                                                                 | ✅                               |
| Больше двух тем                                         | ✅                  | ❌                                                                                                 | ✅                               |
| Tailwind 3 и 4                                          | ✅                  | ✅                                                                                                 | только v4                        |
| Конфиг без JS (JSON + JSON Schema)                      | ✅                  | ❌                                                                                                 | ❌                               |
| Программный API и типы TypeScript                       | ✅                  | ✅                                                                                                 | ✅                               |
| `--watch`                                               | ✅                  | —                                                                                                  | ✅                               |

## Связанные проекты

- [mixin-dictionary](https://github.com/prosazhin/mixin-dictionary) — те же токены в виде CSS-переменных и переменных
  и миксинов LESS/SCSS.
- [pbstyles](https://github.com/prosazhin/pbstyles) — библиотека стилей, собранная обоими пакетами.
- [pbcomponents](https://github.com/prosazhin/pbcomponents) — React-компоненты на основе pbstyles.

## Участие в разработке

Баги и идеи — в [issues](https://github.com/prosazhin/tailwind-dictionary/issues). Перед пул-реквестом прочитайте
[CONTRIBUTING.md](./CONTRIBUTING.md).

## Автор

**Евгений Сажин**, фронтенд-разработчик и дизайнер — [prosazhin.dev](https://prosazhin.dev?lang=ru) ·
[GitHub](https://github.com/prosazhin) · [Telegram](https://t.me/prosazhin) ·
[LinkedIn](https://www.linkedin.com/in/prosazhin)

Если пакет пригодился, поставьте ⭐ на [GitHub](https://github.com/prosazhin/tailwind-dictionary).

## Лицензия

[MIT](./LICENSE) © Evgenii Sazhin
