#!/usr/bin/env node

'use strict';

import fs from 'fs-extra';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';

import build from '../lib/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(fs.readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

program
  .version(pkg.version, '-v, --version', 'output the current version')
  .description(pkg.description)
  .usage('[options]');

program.option('-p, --platforms [items...]', DEFAULT_CLI_MESSAGE.platforms, DEFAULT_PLATFORMS).action(build);

program.parse(process.argv);
