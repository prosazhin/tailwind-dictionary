import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import StyleDictionary from 'style-dictionary';
import buildTheme from './build-theme.js';
import getConfig from './utils/get-config.js';
import { divider } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function build(options) {
  const { source, output, themeAliases, version } = getConfig(options);
  const config = { source, output, themeAliases, version, __dirname };

  divider('\n', '');

  const buildConfig = {
    source: source,
    platforms: {
      js: {
        transformGroup: 'js',
        buildPath: `${join(__dirname, '..')}/cache/`,
        files: [
          {
            format: 'javascript/module',
            destination: 'index.cjs',
          },
        ],
      },
    },
  };

  const sd = new StyleDictionary(buildConfig);
  await sd.buildAllPlatforms();

  divider('\n', '\n');

  await buildTheme(config);
}
