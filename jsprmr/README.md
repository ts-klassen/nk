# jsprmr

JSPrimer 課題用の簡易採点システムです。

採点はブラウザ側で行い、サーバは静的ファイル配信、問題文とテストケースの提供、提出コードの保存だけを行います。

## 起動

```sh
node src/server.js --submissions-dir submissions
```

保存先ディレクトリは必須です。必要ならポートを指定できます。

```sh
node src/server.js --submissions-dir submissions --port 3000
```

起動後、ブラウザで `http://localhost:3000/` を開きます。

## 問題ファイル

問題は次の形式で配置します。

```text
problems/{unit_number}/{set_index}/{basic,standard,advanced}.md
problems/{unit_number}/{set_index}/{basic,standard,advanced}.json
```

例:

```text
problems/03/1/basic.md
problems/03/1/basic.json
```

## 提出コード

テスト実行時のコードは、起動時に指定したディレクトリへ保存されます。

```text
submissions/03/1/basic-1710000000.js
```
