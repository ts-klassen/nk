# スタンプカードのクラス

## 問題

お店のスタンプカードを表す `StampCard` クラスを定義してください。

`StampCard` クラスは、次の仕様を満たしてください。

- `constructor(shopName, stamps)` で、お店の名前と現在のスタンプ数を受け取る
- 受け取ったお店の名前を、インスタンスの `shopName` プロパティに保存する
- 受け取ったスタンプ数を、インスタンスの `stamps` プロパティに保存する
- `add(count)` メソッドで、`stamps` に `count` を足し、更新後の `stamps` を返す
- `isFull` getter で、`stamps` が `10` 以上なら `true`、そうでなければ `false` を返す

`input` の値を使って `StampCard` のインスタンスを 1 つ作成し、`add(input.addStamps)` を 1 回呼び出してください。

その後、`output` に作成したインスタンスそのものを代入してください。

## 入力

`input` には、次のプロパティを持つオブジェクトが入っています。

- `shopName`: お店の名前を表す文字列
- `initialStamps`: 最初のスタンプ数を表す数値
- `addStamps`: 追加するスタンプ数を表す数値

## 出力

`output` には、`add(input.addStamps)` を呼び出した後の `StampCard` インスタンスを代入してください。

`output` はオブジェクトで、`shopName` と `stamps` プロパティ、`add(count)` メソッド、`isFull` getter を持っている必要があります。

## 例

`input`:

```json
{
  "shopName": "Blue Cafe",
  "initialStamps": 4,
  "addStamps": 3
}
```

期待される `output` の主な状態:

```json
{
  "shopName": "Blue Cafe",
  "stamps": 7,
  "isFull": false
}
```

このとき、`output.add(1)` を呼び出すと `8` が返り、`output.stamps` は `8` になります。
