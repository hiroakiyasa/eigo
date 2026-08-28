# Repository instructions

このリポジトリの問題制作では、ルートの指示に加えて以下を必ず守ること。

- ユーザーとの会話と解説は日本語で行う。
- 1セッションでは図鑑1ページだけを扱い、40問を完成させる。複数ページをまとめて処理しない。
- 対象の `pages/PAGE_NNNN.webp` を画像表示ツールで直接確認し、`source-prompts/PAGE_NNNN.txt` と `data/page-manifest.json` の該当項目も読む。
- 画像を最終的な根拠とし、画像にない文法事項をページ固有の内容であるかのように扱わない。
- `docs/TOEIC_PART5_SPEC.md`、`docs/LEARNING_DESIGN.md`、`schemas/question-set.schema.json` に従い、`question-sets/PAGE_NNNN.json` を作る。
- 問題はすべて新規作成する。公式問題集、参考写真、既存問題の文面をコピー・軽微改変しない。
- `pages/`、`source-prompts/`、既存の完成済み問題セットは変更しない。
- 全問を4択・唯一解とし、形式内訳は `part5-cloze`、`correct-sentence`、`meaning-equivalent`、`context-completion` を各10問にする。
- 完成前に `node scripts/validate-question-set.mjs question-sets/PAGE_NNNN.json` を実行する。
- 検証成功後に `node scripts/mark-complete.mjs PAGE_NNNN`、続けて `node scripts/validate-repository.mjs` を実行する。
- 完成した問題はローカルだけにためず、1ページごとに `question-sets/PAGE_NNNN.json`、`data/progress.json`、`CATALOG.md` を同じcommitでGitHubへpushする。
- 既存の未コミット変更があれば保全し、対象問題セット、進捗台帳、カタログ以外をコミットへ混ぜない。
- 画像、原稿、問題JSONは必ず同じ `PAGE_NNNN` 番号にし、問題JSON内の `page` 情報も一致させる。
- force push、履歴改変、完成済みページの上書きを行わない。
