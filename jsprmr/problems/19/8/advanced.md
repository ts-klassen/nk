# メソッドを保って成績ラベルを作る

## 問題

`input` には、`formatter` と `records` を持つオブジェクトが入っています。

`formatter` は次のようなプロパティを持つオブジェクトです。

- `prefix`: ラベルの先頭につける文字列
- `bonus`: 点数に足す数値
- `passLine`: 合格ラインの数値
- `makeLabel`: 1 件の成績オブジェクトを受け取り、ラベル文字列を返すメソッド

`makeLabel` は Arrow Function ではないメソッドで、内部で `this.prefix`、`this.bonus`、`this.passLine` を使います。

`records` は `{ name: 文字列, score: 数値 }` という形のオブジェクトの配列です。

`records` の各要素に `formatter.makeLabel` を適用した配列を作り、`output` に代入してください。

ただし、`makeLabel` を呼び出すときの `this` が `formatter` になるようにしてください。メソッドをそのまま `map` のコールバックに渡すと、`this` が `formatter` ではなくなることに注意してください。

## 入力

`input` には、`formatter` と `records` を持つオブジェクトが入っています。

## 出力

`output` に、`formatter.makeLabel` で作った文字列の配列を代入してください。

## 例

`input`:

```js
{
  formatter: {
    prefix: "A",
    bonus: 3,
    passLine: 10,
    makeLabel(record) {
      const total = record.score + this.bonus;
      let status = "NG";
      if (total >= this.passLine) {
        status = "OK";
      }
      return this.prefix + ":" + record.name + ":" + total + ":" + status;
    }
  },
  records: [
    { name: "mika", score: 4 },
    { name: "ren", score: 8 },
    { name: "ao", score: 7 }
  ]
}
```

期待される `output`:

```json
["A:mika:7:NG", "A:ren:11:OK", "A:ao:10:OK"]
```
