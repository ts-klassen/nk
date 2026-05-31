# 採点関数とthis

## 問題

`input` には、候補を採点するためのオブジェクトが入っています。

`input.candidates` は候補オブジェクトの配列です。各候補オブジェクトには `name` プロパティと `args` プロパティがあります。

`input.score` は Arrow Function ではない通常の関数です。この関数は、呼び出されたときの `this` と、渡された引数を使って点数を返します。

各候補について、`input.score` をその候補オブジェクトを `this` として呼び出してください。引数には、その候補の `args` 配列の中身を渡してください。

点数が `input.line` 以上になった候補の `name` を、元の順番のまま配列にしてください。

## 入力

`input` には、次の形のオブジェクトが入っています。

- `line`: 合格ラインを表す数値
- `score`: 候補を `this` として使う通常の関数
- `candidates`: 候補オブジェクトの配列

候補オブジェクトには、少なくとも次のプロパティがあります。

- `name`: 候補名を表す文字列
- `args`: `score` に渡す引数の配列

`candidates` は空配列の場合があります。

## 出力

`output` に、点数が `input.line` 以上になった候補名の配列を代入してください。

配列の要素は文字列にしてください。

## 例

`input`:

```js
{
  line: 80,
  score: function(add, penalty) {
    return this.base + this.bonus + add - penalty;
  },
  candidates: [
    { name: "Aoba", base: 70, bonus: 5, args: [6, 1] },
    { name: "Mika", base: 65, bonus: 8, args: [4, 0] },
    { name: "Ren", base: 82, bonus: 0, args: [0, 3] },
    { name: "Sora", base: 75, bonus: 2, args: [7, 2] }
  ]
}
```

期待される `output`:

```json
["Aoba", "Sora"]
```
