# 予備設定への切り替え

## 問題

`input` には、次の形のオブジェクトが入っています。

```js
{
  primary: { name: "main", value: 12, max: 20 },
  backup: { name: "sub", value: 8, max: 10 }
}
```

`primary` を先に読み取り、失敗した場合だけ `backup` を読み取ってください。

設定オブジェクトの読み取りでは、次の条件を確認してください。

- `value` または `max` が数値でなければ、`new TypeError("valueとmaxは数値である必要があります")` を投げる
- `value` が `max` より大きければ、`new Error("上限を超えています")` を投げる
- どちらにも当てはまらなければ、その設定の `value` を採用する

`primary` の読み取りでエラーを捕まえたら、次の形で新しい `Error` を作ってください。

```js
new Error(input.primary.name + "を読み取れませんでした", { cause: 捕まえたエラー })
```

`backup` の読み取りでエラーを捕まえた場合も、同じ形で `input.backup.name` を使って新しい `Error` を作ってください。

`attempts` には、読み取りを試した回数を数値で入れてください。`primary` は必ず 1 回試します。`backup` は `primary` が失敗した場合だけ試します。回数の加算には、例外の有無に関係なく実行される `finally` 節を使ってください。

## 入力

`input` には、`primary` と `backup` を持つオブジェクトが入っています。どちらの設定も、`name`、`value`、`max` を持ちます。

## 出力

`output` には、次の形のオブジェクトを代入してください。

```js
{
  selected: "primary", // "primary"、"backup"、"none" のいずれか
  value: 12,           // 採用した数値。どちらも失敗した場合は null
  attempts: 1,         // 読み取りを試した回数
  primaryError: null,  // primary が失敗した場合は下の形のオブジェクト
  backupError: null    // backup が失敗した場合は下の形のオブジェクト
}
```

エラー情報のオブジェクトは、次の形にしてください。

```js
{
  message: "mainを読み取れませんでした",
  causeName: "TypeError",
  causeMessage: "valueとmaxは数値である必要があります"
}
```

`message` には新しく作った `Error` の `message`、`causeName` には `cause` に入っている元のエラーの `name`、`causeMessage` には元のエラーの `message` を入れてください。

## 例

`input`:

```json
{
  "primary": { "name": "main", "value": "12", "max": 20 },
  "backup": { "name": "sub", "value": 8, "max": 10 }
}
```

期待される `output`:

```json
{
  "selected": "backup",
  "value": 8,
  "attempts": 2,
  "primaryError": {
    "message": "mainを読み取れませんでした",
    "causeName": "TypeError",
    "causeMessage": "valueとmaxは数値である必要があります"
  },
  "backupError": null
}
```
