# 共通 API 規約を定義する

## 目的

システム A とシステム B に共通する REST API の設計規約を定義する。

## 作るもの

- API 仕様書で使う共通規約
- HTTP ステータスコードの使い分け
- エラーレスポンス形式
- ページング仕様
- 日時形式

## 決定済み仕様

- JSON ベースの REST API とする。
- 動的 HTML 生成は行わない。
- `POST` 成功時は `201 Created` とする。
- `PATCH` 成功時は `204 No Content` とする。
- `DELETE` 成功時は `204 No Content` とする。
- 一覧 API は `limit` / `offset` を使う。
- `limit` のデフォルトは `20`、最大は `100` とする。
- `offset` のデフォルトは `0` とする。
- 一覧の並び順は `id ASC` とする。
- 一覧レスポンスには `total` を含める。
- `createdAt` / `updatedAt` は RFC 3339 風の日時文字列にする。
- 日付だけの項目は `YYYY-MM-DD` にする。

## 一覧レスポンス形式

```json
{
  "items": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 100
  }
}
```

## エラーレスポンス形式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

## エラーコード

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`

## TODO

- [ ] API 仕様書の共通テンプレートを作る。
- [ ] 各エラーコードの message 文言を決める。
- [ ] `500 Internal Server Error` を仕様書に載せる範囲を決める。
- [ ] 日時文字列をアプリ側でどう生成するか決める。

## 完了条件

- システム A と B の API 仕様書が同じルールで書ける。
- テストコードが API 仕様から一意に書ける。
