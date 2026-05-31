# プロパティの出どころカウント

## 問題

`input.target` はオブジェクトです。`input.keys` には、調べたいプロパティ名の配列が入っています。

`input.keys` の各プロパティ名について、次の 3 種類のどれに当てはまるかを数えてください。

- `own`: `input.target` 自身が持つプロパティ
- `inherited`: `input.target` 自身は持っていないが、継承元のプロトタイプオブジェクトから参照できるプロパティ
- `missing`: 自身にも継承元にも存在しないプロパティ

プロパティの値が `undefined` かどうかではなく、プロパティが存在するかどうかで判定してください。

## 入力

`input` には、次の形のオブジェクトが入っています。

```js
{
  target: 調べる対象のオブジェクト,
  keys: プロパティ名の配列
}
```

`target` は `Object.create` で作られている場合があります。また、`Object.create(null)` で作られ、`Object.prototype` を継承していない場合もあります。

## 出力

`output` に、次の形のオブジェクトを代入してください。

```js
{
  own: 自身が持つプロパティの数,
  inherited: 継承元から参照できるプロパティの数,
  missing: 存在しないプロパティの数
}
```

## 例

`input`:

```js
{
  target: {
    name: "memo"
  },
  keys: ["name", "toString", "missing"]
}
```

期待される `output`:

```json
{
  "own": 1,
  "inherited": 1,
  "missing": 1
}
```

通常のオブジェクトは `Object.prototype` を継承しているため、`toString` は `inherited` として数えます。
