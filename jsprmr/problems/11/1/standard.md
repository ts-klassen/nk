# 合格点を満たす点数があるか

## 問題

`input.scores` に点数の配列が入っています。

`input.scores` の中に、`input.passingScore` 以上の点数が 1 つでもあるかを判定してください。

判定結果を真偽値として `output` に代入してください。

## 入力

`input` には、次のプロパティを持つオブジェクトが入っています。

- `scores`: 数値の配列
- `passingScore`: 合格点を表す数値

## 出力

`output` には、`input.scores` の中に `input.passingScore` 以上の数値が 1 つでもあれば `true`、なければ `false` を代入してください。

`input.scores` が空配列の場合は、`false` を代入してください。

## 例

`input`:

```json
{
  "scores": [40, 70, 59],
  "passingScore": 60
}
```

期待される `output`:

```json
true
```
