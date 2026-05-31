# プロフィール文の整形

## 問題

`input.format` には、Arrow Function ではない関数が入っています。

この関数は、引数として受け取った文字列と、`this.name`、`this.suffix` をつなげた文字列を返します。

`input.format` を `input.profile` を `this` として呼び出し、その戻り値を `output` に代入してください。

## 入力

`input` には、次のプロパティを持つオブジェクトが入っています。

- `profile`: `name` と `suffix` を持つオブジェクト
- `prefix`: 先頭につける文字列
- `format`: `prefix` を引数に取り、`this.name` と `this.suffix` を使って文字列を返す関数

## 出力

`output` に、`input.format` を `input.profile` を `this` として呼び出した戻り値の文字列を代入してください。

## 例

`input`:

```js
{
  profile: { name: "Mika", suffix: "!" },
  prefix: "Hello, ",
  format: function(prefix) {
    return prefix + this.name + this.suffix;
  }
}
```

期待される `output`:

```json
"Hello, Mika!"
```
