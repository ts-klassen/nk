# JSON化チェックレポート

## 問題

`input` には、JSONとして保存できるか確認したい値の配列が入っています。

配列の各要素について、先頭から順に `JSON.stringify` でJSON文字列へ変換してください。

`output` には、各要素の変換結果を表すオブジェクトを並べた配列を代入してください。

各結果オブジェクトは、次のルールで作ります。

- 変換に成功した場合は、`index`、`status`、`json` プロパティを持つオブジェクトにする
- `index` には、元の配列での0始まりの位置を数値で入れる
- `status` には、変換に成功した場合は文字列 `"ok"` を入れる
- `json` には、`JSON.stringify` が返したJSON文字列を入れる
- 変換時に例外が発生した場合は、`index` と `status` だけを持つオブジェクトにする
- 例外が発生した場合の `status` には、文字列 `"error"` を入れる

JSON文字列には、空白やインデントを付けないでください。
なお、`JSON.stringify` の返り値が `undefined` になる値そのものは、`input` の各要素としては渡されません。

## 入力

`input` には配列が入っています。
配列の各要素には、文字列、数値、真偽値、`null`、配列、オブジェクト、`Map`、`Set`、`BigInt`、循環参照を持つオブジェクト、`toJSON` メソッドを持つオブジェクトなどが入ることがあります。

## 出力

`output` に、変換結果を表すオブジェクトの配列を代入してください。

## 例

`input`:

```js
[
  { id: 1, name: "pen", temporary: undefined },
  { id: 2, name: "box", toJSON() { return { id: this.id, label: this.name }; } },
  10n
]
```

期待される `output`:

```json
[
  {
    "index": 0,
    "status": "ok",
    "json": "{\"id\":1,\"name\":\"pen\"}"
  },
  {
    "index": 1,
    "status": "ok",
    "json": "{\"id\":2,\"label\":\"box\"}"
  },
  {
    "index": 2,
    "status": "error"
  }
]
```
