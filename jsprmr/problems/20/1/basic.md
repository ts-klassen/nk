# 入場券クラスを作る

## 問題

`Ticket` クラスを定義してください。

`Ticket` クラスには、次の内容を実装してください。

- `constructor(title, price)` を定義する
- `constructor` の中で、受け取った `title` を `this.title` に代入する
- `constructor` の中で、受け取った `price` を `this.price` に代入する
- `label()` メソッドを定義し、`this.title + " - " + this.price + "円"` という文字列を返す

そのあと、`input.title` と `input.price` を使って `Ticket` のインスタンスを作り、そのインスタンスを `output` に代入してください。

## 入力

`input` には、入場券の情報を表すオブジェクトが入っています。

- `input.title`: 入場券の名前を表す文字列
- `input.price`: 価格を表す数値

## 出力

`output` には、作成した `Ticket` インスタンスを代入してください。

`output` はオブジェクトで、`title` プロパティ、`price` プロパティ、`label()` メソッドを持つものとします。

## 例

`input`:

```json
{
  "title": "Morning Pass",
  "price": 1200
}
```

期待される `output` は、次のように使える `Ticket` インスタンスです。

```js
output.title; // "Morning Pass"
output.price; // 1200
output.label(); // "Morning Pass - 1200円"
```
