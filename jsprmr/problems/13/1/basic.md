# Object.hasOwn と in の確認

## 問題

次の `user` オブジェクトについて、`input` で指定されたプロパティ名を調べてください。

```js
const user = {
  name: "Sora"
};
```

`Object.hasOwn(user, input)` の結果と、`input in user` の結果を、それぞれ求めます。

## 入力

`input` には、調べるプロパティ名を表す文字列が入っています。

## 出力

`output` に、次の 2 つのプロパティを持つオブジェクトを代入してください。

- `own`: `Object.hasOwn(user, input)` の結果を表す真偽値
- `exists`: `input in user` の結果を表す真偽値

## 例

`input`:

```json
"toString"
```

期待される `output`:

```json
{
  "own": false,
  "exists": true
}
```
