# 採点ラベルの切り替え

## 問題

`input` には、採点ラベルを作るためのオブジェクトが入っています。

`input.scorer.build(score, index)` は Arrow Function ではない通常のメソッドです。このメソッドは、呼び出し時の `this` から必要な設定を読み取り、渡された点数と添字を使ってラベル文字列を返します。

`input.scores` の各点数について、この `build` メソッドを使ってラベルを作り、文字列の配列を `output` に代入してください。

ただし、`input.scores` の添字が `input.switchIndex` 未満の点数では `input.scorer` を `this` として使います。添字が `input.switchIndex` 以上の点数では `input.backup` を `this` として使います。

`build` がどのプロパティを読み、どの形式の文字列を返すかは入力ごとに変わる場合があります。提出コードではラベル作成処理を直接書かず、必ず `build` の戻り値を使ってください。

`input.switchIndex` は `0` 以上 `input.scores.length` 以下の整数です。`input.scores` が空配列の場合、`output` には空配列を代入してください。

## 入力

`input` には次の形のオブジェクトが入っています。

```js
{
  scorer: {
    build(score, index) {
      // this と score、index を使ってラベル文字列を返す
    }
    // build が this から読むプロパティを持つ
  },
  backup: {
    // build が this から読むプロパティを持つ
  },
  scores: [10, 0, 30, 5],
  switchIndex: 2
}
```

## 出力

`output` に、作成したラベルの配列を代入してください。

## 例

`input`:

```js
{
  scorer: {
    name: "A",
    bonus: 5,
    build(score, index) {
      return this.name + "#" + (index + 1) + "=" + (score + this.bonus);
    }
  },
  backup: {
    name: "B",
    bonus: 20
  },
  scores: [10, 0, 30, 5],
  switchIndex: 2
}
```

期待される `output`:

```json
["A#1=15", "A#2=5", "B#3=50", "B#4=25"]
```
