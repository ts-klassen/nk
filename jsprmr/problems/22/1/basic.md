# Promise executorの実行順

## 問題

`Promise` コンストラクタに渡した executor 関数は、Promise インスタンスを作った時点で同期的に実行されます。

`input` の値を使って、次の順番で文字列を配列に追加してください。

1. 空の配列を作る
2. `input.before` を配列に追加する
3. `new Promise((resolve) => { ... })` で Promise を作る
4. executor 関数の中で `input.executor` を配列に追加し、`resolve(input.executor)` を呼ぶ
5. Promise を作った後に `input.after` を配列に追加する
6. できあがった配列を `output` に代入する

## 入力

`input` には、次の3つのプロパティを持つオブジェクトが入っています。

- `before`: Promise を作る前に追加する文字列
- `executor`: executor 関数の中で追加する文字列
- `after`: Promise を作った後に追加する文字列

## 出力

`output` に、追加した順番の文字列を並べた配列を代入してください。

## 例

`input`:

```json
{
  "before": "start",
  "executor": "promise",
  "after": "end"
}
```

期待される `output`:

```json
["start", "promise", "end"]
```
