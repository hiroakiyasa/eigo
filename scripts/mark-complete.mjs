import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCatalog } from './lib/build-catalog.mjs';
import { validateQuestionSet } from './lib/validate-question-set.mjs';

const root = resolve(new URL('..', import.meta.url).pathname);
const rawTarget = process.argv[2] ?? '';
const match = rawTarget.match(/^(?:PAGE_)?(\d{1,4})$/i);
if (!match) {
  console.error('Usage: node scripts/mark-complete.mjs PAGE_NNNN');
  process.exit(1);
}

const pageNumber = Number(match[1]);
if (pageNumber < 1 || pageNumber > 330) {
  console.error('Page number must be from 1 to 330');
  process.exit(1);
}

const padded = String(pageNumber).padStart(4, '0');
const output = resolve(root, `question-sets/PAGE_${padded}.json`);
const { errors } = validateQuestionSet(output, pageNumber);
if (errors.length) {
  console.error(`Cannot mark PAGE_${padded} complete:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exit(1);
}

const progressPath = resolve(root, 'data/progress.json');
const progress = JSON.parse(readFileSync(progressPath, 'utf8'));
const page = progress.pages.find((item) => item.number === pageNumber);
if (!page) {
  console.error(`PAGE_${padded} is missing from progress.json`);
  process.exit(1);
}
if (page.status === 'complete') {
  console.log(`already complete: PAGE_${padded}`);
  process.exit(0);
}

page.status = 'complete';
page.completedAt = new Date().toISOString();
progress.completedPages = progress.pages.filter((item) => item.status === 'complete').length;
progress.updatedAt = page.completedAt;
writeFileSync(progressPath, `${JSON.stringify(progress, null, 2)}\n`);
const manifest = JSON.parse(readFileSync(resolve(root, 'data/page-manifest.json'), 'utf8'));
writeFileSync(resolve(root, 'CATALOG.md'), buildCatalog(manifest, progress));
console.log(`complete: PAGE_${padded} (${progress.completedPages}/${progress.totalPages})`);
