// Общий модуль: одинаковый в tailwind-dictionary/lib/tokens и mixin-dictionary/lib/tokens.
// Меняешь здесь — скопируй в другой пакет.
//
// Проверки исходного дерева токенов до Style Dictionary: так в сообщении есть путь токена
// и файл, а не стектрейс Style Dictionary.

import { DictionaryError } from './errors.js';
import { isPlainObject, walkTokens } from './walk.js';

// Типы DTCG 2025.10 и типы, которые понимает Style Dictionary.
const KNOWN_TYPES = new Set([
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'strokeStyle',
  'border',
  'transition',
  'shadow',
  'gradient',
  'typography',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'fontStyle',
  'string',
  'boolean',
  'asset',
  'time',
  'size',
  'content',
  'other',
]);

const REFERENCE_REGEXP = /\{([^{}]+)\}/g;
const HAS_REFERENCE = /\{[^{}]+\}/;

function where(path, sources) {
  const file = sources?.get(path);
  return file ? ` (${file})` : '';
}

function collectReferences(value, result = []) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(REFERENCE_REGEXP)) {
      result.push(match[1]);
    }
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectReferences(item, result));
  } else if (isPlainObject(value)) {
    Object.values(value).forEach((item) => collectReferences(item, result));
  }

  return result;
}

// Возвращает { usesDtcg, warnings }. Ошибки бросает как DictionaryError.
function validateTokens(tree, { sources } = {}) {
  const tokens = [];
  walkTokens(tree, (entry) => tokens.push(entry));

  const dtcg = tokens.filter(({ token }) => '$value' in token);
  const legacy = tokens.filter(({ token }) => !('$value' in token));
  const usesDtcg = dtcg.length > 0;

  if (dtcg.length && legacy.length) {
    const sample = legacy[0].path.join('.');
    throw new DictionaryError(
      `Mixed token formats: "${sample}"${where(sample, sources)} uses "value", other tokens use "$value". ` +
        'Use one format (DTCG "$value" or legacy "value") in all token files.',
    );
  }

  const paths = new Set(tokens.map(({ path }) => path.join('.')));
  const errors = [];
  const warnings = [];

  tokens.forEach(({ path, token, type }) => {
    const id = path.join('.');
    const value = usesDtcg ? token.$value : token.value;

    collectReferences(value).forEach((reference) => {
      if (!paths.has(reference)) {
        errors.push(`Token "${id}"${where(id, sources)} references {${reference}}, which is not defined`);
      }
    });

    if (!usesDtcg) {
      return;
    }

    if (type !== undefined && !KNOWN_TYPES.has(type)) {
      warnings.push(`Token "${id}"${where(id, sources)} has unknown $type "${type}", its value is used as is`);
    }

    if (type === 'typography' && isPlainObject(value) && !('fontSize' in value)) {
      errors.push(`Token "${id}"${where(id, sources)} has $type "typography" without "fontSize"`);
    }

    if (type === 'typography' && typeof value === 'string' && !HAS_REFERENCE.test(value)) {
      errors.push(`Token "${id}"${where(id, sources)} has $type "typography", but its $value is not an object`);
    }
  });

  if (errors.length) {
    throw new DictionaryError(errors.join('\n'));
  }

  return { usesDtcg, warnings };
}

export { validateTokens, collectReferences };
