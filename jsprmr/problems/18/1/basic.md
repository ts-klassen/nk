# 関数の中だけの合計

## 問題

関数の中で宣言した変数は、その関数の内側だけで参照できます。

`input.value` と `input.bonus` を受け取る関数 `addBonus` を定義してください。

`addBonus` の中では、合計を表す `total` という変数を宣言し、`value + bonus` の結果を代入してください。

`addBonus(input.value, input.bonus)` の返り値を `output` に代入してください。

## 入力

`input` には、数値プロパティ `value` と `bonus` を持つオブジェクトが入っています。

## 出力

`output` には、`input.value + input.bonus` の結果である数値を代入してください。

## 例

`input`:

```json
{ "value": 12, "bonus": 5 }
```

期待される `output`:

```json
17
```
