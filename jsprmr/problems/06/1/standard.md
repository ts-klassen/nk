# 注文を受け付けられるか

## 問題

`input` には、注文に関するオブジェクトが入っています。

- `stock`: 在庫数を表す数値
- `quantity`: 注文数を表す数値
- `paid`: 支払い済みなら `true`、そうでなければ `false`

注文を受け付けられる条件は、次のすべてを満たすことです。

- `quantity` が `0` より大きい
- `stock` が `quantity` 以上である
- `paid` が `true` である

注文を受け付けられるなら `true`、そうでなければ `false` を、真偽値として `output` に代入してください。

## 入力

`input` には `{ "stock": 数値, "quantity": 数値, "paid": 真偽値 }` の形のオブジェクトが入っています。

## 出力

`output` に、注文を受け付けられるかどうかを真偽値として代入してください。

## 例

`input`:

```json
{
  "stock": 5,
  "quantity": 3,
  "paid": true
}
```

期待される `output`:

```json
true
```
