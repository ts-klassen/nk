# Promise結果表の集計

## 問題

`input` には、複数の非同期処理の完了結果を表すタスク配列が入っています。

各タスクは次のプロパティを持ちます。

- `name`: タスク名の文字列
- `settledAt`: 完了した時刻を表す数値。小さいほど早く完了します
- `status`: `"fulfilled"` または `"rejected"`
- `value`: `status` が `"fulfilled"` のときの成功値
- `reason`: `status` が `"rejected"` のときの失敗理由

`settledAt` の値は、同じ `input` の中ではすべて異なります。

実際に `Promise` やタイマーを作る必要はありません。タスク配列をもとに、次の 2 つの結果を予測してください。

- `all`: `Promise.all` の結果を表します
  - すべてのタスクが `"fulfilled"` なら、`status` は `"fulfilled"`、`values` は入力配列と同じ順番の成功値配列にします
  - 1 つでも `"rejected"` のタスクがあるなら、`status` は `"rejected"`、`values` は空配列にします
- `race`: `Promise.race` の結果を表します
  - `settledAt` が最も小さいタスクの `name`、`status`、結果を使います
  - 成功したタスクなら `result` は `value`、失敗したタスクなら `result` は `reason` にします

## 入力

`input` にはタスクオブジェクトの配列が入っています。

## 出力

`output` に、次の形のオブジェクトを代入してください。

```js
{
  all: {
    status: "fulfilled" または "rejected",
    values: 成功値の配列
  },
  race: {
    name: 最初に完了したタスク名,
    status: "fulfilled" または "rejected",
    result: 成功値または失敗理由
  }
}
```

## 例

`input`:

```json
[
  { "name": "profile", "settledAt": 30, "status": "fulfilled", "value": "user" },
  { "name": "settings", "settledAt": 10, "status": "fulfilled", "value": "dark" },
  { "name": "history", "settledAt": 20, "status": "fulfilled", "value": "recent" }
]
```

期待される `output`:

```json
{
  "all": {
    "status": "fulfilled",
    "values": ["user", "dark", "recent"]
  },
  "race": {
    "name": "settings",
    "status": "fulfilled",
    "result": "dark"
  }
}
```
