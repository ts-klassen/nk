# callでthisを指定する

## 問題

`input` には、`item` オブジェクト、`unit` 文字列、`format` 関数が入っています。

`format` は Arrow Function ではない関数で、関数内の `this.name` と `this.count`、引数の `unit` を使って文字列を作ります。

`format` は `item` のメソッドではありません。`call` メソッドを使って、`input.item` を `this` として `input.format` を呼び出してください。

その返り値を `output` に代入してください。

## 入力

`input` には、次のプロパティを持つオブジェクトが入っています。

- `item`: `name` と `count` を持つオブジェクト
- `unit`: 個数の単位を表す文字列
- `format`: `this` と引数から文字列を作る関数

## 出力

`output` には、`input.format` を `input.item` を `this` として呼び出した返り値の文字列を代入してください。

## 例

`input`:

```js
{
  item: { name: "ノート", count: 3 },
  unit: "冊",
  format(unit) {
    return `${this.name}:${this.count}${unit}`;
  }
}
```

期待される `output`:

```json
"ノート:3冊"
```
