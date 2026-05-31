# 貸し出された計算関数

## 問題

`input` には、計算用の関数 `calc` と、計算対象の配列 `records` が入っています。

`input.calc` は Arrow Function ではない通常の関数です。この関数は、呼び出されたときの `this` を使って計算します。

`input.records` の各要素には、次のプロパティがあります。

- `name`: 結果につける名前を表す文字列
- `context`: `calc` を呼び出すときに `this` として使うオブジェクト
- `args`: `calc` に渡す引数を順番に入れた配列

`records` を先頭から順に処理し、各要素について `input.calc` を `context` を `this` として呼び出してください。引数には `args` の中身を使います。

計算式の中身はテストケースごとに違います。提出コードでは、`context` のプロパティを直接決め打ちで計算するのではなく、必ず `input.calc` が返した値を使ってください。

## 入力

`input` には、次の形のオブジェクトが入っています。

```js
{
  calc: function(...) { ... },
  records: [
    {
      name: "名前",
      context: { /* calc の this になるオブジェクト */ },
      args: [/* calc に渡す引数 */]
    }
  ]
}
```

## 出力

`output` に配列を代入してください。

配列の各要素は、次の形のオブジェクトにしてください。

```js
{
  name: records の要素の name,
  result: input.calc を正しい this と引数で呼び出した戻り値
}
```

`records` が空の配列の場合、`output` には空の配列を代入してください。

## 例

`input`:

```js
{
  calc: function(count, extra) {
    return this.base + this.unit * count + extra;
  },
  records: [
    {
      name: "alpha",
      context: { base: 100, unit: 25 },
      args: [3, 10]
    },
    {
      name: "beta",
      context: { base: 40, unit: 8 },
      args: [5, -5]
    }
  ]
}
```

期待される `output`:

```json
[
  { "name": "alpha", "result": 185 },
  { "name": "beta", "result": 75 }
]
```
