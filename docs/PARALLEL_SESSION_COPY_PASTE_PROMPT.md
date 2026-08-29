# 別チャット貼り付け用・並列セッション開始プロンプト

このファイルの「コピー用プロンプト」を新しいChatGPTセッションへそのまま貼り付ける。
変更するのは、冒頭の `SESSION_ID: S01` の1行だけでよい。たとえばS02を実行するときは `SESSION_ID: S02` に変更する。

## コピー用プロンプト

```text
SESSION_ID: S01

対象GitHubリポジトリ:
https://github.com/hiroakiyasa/eigo

上記リポジトリの英文法図鑑問題制作を、指定された20並列セッションとして、確認質問なしで直ちに開始してください。説明や計画の提示だけで終了せず、GitHub上の実ファイルを読み、問題を作成し、mainへの保存とGitHub Actionsの確認まで実行してください。

最初に、GitHub mainの最新状態から以下を全文読んでください。

1. https://github.com/hiroakiyasa/eigo/blob/main/AGENTS.md
2. https://github.com/hiroakiyasa/eigo/blob/main/docs/PARALLEL_SESSION_ID_ONLY_SYSTEM_PROMPT.md
3. https://github.com/hiroakiyasa/eigo/blob/main/docs/PARALLEL_SESSION_SYSTEM_PROMPT.md
4. https://github.com/hiroakiyasa/eigo/blob/main/docs/PARALLEL_QUESTION_BUILD.md
5. https://github.com/hiroakiyasa/eigo/blob/main/data/parallel-question-assignments.json
6. https://github.com/hiroakiyasa/eigo/blob/main/data/progress.json
7. https://github.com/hiroakiyasa/eigo/blob/main/question-sets/PAGE_0001.json
8. https://github.com/hiroakiyasa/eigo/blob/main/schemas/question-set.schema.json
9. https://github.com/hiroakiyasa/eigo/blob/main/docs/TOEIC_PART5_SPEC.md
10. https://github.com/hiroakiyasa/eigo/blob/main/docs/LEARNING_DESIGN.md
11. https://github.com/hiroakiyasa/eigo/blob/main/.github/workflows/sync-question-progress.yml

`data/parallel-question-assignments.json` の `sessions` から、冒頭の `SESSION_ID` と一致する要素を1件取得し、`startPage`、`endPage`、`pageCount` を自動的に担当範囲として設定してください。開始ページや終了ページをユーザーへ質問してはいけません。割当表の最新値を正としてください。

担当範囲内について、`data/progress.json` と `question-sets/` の両方を確認し、完成済みページは絶対に上書きせず、担当範囲内の最小未完了ページから開始してください。

この実行に5ページなどの上限を設けてはいけません。担当範囲内の未完了ページが0になるまで、1回の実行で最後まで継続してください。5ページ、10ページ、途中バッチ、進捗報告、回答量の多さを理由に停止せず、追加の「続けてください」を待たないでください。

各ページでは、対応する以下の資料をすべて確認してください。

- `source-json/PAGE_NNNN.json` を全文読む
- `source-prompts/PAGE_NNNN.txt` を全文読む
- `pages/PAGE_NNNN.webp` を画像表示して直接確認する
- `data/page-manifest.json` の該当ページを確認する
- `question-sets/PAGE_0001.json`
- `schemas/question-set.schema.json`
- `docs/TOEIC_PART5_SPEC.md`
- `docs/LEARNING_DESIGN.md`

タイトル、中心テーマ、説明、例、対比、注意点、ミニ問題、図や矢印の意味を深く理解してから、既存例文を転用しないオリジナル40問を作成してください。

1ページ40問の固定条件:

- `part5-cloze`: 10問
- `correct-sentence`: 10問
- `meaning-equivalent`: 10問
- `context-completion`: 10問
- 正答位置は全40問でA/B/C/Dを各10問
- 各形式内でA/B/C/Dを各2〜3問
- 難易度はbasic 10問、intermediate 20問、advanced 10問
- TOEICらしい職場、連絡、会議、出張、施設、配送、顧客対応、サービス等の自然な英文
- 全問が唯一解
- 自然な日本語訳、具体的な正解理由、focusを記載
- 元の図鑑例文をそのまま穴埋め化しない
- 問題IDはQ01〜Q40の連番
- スキーマ外のキーを追加しない

1ページ完成ごとに、書き込み直前のmainで同名ファイルが存在しないことを再確認し、次の1ファイルだけを保存してください。

- `question-sets/PAGE_NNNN.json`
- コミット名: `feat(questions): add grammar mastery set for page NNNN`

複数ページを1コミットへまとめてはいけません。保存後は `.github/workflows/sync-question-progress.yml` の検証、mark-complete、`data/progress.json` と `CATALOG.md` の自動同期を確認してください。自分の担当ページが原因で失敗した場合は、そのページだけを修正し、成功を確認してから次へ進んでください。

禁止事項:

- `PAGE_0002` の作成、更新、削除、完了化
- 担当範囲外ページの作成、修正、削除
- 完成済み問題セットの上書き
- `data/progress.json` と `CATALOG.md` の手動更新
- 複数ページを1コミットへまとめること
- force push、履歴改変
- 今回と無関係なファイルの変更
- 途中件数を理由に作業を終了すること

作業中は短い進捗更新を行って構いませんが、それを最終回答として停止しないでください。外部サービス障害、GitHub権限エラー、利用可能な手段では解消不能な競合など、技術的に続行できない明確な障害がある場合だけ途中終了できます。

担当範囲の完了後に、次を最終報告してください。

- SESSION_ID
- 自動取得した担当範囲
- 今回完成した全ページ
- 各ページのコミットSHA
- GitHub Actionsの結果
- 担当範囲内の残りページ数
- 正常完了時は「担当完了」

今すぐ、冒頭のSESSION_IDの担当範囲を取得して実作業を開始してください。
```

## 使用例

S01を開始する場合は、上のプロンプトを変更せず、そのまま貼り付ける。

S12を開始する場合は、先頭だけを次のように変更して貼り付ける。

```text
SESSION_ID: S12
```

それ以外の本文は変更しない。