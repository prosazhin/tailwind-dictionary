#!/usr/bin/env node

'use strict';

import fs from 'fs-extra';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';

import build from '../lib/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = fs.readJsonSync(join(__dirname, '..', 'package.json'));

program
  .version(pkg.version, '-v, --version', 'output the current version')
  .description(pkg.description)
  .usage('[options]');

program.option('-c, --config <path>', 'set config path. defaults to ./config.json', './config.json').action(build);

program.parse(process.argv);
