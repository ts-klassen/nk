# グループ別スコア表

## 問題

`input` には、`makeLine` と `groups` を持つオブジェクトが入っています。

`makeLine` は Arrow Function ではない普通の関数です。`makeLine(label, point)` のように呼び出すと、呼び出し時の `this` にあるプロパティと、2 つの引数を使って文字列を返します。

`groups` はグループオブジェクトの配列です。各グループオブジェクトには `entries` という配列があります。`entries` の各要素は `[label, point]` の形の配列です。

各グループについて、`entries` の各要素を `makeLine` の引数として渡し、戻り値を配列にしてください。このとき、`makeLine` の `this` は、その `entries` を持つグループオブジェクトになるように呼び出してください。

グループごとの結果配列を、`groups` と同じ順番で並べた二重配列を作り、`output` に代入してください。

`entries` が空のグループの結果は空配列です。`groups` が空の場合は空配列です。

## 入力

`input` には次の形のオブジェクトが入っています。

```js
{
  makeLine: function(label, point) {
    // this と label, point を使って文字列を返す
  },
  groups: [
    {
      entries: [
        ["A", 3],
        ["B", 0]
      ]
      // makeLine が this から読むプロパティを持つ
    }
  ]
}
```

`makeLine` が `this` から読むプロパティ名は、テストケースによって変わる場合があります。提出コードでは `makeLine` の中身と同じ計算を直接書くのではなく、`makeLine` を正しい `this` と引数で呼び出してください。

## 出力

`output` に文字列の二重配列を代入してください。

## 例

`input`:

```js
{
  makeLine(label, point) {
    return this.name + ":" + label + "=" + (this.base + point * this.rate);
  },
  groups: [
    {
      name: "north",
      base: 10,
      rate: 2,
      entries: [
        ["A", 3],
        ["B", 0]
      ]
    },
    {
      name: "south",
      base: 5,
      rate: 4,
      entries: [
        ["C", 2]
      ]
    }
  ]
}
```

期待される `output`:

```json
[
  [
    "north:A=16",
    "north:B=10"
  ],
  [
    "south:C=13"
  ]
]
```
