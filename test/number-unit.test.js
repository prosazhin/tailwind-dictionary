import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generate } from '../lib/generate.js';
import { normalizeConfig } from '../lib/utils/get-config.js';

const tokens = {
  radius: {
    $type: 'number',
    zero: { $value: 0 },
    sm: { $value: 4 },
    md: { $value: { value: 8, unit: 'px' }, $type: 'dimension' },
  },
  leading: { $type: 'number', normal: { $value: 1.5 } },
  opacity: { $type: 'number', half: { $value: 0.5 } },
};
const themeAliases = { radius: 'radius', leading: 'leading', opacity: 'opacity', spacing: '1px' };

async function themeCss(options = {}) {
  const warnings = [];
  const files = await generate({
    tokens,
    themeAliases,
    logger: { warn: (message) => warnings.push(message) },
    ...options,
  });

  return { css: files['tailwind/theme.css'], warnings };
}

test('numberUnit: px by default; zero and non-dimension keys stay numbers', async () => {
  const { css } = await themeCss();

  assert.match(css, /--radius-zero: 0;/);
  assert.match(css, /--radius-sm: 4px;/);
  assert.match(css, /--radius-md: 8px;/);
  assert.match(css, /--leading-normal: 1\.5;/);
  assert.match(css, /--opacity-half: 0\.5;/);
});

test('numberUnit: rem divides by 16', async () => {
  const { css } = await themeCss({ numberUnit: 'rem' });

  assert.match(css, /--radius-sm: 0\.25rem;/);
  assert.match(css, /--radius-zero: 0;/);
  assert.match(css, /--radius-md: 8px;/);
});

test('numberUnit: false keeps bare numbers', async () => {
  const { css } = await themeCss({ numberUnit: false });

  assert.match(css, /--radius-sm: 4;/);
});

test('numberUnit applies to v3 dimension keys and theme overrides', async () => {
  const files = await generate({
    tokens: { radius: { $type: 'number', sm: { $value: 4 } }, lh: { $type: 'number', n: { $value: 1.5 } } },
    themes: { light: { radius: { sm: { $value: 4 } } }, dark: { radius: { sm: { $value: 8 } } } },
    themeAliases: { borderRadius: 'radius', lineHeight: 'lh' },
    version: 3,
  });

  assert.match(files['tailwind/theme.js'], /"lineHeight":\{"n":1\.5\}/);
  assert.match(files['tailwind/theme.css'], /--radius-sm: 8px;/);
});

test('numberUnit config check: invalid value falls back to px', (t) => {
  t.mock.method(console, 'log', () => {});

  assert.equal(normalizeConfig({ themeAliases }).numberUnit, 'px');
  assert.equal(normalizeConfig({ themeAliases, numberUnit: false }).numberUnit, false);
  assert.equal(normalizeConfig({ themeAliases, numberUnit: 'rem' }).numberUnit, 'rem');
  assert.equal(normalizeConfig({ themeAliases, numberUnit: 'em' }).numberUnit, 'px');
});

test('spacing: warns when the value is not a CSS length, keeps the output', async () => {
  const { css, warnings } = await themeCss({ themeAliases: { spacing: 'size/1px' } });

  assert.match(css, /--spacing: size;/);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /themeAliases\.spacing "size\/1px" is a base unit/);

  for (const value of ['1px', '0.25rem', '0']) {
    assert.deepEqual((await themeCss({ themeAliases: { spacing: value } })).warnings, []);
  }
});

test('numberUnit: invalid value is an error in generate()', async () => {
  await assert.rejects(() => themeCss({ numberUnit: 'em' }), /Invalid numberUnit: em/);
});
