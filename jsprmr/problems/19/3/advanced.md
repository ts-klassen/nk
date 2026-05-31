# スタンプカードの対象明細

## 問題

購入履歴から、スタンプカードの対象になる購入だけを明細ラベルにしてください。

`input.card` には、Arrow Function ではないメソッドが用意されています。これらのメソッドは内部で `this` を使うため、呼び出すときに `this` が `input.card` になるようにしてください。

- `input.card.score(purchase)` は、購入 `purchase` の点数を数値で返します。
- `input.card.isRewardTarget(purchase)` は、購入 `purchase` がスタンプ対象なら `true`、そうでなければ `false` を返します。
- `input.card.label(purchase, index)` は、購入 `purchase` と元の購入履歴でのインデックス `index` から明細ラベル文字列を返します。

`input.purchases` を先頭から順に調べ、`input.card.isRewardTarget(purchase)` が `true` になる購入だけを残してください。残した購入ごとに `input.card.label(purchase, index)` を呼び出し、その返り値を配列に入れてください。

`index` には、対象だけを数え直した位置ではなく、`input.purchases` での元のインデックスを渡します。

## 入力

`input` には、次の形のオブジェクトが入っています。

- `input.purchases`: 購入オブジェクトの配列
- `input.card`: スタンプ判定用のオブジェクト

購入オブジェクトには、`code`、`price`、`count` などのプロパティがあります。

## 出力

`output` に、対象購入の明細ラベル文字列を並べた配列を代入してください。

対象になる購入が 1 つもない場合は、空配列 `[]` を代入してください。

## 例

`input.purchases`:

```json
[
  { "code": "A-100", "price": 120, "count": 2 },
  { "code": "S-050", "price": 80, "count": 3 },
  { "code": "B-020", "price": 300, "count": 1 }
]
```

期待される `output`:

```json
["GOLD#2:S-050=260", "GOLD#3:B-020=300"]
```
