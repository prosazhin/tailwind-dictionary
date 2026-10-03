// Чистая генерация темы Tailwind: без fs, path и process — работает и в браузере.
// Файлы читает и пишет lib/index.js (build).

import buildV3 from './build-v3.js';
import buildV4 from './build-v4.js';
import { getGroups } from './tokens/groups.js';
import { resolveThemes, defaultLogger } from './tokens/resolve.js';
import { renderOverrides, renderRoot } from './tokens/theme-blocks.js';
import { getThemeAliasList, getSemanticName, getSemanticVariable } from './utils/helpers.js';
import { DictionaryError } from './tokens/errors.js';

const MEDIA_KEYS = ['breakpoint', 'screens'];
const KEYFRAMES_KEYS = ['keyframes'];

function normalizeAliases(themeAliases) {
  if (Array.isArray(themeAliases)) {
    return themeAliases;
  }

  return getThemeAliasList(themeAliases ?? {}, false);
}

function aliasesFor(themeAliases, keys) {
  return themeAliases.filter(({ key }) => keys.includes(key)).map(({ aliases }) => aliases);
}

// v4: переменные `--<prefix>-<key>-<name>`; токены вне alias темы пропускаются.
function toSemanticVars(tokens, themeAliases, prefix) {
  return tokens
    .map((token) => {
      const name = getSemanticName(token.path, themeAliases);
      return name ? { name: getSemanticVariable(name, prefix), value: token.value } : null;
    })
    .filter(Boolean);
}

// v3: переменные `--<path>`.
function toPathVars(tokens) {
  return tokens.map((token) => ({ name: `--${token.path.join('-')}`, value: token.value }));
}

// Блоки :root / prefers-color-scheme / [data-theme] для тем.
// Пустая строка, если ни одна тема ничего не переопределяет.
function buildThemeBlocks({ resolved, toVars }) {
  const overrides = resolved.themes.filter(({ tokens }) => tokens.length);

  if (!overrides.length) {
    return '';
  }

  const overridden = new Set(overrides.flatMap(({ tokens }) => tokens.map((token) => token.path.join('.'))));
  const defaultVars = toVars(resolved.tokens.filter((token) => overridden.has(token.path.join('.'))));

  return (
    renderRoot(defaultVars) +
    renderOverrides({
      defaultName: resolved.defaultName,
      defaultVars,
      themes: overrides.map(({ name, tokens }) => ({ name, vars: toVars(tokens) })),
    })
  );
}

/**
 * Генерирует тему Tailwind из деревьев токенов.
 *
 * @param {import('./types.js').GenerateOptions} options
 * @returns {Promise<Record<string, string>>} содержимое файлов по путям относительно `output`:
 *   `tailwind/theme.css` (v4, а также v3 с темами) и `tailwind/theme.js` (v3).
 */
async function generate({ tokens, themes = null, themeAliases, version = 4, sources, logger = defaultLogger }) {
  if (version !== 3 && version !== 4) {
    throw new DictionaryError(`Invalid Tailwind version: ${version}. Version must be 3 or 4`);
  }

  const aliases = normalizeAliases(themeAliases);

  if (!aliases.length) {
    throw new DictionaryError('Aliases for your design tokens for the Tailwind Theme are not specified');
  }

  const resolved = await resolveThemes({ tokens: tokens ?? {}, themes, sources, logger });
  const groups = getGroups(resolved.tokens, {
    media: aliasesFor(aliases, MEDIA_KEYS),
    keyframes: aliasesFor(aliases, KEYFRAMES_KEYS),
    flatMedia: true,
  });
  const prefix = themes?.prefix;

  if (version === 4) {
    const theme = buildV4({
      tokens: resolved.tokens,
      themeAliases: aliases,
      groups,
      semantic: resolved.semantic,
      prefix,
      logger,
    });
    const blocks = buildThemeBlocks({ resolved, toVars: (list) => toSemanticVars(list, aliases, prefix) });

    return { 'tailwind/theme.css': blocks ? `${blocks}\n${theme}` : theme };
  }

  const blocks = buildThemeBlocks({ resolved, toVars: toPathVars });
  const themed = new Set(
    blocks ? resolved.themes.flatMap(({ tokens: list }) => list.map((token) => token.path.join('.'))) : [],
  );
  const files = {
    'tailwind/theme.js': buildV3({ tokens: resolved.tokens, themeAliases: aliases, groups, themed, logger }),
  };

  if (blocks) {
    files['tailwind/theme.css'] = blocks;
  }

  return files;
}

export { generate };
export default generate;
