# メソッドのthisで会員ラベルを作る

## 問題

`input` には、会員の情報を表すオブジェクトが入っています。

このオブジェクトには、文字列の `name` プロパティと、文字列の `rank` プロパティがあります。

`input` に `label` というメソッドを追加してください。`label` メソッドは Arrow Function ではない関数として定義し、メソッド内で `this.name` と `this.rank` を使って、次の形の文字列を返します。

```text
nameの値 + さんは + rankの値 + ランクです
```

最後に `input.label()` を呼び出し、その戻り値を `output` に代入してください。

## 入力

`input` には、`name` と `rank` を持つオブジェクトが入っています。

## 出力

`output` に、`label` メソッドが返した文字列を代入してください。

`output` の型は文字列です。

## 例

`input`:

```json
{
  "name": "ミナ",
  "rank": "A"
}
```

期待される `output`:

```json
"ミナさんはAランクです"
```
