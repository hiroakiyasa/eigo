import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateQuestionSet } from './lib/validate-question-set.mjs';

const root = resolve(new URL('..', import.meta.url).pathname);
const argument = process.argv[2];
const files = argument === '--all'
  ? readdirSync(resolve(root, 'question-sets')).filter((name) => /^PAGE_\d{4}\.json$/.test(name)).sort().map((name) => resolve(root, 'question-sets', name))
  : [resolve(process.cwd(), argument ?? '')];

if (!argument) {
  console.error('Usage: node scripts/validate-question-set.mjs question-sets/PAGE_NNNN.json | --all');
  process.exit(1);
}

let failed = false;
for (const file of files) {
  if (!existsSync(file)) {
    console.error(`missing file: ${file}`);
    failed = true;
    continue;
  }
  const { data, errors } = validateQuestionSet(file);
  if (errors.length) {
    console.error(`${file}:\n${errors.map((error) => `- ${error}`).join('\n')}`);
    failed = true;
  } else {
    console.log(`ok: PAGE_${String(data.page.number).padStart(4, '0')} has 40 valid questions`);
  }
}

if (failed) process.exit(1);
