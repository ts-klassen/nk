# 会員カードのメソッド

## 問題

`input` には会員情報のオブジェクトが入っています。

`member` というオブジェクトを作り、次のプロパティとメソッドを持たせてください。

- `name`: `input.name`
- `rank`: `input.rank`
- `message`: 引数なしのメソッド

`message` メソッドは、メソッドの中で `this.name` と `this.rank` を使い、次の形の文字列を返してください。

```text
名前さんはランク会員です
```

ここで、`名前` には `this.name` の値、`ランク` には `this.rank` の値を入れます。

最後に `member.message()` を呼び出し、その返り値を `output` に代入してください。

## 入力

`input` には、`name` と `rank` を持つオブジェクトが入っています。

どちらの値も文字列です。

## 出力

`output` に、`member.message()` の返り値である文字列を代入してください。

## 例

`input`:

```json
{
  "name": "山田",
  "rank": "ゴールド"
}
```

期待される `output`:

```json
"山田さんはゴールド会員です"
```
