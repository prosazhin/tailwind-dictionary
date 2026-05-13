import fs from 'fs-extra';
import { join } from 'path';
import { getTokens } from './utils/helpers.js';
import { greenLog } from './utils/logger.js';

export default async function buildDarkTheme({ output, version, semanticPaths, lightTokens, __dirname }) {
  const cachePath = join(__dirname, '..', 'cache-dark', 'index.cjs');

  if (!fs.existsSync(cachePath)) {
    return;
  }

  const variables = await import(cachePath);
  const allTokens = getTokens(variables.default);
  const darkTokens = allTokens.filter((token) => semanticPaths.has(token.path.join('.')));

  if (!darkTokens.length) {
    return;
  }

  if (version === 4) {
    appendV4Dark({ output, darkTokens });
  }

  if (version === 3) {
    appendV3Dark({ output, lightTokens, darkTokens });
  }

  greenLog('Dark theme build completed successfully');
}

function buildVarsString(tokens, indent) {
  return tokens.map((token) => `${indent}--${token.path.join('-')}: ${token.value};`).join('\n') + '\n';
}

function appendV4Dark({ output, darkTokens }) {
  const darkVars4 = buildVarsString(darkTokens, '    ');
  const darkVars2 = buildVarsString(darkTokens, '  ');

  const mediaBlock = `\n@media (prefers-color-scheme: dark) {\n  :root {\n${darkVars4}  }\n}\n`;
  const selectorBlock = `\n[data-theme='dark'] {\n${darkVars2}}\n`;

  fs.appendFileSync(`${output}/tailwind/theme.css`, mediaBlock + selectorBlock);
}

function appendV3Dark({ output, lightTokens, darkTokens }) {
  const themeFilePath = `${output}/tailwind/theme.js`;

  if (!fs.existsSync(themeFilePath)) {
    return;
  }

  const darkVarNames = new Set(darkTokens.map((t) => t.path.join('-')));
  const lightTokenMap = new Map(lightTokens.map((t) => [t.path.join('-'), t.value]));

  let content = fs.readFileSync(themeFilePath, 'utf8');
  darkTokens.forEach((token) => {
    const varName = token.path.join('-');
    const lightValue = lightTokenMap.get(varName);
    if (!lightValue) {
      return;
    }
    const escaped = lightValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    content = content.replace(new RegExp(`"${escaped}"`, 'g'), `"var(--${varName})"`);
  });
  fs.writeFileSync(themeFilePath, content);

  const semanticLightTokens = lightTokens.filter((t) => darkVarNames.has(t.path.join('-')));
  const lightVars = buildVarsString(semanticLightTokens, '  ');
  const darkVars4 = buildVarsString(darkTokens, '    ');
  const darkVars2 = buildVarsString(darkTokens, '  ');

  const themeCss =
    `:root {\n${lightVars}}\n` +
    `\n@media (prefers-color-scheme: dark) {\n  :root {\n${darkVars4}  }\n}\n` +
    `\n[data-theme='dark'] {\n${darkVars2}}\n`;

  fs.writeFileSync(`${output}/tailwind/theme.css`, themeCss);
}
