# Repository instructions

このリポジトリの英文法図鑑問題制作では、以下を必ず守ること。

## 共通品質ルール

- ユーザーとの会話と解説は日本語で行う。
- `PAGE_0002` は対象外である。作成・更新・削除・完了化を一切行わない。
- 1ページにつき40問を完成させる。複数ページを処理する場合も、各ページを独立した作業単位として、理解・作成・検証・commit・Actions確認まで終えてから次へ進む。
- 対象の `source-json/PAGE_NNNN.json` を全文読む。
- 対象の `pages/PAGE_NNNN.webp` を画像表示ツールで直接確認し、`source-prompts/PAGE_NNNN.txt` と `data/page-manifest.json` の該当項目も読む。
- 画像を最終的な視覚根拠とし、画像にない文法事項をページ固有の内容であるかのように扱わない。
- `question-sets/PAGE_0001.json`、`docs/TOEIC_PART5_SPEC.md`、`docs/LEARNING_DESIGN.md`、`schemas/question-set.schema.json` に従う。
- 問題はすべて新規作成する。公式問題集、参考写真、図鑑の例文、既存問題の文面をコピー・軽微改変しない。
- `pages/`、`source-prompts/`、`source-json/`、既存の完成済み問題セットは変更しない。
- 全問を4択・唯一解とし、形式内訳は `part5-cloze`、`correct-sentence`、`meaning-equivalent`、`context-completion` を各10問にする。
- 正答位置は全体でA・B・C・Dを各10問、各形式内で各文字2〜3問にする。
- 難易度は `basic` 10問、`intermediate` 20問、`advanced` 10問に固定する。
- 画像、原稿、問題JSONは必ず同じ `PAGE_NNNN` 番号にし、問題JSON内の `page` 情報も一致させる。

## 20並列セッション

並列制作では、作業前に必ず次を読む。

- `docs/PARALLEL_QUESTION_BUILD.md`
- `docs/PARALLEL_SESSION_SYSTEM_PROMPT.md`
- `data/parallel-question-assignments.json`

並列制作中の追加ルール:

1. 現在の `SESSION_ID` に割り当てられたページ範囲だけを作成・修正する。
2. 全体の最小未完了ではなく、担当範囲内の最小未完了を選ぶ。
3. 書き込み直前にGitHub `main` を再取得し、完成済みファイルを上書きしない。
4. `data/parallel-question-assignments.json` は固定所有権表であり、進捗を書き込まない。
5. 他セッション担当のページは、検証失敗が見えても勝手に修正しない。
6. main更新競合では最新mainを再取得し、対象ファイルがまだ存在しない場合だけ新規作成を再試行する。
7. 1回の実行で担当範囲内の未完了ページを最後まで処理する。5ページなどのページ数上限で自主的に停止せず、担当範囲が完了するまで1ページごとの作成・検証・保存・Actions確認を繰り返す。

## 検証・commit・進捗同期

- GitHubへ書く前に、`node scripts/validate-question-set.mjs question-sets/PAGE_NNNN.json` と同等の検証を行う。
- 1ページごとに `question-sets/PAGE_NNNN.json` だけを、`feat(questions): add grammar mastery set for page NNNN` で `main` へ保存する。
- 複数ページ分を1コミットにまとめない。
- `data/progress.json` と `CATALOG.md` は `.github/workflows/sync-question-progress.yml` が検証後に自動更新する。制作セッションは手動更新しない。
- Actions失敗が自分の担当ページにある場合だけ、そのページを修正して再検証する。
- 既存の未コミット変更や今回と無関係なファイルをコミットへ混ぜない。
- force push、履歴改変、完成済みページの上書きを行わない。
