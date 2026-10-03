import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from '../lib/index.js';
import { generate } from '../lib/generate.js';
import { normalizeConfig } from '../lib/utils/get-config.js';
import { inDir, makeTempDir, root } from './helpers/fixtures.js';

const bin = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'tailwind-dictionary.js');

function silence(t) {
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'warn', () => {});
}

function runCli(args, cwd) {
  try {
    const stdout = execFileSync(process.execPath, [bin, ...args], { cwd, encoding: 'utf8', stdio: 'pipe' });
    return { code: 0, output: stdout };
  } catch (error) {
    return { code: error.status, output: `${error.stdout}${error.stderr}` };
  }
}

const aliases = { color: 'color' };

test('B1: missing output folder is created recursively', async (t) => {
  silence(t);
  const tmp = makeTempDir('tailwind-dictionary-');
  const output = path.join(tmp, 'deep', 'out');

  try {
    await inDir(path.join(root, 'direct-source'), () =>
      build({ source: ['tokens/base.json'], output, themeAliases: aliases }),
    );
    assert.ok(fs.existsSync(path.join(output, 'tailwind', 'theme.css')));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('B4: no matched token files is an error with the globs', async (t) => {
  silence(t);
  await assert.rejects(
    () => build({ source: ['nope/*.json', 'missing.json'], output: makeTempDir('td-'), themeAliases: aliases }),
    /No token files matched: nope\/\*\.json, missing\.json/,
  );
});

test('B6: parallel builds do not share a cache', async (t) => {
  silence(t);
  const outputs = [makeTempDir('td-a-'), makeTempDir('td-b-')];

  try {
    await inDir(root, () =>
      Promise.all([
        build({ source: ['direct-source/tokens/base.json'], output: outputs[0], themeAliases: aliases }),
        build({ source: ['direct-source/tokens/ignored.json'], output: outputs[1], themeAliases: aliases }),
      ]),
    );

    assert.match(fs.readFileSync(path.join(outputs[0], 'tailwind/theme.css'), 'utf8'), /--color-white: #ffffff;/);
    assert.match(fs.readFileSync(path.join(outputs[1], 'tailwind/theme.css'), 'utf8'), /--color-black: #000000;/);
  } finally {
    outputs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }));
  }
});

test('B8: missing config — one line, exit code 1', () => {
  const { code, output } = runCli(['-c', 'nope.json'], makeTempDir('td-'));
  assert.equal(code, 1);
  assert.match(output, /Config file not found: nope\.json/);
  assert.doesNotMatch(output, /\n\s+at /);
});

test('B8: broken config JSON — one line, exit code 1', () => {
  const cwd = makeTempDir('td-');
  fs.writeFileSync(path.join(cwd, 'config.json'), '{ "version": 4, }');
  const { code, output } = runCli([], cwd);
  assert.equal(code, 1);
  assert.match(output, /Invalid JSON in config file \.\/config\.json/);
  assert.doesNotMatch(output, /\n\s+at /);
});

test('CLI: successful build exits with 0 and matches the snapshot', () => {
  const cwd = makeTempDir('td-');

  try {
    fs.cpSync(path.join(root, 'readme-v4'), cwd, { recursive: true });
    fs.rmSync(path.join(cwd, 'expected'), { recursive: true, force: true });

    const { code } = runCli(['-c', 'config.json'], cwd);

    assert.equal(code, 0);
    assert.equal(
      fs.readFileSync(path.join(cwd, 'expected', 'tailwind', 'theme.css'), 'utf8'),
      fs.readFileSync(path.join(root, 'readme-v4', 'expected', 'tailwind', 'theme.css'), 'utf8'),
    );
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});

test('broken reference: token path and file in the message', async (t) => {
  silence(t);
  const dir = makeTempDir('td-');
  fs.mkdirSync(path.join(dir, 'tokens'));
  fs.writeFileSync(
    path.join(dir, 'tokens', 'colors.json'),
    JSON.stringify({ color: { bg: { $value: '{color.nope}', $type: 'color' } } }),
  );

  await assert.rejects(
    () => inDir(dir, () => build({ source: ['tokens/*.json'], output: 'out', themeAliases: aliases })),
    /Token "color\.bg" \(tokens\/colors\.json\) references \{color\.nope\}, which is not defined/,
  );
});

test('typography without fontSize is an error', async () => {
  await assert.rejects(
    () =>
      generate({
        tokens: { font: { h1: { $type: 'typography', $value: { lineHeight: 1.2 } } } },
        themeAliases: { text: 'font/size' },
        logger: { warn() {} },
      }),
    /Token "font\.h1" has \$type "typography" without "fontSize"/,
  );
});

test('mixed "value" and "$value" is an error', async () => {
  await assert.rejects(
    () =>
      generate({
        tokens: { a: { value: '1px' }, b: { $value: '2px' } },
        themeAliases: { spacing: 'a' },
        logger: { warn() {} },
      }),
    /Mixed token formats/,
  );
});

test('unknown $type is a warning with the token path', async () => {
  const warnings = [];
  await generate({
    tokens: { color: { a: { $type: 'colour', $value: '#fff' } } },
    themeAliases: aliases,
    logger: { warn: (message) => warnings.push(message) },
  });
  assert.deepEqual(warnings, ['Token "color.a" has unknown $type "colour", its value is used as is']);
});

test('theme path missing in one of the themes is a warning', async () => {
  const warnings = [];
  await generate({
    tokens: { color: { white: { value: '#fff' } } },
    themes: {
      light: { color: { bg: { value: '#fff' }, fg: { value: '#000' } } },
      dark: { color: { bg: { value: '#000' } } },
    },
    themeAliases: aliases,
    logger: { warn: (message) => warnings.push(message) },
  });
  assert.equal(warnings.length, 0);

  await generate({
    tokens: { color: { white: { value: '#fff' } } },
    themes: {
      light: { color: { bg: { value: '#fff' } } },
      dark: { color: { bg: { value: '#000' } } },
      contrast: { color: { fg: { value: '#ff0' } } },
    },
    themeAliases: aliases,
    logger: { warn: (message) => warnings.push(message) },
  });
  assert.match(warnings[0], /not defined in every theme.*color\.bg, color\.fg/);
});

test('invalid version in config falls back to the default', (t) => {
  silence(t);
  assert.equal(normalizeConfig({ version: 3.5, themeAliases: aliases }).version, 4);
  assert.equal(normalizeConfig({ version: '3', themeAliases: aliases }).version, 4);
  assert.equal(normalizeConfig({ version: 3, themeAliases: aliases }).version, 3);
});
