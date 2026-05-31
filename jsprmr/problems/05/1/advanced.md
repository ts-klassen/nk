# カード情報の型まとめ

## 問題

`input` には、カード情報を表すオブジェクトが入っています。

カード情報には、次のプロパティがあります。

- `card`: 商品カード本体のオブジェクト
- `labels`: ラベル文字列の配列
- `samples`: サンプル値を持つオブジェクトの配列

`card` オブジェクトには、`"display-name"` や `"main-code"` のように、ドット記法では参照できないプロパティ名も含まれます。

次の形のオブジェクトを作り、`output` に代入してください。

- `title`: `card` の `"display-name"` プロパティの値
- `titleLength`: `title` の文字数
- `selected`: 次の 4 つの値をこの順番で入れた配列
  - `card` の `"main-code"` プロパティの値
  - `labels` の 2 番目の要素
  - `samples` の 1 番目の要素の `value`
  - `samples` の 2 番目の要素の `value`
- `typeNames`: 次の 6 つの値を `typeof` で調べた文字列をこの順番で入れた配列
  - `card` の `"display-name"` プロパティの値
  - `card.stock`
  - `card.active`
  - `card.note`
  - `labels`
  - `samples` の 1 番目の要素
- `sampleValueTypes`: `samples` の 1 番目と 2 番目の `value` を `typeof` で調べた文字列をこの順番で入れた配列

## 入力

`input` にはオブジェクトが入っています。

## 出力

`output` にオブジェクトを代入してください。

## 例

`input`:

```json
{
  "card": {
    "display-name": "Blue Pen",
    "main-code": "P-100",
    "stock": 12,
    "active": true,
    "note": null
  },
  "labels": ["office", "sale", "blue"],
  "samples": [
    { "label": "small", "value": "S" },
    { "label": "count", "value": 3 }
  ]
}
```

期待される `output`:

```json
{
  "title": "Blue Pen",
  "titleLength": 8,
  "selected": ["P-100", "sale", "S", 3],
  "typeNames": ["string", "number", "boolean", "object", "object", "object"],
  "sampleValueTypes": ["string", "number"]
}
```
