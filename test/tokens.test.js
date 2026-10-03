// Тесты общего модуля lib/tokens — одинаковые в tailwind-dictionary и mixin-dictionary.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeValue } from '../lib/tokens/normalize-value.js';
import { readTokens } from '../lib/tokens/read-tokens.js';
import { getGroups } from '../lib/tokens/groups.js';
import { collectTokenPaths, mergeTokens } from '../lib/tokens/walk.js';
import { renderOverrides } from '../lib/tokens/theme-blocks.js';

test('normalizeValue: dimension', () => {
  assert.equal(normalizeValue({ value: 16, unit: 'px' }, 'dimension'), '16px');
  assert.equal(normalizeValue({ value: 0, unit: 'rem' }), '0rem');
  assert.equal(normalizeValue('16px', 'dimension'), '16px');
});

test('normalizeValue: color', () => {
  assert.equal(normalizeValue({ colorSpace: 'srgb', components: [1, 0, 0], hex: '#FF0000' }), '#ff0000');
  assert.equal(normalizeValue({ colorSpace: 'srgb', components: [0, 0.5, 1] }), '#0080ff');
  assert.equal(
    normalizeValue({ colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.1, hex: '#000000' }),
    'rgba(0, 0, 0, 0.1)',
  );
  assert.equal(normalizeValue({ colorSpace: 'srgb', components: [0, 0, 0], alpha: 0 }), 'transparent');
  assert.equal(
    normalizeValue({ colorSpace: 'oklch', components: [0.6, 0.1, 250], alpha: 0.5 }),
    'oklch(0.6 0.1 250 / 0.5)',
  );
  assert.equal(normalizeValue({ colorSpace: 'hsl', components: [210, 50, 40] }), 'hsl(210 50% 40%)');
  assert.equal(normalizeValue({ colorSpace: 'display-p3', components: [1, 0, 0] }), 'color(display-p3 1 0 0)');
  assert.equal(normalizeValue('#abc', 'color'), '#abc');
});

test('normalizeValue: fontFamily', () => {
  assert.equal(normalizeValue(['Inter', 'sans-serif'], 'fontFamily'), "'Inter', sans-serif");
  assert.equal(
    normalizeValue(['Inter Variable', "'Quoted'", 'system-ui'], 'fontFamily'),
    "'Inter Variable', 'Quoted', system-ui",
  );
  assert.equal(normalizeValue("'Inter', sans-serif", 'fontFamily'), "'Inter', sans-serif");
});

test('normalizeValue: shadow', () => {
  const layer = { color: '#000000', offsetX: '0px', offsetY: { value: 1, unit: 'px' }, blur: '2px', spread: '0px' };
  assert.equal(normalizeValue(layer, 'shadow'), '0px 1px 2px 0px #000000');
  assert.equal(
    normalizeValue([layer, { ...layer, inset: true }], 'shadow'),
    '0px 1px 2px 0px #000000, inset 0px 1px 2px 0px #000000',
  );
  assert.equal(normalizeValue('0 1px red', 'shadow'), '0 1px red');
});

test('normalizeValue: other composites', () => {
  assert.equal(normalizeValue([0.4, 0, 0.2, 1], 'cubicBezier'), 'cubic-bezier(0.4, 0, 0.2, 1)');
  assert.equal(normalizeValue({ value: 200, unit: 'ms' }, 'duration'), '200ms');
  assert.equal(normalizeValue({ width: '1px', style: 'solid', color: '#000000' }, 'border'), '1px solid #000000');
  assert.equal(normalizeValue(0, 'number'), 0);
});

test('readTokens: typography expands into a group', () => {
  const tokens = readTokens(
    [
      {
        path: ['font', 'h64'],
        $type: 'typography',
        $value: { fontSize: { value: 64, unit: 'px' }, lineHeight: 1.25, fontWeight: 700 },
        attributes: { category: 'font' },
      },
    ],
    { usesDtcg: true },
  );

  assert.deepEqual(
    tokens.map(({ path, value, group }) => [path.join('.'), value, group]),
    [
      ['font.h64.font-size', '64px', 'h64'],
      ['font.h64.line-height', 1.25, 'h64'],
      ['font.h64.font-weight', 700, 'h64'],
    ],
  );
});

test('readTokens: legacy values are untouched', () => {
  const [token] = readTokens([{ path: ['a'], value: ['x', 'y'], mixin: 'm', attributes: {} }]);
  assert.deepEqual(token.value, ['x', 'y']);
  assert.equal(token.group, 'm');
});

test('getGroups: structure, $extensions and legacy mixin', () => {
  const tokens = readTokens(
    [
      { path: ['screen', 'lg', 'min'], $value: '921px' },
      { path: ['screen', 'lg', 'max'], $value: '1440px' },
      { path: ['screen', 'sm'], $value: '640px' },
      { path: ['keyframes', 'show', 'from', 'opacity'], $value: 0 },
      { path: ['keyframes', 'show', 'to', 'opacity'], $value: 1 },
      { path: ['screen', 'x', 'min'], $value: '1px', $extensions: { 'dev.prosazhin.mixin': 'custom' } },
    ],
    { usesDtcg: true },
  );

  const groups = getGroups(tokens, { media: [['screen']], keyframes: [['keyframes']] });
  assert.deepEqual(
    groups.map(({ name, category, tokens: list }) => [name, category, list.length]),
    [
      ['lg', 'screen', 2],
      ['show', 'keyframes', 2],
      ['custom', 'screen', 1],
    ],
  );

  const flat = getGroups(tokens, { media: [['screen']], flatMedia: true });
  assert.ok(flat.some(({ name }) => name === 'sm'));
});

test('collectTokenPaths: both formats, $type groups are not tokens', () => {
  const paths = collectTokenPaths({
    color: { $type: 'color', a: { $value: '#fff' }, b: { value: '#000' }, c: { d: { $value: 1 } } },
  });
  assert.deepEqual([...paths], ['color.a', 'color.b', 'color.c.d']);
});

test('mergeTokens: deep merge, token objects replaced', () => {
  const merged = mergeTokens({ a: { b: { value: 1, mixin: 'x' }, c: { value: 2 } } }, { a: { b: { value: 3 } } });
  assert.deepEqual(merged, { a: { b: { value: 3 }, c: { value: 2 } } });
});

test('renderOverrides: light/dark keep prefers-color-scheme', () => {
  const vars = [{ name: '--a', value: '#000' }];
  const css = renderOverrides({ defaultName: 'light', defaultVars: vars, themes: [{ name: 'dark', vars }] });
  assert.match(css, /@media \(prefers-color-scheme: dark\) \{\n {2}:root:not\(\[data-theme='light'\]\) \{/);
  assert.match(css, /\[data-theme='dark'\] \{/);
  assert.match(css, /\[data-theme='light'\] \{/);
});

test('isToken: DTCG group with a child token named "value" is a group', () => {
  const paths = collectTokenPaths({ z: { value: { $value: 10 }, top: { $value: 20 } }, legacy: { value: 1 } });
  assert.deepEqual([...paths], ['z.value', 'z.top', 'legacy']);
});
