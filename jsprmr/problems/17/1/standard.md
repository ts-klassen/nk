# プリミティブとラッパーの型

## 問題

`input` にはプリミティブ型の文字列が入っています。

仕組みを確認するため、`new String(input)` で `String` のラッパーオブジェクトを作成してください。

次のプロパティを持つオブジェクトを `output` に代入してください。

- `primitiveType`: `typeof input` の結果
- `wrapperType`: 作成したラッパーオブジェクトに対する `typeof` の結果
- `primitiveValue`: 作成したラッパーオブジェクトの `valueOf()` の戻り値

## 入力

`input` にはプリミティブ型の文字列が入っています。

## 出力

`output` には、`primitiveType`、`wrapperType`、`primitiveValue` プロパティを持つオブジェクトを代入してください。

## 例

`input`:

```json
"hello"
```

期待される `output`:

```json
{
  "primitiveType": "string",
  "wrapperType": "object",
  "primitiveValue": "hello"
}
```
