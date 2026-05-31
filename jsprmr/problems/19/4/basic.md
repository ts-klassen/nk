# メソッドのthisで残り数を求める

## 問題

`input` には、商品の入荷数 `stock` と販売数 `sold` を持つオブジェクトが入っています。

`input` の値を使って、次のプロパティを持つオブジェクト `item` を作ってください。

- `stock`: `input.stock`
- `sold`: `input.sold`
- `remaining`: メソッド。`this.stock - this.sold` を返す

最後に、`item.remaining()` を呼び出した戻り値を `output` に代入してください。

`remaining` は Arrow Function ではなく、`function` キーワードまたはメソッドの短縮記法で定義してください。

## 入力

`input` には、数値の `stock` と `sold` を持つオブジェクトが入っています。

`sold` は `stock` 以下です。

## 出力

`output` に、残り数を数値として代入してください。

## 例

`input`:

```json
{
  "stock": 12,
  "sold": 5
}
```

期待される `output`:

```json
7
```
