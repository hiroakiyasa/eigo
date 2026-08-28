# 問題セット保存ルール

## 1ページにつき1ファイル

図鑑 `pages/PAGE_NNNN.webp` の問題40問は、必ず `question-sets/PAGE_NNNN.json` に保存します。別ページの問題を同じファイルへ入れません。

問題JSONの `page` オブジェクトは次の5項目を持ち、対象ページと完全に一致させます。

- `number`: 1〜330のページ番号
- `id`: `grammar-master-NNNN`
- `title`: `data/page-manifest.json` と同じタイトル
- `image`: `pages/PAGE_NNNN.webp`
- `sourcePrompt`: `source-prompts/PAGE_NNNN.txt`

## 完成時の保存単位

1. `question-sets/PAGE_NNNN.json` を検証する。
2. `mark-complete.mjs` で `data/progress.json` と `CATALOG.md` を更新する。
3. 上記3ファイルを同じcommitへ入れる。
4. そのページの作業セッション内でGitHubへpushする。

未完成JSON、検証に失敗したJSON、複数ページを混ぜたcommitはpushしません。完成済みセットに誤りが見つかった場合は、元のcommitを改変せず、`fix(questions): correct page NNNN questions` という新しいcommitで修正します。

