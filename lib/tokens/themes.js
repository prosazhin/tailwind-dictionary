// Общий модуль: одинаковый в tailwind-dictionary/lib/tokens и mixin-dictionary/lib/tokens.
// Меняешь здесь — скопируй в другой пакет.
//
// Темы: { default?: string, prefix?: string, <name>: tokens }.
// Тема по умолчанию попадает в :root, остальные — в [data-theme='<name>'].
// `light` и `dark` дополнительно связаны с prefers-color-scheme.

import { collectTokenPaths } from './walk.js';

const RESERVED_THEME_KEYS = new Set(['default', 'prefix']);
const FALLBACK_DEFAULT_THEME = 'light';

function getThemeNames(themes) {
  return Object.keys(themes ?? {}).filter((key) => !RESERVED_THEME_KEYS.has(key));
}

// Имя темы по умолчанию: `themes.default`, иначе `light`. Если файлов `light` нет
// (например, задана только `dark`), `light` — это базовые токены без переопределений,
// как было до поддержки произвольного числа тем.
function getDefaultThemeName(themes) {
  return themes?.default ?? FALLBACK_DEFAULT_THEME;
}

// Пути семантических токенов — объединение путей всех тем, кроме темы по умолчанию.
// trees — { <name>: дерево токенов темы }.
function getSemanticPaths(trees, defaultName, logger) {
  const names = Object.keys(trees);
  const pathsByTheme = new Map(names.map((name) => [name, collectTokenPaths(trees[name])]));
  const semantic = new Set();

  names
    .filter((name) => name !== defaultName)
    .forEach((name) => pathsByTheme.get(name).forEach((path) => semantic.add(path)));

  if (names.length > 1) {
    const incomplete = [...semantic].filter((path) => names.some((name) => !pathsByTheme.get(name).has(path)));

    if (incomplete.length && logger) {
      logger.warn(
        `Some theme tokens are not defined in every theme (${names.join(', ')}), ` +
          `base token values are used instead: ${incomplete.join(', ')}`,
      );
    }
  }

  return semantic;
}

// Токен семантический, если его путь (или путь составного токена, из которого он разложен) есть в semantic.
function isSemanticToken(token, semantic) {
  return semantic.has(token.path.join('.')) || Boolean(token.composite && semantic.has(token.composite.path.join('.')));
}

export { isSemanticToken, getThemeNames, getDefaultThemeName, getSemanticPaths, RESERVED_THEME_KEYS };
