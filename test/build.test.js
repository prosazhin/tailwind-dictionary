import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { build } from '../lib/index.js';
import { generate } from '../lib/generate.js';
import { getFixtures, inDir, listFiles, makeTempDir, readFixture } from './helpers/fixtures.js';

function silence(t) {
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'warn', () => {});
}

for (const name of getFixtures()) {
  test(`build: ${name}`, async (t) => {
    silence(t);
    const { dir, config, expectedDir } = readFixture(name);
    const output = makeTempDir('tailwind-dictionary-');

    try {
      await inDir(dir, () => build({ ...config, output }));

      assert.deepEqual(listFiles(output), listFiles(expectedDir));

      for (const file of listFiles(expectedDir)) {
        assert.equal(
          fs.readFileSync(path.join(output, file), 'utf8'),
          fs.readFileSync(path.join(expectedDir, file), 'utf8'),
          `${name}: ${file}`,
        );
      }
    } finally {
      fs.rmSync(output, { recursive: true, force: true });
    }
  });
}

test('generate() returns the same files as build()', async (t) => {
  silence(t);
  const { dir, config, expectedDir } = readFixture('readme-v4');
  const tokens = JSON.parse(fs.readFileSync(path.join(dir, 'tokens', 'base.json'), 'utf8'));
  const files = await generate({ tokens, themeAliases: config.themeAliases, version: config.version });

  assert.deepEqual(Object.keys(files), listFiles(expectedDir));
  assert.equal(files['tailwind/theme.css'], fs.readFileSync(path.join(expectedDir, 'tailwind/theme.css'), 'utf8'));
});
