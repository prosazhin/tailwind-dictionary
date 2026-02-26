# AGENTS.md

## Project Overview

CLI-утилита для генерации тем Tailwind CSS (v3 и v4) из design tokens через Style Dictionary. Публикуется как npm-пакет `tailwind-dictionary`.

## Tech Stack

- **Язык:** JavaScript (ES Modules, `"type": "module"`)
- **Runtime:** Node.js >= 20.22.0
- **Основные зависимости:** `style-dictionary`, `fs-extra`, `commander`, `chalk`
- **Линтинг:** ESLint + eslint-config-prettier
- **Форматирование:** Prettier
- **Git hooks:** simple-git-hooks + lint-staged + commitlint (conventional commits)
- **CI/CD:** GitHub Actions (автоматическая публикация в npm при обновлении версии)

## Project Structure

```
bin/
  tailwind-dictionary.js   # CLI точка входа (commander)
lib/
  index.js                 # Главный модуль: инициализация Style Dictionary, запуск сборки
  build-theme.js           # Загрузка промежуточных данных, выбор генератора (v3/v4)
  build-v3.js              # Генератор JS-объекта для Tailwind v3
  build-v4.js              # Генератор CSS с @theme для Tailwind v4
  const.js                 # Константы проекта
  utils/
    get-config.js          # Парсинг и валидация конфигурации
    helpers.js             # Работа с токенами, форматирование, миксины
    logger.js              # Цветной вывод в консоль (chalk)
.github/workflows/
  prepare.yml              # Проверка версии и создание тега
  release.yml              # Публикация в npm и создание GitHub Release
```

## Architecture

1. CLI (`bin/`) парсит аргументы и вызывает `lib/index.js`
2. `index.js` читает конфиг, запускает Style Dictionary для создания промежуточного файла в `cache/`
3. `build-theme.js` загружает промежуточные данные, извлекает токены и миксины
4. В зависимости от `version` (3 или 4) вызывается соответствующий генератор
5. `build-v3.js` создаёт `theme.js` (CommonJS module.exports)
6. `build-v4.js` создаёт `theme.css` (CSS с `@theme {}`)
7. Директория `cache/` удаляется после сборки

## Code Conventions

### Стиль кода

- ES Modules: `import`/`export` везде (кроме `eslint.config.cjs`)
- Функциональный подход, чистые функции где возможно
- camelCase для функций и переменных
- kebab-case для файлов
- UPPER_SNAKE_CASE для констант
- Именованные экспорты для утилит, default экспорты для главных функций модулей
- Отступы: 2 пробела, без табов
- Одинарные кавычки, точки с запятой, trailing commas
- Максимальная длина строки: 120 символов

### ESLint правила

- `curly: 'error'` — фигурные скобки обязательны
- `no-shadow: 'error'` — запрет на перекрытие переменных
- `no-nested-ternary: 'error'` — запрет вложенных тернарных операторов

### Git

- Conventional Commits (commitlint с `@commitlint/config-conventional`)
- Pre-commit: lint-staged (prettier + eslint --fix)
- Pre-push: форматирование всех файлов

## Commands

| Команда | Описание |
|---------|----------|
| `npm run lint` | Запуск ESLint |
| `npm run format` | Форматирование всех `.js` и `.json` файлов через Prettier |
| `npm run prepare` | Установка git hooks |

## Release Process

1. Обновить `version` в `package.json`
2. Push в `main`
3. GitHub Actions (`prepare.yml`) сравнивает версию с npm — если локальная новее, создаёт git-тег
4. Git-тег триггерит `release.yml`: публикация в npm с provenance + создание GitHub Release
