# 除外リストを使ったタグ選択

## 問題

表示するタグの一覧を作ります。

`input.tags` には、もとのタグ名が順番に入った配列があります。
`input.hidden` には、表示しないタグ名が入った配列があります。

`input.tags` のうち、`input.hidden` に含まれていないタグだけを、もとの順番のまま集めてください。
同じタグが `input.tags` に複数回出てくる場合も、`input.hidden` に含まれていなければその回数分残します。

## 入力

`input` には次の形のオブジェクトが入っています。

- `tags`: 文字列の配列
- `hidden`: 文字列の配列

## 出力

`output` に、表示するタグ名だけを集めた配列を代入してください。

## 例

`input`:

```json
{
  "tags": ["news", "sale", "draft", "event"],
  "hidden": ["draft"]
}
```

期待される `output`:

```json
["news", "sale", "event"]
```
