# 店舗別ランク判定

## 問題

`input` には、店舗ごとの設定と、会員ランクを判定するための関数が入っています。

`input.judge` は Arrow Function ではない関数です。この関数は、呼び出し時の `this` から店舗の設定を読み取り、渡された引数を使って判定文字列を返します。

各リクエストについて、`input.stores` から対応する店舗オブジェクトを選び、その店舗オブジェクトを `this` として `input.judge` を呼び出してください。呼び出しには `call`、`apply`、`bind` のいずれかを使ってください。

`input.judge` がどのプロパティを読み、どの形式の文字列を返すかは入力ごとに変わる場合があります。提出コードでは判定処理を直接書かず、必ず `input.judge` の戻り値を使ってください。

すべてのリクエストを順番に処理し、戻り値を並べた配列を `output` に代入してください。

## 入力

`input` には次のプロパティがあります。

- `judge`: Arrow Function ではない判定関数
- `stores`: 店舗オブジェクトの配列
- `requests`: 判定リクエストの配列

各リクエストには、次のプロパティがあります。

- `storeIndex`: `input.stores` のインデックス
- `args`: `input.judge` に渡す 2 つの引数を入れた配列。順番は `[来店回数, 購入ポイント]`

`requests` は空配列の場合があります。

## 出力

`output` に、`input.judge` の戻り値をリクエスト順に並べた文字列の配列を代入してください。

## 例

`input`:

```js
{
  judge: function(visits, purchasePoint) { /* 店舗を this として使う */ },
  stores: [
    { name: "east", visitPoint: 8, weekendBonus: 12, silverLine: 40, goldLine: 70, weekend: true },
    { name: "west", visitPoint: 5, weekendBonus: 0, silverLine: 30, goldLine: 55, weekend: false }
  ],
  requests: [
    { storeIndex: 0, args: [4, 20] },
    { storeIndex: 1, args: [3, 15] },
    { storeIndex: 0, args: [6, 12] }
  ]
}
```

期待される `output`:

```json
["east:silver:64", "west:silver:30", "east:gold:72"]
```
