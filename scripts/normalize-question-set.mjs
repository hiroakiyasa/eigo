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
const DIFFICULTIES = ['basic', 'intermediate', 'advanced'];
const EXPECTED_DIFFICULTIES = { basic: 10, intermediate: 20, advanced: 10 };

// Each format keeps every answer position at 2-3 occurrences. Across all four
// formats, A/B/C/D appear exactly ten times each. The order is intentionally
// irregular so learners cannot infer answers from a simple repeating pattern.
const TARGET_ANSWERS = {
  'part5-cloze': ['C', 'A', 'D', 'B', 'A', 'C', 'B', 'D', 'A', 'B'],
  'correct-sentence': ['D', 'B', 'C', 'A', 'D', 'C', 'B', 'D', 'C', 'A'],
  'meaning-equivalent': ['A', 'D', 'C', 'B', 'A', 'C', 'D', 'A', 'B', 'C'],
  'context-completion': ['B', 'D', 'A', 'C', 'D', 'B', 'A', 'D', 'C', 'B'],
};

const FALLBACK_DIFFICULTIES = {
  'part5-cloze': ['basic', 'intermediate', 'basic', 'intermediate', 'advanced', 'intermediate', 'basic', 'advanced', 'intermediate', 'intermediate'],
  'correct-sentence': ['intermediate', 'basic', 'advanced', 'intermediate', 'basic', 'advanced', 'intermediate', 'advanced', 'intermediate', 'intermediate'],
  'meaning-equivalent': ['basic', 'intermediate', 'advanced', 'basic', 'intermediate', 'intermediate', 'basic', 'advanced', 'intermediate', 'intermediate'],
  'context-completion': ['intermediate', 'basic', 'advanced', 'intermediate', 'advanced', 'basic', 'intermediate', 'advanced', 'intermediate', 'intermediate'],
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

function normalizeDifficultyDistribution(questions) {
  if (!Array.isArray(questions) || questions.length !== 40) return false;
  const grouped = Object.fromEntries(FORMATS.map((format) => [format, []]));
  for (const question of questions) {
    if (!FORMATS.includes(question?.format)) return false;
    grouped[question.format].push(question);
  }
  if (FORMATS.some((format) => grouped[format].length !== 10)) return false;

  const invalid = questions.some((question) => !DIFFICULTIES.includes(question?.difficulty));
  if (invalid) {
    for (const format of FORMATS) {
      grouped[format].forEach((question, index) => {
        question.difficulty = FALLBACK_DIFFICULTIES[format][index];
      });
    }
    return true;
  }

  const counts = Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, 0]));
  questions.forEach((question) => { counts[question.difficulty] += 1; });
  if (DIFFICULTIES.every((difficulty) => counts[difficulty] === EXPECTED_DIFFICULTIES[difficulty])) return false;

  const surplus = Object.fromEntries(
    DIFFICULTIES.map((difficulty) => [difficulty, Math.max(0, counts[difficulty] - EXPECTED_DIFFICULTIES[difficulty])]),
  );
  const deficit = Object.fromEntries(
    DIFFICULTIES.map((difficulty) => [difficulty, Math.max(0, EXPECTED_DIFFICULTIES[difficulty] - counts[difficulty])]),
  );

  const orderForTarget = {
    basic: [...questions.keys()],
    intermediate: [...questions.keys()].sort((a, b) => Math.abs(a - 19.5) - Math.abs(b - 19.5)),
    advanced: [...questions.keys()].reverse(),
  };

  for (const target of DIFFICULTIES) {
    while (deficit[target] > 0) {
      const source = DIFFICULTIES.find((difficulty) => surplus[difficulty] > 0);
      if (!source) return false;
      const index = orderForTarget[target].find((candidate) => questions[candidate].difficulty === source);
      if (index === undefined) return false;
      questions[index].difficulty = target;
      surplus[source] -= 1;
      deficit[target] -= 1;
    }
  }
  return true;
}

if (normalizeDifficultyDistribution(data.questions)) {
  changed = true;
  changes.push('difficulty-distribution');
}

if (changed) {
  writeFileSync(file, `${JSON.stringify(data)}\n`);
  console.log(`normalized ${file}: ${changes.join(', ')}`);
}
