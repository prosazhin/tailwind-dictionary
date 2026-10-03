import { FONT_PROPS_V4, DEFAULT_SEMANTIC_PREFIX } from '../const.js';

function getThemeAliasList(value, isExtend) {
  return Object.keys(value).reduce((acc, cur) => {
    if (cur === 'extend') {
      const result = getThemeAliasList(value[cur], true);
      return [...acc, ...result];
    }

    return [
      ...acc,
      {
        key: cur,
        aliases: value[cur].split('/'),
        isExtend,
      },
    ];
  }, []);
}

function camelize(str) {
  return str.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase());
}

// Находит alias темы, которому принадлежит токен, и возвращает имя переменной без сегментов alias.
// При пересекающихся alias (`color` и `color/bg`) выбирается самый длинный совпавший.
// Например, для alias `color` и пути `color.basic.0` вернёт { key: 'color', name: 'basic-0' }.
function getSemanticName(path, themeAliases) {
  const match = themeAliases
    .filter(({ aliases }) => aliases.length < path.length && aliases.every((alias, index) => path[index] === alias))
    .sort((a, b) => b.aliases.length - a.aliases.length)[0];

  if (!match) {
    return null;
  }

  return { key: match.key, name: path.slice(match.aliases.length).join('-') };
}

// Имя «сырой» CSS-переменной семантического токена: `--<prefix>-<key>-<name>`.
// Ключ alias в имени исключает коллизии между категориями (`radius.md` и `shadow.md`),
// а префикс (по умолчанию `theme`) — коллизию с переменными `@theme` самого Tailwind.
function getSemanticVariable({ key, name }, prefix = DEFAULT_SEMANTIC_PREFIX) {
  return `--${prefix || DEFAULT_SEMANTIC_PREFIX}-${key}-${name}`;
}

// Свойство типографики, которого нет у `--text-*` в v4 (например, font-family), пропускается
// с предупреждением: иначе оно перезаписало бы сам размер шрифта `--text-<name>`.
function warnUnsupportedFontProp(logger, path) {
  logger?.warn(`Token "${path.join('.')}" is skipped: Tailwind v4 --text-* has no "${path[path.length - 1]}" option`);
}

const customFormatting = {
  fontSize: (tokens) => {
    let fontSize = '';
    const options = {};

    tokens.forEach(({ value, path }) => {
      const prop = camelize(path[path.length - 1]);

      if (prop === 'fontSize') {
        fontSize = value;
        return;
      }

      options[prop] = value;
    });

    return [fontSize, options];
  },
  text: (tokens, key, name, logger) => {
    let result = '';

    tokens.forEach(({ value, path }) => {
      const prop = path[path.length - 1];
      const isProp = FONT_PROPS_V4[prop];

      if (isProp === undefined) {
        warnUnsupportedFontProp(logger, path);
        return;
      }

      result += `${isProp ? '' : '\n'}--${key}-${name}${isProp ? `--${prop}` : ''}: ${value};\n`;
    });

    return result;
  },
  breakpoint: (tokens, key, name) => {
    let result = '';
    const isMinLength = tokens.length === 1;

    tokens.forEach(({ value, path }) => {
      const prop = path[path.length - 1];

      result += `--${key}-${name}${!isMinLength ? `-${prop}` : ''}: ${value};\n`;
    });

    return result;
  },
  keyframes: (tokens, key, name) => {
    const result = tokens.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.path[cur.path.length - 2]]: {
          ...acc[cur.path[cur.path.length - 2]],
          [cur.path[cur.path.length - 1]]: cur.value,
        },
      }),
      {},
    );

    const frames = Object.entries(result)
      .map(([selector, props]) => {
        const declarations = Object.entries(props)
          .map(([prop, val]) => `    ${prop}: ${val};\n`)
          .join('');
        return `  ${selector} {\n${declarations}  }\n`;
      })
      .join('');

    return `\n@keyframes ${name} {\n${frames}}`;
  },
};

export { getThemeAliasList, getSemanticName, getSemanticVariable, customFormatting };
