# インポート指定を検査する

## 問題

`input.modules` には、モジュールごとにエクスポートされている名前の情報が入っています。
`input.requests` には、そのモジュールからインポートしたい値の指定が入っています。

実際の `import` 文は実行せず、指定されたインポートが有効かどうかをデータとして判定してください。

各リクエストについて、次の順番で確認します。

- `defaultName` が `null` ではない場合、そのモジュールにデフォルトエクスポートがあれば `defaultName` をローカル名として受け入れる
- `named` の各要素について、`imported` がそのモジュールの名前つきエクスポートにあれば `local` をローカル名として受け入れる
- 存在しないエクスポートを指定している場合は、エラー文字列を作る

エラー文字列は次の形式にしてください。

```text
モジュールパス: エクスポート名
```

デフォルトエクスポートが存在しないのにデフォルトインポートしようとした場合、エクスポート名には `default` を使ってください。

## 入力

`input` には次の形のオブジェクトが入っています。

```js
{
  modules: [
    {
      path: "./module.js",
      default: true,
      named: ["foo", "bar"]
    }
  ],
  requests: [
    {
      path: "./module.js",
      defaultName: "moduleDefault",
      named: [
        {
          imported: "foo",
          local: "localFoo"
        }
      ]
    }
  ]
}
```

`requests` の `path` は、必ず `modules` のどれかの `path` と一致します。
`defaultName` は文字列または `null` です。

## 出力

`output` に、次のプロパティを持つオブジェクトを代入してください。

- `locals`: 有効なインポートで作られるローカル名を、リクエスト順に並べた配列
- `errors`: 存在しないエクスポートに対するエラー文字列を、見つけた順に並べた配列

## 例

`input`:

```json
{
  "modules": [
    { "path": "./math.js", "default": false, "named": ["sum", "max"] },
    { "path": "./formatter.js", "default": true, "named": ["VERSION"] }
  ],
  "requests": [
    {
      "path": "./math.js",
      "defaultName": null,
      "named": [
        { "imported": "sum", "local": "sum" },
        { "imported": "min", "local": "min" }
      ]
    },
    {
      "path": "./formatter.js",
      "defaultName": "format",
      "named": [
        { "imported": "VERSION", "local": "formatterVersion" }
      ]
    }
  ]
}
```

期待される `output`:

```json
{
  "locals": ["sum", "format", "formatterVersion"],
  "errors": ["./math.js: min"]
}
```
