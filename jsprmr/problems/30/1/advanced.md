# 学習項目の次アクションを決める

## 問題

`input` には、調べたい学習項目の配列が入っています。

各要素には、項目名と、その項目の位置づけを表す情報があります。
第一部の復習で済むもの、第二部で学ぶもの、公式情報で調べるもの、Deprecated として避けるものに整理してください。

Deprecated の項目は、他の分類には入れず、`avoid` だけに追加してください。

Deprecated ではない項目は、次のルールで分類します。

- `area` が `"ecmascript"` で `coveredInFirstPart` が `true` の項目は、`reviewFirstPart` に追加する
- `area` が `"browser"`、`"node"`、`"library"`、`"tool"` の項目は、`learnSecondPart` に追加する
- 第一部で詳しく扱っていない項目は、公式情報で調べる対象として `lookUp` に追加する

公式情報の参照先は、次のように選んでください。

- `area` が `"ecmascript"` または `"browser"` の項目は `lookUp.mdn`
- `area` が `"node"` の項目は `lookUp.node`
- `area` が `"library"` または `"tool"` の項目は `lookUp.official`

それぞれの配列では、`input` に出てきた順番を保ってください。

## 入力

`input` には、次のプロパティを持つオブジェクトの配列が入っています。

- `name`: 項目名を表す文字列
- `area`: `"ecmascript"`、`"browser"`、`"node"`、`"library"`、`"tool"` のいずれか
- `coveredInFirstPart`: 第一部で詳しく扱った項目なら `true`
- `introducedOnly`: 第一部で名前と大まかな用途だけ紹介された項目なら `true`
- `deprecated`: Deprecated として避けるべき項目なら `true`

## 出力

`output` には、次の形のオブジェクトを代入してください。

```js
{
  reviewFirstPart: [],
  learnSecondPart: [],
  lookUp: {
    mdn: [],
    node: [],
    official: []
  },
  avoid: []
}
```

## 例

`input`:

```json
[
  { "name": "constとlet", "area": "ecmascript", "coveredInFirstPart": true, "introducedOnly": false, "deprecated": false },
  { "name": "Proxy", "area": "ecmascript", "coveredInFirstPart": false, "introducedOnly": true, "deprecated": false },
  { "name": "fs.readFile", "area": "node", "coveredInFirstPart": false, "introducedOnly": false, "deprecated": false },
  { "name": "DOMイベント", "area": "browser", "coveredInFirstPart": false, "introducedOnly": false, "deprecated": false },
  { "name": "古いライブラリ", "area": "library", "coveredInFirstPart": false, "introducedOnly": false, "deprecated": true }
]
```

期待される `output`:

```json
{
  "reviewFirstPart": ["constとlet"],
  "learnSecondPart": ["fs.readFile", "DOMイベント"],
  "lookUp": {
    "mdn": ["Proxy", "DOMイベント"],
    "node": ["fs.readFile"],
    "official": []
  },
  "avoid": ["古いライブラリ"]
}
```
