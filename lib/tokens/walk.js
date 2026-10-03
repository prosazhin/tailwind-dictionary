// Общий модуль: одинаковый в tailwind-dictionary/lib/tokens и mixin-dictionary/lib/tokens.
// Меняешь здесь — скопируй в другой пакет.

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

// Токен — объект с полем `value` (старый формат) или `$value` (DTCG).
// Группа DTCG с `$type` токеном не считается, как и группа с дочерним токеном DTCG по имени `value`.
function isToken(node) {
  if (!isPlainObject(node)) {
    return false;
  }

  if ('$value' in node) {
    return true;
  }

  return 'value' in node && !(isPlainObject(node.value) && '$value' in node.value);
}

// Обходит исходное дерево токенов (до Style Dictionary).
// callback({ path, token, type }) вызывается для каждого токена; `type` — собственный `$type`/`type`
// токена или ближайший `$type` группы-предка (наследование DTCG).
function walkTokens(tree, callback, path = [], inheritedType = undefined) {
  if (!isPlainObject(tree)) {
    return;
  }

  Object.entries(tree).forEach(([key, node]) => {
    if (key.startsWith('$') || !isPlainObject(node)) {
      return;
    }

    const nodePath = [...path, key];

    if (isToken(node)) {
      callback({ path: nodePath, token: node, type: node.$type ?? node.type ?? inheritedType });
      return;
    }

    walkTokens(node, callback, nodePath, node.$type ?? inheritedType);
  });
}

// Набор путей (`a.b.c`) всех токенов дерева.
function collectTokenPaths(tree) {
  const paths = new Set();
  walkTokens(tree, ({ path }) => paths.add(path.join('.')));
  return paths;
}

// Глубокое слияние деревьев токенов: объекты сливаются, остальное (в т. ч. массивы) заменяется.
function mergeTokens(...trees) {
  return trees.reduce((acc, tree) => mergeInto(acc, tree), {});
}

function mergeInto(target, source) {
  if (!isPlainObject(source)) {
    return target;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(target[key]) && !isToken(value)) {
      target[key] = mergeInto({ ...target[key] }, value);
    } else if (isPlainObject(value)) {
      target[key] = mergeInto({}, value);
    } else {
      target[key] = value;
    }
  });

  return target;
}

export { isPlainObject, isToken, walkTokens, collectTokenPaths, mergeTokens };
