# 別の会員としてメッセージを作る

## 問題

`input` には、`template`、`target`、`prefix` を持つオブジェクトが入っています。

`input.template.format` は Arrow Function ではない通常の関数です。この関数は、呼び出されたときの `this.name` と `this.rank`、そして引数の `prefix` を使って文字列を返します。

`input.target` は、`name` と `rank` を持つ別のオブジェクトです。

`input.template.format` を、`input.target` を `this` として呼び出してください。その戻り値の文字列を `output` に代入してください。

## 入力

`input` には、次の形のオブジェクトが入っています。

- `template`: `format` メソッドを持つオブジェクト
- `target`: `name` と `rank` を持つオブジェクト
- `prefix`: `format` に渡す文字列

`format` は Arrow Function ではない通常の関数です。

## 出力

`output` に、`input.target` を `this` として `input.template.format` を呼び出した戻り値の文字列を代入してください。

## 例

`input`:

```js
{
  template: {
    name: "Original",
    rank: "silver",
    format: function(prefix) {
      return prefix + ": " + this.name + " (" + this.rank + ")";
    }
  },
  target: {
    name: "Aki",
    rank: "gold"
  },
  prefix: "member"
}
```

期待される `output`:

```json
"member: Aki (gold)"
```
