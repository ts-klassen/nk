# thisを指定してラベルを作る

## 問題

`input` には、ラベルを作るためのオブジェクトが入っています。

- `input.tool.makeLabel` は Arrow Function ではない通常のメソッドです。
- `input.tool.makeLabel(left, right)` は、`this.prefix + left + "-" + right + this.suffix` という文字列を返します。
- `input.card` は、`prefix` と `suffix` を持つオブジェクトです。
- `input.parts` は、2 つの文字列を持つ配列です。

`input.tool.makeLabel` を、`this` が `input.card` になるように呼び出してください。
引数には `input.parts[0]` と `input.parts[1]` をこの順番で渡してください。

戻り値の文字列を `output` に代入してください。

## 入力

`input` には、`tool`、`card`、`parts` を持つオブジェクトが入っています。

## 出力

`output` に、`input.tool.makeLabel` の戻り値の文字列を代入してください。

## 例

`input` の内容:

```js
{
  tool: {
    makeLabel(left, right) {
      return this.prefix + left + "-" + right + this.suffix;
    }
  },
  card: {
    prefix: "#",
    suffix: "!"
  },
  parts: ["A", "7"]
}
```

期待される `output`:

```json
"#A-7!"
```
