# 提案メモの行動分類

## 問題

ECMAScriptの機能について、チーム内で確認したいメモが`input`に配列で入っています。

各メモは次のプロパティを持つオブジェクトです。

- `name`: 機能名を表す文字列
- `stage`: TC39プロポーザルのステージを表す数値。`0`、`1`、`2`、`2.7`、`3`、`4`のいずれか
- `kind`: 機能の種類を表す文字列。新しい構文なら`"syntax"`、新しい関数やメソッドなどのAPIなら`"api"`
- `purpose`: 判断したい目的を表す文字列。`"production"`、`"oldRuntime"`、`"study"`のいずれか

各メモについて、次のルールで行動を決めてください。

- `stage`が`4`の場合
  - `purpose`が`"production"`なら、行動は`"仕様採用済み"`
  - `purpose`が`"oldRuntime"`で、`kind`が`"syntax"`なら、行動は`"Transpilerを検討"`
  - `purpose`が`"oldRuntime"`で、`kind`が`"api"`なら、行動は`"Polyfillを検討"`
  - `purpose`が`"study"`なら、行動は`"仕様またはMDNで確認"`
- `stage`が`2.7`または`3`の場合
  - `purpose`が`"production"`なら、行動は`"採用前に実装状況を確認"`
  - `purpose`が`"oldRuntime"`なら、行動は`"試験的な検証に留める"`
  - `purpose`が`"study"`なら、行動は`"プロポーザルの状態を確認"`
- `stage`が`0`、`1`、`2`の場合
  - `purpose`が`"production"`または`"oldRuntime"`なら、行動は`"まだ採用しない"`
  - `purpose`が`"study"`なら、行動は`"アイデアまたはドラフトとして読む"`

それぞれのメモについて、`"機能名: 行動"`という文字列を作ってください。

## 入力

`input`には、メモのオブジェクトを要素に持つ配列が入っています。

## 出力

`output`に、各メモの判定結果を同じ順番で並べた配列を代入してください。

配列の各要素は文字列です。

## 例

`input`:

```json
[
  {
    "name": "記法A",
    "stage": 4,
    "kind": "syntax",
    "purpose": "oldRuntime"
  },
  {
    "name": "メソッドB",
    "stage": 3,
    "kind": "api",
    "purpose": "production"
  },
  {
    "name": "機能C",
    "stage": 1,
    "kind": "api",
    "purpose": "study"
  }
]
```

期待される`output`:

```json
[
  "記法A: Transpilerを検討",
  "メソッドB: 採用前に実装状況を確認",
  "機能C: アイデアまたはドラフトとして読む"
]
```
