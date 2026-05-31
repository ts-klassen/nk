# 借りたフォーマッターを適用する

## 問題

`input` には、次のプロパティを持つオブジェクトが入っています。

- `receiver`: `this` として使いたいオブジェクト
- `formatter`: Arrow Function ではない通常の関数。関数内で `this` を参照し、文字列を返します
- `args`: `formatter` に渡す引数の配列

`formatter` を、`receiver` を `this` として、`args` の要素を引数として呼び出してください。

## 入力

`input` には、`receiver`、`formatter`、`args` を持つオブジェクトが入っています。

## 出力

`output` に、`formatter` の戻り値である文字列を代入してください。

## 例

`input`:

```js
{
  receiver: { name: "Mika", score: 42 },
  formatter: function(prefix, suffix) {
    return prefix + this.name + ":" + this.score + suffix;
  },
  args: ["@", "!"]
}
```

期待される `output`:

```json
"@Mika:42!"
```
