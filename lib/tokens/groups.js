// Общий модуль: одинаковый в tailwind-dictionary/lib/tokens и mixin-dictionary/lib/tokens.
// Меняешь здесь — скопируй в другой пакет.
//
// Группа — набор токенов, из которых собирается один миксин: типографика, брейкпоинт, keyframes.
// Порядок определения группы токена:
// 1. старое поле `mixin` и `$extensions["dev.prosazhin.mixin"]`, составная `typography`
//    (уже проставлены в read-tokens.js);
// 2. категории брейкпоинтов: `screen.lg.{min,max}` → группа `lg`;
// 3. категории keyframes: `keyframes.show.{from,to}.<prop>` → группа `show`.

function startsWith(path, aliases) {
  return aliases.length < path.length && aliases.every((alias, index) => path[index] === alias);
}

function getStructuralGroup(path, { media, keyframes, flatMedia }) {
  const mediaAliases = media.find((aliases) => startsWith(path, aliases));

  if (mediaAliases) {
    const depth = path.length - mediaAliases.length;
    return depth === 2 || (flatMedia && depth === 1) ? path[mediaAliases.length] : undefined;
  }

  const keyframesAliases = keyframes.find((aliases) => startsWith(path, aliases));

  if (keyframesAliases) {
    return path.length - keyframesAliases.length === 3 ? path[keyframesAliases.length] : undefined;
  }

  return undefined;
}

// tokens — результат readTokens. media / keyframes — массивы путей alias (`[['screen'], ['breakpoint']]`).
// flatMedia — считать группой и токен без min/max (`screen.sm`).
// Возвращает группы [{ name, category, tokens }] в порядке первого появления.
function getGroups(tokens, { media = [], keyframes = [], flatMedia = false } = {}) {
  const groups = new Map();

  tokens.forEach((token) => {
    const name = token.group ?? getStructuralGroup(token.path, { media, keyframes, flatMedia });

    if (name === undefined) {
      return;
    }

    if (!groups.has(name)) {
      groups.set(name, { name, category: token.attributes?.category ?? token.path[0], tokens: [] });
    }

    groups.get(name).tokens.push(token);
  });

  return [...groups.values()];
}

export { getGroups };
