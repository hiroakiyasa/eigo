import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const progress = JSON.parse(readFileSync(resolve(root, 'data/progress.json'), 'utf8'));
const next = progress.pages.find((page) => page.status === 'pending');

if (!next) {
  console.log('ALL_COMPLETE');
} else {
  console.log(`PAGE_${String(next.number).padStart(4, '0')}`);
}

