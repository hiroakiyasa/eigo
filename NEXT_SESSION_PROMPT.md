# 次セッション用プロンプト

以下のコードブロック全体を、新しいセッションへそのまま貼り付けてください。特定ページを作る場合だけ、先頭の `対象ページ: AUTO` を `対象ページ: PAGE_0121` のように変更します。

```text
対象ページ: AUTO

GitHubリポジトリ https://github.com/hiroakiyasa/eigo にある英文法図鑑を使い、英文法を定着させる4択問題を作成してください。この依頼では、完成した対象ページの問題セットと進捗台帳を同リポジトリへcommit・pushすることを許可します。

このセッションで扱う図鑑は必ず1ページだけです。その1ページを深く理解したうえで、関係するオリジナル問題をちょうど40問完成させてください。複数ページをまとめて処理しないでください。

作業手順:

1. リポジトリがローカルにない場合はcloneし、ある場合はその作業コピーを使ってください。最初にリポジトリ内の `AGENTS.md`、`README.md`、`docs/TOEIC_PART5_SPEC.md`、`docs/LEARNING_DESIGN.md`、`schemas/question-set.schema.json` を全文読んでください。既存変更は保全してください。
2. `git pull --ff-only` で最新状態を取得してください。競合や別作業の未コミット変更がある場合は、壊したり上書きしたりせず安全に作業してください。
3. 対象ページが `AUTO` なら `node scripts/next-page.mjs` が返す最小番号の未完了ページを選んでください。ページ番号が指定されている場合はそのページだけを使い、すでに完了済みなら上書きせず報告してください。
4. 対象の `pages/PAGE_NNNN.webp` を画像表示ツールで実際に高解像度表示し、文字、図解、例文、対比、注意書きを確認してください。あわせて `source-prompts/PAGE_NNNN.txt` と `data/page-manifest.json` の該当ページを読みます。原稿と画像が異なるときは画像を正としてください。
5. ページの中心テーマ、文法要点、視覚的な根拠、学習者が間違えやすい点を整理してから問題を作ってください。画像の例文をそのまま穴埋めにせず、内容理解を別の自然な英文で試してください。
6. 40問はすべて4択・唯一解とし、`part5-cloze`、`correct-sentence`、`meaning-equivalent`、`context-completion` を各10問の固定構成にしてください。Part 5型は「英文1文、空所 `-------` が1つ、(A)〜(D)相当の4択」です。全問を新規作成し、公式問題や既存教材をコピーしないでください。TOEICらしい職場・連絡・出張・施設・サービス等の自然な文脈を中心にしてください。
7. `question-sets/PAGE_NNNN.json` を新規作成してください。スキーマへ厳密に従い、正答は全40問でA/B/C/D各10問、各形式内でもA〜Dを各2〜3問にしてください。自然な和訳、正解理由、出題ポイント、難易度を入れ、4形式を通してページの全重要事項をカバーしてください。似た問題や曖昧な正解を避けてください。
8. `node scripts/validate-question-set.mjs question-sets/PAGE_NNNN.json` を実行し、失敗したら内容を直して再実行してください。機械検証の通過だけで満足せず、40問を1問ずつ読み直して、唯一解・自然さ・ページとの関連を確認してください。
9. 問題セットが完成したら `node scripts/mark-complete.mjs PAGE_NNNN` を実行してください。これにより `data/progress.json` と `CATALOG.md` の該当ページが更新されます。続けて `node scripts/validate-repository.mjs` を実行してください。
10. 対象の `question-sets/PAGE_NNNN.json`、`data/progress.json`、`CATALOG.md` の3ファイルだけを基本としてステージし、Conventional Commitsの `feat(questions): add grammar mastery set for page NNNN` でcommitして、通常のpushをしてください。1ページ分を完成するたびに必ずGitHubへ保存し、複数ページ分をローカルにためないでください。force pushは禁止です。今回と無関係な変更はcommitへ含めないでください。
11. 最後に、処理したページ番号とタイトル、作成したファイル、検証結果、commit ID、push結果、次の未完了ページを日本語で簡潔に報告してください。検証やpushができなかった場合は、成功したと装わず理由を明記してください。
```
