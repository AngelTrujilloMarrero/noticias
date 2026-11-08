import { readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('..', import.meta.url);
const RELEASES_URL = 'https://nodejs.org/dist/index.json';

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, ROOT), 'utf8'));
}

async function writeJson(relativePath, data) {
  await writeFile(new URL(relativePath, ROOT), `${JSON.stringify(data, null, 2)}\n`);
}

async function latestLts() {
  const response = await fetch(RELEASES_URL, {
    headers: { 'user-agent': 'noticias-node-updater' },
  });
  if (!response.ok) {
    throw new Error(`No se pudo consultar ${RELEASES_URL}: HTTP ${response.status}`);
  }

  const releases = await response.json();
  const lts = releases.find((release) => release.lts);
  if (!lts?.version) {
    throw new Error('La respuesta de Node.js no contiene ninguna versión LTS.');
  }

  return lts.version.replace(/^v/, '');
}

const version = await latestLts();
const major = version.split('.')[0];

const currentNvmrc = (await readFile(new URL('.nvmrc', ROOT), 'utf8')).trim();
if (currentNvmrc === major) {
  console.log(`Node.js ya está en la última LTS (${version}).`);
  process.exit(0);
}

await writeFile(new URL('.nvmrc', ROOT), `${major}\n`);

const packageJson = await readJson('package.json');
packageJson.engines = { ...packageJson.engines, node: `>=${major}.0.0` };
await writeJson('package.json', packageJson);

const packageLock = await readJson('package-lock.json');
if (packageLock.packages?.['']) {
  packageLock.packages[''].engines = {
    ...packageLock.packages[''].engines,
    node: `>=${major}.0.0`,
  };
  await writeJson('package-lock.json', packageLock);
}

const readmeUrl = new URL('README.md', ROOT);
const readme = await readFile(readmeUrl, 'utf8');
await writeFile(readmeUrl, readme.replace(/Node\.js \d+ o superior/, `Node.js ${major} o superior`));

console.log(`Node.js actualizado de ${currentNvmrc} a ${major} (${version}).`);
