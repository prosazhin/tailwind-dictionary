# CLAUDE.md

## Project

CLI-утилита `tailwind-dictionary`: генерирует Tailwind CSS тему (v3 и v4) из design tokens через Style Dictionary. Публикуется в npm.

## Commands

```bash
npm run lint      # ESLint
npm run format    # Prettier по *.js и *.json
npm run prepare   # Установить git hooks
```

Тестов нет. Проверяй изменения через `npm run lint`.

## Key conventions

- ES Modules везде (`"type": "module"`), кроме `eslint.config.cjs`
- Default экспорт для главных функций модулей, именованные для утилит
- camelCase функции/переменные, kebab-case файлы, UPPER_SNAKE_CASE константы
- Одинарные кавычки, точки с запятой, trailing commas, отступ 2 пробела, максимум 120 символов в строке
- `curly: error` — фигурные скобки обязательны для всех ветвлений
- Conventional Commits (commitlint). Pre-commit: prettier + eslint --fix через lint-staged

## Config options

| Ключ           | Тип    | Обязательный | Default       |
|----------------|--------|--------------|---------------|
| `version`      | Number | да           | 4             |
| `source`       | Array  | да           | —             |
| `output`       | String | да           | `"./styles"`  |
| `themeAliases` | Object | да           | `{}`          |
| `themes`       | Object | нет          | `null`        |

`themes` — необязательный объект `{ light?: string[], dark?: string[] }`. Отсутствие ключа не логируется как ошибка.

## Dark theme build flow

`themes.dark` запускает второй проход Style Dictionary в `cache-dark/`. Оба кэша удаляются в `finally`. Подробности — в [AGENTS.md](AGENTS.md).

## Release

1. Обновить `version` в `package.json`
2. Push в `main`
3. `prepare.yml` создаёт git-тег при новой версии
4. Тег триггерит `release.yml` (Node 22.x): npm publish + GitHub Release
