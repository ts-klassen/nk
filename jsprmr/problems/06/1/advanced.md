# 出荷ステータスの判定

## 問題

倉庫の在庫数と注文数から、注文の出荷ステータスを判定します。

`input.count` が `null` または `undefined` の場合だけ、`input.defaultCount` を注文数として使ってください。`input.count` が `0` の場合は、`0` をそのまま注文数として扱います。

現在すぐ出荷できる数は、`input.stock - input.reserved` です。

判定した注文数に応じて、次のいずれかの文字列を `output` に代入してください。

- 注文数が `0` 以下なら `"invalid"`
- 注文数が、現在すぐ出荷できる数以下なら `"ship"`
- すぐ出荷はできないが、`input.allowRestock` が `true` で、注文数が `現在すぐ出荷できる数 + input.restock` 以下なら `"restock"`
- それ以外なら `"reject"`

## 入力

`input` には、次のプロパティを持つオブジェクトが入っています。

- `stock`: 現在の在庫数を表す数値
- `reserved`: すでに取り置きされている数を表す数値
- `count`: 注文数を表す数値、`null`、または未指定
- `defaultCount`: `count` が `null` または `undefined` のときだけ使う注文数を表す数値
- `allowRestock`: 補充予定分まで受け付けるかを表す真偽値
- `restock`: 補充予定数を表す数値

## 出力

`output` に、判定結果を表す文字列を代入してください。

## 例

`input`:

```json
{
  "stock": 10,
  "reserved": 6,
  "count": null,
  "defaultCount": 3,
  "allowRestock": false,
  "restock": 5
}
```

期待される `output`:

```json
"ship"
```
