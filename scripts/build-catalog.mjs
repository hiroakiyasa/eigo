import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCatalog } from './lib/build-catalog.mjs';

const root = resolve(new URL('..', import.meta.url).pathname);
const manifest = JSON.parse(readFileSync(resolve(root, 'data/page-manifest.json'), 'utf8'));
const progress = JSON.parse(readFileSync(resolve(root, 'data/progress.json'), 'utf8'));
writeFileSync(resolve(root, 'CATALOG.md'), buildCatalog(manifest, progress));
console.log(`updated: CATALOG.md (${progress.completedPages}/${progress.totalPages})`);

