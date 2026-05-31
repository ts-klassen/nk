# メソッドとして呼び出す

## 問題

`input` には、予定を表すオブジェクトが入っています。

このオブジェクトには、予定名を表す `name`、分数を表す `minutes`、予定を説明する文字列を返す `getSummary` メソッドがあります。

`getSummary` メソッドは、メソッドの中で `this.name` と `this.minutes` を参照します。

`input.getSummary()` のように、`getSummary` を `input` のメソッドとして呼び出してください。

## 入力

`input` には、`name`、`minutes`、`getSummary` メソッドを持つオブジェクトが入っています。

## 出力

`output` に、`input.getSummary()` を呼び出した戻り値を文字列として代入してください。

## 例

`input`:

```js
{
  name: "朝の読書",
  minutes: 20,
  getSummary() {
    return this.name + "は" + this.minutes + "分です";
  }
}
```

期待される `output`:

```json
"朝の読書は20分です"
```
