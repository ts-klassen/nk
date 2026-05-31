# インポート文の組み立て

## 問題

ECMAScriptモジュールのインポート文を、文字列として組み立てます。

`input` には、次のプロパティを持つオブジェクトが入っています。

- `modulePath`: インポート元の相対パスを表す文字列
- `defaultName`: デフォルトインポートで使う名前を表す文字列。デフォルトインポートをしない場合は空文字列
- `exportName`: 名前つきエクスポートの名前を表す文字列
- `localName`: 名前つきインポート後に使う名前を表す文字列

名前つきインポート部分は、`exportName` と `localName` が同じなら `as` を使わず、違うなら `exportName as localName` の形にしてください。

`defaultName` が空文字列の場合は、名前つきインポートだけの文にします。

`defaultName` が空文字列ではない場合は、デフォルトインポートと名前つきインポートを同時に行う文にします。

## 入力

`input` には、インポート文を組み立てるためのオブジェクトが入っています。

## 出力

`output` に、組み立てたインポート文を文字列として代入してください。

## 例

`input`:

```json
{
  "modulePath": "./price.js",
  "defaultName": "",
  "exportName": "formatPrice",
  "localName": "format"
}
```

期待される `output`:

```json
"import { formatPrice as format } from \"./price.js\";"
```
