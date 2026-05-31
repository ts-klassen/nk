# 数量チェックとエラー種別

## 問題

注文データの数量を確認し、正常に計算できる場合とエラーになる場合を `try...catch` 文で分けてください。

`try` ブロックでは、次の順番で `input.quantity` を確認してください。

1. `input.quantity` が数値でない場合は、`new TypeError("quantity must be a number")` を `throw` する
2. `input.quantity` が `1` 未満の場合は、`new Error("quantity must be at least 1")` を `throw` する
3. どちらにも当てはまらない場合は、`input.price * input.quantity` を計算する

正常に計算できた場合は、`{ ok: true, total: 合計金額 }` を `output` に代入してください。

例外を `catch` した場合は、捕まえたエラーオブジェクトの `name` と `message` を使って、`{ ok: false, name: エラー名, message: エラーメッセージ }` を `output` に代入してください。

## 入力

`input` には、次のプロパティを持つオブジェクトが入っています。

- `price`: 商品の単価を表す数値
- `quantity`: 注文数量。数値以外の値や `1` 未満の数値の場合があります

## 出力

`output` にはオブジェクトを代入してください。

正常に計算できた場合:

```json
{
  "ok": true,
  "total": 500
}
```

例外を `catch` した場合:

```json
{
  "ok": false,
  "name": "TypeError",
  "message": "quantity must be a number"
}
```

## 例

`input`:

```json
{
  "price": 250,
  "quantity": 2
}
```

期待される `output`:

```json
{
  "ok": true,
  "total": 500
}
```
