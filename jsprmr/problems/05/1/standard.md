# 型チェックカード

## 問題

`input` には、次の 4 つのプロパティを持つオブジェクトが入っています。

- `title`
- `count`
- `tags`
- `memo`

それぞれの値に `typeof` 演算子を使い、結果を配列にしてください。

配列の要素は、次の順番にしてください。

1. `input.title` の `typeof` の結果
2. `input.count` の `typeof` の結果
3. `input.tags` の `typeof` の結果
4. `input.memo` の `typeof` の結果

## 入力

`input` には、`title`、`count`、`tags`、`memo` を持つオブジェクトが入っています。

## 出力

`output` に、`typeof` の結果を並べた配列を代入してください。

`output` の型は配列です。配列の各要素は文字列です。

## 例

`input`:

```json
{
  "title": "JavaScript",
  "count": 3,
  "tags": ["basic", "type"],
  "memo": null
}
```

期待される `output`:

```json
["string", "number", "object", "object"]
```
