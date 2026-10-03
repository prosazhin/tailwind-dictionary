// Типы публичного API (JSDoc). Из них `tsc` собирает `types/*.d.ts` перед публикацией.

/**
 * Дерево дизайн-токенов: старый формат (`value`) или DTCG (`$value`, `$type`).
 * @typedef {{ [key: string]: any }} TokenTree
 */

/**
 * Алиасы темы Tailwind: ключ темы → путь к токенам через `/` (`"font/family"`).
 * Вложенный `extend` — то же для `theme.extend` (Tailwind v3).
 * @typedef {{ [key: string]: string | ThemeAliases }} ThemeAliases
 */

/**
 * Темы в конфиге: имя темы → файлы токенов, плюс необязательные `default` и `prefix`.
 * @typedef {{ default?: string, prefix?: string, [theme: string]: string[] | string | undefined }} ThemesConfig
 */

/**
 * Темы для generate(): имя темы → дерево токенов, плюс необязательные `default` и `prefix`.
 * @typedef {{ default?: string, prefix?: string, [theme: string]: TokenTree | string | undefined }} ThemesTokens
 */

/**
 * Получатель предупреждений (по умолчанию — console.warn).
 * @typedef {{ warn: (message: string) => void }} Logger
 */

/**
 * Конфиг tailwind-dictionary (то же, что в config.json).
 * @typedef {object} Config
 * @property {string[]} [source] Глобы или пути к файлам токенов. По умолчанию `["tokens/**\/*.json"]`.
 * @property {string} [output] Папка для результата. По умолчанию `"./styles"`.
 * @property {ThemeAliases} themeAliases Алиасы темы Tailwind.
 * @property {3 | 4} [version] Версия Tailwind. По умолчанию 4.
 * @property {ThemesConfig | null} [themes] Файлы тем (`light`, `dark`, …), `default` и `prefix`.
 */

/**
 * Параметры build(): конфиг целиком или путь к config.json.
 * @typedef {Config | { config: string }} BuildOptions
 */

/**
 * Параметры generate().
 * @typedef {object} GenerateOptions
 * @property {TokenTree} tokens Базовые токены.
 * @property {ThemeAliases} themeAliases Алиасы темы Tailwind.
 * @property {3 | 4} [version] Версия Tailwind. По умолчанию 4.
 * @property {ThemesTokens | null} [themes] Токены тем, `default` и `prefix`.
 * @property {Map<string, string>} [sources] Путь токена (`a.b.c`) → файл: для сообщений об ошибках.
 * @property {Logger} [logger] Куда писать предупреждения.
 */

export {};
