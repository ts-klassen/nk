# 新機能を試す手段の分類

## 問題

JavaScriptの新しい機能を古い実行環境で試したい場面があります。

`input` には、試したい機能を表すオブジェクトが入っています。

- `input.kind` が `"syntax"` のとき、その機能は新しい構文です
- `input.kind` が `"api"` のとき、その機能は新しい関数やメソッドなどのAPIです
- `input.reproducible` が `false` のとき、その機能は既存の機能だけでは十分に再現できません

次のルールで、使う手段を表す文字列を `output` に代入してください。

- `input.reproducible` が `false` の場合は `"cannot-reproduce"`
- そうでなく、`input.kind` が `"syntax"` の場合は `"transpiler"`
- そうでなく、`input.kind` が `"api"` の場合は `"polyfill"`

## 入力

`input` には、次の形式のオブジェクトが入っています。

```js
{
  kind: "syntax" または "api",
  reproducible: true または false
}
```

## 出力

`output` に、判定結果を表す文字列を代入してください。

## 例

`input`:

```json
{
  "kind": "syntax",
  "reproducible": true
}
```

期待される `output`:

```json
"transpiler"
```
