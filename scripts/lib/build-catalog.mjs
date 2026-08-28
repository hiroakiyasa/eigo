export function buildCatalog(manifest, progress) {
  const chapterById = new Map(manifest.chapters.map((chapter) => [chapter.id, chapter]));
  const progressByNumber = new Map(progress.pages.map((page) => [page.number, page]));
  const lines = [
    '# 図鑑ページ一覧',
    '',
    `全${manifest.total}ページです。画像リンクを開くとGitHub上で各ページを確認できます。問題セットの進捗は [data/progress.json](data/progress.json) を正とします。`,
    '',
  ];
  let currentChapter = '';
  for (const page of manifest.pages) {
    if (page.chapterId !== currentChapter) {
      currentChapter = page.chapterId;
      const chapter = chapterById.get(currentChapter);
      lines.push(`## ${chapter.title}（${chapter.start}〜${chapter.end}）`, '', '| ページ | タイトル | 画像 | 制作原稿 | 問題 |', '|---:|---|---|---|---|');
    }
    const padded = String(page.number).padStart(4, '0');
    const pageProgress = progressByNumber.get(page.number);
    const questionCell = pageProgress?.status === 'complete'
      ? `[40問](question-sets/PAGE_${padded}.json)`
      : '`pending`';
    lines.push(`| ${page.number} | ${page.title.replaceAll('|', '\\|')} | [PAGE_${padded}](pages/PAGE_${padded}.webp) | [原稿](source-prompts/PAGE_${padded}.txt) | ${questionCell} |`);
    const chapter = chapterById.get(currentChapter);
    if (page.number === chapter.end) lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

