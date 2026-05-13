import fs from 'fs-extra';

function collectPaths(obj, prefix = '') {
  const paths = new Set();

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')) {
      paths.add(path);
    } else if (value && typeof value === 'object') {
      collectPaths(value, path).forEach((p) => paths.add(p));
    }
  }

  return paths;
}

export default function getSemanticPaths(sourceFiles) {
  const paths = new Set();

  sourceFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const json = fs.readJsonSync(filePath);
      collectPaths(json).forEach((p) => paths.add(p));
    }
  });

  return paths;
}
