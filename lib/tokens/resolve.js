// Общий модуль: одинаковый в tailwind-dictionary/lib/tokens и mixin-dictionary/lib/tokens.
// Меняешь здесь — скопируй в другой пакет.
//
// Деревья токенов → Style Dictionary в памяти (без промежуточных файлов) → плоский список.

import StyleDictionary from 'style-dictionary';
import { DictionaryError } from './errors.js';
import { readTokens } from './read-tokens.js';
import { getDefaultThemeName, getSemanticPaths, getThemeNames, isSemanticToken } from './themes.js';
import { validateTokens } from './validate.js';
import { mergeTokens } from './walk.js';

const defaultLogger = { warn: (message) => console.warn(message) };

// Старый формат идёт через transformGroup `js`, как раньше, — вывод не меняется.
// DTCG — без трансформаций значений: их приводит к CSS normalize-value.js.
function getPlatform(usesDtcg) {
  return usesDtcg ? { transforms: ['attribute/cti'] } : { transformGroup: 'js' };
}

// Каждая тема прогоняется отдельно, поэтому одно и то же предупреждение выводится один раз.
function uniqueLogger(logger) {
  const seen = new Set();

  return {
    warn: (message) => {
      if (!seen.has(message)) {
        seen.add(message);
        logger.warn(message);
      }
    },
  };
}

async function resolveTree(tree, { sources, logger = defaultLogger } = {}) {
  const { usesDtcg, warnings } = validateTokens(tree, { sources });
  warnings.forEach((warning) => logger.warn(warning));

  const sd = new StyleDictionary({
    tokens: structuredClone(tree),
    platforms: { js: getPlatform(usesDtcg) },
    log: { verbosity: 'silent', warnings: 'disabled' },
  });

  let dictionary;

  try {
    dictionary = await sd.getPlatformTokens('js');
  } catch (error) {
    throw new DictionaryError(`Unable to resolve design tokens: ${String(error.message).trim()}`);
  }

  return { usesDtcg, tokens: readTokens(dictionary.allTokens, { usesDtcg }) };
}

// tokens — базовое дерево токенов, themes — { default?, prefix?, <name>: дерево токенов темы }.
// Возвращает токены темы по умолчанию и переопределения остальных тем (только семантические пути).
async function resolveThemes({ tokens, themes, sources, logger: baseLogger = defaultLogger }) {
  const logger = uniqueLogger(baseLogger);
  const names = getThemeNames(themes);

  if (!names.length) {
    const base = await resolveTree(tokens, { sources, logger });
    return { ...base, tree: tokens, defaultName: null, semantic: new Set(), themes: [] };
  }

  const defaultName = getDefaultThemeName(themes);
  const trees = Object.fromEntries(names.map((name) => [name, themes[name]]));
  const semantic = getSemanticPaths(trees, defaultName, logger);

  const defaultTree = mergeTokens(tokens, themes[defaultName] ?? {});
  const base = await resolveTree(defaultTree, { sources, logger });

  const overrides = [];

  for (const name of names.filter((themeName) => themeName !== defaultName)) {
    const resolved = await resolveTree(mergeTokens(tokens, themes[name]), { sources, logger });
    overrides.push({ name, tokens: resolved.tokens.filter((token) => isSemanticToken(token, semantic)) });
  }

  return { ...base, tree: defaultTree, defaultName, semantic, themes: overrides };
}

export { resolveTree, resolveThemes, defaultLogger };
