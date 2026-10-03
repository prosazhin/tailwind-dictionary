#!/usr/bin/env node

'use strict';

import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { program } from 'commander';

import build from '../lib/index.js';
import { readConfigFile } from '../lib/utils/get-config.js';
import { redLog, log } from '../lib/utils/logger.js';
import { watch } from '../lib/utils/watch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(fs.readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

// Ошибки конфига и токенов — одной строкой, остальное — со стектрейсом.
function reportError(error) {
  if (error?.isDictionaryError) {
    redLog(error.message);
  } else {
    redLog('Build failed:', error?.stack ?? error);
  }
}

async function run(config) {
  try {
    await build({ config });
    return true;
  } catch (error) {
    reportError(error);
    return false;
  }
}

program
  .version(pkg.version, '-v, --version', 'output the current version')
  .description(pkg.description)
  .usage('[options]');

program
  .option('-c, --config <path>', 'set config path. defaults to ./config.json', './config.json')
  .option('-w, --watch', 'rebuild when token files or the config change')
  .action(async ({ config, watch: isWatch }) => {
    const ok = await run(config);

    if (!isWatch) {
      process.exitCode = ok ? 0 : 1;
      return;
    }

    log('\nWatching for changes…');
    watch({
      configPath: config,
      readConfig: () => readConfigFile(config),
      run: () => build({ config }),
      onError: reportError,
    });
  });

program.parse(process.argv);
