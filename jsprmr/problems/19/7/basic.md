# メソッドのthisで自己紹介

## 問題

`input` には、名前と年齢を持つオブジェクトが入っています。

`profile` というオブジェクトを作り、次のプロパティを持たせてください。

- `name`: `input.name` の値
- `age`: `input.age` の値
- `introduce`: 自己紹介文を返すメソッド

`introduce` メソッドは Arrow Function ではなく、メソッドの短縮記法または `function` キーワードで定義してください。

`introduce` メソッドの中では `this.name` と `this.age` を使い、次の形の文字列を返してください。

```text
名前は年齢歳です
```

最後に `profile.introduce()` を呼び出し、その戻り値を `output` に代入してください。

## 入力

`input` には、次の形のオブジェクトが入っています。

```js
{
  name: "名前",
  age: 年齢
}
```

`name` は文字列、`age` は数値です。

## 出力

`output` に、`introduce` メソッドが返す文字列を代入してください。

## 例

`input`:

```json
{
  "name": "アオイ",
  "age": 12
}
```

期待される `output`:

```json
"アオイは12歳です"
```
