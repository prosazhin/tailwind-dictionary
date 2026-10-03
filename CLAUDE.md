# CLAUDE.md

## Project

CLI-утилита и библиотека `tailwind-dictionary`: генерирует Tailwind CSS тему (v3 и v4) из design tokens (DTCG 2025.10 и старый формат Style Dictionary). Публикуется в npm.

## Commands

```bash
npm test             # snapshot-тесты (node --test)
npm run test:types   # сборка .d.ts + проверка test/types/usage.ts
npm run lint         # ESLint
npm run format       # Prettier по *.js и *.json
npm run prepare      # Установить git hooks
```

Перед завершением задачи: `npm test` и `npm run lint`.

## Key conventions

- ES Modules везде (`"type": "module"`), кроме `eslint.config.cjs`
- Default экспорт для главных функций модулей, именованные для утилит
- camelCase функции/переменные, kebab-case файлы, UPPER_SNAKE_CASE константы
- Одинарные кавычки, точки с запятой, trailing commas, отступ 2 пробела, максимум 120 символов в строке
- `curly: error` — фигурные скобки обязательны для всех ветвлений
- Conventional Commits (commitlint). Pre-commit: prettier + eslint --fix через lint-staged
- Не удалять существующие возможности и вывод: только улучшать и исправлять
- `lib/generate.js` и `lib/tokens/*` без `fs`, `path`, `process`, `chalk` — работают в браузере
- `lib/tokens/*`, `lib/utils/read-token-files.js`, `lib/utils/watch.js`, `test/tokens.test.js` одинаковые с mixin-dictionary — менять в обоих

## Config options

| Ключ           | Тип    | Обязательный | Default              |
|----------------|--------|--------------|----------------------|
| `version`      | Number | да           | 4                    |
| `source`       | Array  | да           | `["tokens/**/*.json"]` |
| `output`       | String | да           | `"./styles"`         |
| `themeAliases` | Object | да           | —                    |
| `themes`       | Object | нет          | `null`               |

`themes` — `{ default?: string, prefix?: string, <имя темы>: string[] }`. `default` по умолчанию `light` (если файлов light нет — базовые токены). `prefix` — префикс CSS-переменных семантических токенов в v4 (`--<prefix>-<key>-<name>`; по умолчанию `theme`). Схема: `schema/config.schema.json`.

## Build flow

`build()` читает файлы → `generate()` → запись. Style Dictionary работает в памяти (`getPlatformTokens`), кэша на диске нет. Подробности — в [AGENTS.md](AGENTS.md).

## Release

1. Обновить `version` в `package.json` и `CHANGELOG.md`
2. Push в `main`
3. `release.yml` (Node 22.x) сверяет версию с npm и, если она новая, гоняет lint + тесты, публикует пакет (`prepublishOnly` собирает типы) + создаёт тег и GitHub Release
