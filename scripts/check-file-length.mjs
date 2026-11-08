import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const MAX_LINES = 400;
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.css']);
const IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', '.git', 'docs', 'public']);

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.github') continue;
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (SOURCE_EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
      yield path;
    }
  }
}

const violations = [];

for await (const path of walk(ROOT)) {
  const contents = await readFile(path, 'utf8');
  const lines = contents.split('\n').length - (contents.endsWith('\n') ? 1 : 0);
  if (lines > MAX_LINES) {
    violations.push({ path: relative(ROOT, path), lines });
  }
}

if (violations.length > 0) {
  console.error(`Archivos por encima de ${MAX_LINES} líneas:`);
  for (const violation of violations) {
    console.error(`  ${violation.path} (${violation.lines})`);
  }
  process.exit(1);
}

console.log(`Todos los archivos de código tienen ${MAX_LINES} líneas o menos.`);
