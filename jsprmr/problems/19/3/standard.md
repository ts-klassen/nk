# thisを指定して名前を整える

## 問題

`input` には、次のプロパティを持つオブジェクトが入っています。

- `profile`: `familyName` と `givenName` を持つオブジェクト
- `separator`: 姓と名の間に入れる文字列
- `formatName`: Arrow Function ではない通常の関数

`formatName` は、`this.familyName`、引数で受け取った区切り文字、`this.givenName` をこの順につなげた文字列を返します。

`formatName` を、`this` が `input.profile` になるように呼び出してください。引数には `input.separator` を渡してください。

返ってきた文字列を `output` に代入してください。

## 入力

`input` には、`profile`、`separator`、`formatName` を持つオブジェクトが入っています。

`formatName` は通常の関数です。

## 出力

`output` に、`formatName` を指定どおりに呼び出した結果の文字列を代入してください。

## 例

`input`:

```js
{
  profile: { familyName: "山田", givenName: "太郎" },
  separator: " ",
  formatName: function(separator) {
    return this.familyName + separator + this.givenName;
  }
}
```

期待される `output`:

```json
"山田 太郎"
```
