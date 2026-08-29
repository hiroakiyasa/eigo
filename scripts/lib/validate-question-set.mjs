import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

const LETTERS = ['A', 'B', 'C', 'D'];
const DIFFICULTIES = new Set(['basic', 'intermediate', 'advanced']);
const EXPECTED_DIFFICULTY_COUNTS = {
  basic: 10,
  intermediate: 20,
  advanced: 10,
};
const EXPECTED_FORMAT_COUNTS = {
  'part5-cloze': 10,
  'correct-sentence': 10,
  'meaning-equivalent': 10,
  'context-completion': 10,
};

function text(value, label, errors, minimum = 1) {
  if (typeof value !== 'string' || value.trim().length < minimum) errors.push(`${label} must be a string of at least ${minimum} characters`);
}

export function validateQuestionSet(filePath, expectedPageNumber) {
  const errors = [];
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    return { data: null, errors: [`invalid JSON: ${error.message}`] };
  }

  if (data.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!data.page || typeof data.page !== 'object') errors.push('page is required');
  const pageNumber = data.page?.number;
  const padded = Number.isInteger(pageNumber) ? String(pageNumber).padStart(4, '0') : '????';
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 330) errors.push('page.number must be an integer from 1 to 330');
  if (expectedPageNumber && pageNumber !== expectedPageNumber) errors.push(`page.number must be ${expectedPageNumber}`);
  if (data.page?.id !== `grammar-master-${padded}`) errors.push(`page.id must be grammar-master-${padded}`);
  if (data.page?.image !== `pages/PAGE_${padded}.webp`) errors.push(`page.image must be pages/PAGE_${padded}.webp`);
  if (data.page?.sourcePrompt !== `source-prompts/PAGE_${padded}.txt`) errors.push(`page.sourcePrompt must be source-prompts/PAGE_${padded}.txt`);
  text(data.page?.title, 'page.title', errors);

  const analysis = data.analysis;
  if (!analysis || typeof analysis !== 'object') {
    errors.push('analysis is required');
  } else {
    text(analysis.summaryJa, 'analysis.summaryJa', errors, 20);
    for (const key of ['grammarPoints', 'visualEvidence', 'commonTraps']) {
      if (!Array.isArray(analysis[key]) || analysis[key].length < 1) errors.push(`analysis.${key} must contain at least one item`);
      else analysis[key].forEach((item, index) => text(item, `analysis.${key}[${index}]`, errors));
    }
  }

  if (!Array.isArray(data.questions) || data.questions.length !== 40) {
    errors.push(`questions must contain exactly 40 items; got ${data.questions?.length ?? 'none'}`);
    return { data, errors };
  }

  const ids = new Set();
  const prompts = new Set();
  const answerCounts = Object.fromEntries(LETTERS.map((letter) => [letter, 0]));
  const difficultyCounts = Object.fromEntries(Object.keys(EXPECTED_DIFFICULTY_COUNTS).map((difficulty) => [difficulty, 0]));
  const formatCounts = Object.fromEntries(Object.keys(EXPECTED_FORMAT_COUNTS).map((format) => [format, 0]));
  const formatAnswerCounts = Object.fromEntries(Object.keys(EXPECTED_FORMAT_COUNTS).map((format) => [format, Object.fromEntries(LETTERS.map((letter) => [letter, 0]))]));
  data.questions.forEach((question, index) => {
    const number = String(index + 1).padStart(2, '0');
    const prefix = `questions[${index}]`;
    const expectedId = `PAGE_${padded}_Q${number}`;
    if (question.id !== expectedId) errors.push(`${prefix}.id must be ${expectedId}`);
    if (ids.has(question.id)) errors.push(`duplicate question id: ${question.id}`);
    ids.add(question.id);
    if (!(question.format in EXPECTED_FORMAT_COUNTS)) errors.push(`${prefix}.format is invalid`);
    else formatCounts[question.format] += 1;
    text(question.prompt, `${prefix}.prompt`, errors, 12);
    const blanks = typeof question.prompt === 'string' ? question.prompt.split('-------').length - 1 : 0;
    const needsBlank = question.format === 'part5-cloze' || question.format === 'context-completion';
    if (needsBlank && blanks !== 1) errors.push(`${prefix}.prompt must contain exactly one ------- blank`);
    if (!needsBlank && blanks !== 0) errors.push(`${prefix}.prompt must not contain a ------- blank`);
    const normalizedPrompt = typeof question.prompt === 'string' ? question.prompt.toLowerCase().replace(/\s+/g, ' ').trim() : '';
    if (prompts.has(normalizedPrompt)) errors.push(`duplicate prompt: ${question.prompt}`);
    prompts.add(normalizedPrompt);

    if (!question.choices || typeof question.choices !== 'object') {
      errors.push(`${prefix}.choices is required`);
    } else {
      const values = [];
      for (const letter of LETTERS) {
        text(question.choices[letter], `${prefix}.choices.${letter}`, errors);
        if (typeof question.choices[letter] === 'string') values.push(question.choices[letter].toLowerCase().trim());
      }
      if (new Set(values).size !== 4) errors.push(`${prefix}.choices must be four distinct values`);
      const extraKeys = Object.keys(question.choices).filter((key) => !LETTERS.includes(key));
      if (extraKeys.length) errors.push(`${prefix}.choices has unexpected keys: ${extraKeys.join(', ')}`);
    }

    if (!LETTERS.includes(question.correctAnswer)) errors.push(`${prefix}.correctAnswer must be A, B, C, or D`);
    else {
      answerCounts[question.correctAnswer] += 1;
      if (question.format in formatAnswerCounts) formatAnswerCounts[question.format][question.correctAnswer] += 1;
    }
    text(question.translationJa, `${prefix}.translationJa`, errors);
    text(question.explanationJa, `${prefix}.explanationJa`, errors, 10);
    text(question.focus, `${prefix}.focus`, errors);
    if (!DIFFICULTIES.has(question.difficulty)) errors.push(`${prefix}.difficulty must be basic, intermediate, or advanced`);
    else difficultyCounts[question.difficulty] += 1;
  });

  for (const letter of LETTERS) {
    if (answerCounts[letter] !== 10) errors.push(`correctAnswer ${letter} must appear 10 times; got ${answerCounts[letter]}`);
  }
  for (const [difficulty, expected] of Object.entries(EXPECTED_DIFFICULTY_COUNTS)) {
    if (difficultyCounts[difficulty] !== expected) errors.push(`difficulty ${difficulty} must appear ${expected} times; got ${difficultyCounts[difficulty]}`);
  }
  for (const [format, expected] of Object.entries(EXPECTED_FORMAT_COUNTS)) {
    if (formatCounts[format] !== expected) errors.push(`${format} must appear ${expected} times; got ${formatCounts[format]}`);
    for (const letter of LETTERS) {
      const count = formatAnswerCounts[format][letter];
      if (count < 2 || count > 3) errors.push(`${format} correctAnswer ${letter} must appear 2 or 3 times; got ${count}`);
    }
  }

  const filename = basename(filePath);
  if (filename !== `PAGE_${padded}.json`) errors.push(`filename must be PAGE_${padded}.json`);
  const repositoryRoot = dirname(dirname(resolve(filePath)));
  if (!existsSync(resolve(repositoryRoot, data.page?.image ?? 'missing'))) errors.push(`referenced image does not exist: ${data.page?.image}`);
  if (!existsSync(resolve(repositoryRoot, data.page?.sourcePrompt ?? 'missing'))) errors.push(`referenced source prompt does not exist: ${data.page?.sourcePrompt}`);
  const manifestPath = resolve(repositoryRoot, 'data/page-manifest.json');
  if (existsSync(manifestPath) && Number.isInteger(pageNumber)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const manifestPage = manifest.pages?.find((page) => page.number === pageNumber);
    if (!manifestPage) errors.push(`page ${pageNumber} is missing from data/page-manifest.json`);
    else if (data.page?.title !== manifestPage.title) errors.push(`page.title must match manifest: ${manifestPage.title}`);
  }

  return { data, errors };
}
