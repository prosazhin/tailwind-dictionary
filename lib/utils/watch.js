// Общий модуль: одинаковый в tailwind-dictionary/lib/utils и mixin-dictionary/lib/utils.
// Меняешь здесь — скопируй в другой пакет.
//
// Режим --watch: пересборка при изменении файлов токенов (source и themes) или конфига.

import fs from 'node:fs';
import path from 'node:path';
import { matchFiles } from './read-token-files.js';

const DEBOUNCE_MS = 100;
const GLOB_CHARS = /[*?[\]{}!]/;

// Глобы из конфига: source + файлы всех тем.
function getConfigPatterns(config) {
  const source = Array.isArray(config?.source) ? config.source : [];
  const themes = Object.values(config?.themes ?? {})
    .filter(Array.isArray)
    .flat();
  return [...source, ...themes].filter((item) => typeof item === 'string');
}

// Папки, за которыми следим: статическая часть каждого глоба (`tokens/**/*.json` → `tokens`)
// или папка файла. Так не отслеживаются node_modules и остальной проект.
function getWatchRoots(patterns) {
  const roots = patterns.map((pattern) => {
    const segments = pattern.split(/[\\/]/);
    const index = segments.findIndex((segment) => GLOB_CHARS.test(segment));
    const base = index === -1 ? path.dirname(pattern) : segments.slice(0, index).join(path.sep);
    return path.resolve(base || '.');
  });

  return [...new Set(roots)]
    .filter((root) => fs.existsSync(root))
    .filter((root, _, all) => !all.some((other) => other !== root && root.startsWith(other + path.sep)));
}

function safeRead(readConfig) {
  try {
    return readConfig();
  } catch {
    return {};
  }
}

// readConfig() — текущий конфиг (без проверок и логов), run() — сборка.
// Возвращает { close() } для остановки.
function watch({ configPath, readConfig, run, onError }) {
  const configFile = path.resolve(configPath);
  let watchers = [];
  let roots = '';
  let known = new Set();
  let timer = null;
  let running = false;
  let pending = false;

  const isTokenFile = (file) =>
    known.has(file) ||
    matchFiles(getConfigPatterns(safeRead(readConfig))).some((match) => path.resolve(match) === file);

  const onChange = (dir) => (event, filename) => {
    const file = filename ? path.resolve(dir, filename.toString()) : null;

    if (!file || file === configFile || isTokenFile(file)) {
      schedule();
    }
  };

  // Список папок зависит от конфига: пересоздаём наблюдателей, если он изменился.
  const refresh = () => {
    const patterns = getConfigPatterns(safeRead(readConfig));
    known = new Set(matchFiles(patterns).map((file) => path.resolve(file)));

    const nextRoots = getWatchRoots(patterns);

    if (nextRoots.join('\n') === roots) {
      return;
    }

    roots = nextRoots.join('\n');
    watchers.forEach((watcher) => watcher.close());
    watchers = [
      fs.watch(path.dirname(configFile), onChange(path.dirname(configFile))),
      ...nextRoots.map((root) => fs.watch(root, { recursive: true }, onChange(root))),
    ];
  };

  const rebuild = async () => {
    if (running) {
      pending = true;
      return;
    }

    running = true;

    try {
      await run();
    } catch (error) {
      onError(error);
    } finally {
      running = false;
      refresh();

      if (pending) {
        pending = false;
        rebuild();
      }
    }
  };

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(rebuild, DEBOUNCE_MS);
  }

  refresh();

  return {
    close: () => {
      clearTimeout(timer);
      watchers.forEach((watcher) => watcher.close());
    },
  };
}

export { watch, getConfigPatterns, getWatchRoots };
