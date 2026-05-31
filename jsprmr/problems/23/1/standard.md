# 参加者リストへの追加

## 問題

イベントの参加者IDを管理します。

`input.participants` には、すでに登録されている参加者IDの配列が入っています。同じIDが重複して入っていることがあります。

`input.candidate` には、これから追加しようとしている参加者IDが入っています。

`Set` を使って参加者IDの重複を1つにまとめ、`input.candidate` が追加前から登録済みだったかどうかと、追加後の登録人数を求めてください。

## 入力

`input` には次のプロパティを持つオブジェクトが入っています。

- `participants`: 参加者IDの配列
- `candidate`: 追加しようとしている参加者ID

参加者IDはすべて文字列です。

## 出力

`output` に次のプロパティを持つオブジェクトを代入してください。

- `exists`: `candidate` が追加前から登録済みなら `true`、そうでなければ `false`
- `count`: `candidate` を追加した後の、重複を除いた参加者数

## 例

`input`:

```json
{
  "participants": ["aoi", "ren", "sora"],
  "candidate": "mika"
}
```

期待される `output`:

```json
{
  "exists": false,
  "count": 4
}
```
