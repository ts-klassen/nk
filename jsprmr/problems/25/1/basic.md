# JSON文字列を値に変換する

## 問題

`input` に JSON 形式の文字列が入っています。

`JSON.parse` を使って、`input` を JavaScript の値へ変換してください。

変換した値を `output` に代入してください。

## 入力

`input` には、オブジェクトまたは配列を表す JSON 形式の文字列が入っています。

## 出力

`output` には、`JSON.parse(input)` で得られるオブジェクトまたは配列を代入してください。

## 例

`input`:

```json
"{\"name\":\"JavaScript\",\"year\":2015}"
```

期待される `output`:

```json
{
  "name": "JavaScript",
  "year": 2015
}
```
