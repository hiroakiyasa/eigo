# 英文法クエスト図鑑 × 4択文法マスター問題

このリポジトリには、オリジナルの英文法図鑑330ページと、各ページの内容を身につけるための4択問題セットを蓄積します。TOEIC Part 5型を中心に、誤りの識別、意味の言い換え、複数文の文脈判断も組み合わせます。

- 図鑑: 330ページ（`PAGE_0001`〜`PAGE_0330`）
- 制作予定: 各ページ40問、合計13,200問
- 作業単位: 1セッションにつき1ページ
- 問題形式: 全問4択・正解1つ（4形式を各10問）

図鑑の一覧は [CATALOG.md](CATALOG.md)、次セッションへ渡す指示は [NEXT_SESSION_PROMPT.md](NEXT_SESSION_PROMPT.md) を参照してください。

## ディレクトリ

| パス | 内容 |
|---|---|
| `pages/` | 図鑑の完成画像。内容判断ではこの画像を正とする |
| `source-prompts/` | 各画像を制作した際の詳細な原稿。画像理解の補助資料 |
| `data/page-manifest.json` | ページ番号、章、タイトル、関連単元などの索引 |
| `data/progress.json` | 問題制作の進捗台帳 |
| `question-sets/` | 完成した40問セットを同じページ番号のJSONで保存 |
| `docs/TOEIC_PART5_SPEC.md` | 問題形式と品質基準 |
| `docs/LEARNING_DESIGN.md` | 文法を定着させる出題構成と復習方針 |
| `schemas/question-set.schema.json` | 問題セットのJSON Schema |
| `scripts/` | 次ページ選択、検証、進捗更新用スクリプト |

`source-prompts/` は画像生成時の設計資料です。生成画像では文字や例文が設計資料と異なる場合があるため、問題制作時は必ず `pages/` の対象画像を実際に表示して確認してください。

## 1ページ分の作業

```bash
node scripts/next-page.mjs
node scripts/validate-question-set.mjs question-sets/PAGE_0001.json
node scripts/mark-complete.mjs PAGE_0001
node scripts/validate-repository.mjs
```

`mark-complete.mjs` は、対象JSONが検証を通った場合だけ進捗を完了へ変更します。

## ページと問題の紐づけ

図鑑と問題は、同じ4桁番号で1対1に対応させます。

```text
pages/PAGE_0121.webp
source-prompts/PAGE_0121.txt
question-sets/PAGE_0121.json
```

問題JSON内にもページ番号、ページID、タイトル、画像パス、原稿パスを持たせます。完成時に `mark-complete.mjs` が `data/progress.json` と `CATALOG.md` を同時更新します。問題は複数ページ分をため込まず、1ページが完成・検証されるたびに、その3ファイルを1つのcommitとしてGitHubへpushします。詳細は [question-sets/README.md](question-sets/README.md) を参照してください。

TOEIC Part 5の基本形式は、IIBCの[公式サンプル問題](https://www.iibc-global.org/toeic/test/lr/about/format/sample05.html)にある「各文の欠けた語句を4つの選択肢から補う」形式に準拠します。掲載問題の文章や選択肢は転載せず、すべて図鑑内容に基づくオリジナル問題とします。学習効果を高めるための構成は [docs/LEARNING_DESIGN.md](docs/LEARNING_DESIGN.md) にまとめています。
