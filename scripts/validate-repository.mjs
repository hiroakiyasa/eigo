import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCatalog } from './lib/build-catalog.mjs';
import { validateQuestionSet } from './lib/validate-question-set.mjs';

const root = resolve(new URL('..', import.meta.url).pathname);
const manifest = JSON.parse(readFileSync(resolve(root, 'data/page-manifest.json'), 'utf8'));
const progress = JSON.parse(readFileSync(resolve(root, 'data/progress.json'), 'utf8'));
const errors = [];
const expectedCatalog = buildCatalog(manifest, progress);
const actualCatalog = readFileSync(resolve(root, 'CATALOG.md'), 'utf8');
if (actualCatalog !== expectedCatalog) errors.push('CATALOG.md is out of sync; run node scripts/build-catalog.mjs');

const images = readdirSync(resolve(root, 'pages')).filter((name) => /^PAGE_\d{4}\.webp$/.test(name)).sort();
const prompts = readdirSync(resolve(root, 'source-prompts')).filter((name) => /^PAGE_\d{4}\.txt$/.test(name)).sort();
const outputs = readdirSync(resolve(root, 'question-sets')).filter((name) => /^PAGE_\d{4}\.json$/.test(name)).sort();

if (images.length !== 330) errors.push(`expected 330 images, got ${images.length}`);
if (prompts.length !== 330) errors.push(`expected 330 source prompts, got ${prompts.length}`);
if (manifest.total !== 330 || manifest.pages?.length !== 330) errors.push(`manifest must contain 330 pages, got ${manifest.pages?.length}`);
if (progress.totalPages !== 330 || progress.pages?.length !== 330) errors.push(`progress must contain 330 pages, got ${progress.pages?.length}`);
if (progress.questionsPerPage !== 40) errors.push(`questionsPerPage must be 40, got ${progress.questionsPerPage}`);
if (progress.totalPlannedQuestions !== 13200) errors.push(`totalPlannedQuestions must be 13200, got ${progress.totalPlannedQuestions}`);

for (let number = 1; number <= 330; number += 1) {
  const padded = String(number).padStart(4, '0');
  const manifestPage = manifest.pages?.[number - 1];
  const progressPage = progress.pages?.[number - 1];
  if (manifestPage?.number !== number) errors.push(`manifest sequence mismatch at ${number}`);
  if (progressPage?.number !== number) errors.push(`progress sequence mismatch at ${number}`);
  if (!['pending', 'complete'].includes(progressPage?.status)) errors.push(`invalid progress status at ${number}: ${progressPage?.status}`);
  if (!existsSync(resolve(root, `pages/PAGE_${padded}.webp`))) errors.push(`missing pages/PAGE_${padded}.webp`);
  if (!existsSync(resolve(root, `source-prompts/PAGE_${padded}.txt`))) errors.push(`missing source-prompts/PAGE_${padded}.txt`);
  const outputExists = existsSync(resolve(root, `question-sets/PAGE_${padded}.json`));
  if (progressPage?.status === 'complete' && !outputExists) errors.push(`PAGE_${padded} is complete but output is missing`);
  if (progressPage?.status === 'pending' && outputExists) errors.push(`PAGE_${padded} has output but progress is pending; validate and mark complete`);
}

for (const output of outputs) {
  const { errors: outputErrors } = validateQuestionSet(resolve(root, 'question-sets', output));
  errors.push(...outputErrors.map((error) => `${output}: ${error}`));
}

const completed = progress.pages.filter((page) => page.status === 'complete').length;
if (progress.completedPages !== completed) errors.push(`completedPages is ${progress.completedPages}, expected ${completed}`);

if (errors.length) {
  console.error(errors.slice(0, 100).map((error) => `- ${error}`).join('\n'));
  if (errors.length > 100) console.error(`...and ${errors.length - 100} more errors`);
  process.exit(1);
}

console.log(`ok: 330 images, 330 prompts, ${completed} completed question sets`);
