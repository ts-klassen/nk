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
- `createdAt` / `updatedAt` は RFC 3339 date-time の文字列にする。
- DB には UTC で保存し、レスポンス時に必要なタイムゾーンへ変換する。
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
- `INTERNAL_SERVER_ERROR`

## エラー message

| code | message |
| --- | --- |
| `VALIDATION_ERROR` | `入力値が不正です` |
| `UNAUTHORIZED` | `認証が必要です` |
| `FORBIDDEN` | `この操作は許可されていません` |
| `NOT_FOUND` | `対象リソースが存在しません` |
| `CONFLICT` | `リソースが競合しています` |
| `INTERNAL_SERVER_ERROR` | `サーバーエラーが発生しました` |

`INTERNAL_SERVER_ERROR` は想定外エラー時の実装上の共通コードとする。通常の教材課題で受講生が意図的に発生させる対象ではなく、振る舞いテストの主対象にも含めない。

## TODO

- [x] API 仕様書の共通テンプレートを作る。
- [x] 各エラーコードの message 文言を決める。
- [x] `500 Internal Server Error` を仕様書に載せる範囲を決める。
- [x] 日時文字列をアプリ側でどう生成するか決める。

## 完了条件

- システム A と B の API 仕様書が同じルールで書ける。
- テストコードが API 仕様から一意に書ける。
