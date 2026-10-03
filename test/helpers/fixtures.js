import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');

function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? listFiles(full, base) : [path.relative(base, full).split(path.sep).join('/')];
    })
    .sort();
}

// Фикстуры с эталоном: test/fixtures/<case>/{config.json, tokens/, expected/}
function getFixtures() {
  return fs
    .readdirSync(root)
    .filter((name) => fs.existsSync(path.join(root, name, 'expected')))
    .sort();
}

function readFixture(name) {
  const dir = path.join(root, name);
  const config = JSON.parse(fs.readFileSync(path.join(dir, 'config.json'), 'utf8'));
  return { dir, config, expectedDir: path.join(dir, 'expected') };
}

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

// Запуск в папке фикстуры: пути в конфиге относительные, как у пользователя.
async function inDir(dir, callback) {
  const cwd = process.cwd();
  process.chdir(dir);

  try {
    return await callback();
  } finally {
    process.chdir(cwd);
  }
}

export { root, listFiles, getFixtures, readFixture, makeTempDir, inDir };
