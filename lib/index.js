import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import StyleDictionary from 'style-dictionary';
import buildTheme from './build-theme.js';
import buildDarkTheme from './build-dark-theme.js';
import getConfig from './utils/get-config.js';
import getSemanticPaths from './utils/get-semantic-paths.js';
import { getTokens } from './utils/helpers.js';
import { divider } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function build(options) {
  const { source, output, themeAliases, version, themes } = getConfig(options);

  divider('\n', '');

  try {
    // --- Сборка 1: базовые токены + светлая тема ---
    const lightSource = themes?.light ? [...source, ...themes.light] : source;

    const sdLight = new StyleDictionary({
      source: lightSource,
      platforms: {
        js: {
          transformGroup: 'js',
          buildPath: `${join(__dirname, '..')}/cache/`,
          files: [{ format: 'javascript/module', destination: 'index.cjs' }],
        },
      },
    });

    await sdLight.buildAllPlatforms();

    // Читаем light-токены ДО того, как buildTheme может удалить кэш.
    // Нужно для v3: найти оригинальные значения для замены на var() в theme.js
    let lightTokens = [];
    if (themes?.dark && version === 3) {
      const lightCachePath = join(__dirname, '..', 'cache', 'index.cjs');
      const lightVariables = await import(lightCachePath);
      lightTokens = getTokens(lightVariables.default);
    }

    divider('\n', '\n');

    await buildTheme({ output, themeAliases, version, __dirname });

    // --- Сборка 2: тёмная тема ---
    if (themes?.dark) {
      const darkSource = [...source, ...themes.dark];
      const semanticPaths = getSemanticPaths(themes.dark);

      const sdDark = new StyleDictionary({
        source: darkSource,
        platforms: {
          js: {
            transformGroup: 'js',
            buildPath: `${join(__dirname, '..')}/cache-dark/`,
            files: [{ format: 'javascript/module', destination: 'index.cjs' }],
          },
        },
      });

      await sdDark.buildAllPlatforms();

      await buildDarkTheme({ output, version, semanticPaths, lightTokens, __dirname });
    }
  } finally {
    fs.removeSync(join(__dirname, '..', 'cache'));
    fs.removeSync(join(__dirname, '..', 'cache-dark'));
  }
}
