# 図鑑ページ生成プロンプト JSON

`PAGE_0001.json` から `PAGE_0330.json` までの330件は、図鑑画像を独自生成した際のプロンプトを、ページ単位で扱いやすいJSONにしたものです。

各JSONには次の情報を収録しています。

- ページ番号、タイトル、章、対応単元、ページ種別
- 対応する画像と元のテキストプロンプトへの相対パス
- 元プロンプトのSHA-256
- 生成時のプロンプト全文

市販書籍をOCRした本文データは含みません。`prompt` は対応する `source-prompts/PAGE_NNNN.txt` と完全に一致します。

再生成と整合性確認には次のコマンドを使います。

```sh
node scripts/build-source-json.mjs
node scripts/build-source-json.mjs --check
```
