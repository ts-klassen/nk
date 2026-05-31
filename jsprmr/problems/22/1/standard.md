# Promiseチェーンの同期部分

## 問題

`input.ok` が `true` の場合は `Promise.resolve(input.value)` から、`false` の場合は `Promise.reject(new Error(input.errorMessage))` からPromiseチェーンを作ります。

次の処理を行ってください。

- 空の配列 `log` を作る
- `input.ok` に応じて、成功または失敗したPromiseを作る
- そのPromiseに `then` を登録し、成功時は `log` に `"then:"` と受け取った値をつなげた文字列を追加する
- 続けて `catch` を登録し、失敗時は `log` に `"catch:"` とエラーメッセージをつなげた文字列を追加する
- `then` と `catch` をつなげた結果のPromiseを変数に入れる
- チェーンを作った直後に、`input.syncLabel` を `log` に追加する
- `output` に、次のプロパティを持つオブジェクトを代入する
  - `chainIsPromise`: チェーンの結果がPromiseなら `true`
  - `log`: 採点時点での `log` 配列

## 入力

`input` には、`ok`、`value`、`errorMessage`、`syncLabel` プロパティを持つオブジェクトが入っています。

- `ok` は真偽値です
- `value` は数値または文字列です
- `errorMessage` は文字列です
- `syncLabel` は文字列です

## 出力

`output` には、`chainIsPromise` プロパティと `log` プロパティを持つオブジェクトを代入してください。

## 例

`input`:

```json
{
  "ok": true,
  "value": 10,
  "errorMessage": "失敗",
  "syncLabel": "同期処理"
}
```

期待される `output`:

```json
{
  "chainIsPromise": true,
  "log": ["同期処理"]
}
```
