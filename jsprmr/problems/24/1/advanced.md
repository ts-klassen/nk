# 採用する番号ストリーム

## 問題

`input.sources` には、数値を順番に取り出せる Iterable が複数入っています。

それぞれの Iterable を先頭から順に調べ、次の条件をすべて満たす数値だけを採用してください。

- `input.blocked` に含まれていない
- すでに採用した数値ではない

採用した数値の個数が `input.limit` 個になったら、まだ調べていない Iterable や値が残っていても処理を終えてください。

`input.sources` の中には、配列、`Set`、Generator オブジェクトなどが入ることがあります。同じ Iterator が複数回入っている場合も、作り直さず、その Iterator の残っている値をそのまま調べてください。

## 入力

`input` には次の形のオブジェクトが入っています。

- `sources`: 数値を取り出せる Iterable の配列
- `blocked`: 採用しない数値を持つ `Set`
- `limit`: 採用する数値の最大個数を表す数値

## 出力

採用した数値を、採用した順番の配列として `output` に代入してください。

`output` は数値の配列にしてください。

## 例

`input`:

```js
{
  sources: [[3, 1, 2], new Set([2, 4, 5]), [6]],
  blocked: new Set([1, 5]),
  limit: 4
}
```

期待される `output`:

```json
[3, 2, 4, 6]
```
