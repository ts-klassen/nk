# メソッドのthisで在庫ラベルを作る

## 問題

`input` には、商品の情報を表すオブジェクトが入っています。

`input.name` には商品名の文字列、`input.stock` には在庫数の数値が入っています。

新しく `item` というオブジェクトを作り、`name` と `stock` に `input` の値を入れてください。

さらに、`item` に `label` というメソッドを定義してください。

`label` メソッドは、メソッドの中で `this.name` と `this.stock` を使い、次の形の文字列を返してください。

```text
商品名: 在庫数個
```

最後に、`item.label()` の戻り値を `output` に代入してください。

## 入力

`input` には、`name` と `stock` を持つオブジェクトが入っています。

## 出力

`output` に、`item.label()` の戻り値である文字列を代入してください。

## 例

`input`:

```json
{
  "name": "えんぴつ",
  "stock": 5
}
```

期待される `output`:

```json
"えんぴつ: 5個"
```
