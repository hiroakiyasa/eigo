import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve(process.argv[2] ?? '');
const expectedPageNumber = Number(process.argv[3]);
const LETTERS = ['A', 'B', 'C', 'D'];
const FORMATS = [
  'part5-cloze',
  'correct-sentence',
  'meaning-equivalent',
  'context-completion',
];

// Each format keeps every answer position at 2-3 occurrences. Across all four
// formats, A/B/C/D appear exactly ten times each. The order is intentionally
// irregular so learners cannot infer answers from a simple repeating pattern.
const TARGET_ANSWERS = {
  'part5-cloze': ['C', 'A', 'D', 'B', 'A', 'C', 'B', 'D', 'A', 'B'],
  'correct-sentence': ['D', 'B', 'C', 'A', 'D', 'C', 'B', 'D', 'C', 'A'],
  'meaning-equivalent': ['A', 'D', 'C', 'B', 'A', 'C', 'D', 'A', 'B', 'C'],
  'context-completion': ['B', 'D', 'A', 'C', 'D', 'B', 'A', 'D', 'C', 'B'],
};

let data;
try {
  data = JSON.parse(readFileSync(file, 'utf8'));
} catch {
  // Leave malformed JSON untouched so the normal validator reports the exact
  // structural failure instead of hiding it behind an automatic rewrite.
  process.exit(0);
}

let changed = false;
const changes = [];

const root = resolve(new URL('..', import.meta.url).pathname);
const manifest = JSON.parse(readFileSync(resolve(root, 'data/page-manifest.json'), 'utf8'));
const manifestPage = manifest.pages?.find((item) => item.number === expectedPageNumber);
if (manifestPage && data.page?.title !== manifestPage.title) {
  data.page.title = manifestPage.title;
  changed = true;
  changes.push('title');
}

function answerDistributionNeedsRepair(questions) {
  if (!Array.isArray(questions) || questions.length !== 40) return false;
  const overall = Object.fromEntries(LETTERS.map((letter) => [letter, 0]));
  const byFormat = Object.fromEntries(
    FORMATS.map((format) => [format, Object.fromEntries(LETTERS.map((letter) => [letter, 0]))]),
  );
  for (const question of questions) {
    if (!LETTERS.includes(question?.correctAnswer) || !FORMATS.includes(question?.format)) return false;
    overall[question.correctAnswer] += 1;
    byFormat[question.format][question.correctAnswer] += 1;
  }
  if (LETTERS.some((letter) => overall[letter] !== 10)) return true;
  return FORMATS.some((format) =>
    LETTERS.some((letter) => byFormat[format][letter] < 2 || byFormat[format][letter] > 3),
  );
}

function updateLetterReferences(text, oldLetter, newLetter) {
  if (typeof text !== 'string' || oldLetter === newLetter) return text;
  const replacements = [
    [`選択肢${oldLetter}`, `選択肢${newLetter}`],
    [`のは${oldLetter}です`, `のは${newLetter}です`],
    [`${oldLetter}が正解`, `${newLetter}が正解`],
    [`${oldLetter}が同義`, `${newLetter}が同義`],
    [`${oldLetter}が適切`, `${newLetter}が適切`],
    [`${oldLetter}を選ぶ`, `${newLetter}を選ぶ`],
    [`${oldLetter}を選び`, `${newLetter}を選び`],
  ];
  return replacements.reduce((result, [from, to]) => result.split(from).join(to), text);
}

if (answerDistributionNeedsRepair(data.questions)) {
  let repairable = true;
  const grouped = Object.fromEntries(FORMATS.map((format) => [format, []]));
  for (const question of data.questions) {
    if (FORMATS.includes(question?.format)) grouped[question.format].push(question);
  }
  if (FORMATS.some((format) => grouped[format].length !== 10)) repairable = false;
  if (repairable) {
    for (const format of FORMATS) {
      grouped[format].forEach((question, index) => {
        const oldLetter = question.correctAnswer;
        const newLetter = TARGET_ANSWERS[format][index];
        if (oldLetter === newLetter) return;
        if (!question.choices || typeof question.choices[oldLetter] !== 'string' || typeof question.choices[newLetter] !== 'string') {
          repairable = false;
          return;
        }
        const oldCorrectText = question.choices[oldLetter];
        question.choices[oldLetter] = question.choices[newLetter];
        question.choices[newLetter] = oldCorrectText;
        question.correctAnswer = newLetter;
        question.explanationJa = updateLetterReferences(question.explanationJa, oldLetter, newLetter);
      });
    }
    if (repairable) {
      changed = true;
      changes.push('answer-distribution');
    }
  }
}

if (changed) {
  writeFileSync(file, `${JSON.stringify(data)}\n`);
  console.log(`normalized ${file}: ${changes.join(', ')}`);
}
