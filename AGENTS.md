# AGENTS.md

## Project Overview

CLI-утилита и библиотека для генерации тем Tailwind CSS (v3 и v4) из design tokens через Style Dictionary. Публикуется как npm-пакет `tailwind-dictionary`. Вход — DTCG 2025.10 (`$value`, `$type`) или старый формат (`value`).

## Tech Stack

- **Язык:** JavaScript (ES Modules, `"type": "module"`), типы через JSDoc → `tsc` в `types/`
- **Runtime:** Node.js >= 22.0.0
- **Зависимости:** `style-dictionary`, `commander`, `chalk`, `json5` (только для `.json5`-файлов токенов)
- **Тесты:** `node --test` (snapshot по `test/fixtures/*/expected`)
- **Линтинг:** ESLint + eslint-config-prettier, **форматирование:** Prettier
- **Git hooks:** simple-git-hooks + lint-staged + commitlint (conventional commits)
- **CI/CD:** GitHub Actions (lint + тесты на Node 22/24, публикация в npm при новой версии)

## Project Structure

```
bin/
  tailwind-dictionary.js      # CLI (commander): -c, -w; ошибки DictionaryError — одной строкой, exit 1
lib/
  index.js                    # build(config): чтение файлов → generate() → запись в <output>/tailwind
  generate.js                 # generate({ tokens, themes, themeAliases, version }) → { 'tailwind/theme.css': … } без fs
  build-v3.js                 # theme.js (module.exports) из плоского списка токенов
  build-v4.js                 # @theme / @theme inline из плоского списка токенов
  const.js                    # константы, DEFAULT_OPTIONS, DEFAULT_VALUE
  types.js                    # JSDoc-типы публичного API
  tokens/                     # общий с mixin-dictionary код (без fs)
    walk.js                   # обход дерева, isToken, collectTokenPaths, mergeTokens
    validate.js               # формат (DTCG/старый), битые ссылки, typography без fontSize, неизвестный $type
    normalize-value.js        # значения DTCG → строки CSS
    read-tokens.js            # allTokens Style Dictionary → плоский список { path, value, type, group }
    groups.js                 # группы: mixin / $extensions / typography / брейкпоинты / keyframes
    themes.js                 # имена тем, тема по умолчанию, семантические пути
    theme-blocks.js           # :root, prefers-color-scheme, [data-theme]
    resolve.js                # Style Dictionary в памяти для базы и каждой темы
    errors.js                 # DictionaryError
  utils/
    get-config.js             # чтение и проверка config.json (правила = schema/config.schema.json)
    read-token-files.js       # глобы → файлы → дерево + карта «путь токена → файл» (общий с mixin-dictionary)
    watch.js                  # --watch (общий с mixin-dictionary)
    helpers.js                # alias-ы темы, имена семантических переменных, customFormatting
    logger.js                 # chalk
schema/config.schema.json     # JSON Schema конфига
test/                         # *.test.js, fixtures/, types/
```

## Architecture

1. CLI (`bin/`) → `build({ config })`; программно — `build(config)` или `generate(...)`.
2. `build()`: `get-config` → `read-token-files` (глобы `source` и `themes.*`, ошибка `No token files matched`) → `generate()` → запись (папка `output` создаётся рекурсивно).
3. `generate()`:
   - `resolveThemes`: проверка дерева (`validate.js`), затем Style Dictionary в памяти для темы по умолчанию (`source` + её файлы) и для каждой другой темы. Старый формат идёт через `transformGroup: 'js'` (вывод не меняется), DTCG — без трансформаций, значения приводит `normalize-value.js`.
   - Семантические пути — объединение путей всех тем, кроме темы по умолчанию.
   - Группы (`groups.js`): поле `mixin` → `$extensions["dev.prosazhin.mixin"]` → составная `typography` → брейкпоинты (alias `breakpoint`/`screens`) → keyframes (alias `keyframes`).
   - *v4*: семантические токены исключаются из `@theme` и выносятся в `@theme inline` как `--<key>-<name>: var(--<prefix>-<key>-<name>)`; перед `@theme` — `:root` (тема по умолчанию), `@media (prefers-color-scheme)` для `light`/`dark`, `[data-theme='<name>']` для каждой темы.
   - *v3*: `theme.js`, семантические токены → `var(--<path>)` по пути токена; `theme.css` с теми же блоками.

## Code Conventions

- ES Modules, функциональный подход, чистые функции где возможно
- camelCase / kebab-case файлы / UPPER_SNAKE_CASE константы
- Именованные экспорты для утилит, default — для главных функций модулей
- 2 пробела, одинарные кавычки, точки с запятой, trailing commas, до 120 символов
- ESLint: `curly`, `no-shadow`, `no-nested-ternary`
- Не удалять существующие возможности и вывод — только улучшать

## Commands

| Команда | Описание |
|---------|----------|
| `npm test` | Snapshot-тесты, тесты ошибок и общего модуля |
| `npm run test:types` | `.d.ts` + проверка типов на `test/types/usage.ts` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier по `.js` и `.json` |

## Release Process

1. Обновить `version` в `package.json` и `CHANGELOG.md`
2. Push в `main`
3. `release.yml` (job `gate`) сравнивает версию с npm: если такая версия уже опубликована — релиз пропускается
4. Job `release`: `npm ci`, lint, тесты, публикация в npm с provenance (`prepublishOnly` собирает `types/`), затем тег `v<version>` и GitHub Release
