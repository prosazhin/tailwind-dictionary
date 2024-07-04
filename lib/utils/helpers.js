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
};

export { getThemeAliasList, getTokens, getMixins, getObjectValue, customFormatting };
