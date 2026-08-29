# 英文法図鑑問題・20セッション並列制作ガイド

## 目的

`hiroakiyasa/eigo` の未完成部分を20個の独立セッションへ固定割当し、同じページの重複作成と `progress.json` の競合を避けながら進める。

分割時点のGitHub `main` ではPAGE_0053まで完成している。したがって、固定割当はPAGE_0054〜PAGE_0330の277ページである。実行時は必ず最新の `main` を再確認し、すでに完成したページは上書きせずスキップする。

## リポジトリ内の引き継ぎ資料

- `AGENTS.md`: リポジトリ全体の禁止事項と基本ルール
- `docs/PARALLEL_SESSION_SYSTEM_PROMPT.md`: 全セッション共通の完全な作業指示
- `data/parallel-question-assignments.json`: セッションID、担当範囲、推奨5ページバッチの機械可読な固定表
- `docs/PARALLEL_SESSION_PROMPTS.md`: 20個のコピー用開始プロンプト
- `.github/workflows/sync-question-progress.yml`: 並列コミット中も安全に進捗を同期する直列・再試行対応ワークフロー

`data/parallel-question-assignments.json` は担当所有権の固定表であり、進捗記録には使わない。進捗の正は `question-sets/`、`data/progress.json`、GitHub Actionsである。

## 担当割当

277ページをできるだけ均等に分割した。S01〜S17は14ページ、S18〜S20は13ページで、重複も欠番もない。

| Session | 担当範囲 | ページ数 | 推奨バッチ |
|---|---:|---:|---|
| S01 | PAGE_0054〜PAGE_0067 | 14 | PAGE_0054〜PAGE_0058 / PAGE_0059〜PAGE_0063 / PAGE_0064〜PAGE_0067 |
| S02 | PAGE_0068〜PAGE_0081 | 14 | PAGE_0068〜PAGE_0072 / PAGE_0073〜PAGE_0077 / PAGE_0078〜PAGE_0081 |
| S03 | PAGE_0082〜PAGE_0095 | 14 | PAGE_0082〜PAGE_0086 / PAGE_0087〜PAGE_0091 / PAGE_0092〜PAGE_0095 |
| S04 | PAGE_0096〜PAGE_0109 | 14 | PAGE_0096〜PAGE_0100 / PAGE_0101〜PAGE_0105 / PAGE_0106〜PAGE_0109 |
| S05 | PAGE_0110〜PAGE_0123 | 14 | PAGE_0110〜PAGE_0114 / PAGE_0115〜PAGE_0119 / PAGE_0120〜PAGE_0123 |
| S06 | PAGE_0124〜PAGE_0137 | 14 | PAGE_0124〜PAGE_0128 / PAGE_0129〜PAGE_0133 / PAGE_0134〜PAGE_0137 |
| S07 | PAGE_0138〜PAGE_0151 | 14 | PAGE_0138〜PAGE_0142 / PAGE_0143〜PAGE_0147 / PAGE_0148〜PAGE_0151 |
| S08 | PAGE_0152〜PAGE_0165 | 14 | PAGE_0152〜PAGE_0156 / PAGE_0157〜PAGE_0161 / PAGE_0162〜PAGE_0165 |
| S09 | PAGE_0166〜PAGE_0179 | 14 | PAGE_0166〜PAGE_0170 / PAGE_0171〜PAGE_0175 / PAGE_0176〜PAGE_0179 |
| S10 | PAGE_0180〜PAGE_0193 | 14 | PAGE_0180〜PAGE_0184 / PAGE_0185〜PAGE_0189 / PAGE_0190〜PAGE_0193 |
| S11 | PAGE_0194〜PAGE_0207 | 14 | PAGE_0194〜PAGE_0198 / PAGE_0199〜PAGE_0203 / PAGE_0204〜PAGE_0207 |
| S12 | PAGE_0208〜PAGE_0221 | 14 | PAGE_0208〜PAGE_0212 / PAGE_0213〜PAGE_0217 / PAGE_0218〜PAGE_0221 |
| S13 | PAGE_0222〜PAGE_0235 | 14 | PAGE_0222〜PAGE_0226 / PAGE_0227〜PAGE_0231 / PAGE_0232〜PAGE_0235 |
| S14 | PAGE_0236〜PAGE_0249 | 14 | PAGE_0236〜PAGE_0240 / PAGE_0241〜PAGE_0245 / PAGE_0246〜PAGE_0249 |
| S15 | PAGE_0250〜PAGE_0263 | 14 | PAGE_0250〜PAGE_0254 / PAGE_0255〜PAGE_0259 / PAGE_0260〜PAGE_0263 |
| S16 | PAGE_0264〜PAGE_0277 | 14 | PAGE_0264〜PAGE_0268 / PAGE_0269〜PAGE_0273 / PAGE_0274〜PAGE_0277 |
| S17 | PAGE_0278〜PAGE_0291 | 14 | PAGE_0278〜PAGE_0282 / PAGE_0283〜PAGE_0287 / PAGE_0288〜PAGE_0291 |
| S18 | PAGE_0292〜PAGE_0304 | 13 | PAGE_0292〜PAGE_0296 / PAGE_0297〜PAGE_0301 / PAGE_0302〜PAGE_0304 |
| S19 | PAGE_0305〜PAGE_0317 | 13 | PAGE_0305〜PAGE_0309 / PAGE_0310〜PAGE_0314 / PAGE_0315〜PAGE_0317 |
| S20 | PAGE_0318〜PAGE_0330 | 13 | PAGE_0318〜PAGE_0322 / PAGE_0323〜PAGE_0327 / PAGE_0328〜PAGE_0330 |

## 実行方法

1. 現在のチャットをS01として使うか、20個の新規チャットを開く。
2. 各チャットへ `docs/PARALLEL_SESSION_PROMPTS.md` の対応する開始プロンプトを1つだけコピーする。
3. 各実行は品質を守るため最大5ページとする。20セッションを同時に動かすと、1波で最大100ページを処理できる。
4. 1波が終わったチャットへ、同ファイル末尾の「共通・継続プロンプト」を送る。
5. 3波目で各担当範囲が完了する。最後のバッチは3〜4ページになる。
6. 各セッションは、自分の担当範囲内だけで最小未完了ページを選ぶ。全体の最小未完了ページを選ばない。

## 並列時の重要ルール

- `PAGE_0002` は全セッションで対象外。
- 1ページにつき1ファイル・1コミット。
- 書き込む直前にファイル有無を再確認し、存在すれば上書きしない。
- `data/progress.json` と `CATALOG.md` は人や制作セッションが手動編集しない。
- `data/parallel-question-assignments.json` に完了印を書かない。
- main更新競合が起きたら、最新mainを再取得し、対象ファイルが未作成の場合だけ再試行する。
- force pushは禁止。
- 他セッション担当の検証失敗を勝手に修正しない。割当表から担当セッションを特定して報告する。

## GitHub Actionsの並列安全化

`sync-question-progress.yml` は同名グループで直列実行される。各実行は最新の `origin/main` から進捗を再計算し、他セッションのコミットでmainが進んだ場合は、force pushせず再取得・再検証・再コミットする。

そのため、複数のActionsが `queued` になるのは正常である。あるActionsが複数ページをまとめてcompleteへ同期した場合、後続Actionsは「No progress changes」で正常終了できる。

## 完了条件

全体完成時は次の状態になる。

- `PAGE_0001` と `PAGE_0003`〜`PAGE_0330` がcomplete
- `PAGE_0002` だけがpending
- `completedPages` が329
- `question-sets/PAGE_0002.json` は存在しない
- 最終の `Sync question progress` が成功
- 全セッションが担当完了を報告
