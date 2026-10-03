// Общий модуль: одинаковый в tailwind-dictionary/lib/tokens и mixin-dictionary/lib/tokens.
// Меняешь здесь — скопируй в другой пакет.
//
// Приводит значения DTCG (2025.10) к строкам CSS. Строки и числа старого формата не меняются,
// поэтому функцию можно звать для любого токена.

import { isPlainObject } from './walk.js';

const GENERIC_FONT_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',
  'inherit',
  'initial',
  'unset',
]);

// Пространства, у которых в CSS есть своя функция; остальные выводятся через color().
const COLOR_FUNCTIONS = {
  hsl: (c) => `hsl(${c[0]} ${percent(c[1])} ${percent(c[2])}`,
  hwb: (c) => `hwb(${c[0]} ${percent(c[1])} ${percent(c[2])}`,
  lab: (c) => `lab(${c.join(' ')}`,
  lch: (c) => `lch(${c.join(' ')}`,
  oklab: (c) => `oklab(${c.join(' ')}`,
  oklch: (c) => `oklch(${c.join(' ')}`,
};

function percent(value) {
  return value === 'none' ? value : `${value}%`;
}

function round(value, digits = 4) {
  return Number(Number(value).toFixed(digits));
}

function isDimension(value) {
  return isPlainObject(value) && 'value' in value && 'unit' in value;
}

function isColor(value) {
  return isPlainObject(value) && 'colorSpace' in value && 'components' in value;
}

function isShadowLayer(value) {
  return isPlainObject(value) && ('offsetX' in value || 'offsetY' in value);
}

function formatDimension({ value, unit }) {
  return `${value}${unit}`;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : clean.slice(0, 6);

  return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16));
}

function rgbToHex(rgb) {
  return `#${rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

// sRGB: непрозрачный цвет → hex (поле `hex`, если есть), полупрозрачный → rgba(),
// полностью прозрачный чёрный → `transparent`. Остальные пространства → функции CSS Color 4.
function formatColor({ colorSpace, components, alpha, hex }) {
  const opacity = alpha ?? 1;

  if (colorSpace === 'srgb' && components.every((c) => typeof c === 'number')) {
    if (opacity === 0 && components.every((c) => c === 0)) {
      return 'transparent';
    }

    const rgb = hex ? hexToRgb(hex) : components.map((c) => Math.round(Math.min(Math.max(c, 0), 1) * 255));

    if (opacity >= 1) {
      return hex ? hex.toLowerCase() : rgbToHex(rgb);
    }

    return `rgba(${rgb.join(', ')}, ${round(opacity)})`;
  }

  const alphaPart = opacity < 1 ? ` / ${round(opacity)}` : '';
  const format = COLOR_FUNCTIONS[colorSpace];

  if (format) {
    return `${format(components)}${alphaPart})`;
  }

  return `color(${colorSpace} ${components.join(' ')}${alphaPart})`;
}

function formatFontFamilyName(name) {
  const value = String(name).trim();

  if (GENERIC_FONT_FAMILIES.has(value) || /^['"]/.test(value) || value.startsWith('var(')) {
    return value;
  }

  return `'${value.replace(/'/g, "\\'")}'`;
}

function formatFontFamily(value) {
  return Array.isArray(value) ? value.map(formatFontFamilyName).join(', ') : value;
}

function formatShadowLayer(layer) {
  const parts = ['offsetX', 'offsetY', 'blur', 'spread']
    .filter((key) => layer[key] !== undefined)
    .map((key) => normalizeValue(layer[key]));

  if (layer.color !== undefined) {
    parts.push(normalizeValue(layer.color, 'color'));
  }

  return `${layer.inset ? 'inset ' : ''}${parts.join(' ')}`;
}

function formatShadow(value) {
  return (Array.isArray(value) ? value : [value]).map(formatShadowLayer).join(', ');
}

function formatBorder({ width, style, color }) {
  const borderStyle = typeof style === 'string' ? style : 'solid';
  return [normalizeValue(width), borderStyle, normalizeValue(color, 'color')].join(' ');
}

function formatTransition({ duration, delay, timingFunction }) {
  return [normalizeValue(duration), normalizeValue(timingFunction, 'cubicBezier'), normalizeValue(delay)]
    .filter((part) => part !== undefined)
    .join(' ');
}

function formatGradient(stops) {
  return stops
    .map(({ color, position }) => `${normalizeValue(color, 'color')} ${round(Number(position) * 100, 2)}%`)
    .join(', ');
}

// Подсвойства составной типографики → свой тип для нормализации.
const TYPOGRAPHY_TYPES = {
  fontFamily: 'fontFamily',
  fontSize: 'dimension',
  letterSpacing: 'dimension',
  lineHeight: 'number',
  fontWeight: 'fontWeight',
};

function normalizeTypography(value) {
  return Object.fromEntries(
    Object.entries(value).map(([key, subValue]) => [key, normalizeValue(subValue, TYPOGRAPHY_TYPES[key])]),
  );
}

// Значение токена → строка CSS (или число). Для `typography` возвращается объект
// с уже нормализованными подсвойствами: его раскладывают в группу (миксин) отдельно.
function normalizeValue(value, type) {
  if (value === null || value === undefined) {
    return value;
  }

  if (type === 'typography' && isPlainObject(value)) {
    return normalizeTypography(value);
  }

  if (type === 'shadow' || isShadowLayer(value) || (Array.isArray(value) && value.some(isShadowLayer))) {
    return typeof value === 'string' ? value : formatShadow(value);
  }

  if (Array.isArray(value)) {
    if (type === 'cubicBezier' || (value.length === 4 && value.every((item) => typeof item === 'number'))) {
      return `cubic-bezier(${value.join(', ')})`;
    }

    if (type === 'gradient') {
      return formatGradient(value);
    }

    return formatFontFamily(value);
  }

  if (isDimension(value)) {
    return formatDimension(value);
  }

  if (isColor(value)) {
    return formatColor(value);
  }

  if (type === 'border' && isPlainObject(value)) {
    return formatBorder(value);
  }

  if (type === 'transition' && isPlainObject(value)) {
    return formatTransition(value);
  }

  return value;
}

export { normalizeValue, formatColor, formatFontFamily, formatShadow, TYPOGRAPHY_TYPES };
