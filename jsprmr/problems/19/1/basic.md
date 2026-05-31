# メソッドとして呼び出す

## 問題

`input` には、`kind` と `name` プロパティ、`getLabel` メソッドを持つオブジェクトが入っています。

`getLabel` メソッドは、メソッド内の `this.kind` と `this.name` を使って文字列を作ります。

`input.getLabel()` の形でメソッドとして呼び出し、その返り値を `output` に代入してください。

## 入力

`input` には、`kind` と `name` プロパティ、`getLabel` メソッドを持つオブジェクトが入っています。

## 出力

`output` には、`getLabel` メソッドの返り値である文字列を代入してください。

## 例

`input`:

```js
{
  kind: "入門",
  name: "JavaScript",
  getLabel() {
    return `${this.kind}:${this.name}`;
  }
}
```

期待される `output`:

```json
"入門:JavaScript"
```
