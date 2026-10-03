// Общий модуль: одинаковый в tailwind-dictionary/lib/tokens и mixin-dictionary/lib/tokens.
// Меняешь здесь — скопируй в другой пакет.

const COLOR_SCHEMES = new Set(['light', 'dark']);

function renderVars(vars, indent) {
  return vars.map(({ name, value }) => `${indent}${name}: ${value};`).join('\n') + '\n';
}

function renderRoot(vars) {
  return `:root {\n${renderVars(vars, '  ')}}\n`;
}

// Блоки переопределений после :root.
// themes — [{ name, vars: [{ name, value }] }] без темы по умолчанию, в порядке конфига.
//
// Системная тема (`light`/`dark`, если она не по умолчанию) применяется через prefers-color-scheme,
// только пока на :root не выбрана другая тема явно — иначе её нельзя было бы включить принудительно.
// Последним идёт блок темы по умолчанию: он нужен для её контейнеров внутри страницы другой темы.
function renderOverrides({ defaultName, defaultVars, themes }) {
  const allNames = [defaultName, ...themes.map(({ name }) => name)];
  let result = '';

  themes.forEach(({ name, vars }) => {
    if (COLOR_SCHEMES.has(name)) {
      const not = allNames
        .filter((other) => other !== name)
        .map((other) => `:not([data-theme='${other}'])`)
        .join('');

      result += `\n@media (prefers-color-scheme: ${name}) {\n  :root${not} {\n${renderVars(vars, '    ')}  }\n}\n`;
    }

    result += `\n[data-theme='${name}'] {\n${renderVars(vars, '  ')}}\n`;
  });

  result += `\n[data-theme='${defaultName}'] {\n${renderVars(defaultVars, '  ')}}\n`;

  return result;
}

export { renderVars, renderRoot, renderOverrides };
