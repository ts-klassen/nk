# 式の評価値で作るタグ

## 問題

`input` には、基準値、加算する値、倍率、ラベルが入ったオブジェクトが入っています。

関数宣言文と関数式を 1 つずつ使い、次の 3 つの値を作ってください。

- `added`: `input.base` に `input.bonus` を足した数値
- `scaled`: `added` に `input.multiplier` をかけた数値
- `tag`: `input.label`、`":"`、`scaled` をこの順につなげた文字列

最後に、これらを持つオブジェクトを `output` に代入してください。

この課題では、次の点を意識してください。

- `function name(...) { ... }` の形で書く関数宣言文は、ブロックで終わる文です。
- `const name = function(...) { ... };` の形で書く関数式は、変数宣言文の中で値として扱える式です。
- 関数呼び出しや演算子を使った式は、評価すると値になります。

## 入力

`input` には次のプロパティを持つオブジェクトが入っています。

- `base`: 数値
- `bonus`: 数値
- `multiplier`: 数値
- `label`: 文字列

## 出力

`output` に、次のプロパティを持つオブジェクトを代入してください。

- `added`: 数値
- `scaled`: 数値
- `tag`: 文字列

## 例

`input`:

```json
{
  "base": 12,
  "bonus": 5,
  "multiplier": 3,
  "label": "alpha"
}
```

期待される `output`:

```json
{
  "added": 17,
  "scaled": 51,
  "tag": "alpha:51"
}
```
