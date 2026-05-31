# 別のオブジェクトをthisとして呼び出す

## 問題

`input` には、商品オブジェクト、割引額、計算用の関数が入っています。

`input.calc` は Arrow Function ではない通常の関数です。この関数は、引数で受け取った割引額を使い、`this.price * this.count - 割引額` を返します。

`input.calc` の `this` が `input.item` になるように呼び出し、その戻り値を `output` に代入してください。

## 入力

`input` には次の形のオブジェクトが入っています。

```js
{
  item: { price: 数値, count: 数値 },
  discount: 数値,
  calc: function(discount) {
    return this.price * this.count - discount;
  }
}
```

## 出力

`output` に、`input.calc` を `this` が `input.item` になるように呼び出した結果の数値を代入してください。

## 例

`input`:

```js
{
  item: { price: 120, count: 3 },
  discount: 50,
  calc: function(discount) {
    return this.price * this.count - discount;
  }
}
```

期待される `output`:

```json
310
```
