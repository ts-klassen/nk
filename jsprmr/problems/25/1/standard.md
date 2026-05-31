# 公開用ステータスJSON

## 問題

`input` には、会員の状態を表すオブジェクトが入っています。

このオブジェクトから、公開してよい情報だけを JSON 文字列にしてください。

出力する JSON には、次の 3 つのプロパティだけをこの順番で含めます。

- `id`
- `name`
- `active`

JSON 文字列は、2 個のスペースでインデントしてください。

## 入力

`input` にはオブジェクトが入っています。

`input` には `id`、`name`、`active` プロパティが必ずあり、ほかのプロパティが含まれることもあります。

## 出力

`output` に、`id`、`name`、`active` だけを含む JSON 文字列を代入してください。

キーの順番とインデントも、指定どおりにしてください。

## 例

`input`:

```json
{
  "id": "u-001",
  "name": "Rina",
  "active": true,
  "password": "hidden"
}
```

期待される `output`:

```json
"{\n  \"id\": \"u-001\",\n  \"name\": \"Rina\",\n  \"active\": true\n}"
```
