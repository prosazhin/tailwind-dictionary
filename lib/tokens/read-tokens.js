// Общий модуль: одинаковый в tailwind-dictionary/lib/tokens и mixin-dictionary/lib/tokens.
// Меняешь здесь — скопируй в другой пакет.

import { normalizeValue, TYPOGRAPHY_TYPES } from './normalize-value.js';
import { isPlainObject } from './walk.js';

// Явное имя группы (миксина) для токена DTCG: "$extensions": { "dev.prosazhin.mixin": "h64" }.
const MIXIN_EXTENSION = 'dev.prosazhin.mixin';

function kebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function getExplicitGroup(token) {
  if (Object.prototype.hasOwnProperty.call(token, 'mixin')) {
    return token.mixin;
  }

  const extension = token.$extensions?.[MIXIN_EXTENSION];
  return typeof extension === 'string' ? extension : undefined;
}

// Токены Style Dictionary (`allTokens`) → плоский список
// { path, value, type?, group?, extensions?, attributes }.
//
// - Старый формат (`value`) отдаётся как есть: вывод не меняется.
// - DTCG (`$value`) нормализуется в строки CSS (normalize-value.js).
// - Составная типографика раскладывается на подтокены `<path>.<font-size|line-height|…>`
//   с общей группой — так же, как старые токены с полем `mixin`.
function readTokens(allTokens, { usesDtcg = false } = {}) {
  return allTokens.flatMap((token) => {
    const value = usesDtcg ? token.$value : token.value;
    const type = usesDtcg ? token.$type : token.type;
    const group = getExplicitGroup(token);
    const attributes = { ...token.attributes, category: token.path[0] };
    const extensions = token.$extensions;

    if (usesDtcg && type === 'typography' && isPlainObject(value)) {
      const typography = normalizeValue(value, 'typography');
      const name = group ?? token.path[token.path.length - 1];

      return Object.entries(typography).map(([prop, subValue]) => ({
        path: [...token.path, kebabCase(prop)],
        value: subValue,
        type: TYPOGRAPHY_TYPES[prop],
        group: name,
        composite: { type: 'typography', path: token.path },
        attributes,
        extensions,
      }));
    }

    return [
      {
        path: token.path,
        value: usesDtcg ? normalizeValue(value, type) : value,
        type,
        group,
        attributes,
        extensions,
      },
    ];
  });
}

// Токены, лежащие под путём alias (`['font', 'size']`), в порядке исходного дерева.
function tokensUnder(tokens, aliases) {
  return tokens.filter(
    ({ path }) => path.length > aliases.length && aliases.every((alias, index) => path[index] === alias),
  );
}

export { readTokens, tokensUnder, kebabCase, MIXIN_EXTENSION };
