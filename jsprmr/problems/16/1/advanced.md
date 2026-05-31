# Code Point レポート

## 問題

`input` には、文字列 `text` と、1 つの Code Point だけからなる文字列 `target` を持つオブジェクトが入っています。

`text` を Code Point ごとに調べて、次のプロパティを持つオブジェクトを `output` に代入してください。

- `codeUnitLength`: `text` の Code Unit の個数
- `codePointLength`: `text` の Code Point の個数
- `targetCount`: `text` の中で `target` と同じ Code Point の個数
- `surrogateHexes`: `text` に含まれる、サロゲートペアで表される Code Point を、出現順に 16 進数文字列へ変換した配列

`surrogateHexes` に入れるのは、Code Point の数値が `65535` より大きい文字だけです。
16 進数文字列は、`codePointAt(0).toString(16)` で得られる形式にしてください。`0x` は付けず、先頭に `0` を足す必要もありません。

`text` は `Array.from` または `for...of` を使って、Code Point 単位で処理してください。

## 入力

`input` には次の形式のオブジェクトが入っています。

```json
{
  "text": "文字列",
  "target": "1 つの Code Point だけからなる文字列"
}
```

`text` は空文字列の場合があります。

## 出力

`output` に、次の形式のオブジェクトを代入してください。

```json
{
  "codeUnitLength": 0,
  "codePointLength": 0,
  "targetCount": 0,
  "surrogateHexes": []
}
```

各プロパティの値は、実際の `text` と `target` に合わせてください。

## 例

`input`:

```json
{
  "text": "A😀あ🐱B",
  "target": "🐱"
}
```

期待される `output`:

```json
{
  "codeUnitLength": 7,
  "codePointLength": 5,
  "targetCount": 1,
  "surrogateHexes": ["1f600", "1f431"]
}
```
