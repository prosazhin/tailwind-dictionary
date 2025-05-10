import fs from 'fs-extra';
import { join } from 'path';
import { getTokens, getMixins } from './utils/helpers.js';
import { log, greenLog } from './utils/logger.js';
import buildV3 from './build-v3.js';
import buildV4 from './build-v4.js';

export default async function buildTheme({ output, themeAliases, version, __dirname }) {
  const cachePath = join(__dirname, '..', 'cache', 'index.cjs');
  const themeFolderPath = join(output, 'tailwind');

  if (fs.existsSync(cachePath)) {
    const variables = await import(cachePath);
    const allTokenList = getTokens(variables.default);
    const mixins = getMixins(allTokenList.filter((token) => token.hasOwnProperty('mixin')));

    log(`Start building Tailwind v${version} Theme`);

    if (version === 3) {
      buildV3({
        output,
        themeFolderPath,
        themeAliases,
        variables: variables.default,
        mixins,
      });
    }

    if (version === 4) {
      buildV4({
        output,
        themeFolderPath,
        themeAliases,
        variables: variables.default,
        mixins,
      });
    }

    greenLog(`Tailwind v${version} Theme build completed successfully`);
  }

  fs.removeSync(join(__dirname, '..', 'cache'));
}
