import { FONT_PROPS_V4 } from '../const.js';

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

function findTokensWithMixins(data, result) {
  if (data.hasOwnProperty('value')) {
    result.push(data);
    return;
  }
  Object.keys(data).forEach((key) => {
    findTokensWithMixins(data[key], result);
  });
}

function getTokens(data) {
  const result = [];
  findTokensWithMixins(data, result);
  return result;
}

function getMixins(tokens) {
  if (!tokens.length) {
    return [];
  }

  return tokens.reduce((acc, cur) => {
    const index = acc.findIndex(({ name }) => name === cur.mixin);

    if (index >= 0) {
      acc[index].tokens.push(cur);
      return acc;
    }

    return [
      ...acc,
      {
        name: cur.mixin,
        category: cur.attributes.category,
        tokens: [cur],
      },
    ];
  }, []);
}

function getObjectValue(value) {
  const result = Object.keys(value).reduce((acc, cur) => {
    if (value[cur].hasOwnProperty('value')) {
      return {
        ...acc,
        [value[cur].path[value[cur].path.length - 1]]: value[cur].value,
      };
    }

    return {
      ...acc,
      [cur]: getObjectValue(value[cur]),
    };
  }, {});

  return result;
}

function camelize(str) {
  return str.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase());
}

function objectToVariables(obj, categoryName, parentKey = '') {
  let result = '';

  Object.entries(obj).forEach(([key, value]) => {
    const currentKey = parentKey ? `${parentKey}-${key}` : key;

    if (value.value) {
      result += `--${categoryName}-${currentKey}: ${value.value};\n`;
    } else if (typeof value === 'object') {
      result += objectToVariables(value, categoryName, currentKey);
    }
  });

  return result;
}

const customFormatting = {
  fontSize: (tokens) => {
    let fontSize = '';
    const options = {};

    tokens.forEach(({ value, path }) => {
      const name = camelize(path[path.length - 1]);

      if (name === 'fontSize') {
        fontSize = value;
        return;
      }

      options[camelize(path[path.length - 1])] = value;
    });

    return [fontSize, options];
  },
  text: (tokens, key, name) => {
    let result = '';

    tokens.forEach(({ value, path }) => {
      const prop = path[path.length - 1];
      const isProp = FONT_PROPS_V4[prop];

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

    return `\n@keyframes ${name} ${JSON.stringify(result).replace(/[",]/g, '')}`;
  },
};

export { getThemeAliasList, getTokens, getMixins, getObjectValue, objectToVariables, customFormatting };
