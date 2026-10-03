// Общий модуль: одинаковый в tailwind-dictionary/lib/utils и mixin-dictionary/lib/utils.
// Меняешь здесь — скопируй в другой пакет.
//
// Чтение файлов токенов с диска (только для build, generate работает без fs).

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DictionaryError } from '../tokens/errors.js';
import { mergeTokens, walkTokens } from '../tokens/walk.js';

// Пути и глобы → список файлов. Как в Style Dictionary: результат каждого глоба сортируется,
// порядок глобов сохраняется, повторы убираются.
function matchFiles(patterns) {
  const files = [];

  patterns.forEach((pattern) => {
    const matched = fs.existsSync(pattern) && fs.statSync(pattern).isFile() ? [pattern] : fs.globSync(pattern);

    matched
      .filter((file) => fs.statSync(file).isFile())
      .map((file) => file.split(path.sep).join('/'))
      .sort()
      .forEach((file) => {
        if (!files.includes(file)) {
          files.push(file);
        }
      });
  });

  return files;
}

async function readTokenFile(file) {
  const extension = path.extname(file).toLowerCase();

  if (['.js', '.mjs', '.cjs'].includes(extension)) {
    // Метка времени изменения в URL: в режиме --watch изменённый модуль загружается заново.
    const url = `${pathToFileURL(path.resolve(file)).href}?mtime=${fs.statSync(file).mtimeMs}`;
    const module = await import(url);
    return module.default ?? module;
  }

  const content = fs.readFileSync(file, 'utf8');

  try {
    if (extension === '.json5' || extension === '.jsonc') {
      const { default: JSON5 } = await import('json5');
      return JSON5.parse(content);
    }

    return JSON.parse(content);
  } catch (error) {
    throw new DictionaryError(`Invalid JSON in token file ${file}: ${error.message}`);
  }
}

// Читает файлы, сливает их в одно дерево и запоминает, в каком файле лежит каждый токен
// (для сообщений об ошибках). `sources` дополняется, если передан.
async function readTokenFiles(files, sources = new Map()) {
  const trees = [];

  for (const file of files) {
    const tree = await readTokenFile(file);
    walkTokens(tree, ({ path: tokenPath }) => sources.set(tokenPath.join('.'), file));
    trees.push(tree);
  }

  return { tree: mergeTokens(...trees), sources };
}

// Файлы по глобам; если ни один глоб ничего не нашёл — ошибка.
function requireFiles(patterns, label = 'token files') {
  const files = matchFiles(patterns);

  if (!files.length) {
    throw new DictionaryError(`No ${label} matched: ${patterns.join(', ')}`);
  }

  return files;
}

export { matchFiles, readTokenFiles, requireFiles };
