# 点検チケットの作成

## 問題

建物の点検チケットを作成します。

`input` には、次のプロパティを持つオブジェクトが入っています。

- `status`: チケットにつける状態を表す文字列
- `areas`: 点検するエリアの配列
- `createTicket`: Arrow Function ではない関数

`areas` の各要素は、次のプロパティを持つオブジェクトです。

- `floor`: 階を表す文字列
- `name`: エリア名を表す文字列
- `rooms`: 部屋番号の配列

`input.createTicket(room, status)` は、`this.floor` と `this.name` を使ってチケット文字列を作る関数です。

各エリアの `rooms` を先頭から順に調べ、各部屋番号について `input.createTicket` を呼び出してください。このとき、`this` がその部屋の所属するエリアオブジェクトになるように呼び出します。

作成したチケット文字列を、エリアの順番、同じエリア内では `rooms` の順番で配列に入れてください。`rooms` が空配列のエリアからは、チケットを作成しません。

## 入力

`input` には、点検チケット作成用のオブジェクトが入っています。

## 出力

`output` に、作成したチケット文字列の配列を代入してください。

## 例

`input`:

```js
{
  status: "OK",
  areas: [
    { floor: "2", name: "east", rooms: [201, 202] },
    { floor: "3", name: "west", rooms: [301] }
  ],
  createTicket: function (room, status) {
    return this.floor + "F-" + this.name + "-" + room + ":" + status;
  }
}
```

期待される `output`:

```json
["2F-east-201:OK", "2F-east-202:OK", "3F-west-301:OK"]
```
