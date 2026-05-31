# 指定したthisで会員ラベルを作る

## 問題

`input` には、通常の関数 `makeLabel`、`this` として使うオブジェクト `member`、関数に渡す文字列 `prefix` と `suffix` が入っています。

`makeLabel` は `this.name` や `this.rank` を使って文字列を作る関数です。具体的な文字列の形は、`makeLabel` の中で決まります。

`makeLabel` を、`member` を `this` にして呼び出してください。関数には `prefix` と `suffix` をこの順番で渡し、戻り値を `output` に代入してください。

通常の関数なので、`input.makeLabel(input.prefix, input.suffix)` と呼び出すだけでは `this` は `member` になりません。`call`、`apply`、または `bind` を使って呼び出してください。

## 入力

`input` には次の値が入っています。

- `input.member`: `name` と `rank` を持つオブジェクト
- `input.prefix`: `makeLabel` に渡す文字列
- `input.suffix`: `makeLabel` に渡す文字列
- `input.makeLabel`: `prefix` と `suffix` を受け取り、`this` を使って文字列を返す通常の関数

## 出力

`output` に、`input.member` を `this` にして `input.makeLabel` を呼び出した戻り値を代入してください。

`output` に代入する値は文字列です。

## 例

`input`:

```js
{
  member: { name: "Mina", rank: "gold" },
  prefix: "member:",
  suffix: "!",
  makeLabel: function(prefix, suffix) {
    return prefix + this.name + "(" + this.rank + ")" + suffix;
  }
}
```

期待される `output`:

```json
"member:Mina(gold)!"
```
