import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const repositoryRoot = resolve(new URL('..', import.meta.url).pathname);
const promptDirectory = join(repositoryRoot, 'source-prompts');
const imageDirectory = join(repositoryRoot, 'pages');
const outputDirectory = join(repositoryRoot, 'source-json');
const manifestPath = join(repositoryRoot, 'data/page-manifest.json');
const checkOnly = process.argv.includes('--check');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const manifestPages = new Map(manifest.pages.map((page) => [page.number, page]));
const promptFiles = readdirSync(promptDirectory)
  .filter((name) => /^PAGE_\d{4}\.txt$/.test(name))
  .sort();

if (promptFiles.length !== manifest.total || manifestPages.size !== manifest.total) {
  throw new Error(
    `Coverage mismatch: prompts=${promptFiles.length}, manifest=${manifestPages.size}, expected=${manifest.total}`,
  );
}

if (!checkOnly) mkdirSync(outputDirectory, { recursive: true });

const expectedNames = new Set();
const errors = [];

for (const promptFile of promptFiles) {
  const pageId = basename(promptFile, '.txt');
  const number = Number(pageId.slice(5));
  const page = manifestPages.get(number);
  const imageName = `${pageId}.webp`;
  const outputName = `${pageId}.json`;
  const outputPath = join(outputDirectory, outputName);
  expectedNames.add(outputName);

  if (!page) {
    errors.push(`Missing manifest entry for ${pageId}`);
    continue;
  }
  if (page.remoteFile !== imageName || !existsSync(join(imageDirectory, imageName))) {
    errors.push(`Missing or mismatched image for ${pageId}`);
    continue;
  }

  const prompt = readFileSync(join(promptDirectory, promptFile), 'utf8');
  const record = {
    version: 1,
    id: pageId,
    number,
    title: page.title,
    chapter: {
      id: page.chapterId,
      title: page.chapterTitle,
    },
    unitId: page.unitId,
    pageType: page.pageType,
    image: `pages/${imageName}`,
    promptSource: `source-prompts/${promptFile}`,
    promptSha256: createHash('sha256').update(prompt).digest('hex'),
    prompt,
  };
  const expected = `${JSON.stringify(record, null, 2)}\n`;

  if (checkOnly) {
    if (!existsSync(outputPath)) {
      errors.push(`Missing JSON output for ${pageId}`);
    } else if (readFileSync(outputPath, 'utf8') !== expected) {
      errors.push(`JSON output differs from source prompt for ${pageId}`);
    }
  } else {
    writeFileSync(outputPath, expected);
  }
}

if (existsSync(outputDirectory)) {
  const unexpected = readdirSync(outputDirectory)
    .filter((name) => /^PAGE_\d{4}\.json$/.test(name) && !expectedNames.has(name));
  errors.push(...unexpected.map((name) => `Unexpected JSON output: ${name}`));
}

if (errors.length > 0) {
  throw new Error(errors.join('\n'));
}

console.log(`${checkOnly ? 'Verified' : 'Wrote'} ${promptFiles.length} source prompt JSON files.`);
