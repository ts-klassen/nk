# 自身のプロパティと継承されたプロパティ

## 問題

`input` には、判定対象のオブジェクト `target` と、プロパティ名を表す文字列 `propertyName` が入っています。

次の 2 つを判定し、結果をオブジェクトとして `output` に代入してください。

- `own`: `target` 自身が `propertyName` と同じ名前のプロパティを持つか
- `available`: `target` 自身または継承元のプロトタイプオブジェクトに、`propertyName` と同じ名前のプロパティがあるか

`Object.create(null)` で作成されたオブジェクトも入力に含まれます。自身のプロパティの判定には `Object.hasOwn` を使ってください。

## 入力

`input` には、次の形のオブジェクトが入っています。

```js
{
  target: 判定対象のオブジェクト,
  propertyName: プロパティ名の文字列
}
```

## 出力

`output` に、次の形のオブジェクトを代入してください。

```js
{
  own: 真偽値,
  available: 真偽値
}
```

## 例

`input`:

```json
{
  "target": {},
  "propertyName": "toString"
}
```

期待される `output`:

```json
{
  "own": false,
  "available": true
}
```
