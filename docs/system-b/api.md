# システム B API 仕様: 用例採集

## 概要

用語はログインなしで CRUD できる。ユーザー登録後は Basic 認証により、用例を CRUD できる。

用例はログインなしで閲覧できる。他ユーザーの用例も閲覧できるが、更新と削除は所有者だけができる。

## 共通仕様

### データ形式

- リクエストボディは JSON。
- レスポンスボディも JSON。
- 動的 HTML は返さない。

### 日時

- `createdAt` / `updatedAt`: `2026-04-28T11:39:55+09:00` 形式。
- `collectedDate`: `YYYY-MM-DD` 形式。
- DB には UTC で保存し、レスポンス時に `Asia/Tokyo` の `+09:00` 表示へ変換する。

### ページング

一覧 API は `limit` / `offset` を使う。

- `limit`: 任意。デフォルト `20`。最小 `1`。最大 `100`。
- `offset`: 任意。デフォルト `0`。最小 `0`。
- 並び順: `id ASC`。

レスポンス形式:

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

### エラー

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

| HTTP status | code | message | 条件 |
| --- | --- | --- | --- |
| `400` | `VALIDATION_ERROR` | `入力値が不正です` | 入力値が不正 |
| `401` | `UNAUTHORIZED` | `認証が必要です` | Basic 認証がない、または不正 |
| `403` | `FORBIDDEN` | `この操作は許可されていません` | 認証済みだが権限がない |
| `404` | `NOT_FOUND` | `対象リソースが存在しません` | 対象リソースが存在しない |
| `409` | `CONFLICT` | `リソースが競合しています` | 一意制約違反、または子データがあるため削除できない |
| `500` | `INTERNAL_SERVER_ERROR` | `サーバーエラーが発生しました` | 想定外のサーバーエラー |

`INTERNAL_SERVER_ERROR` は想定外エラー時の実装上の共通コードである。通常の課題実装で意図的に発生させる対象ではなく、公開テストの主対象にも含めない。

`401 Unauthorized` では次のヘッダを返す。

```http
WWW-Authenticate: Basic realm="backend-training"
```

### Basic 認証

用例の作成、更新、削除では Basic 認証が必要。

```http
Authorization: Basic base64(username:password)
```

パスワードは Argon2 でハッシュ化して保存する。Argon2 はライブラリのデフォルトパラメータを使う。教材と課題ではパスワードを平文保存せず、ハッシュ化して検証する流れまでを扱い、Argon2 パラメータ調整は扱わない。

## ユーザー

### POST /users

公開 API。認証用ユーザーを作成する。

Request:

```json
{
  "username": "alice",
  "password": "password123"
}
```

制約:

- `username`: 必須。半角英数字と `_` のみ。3 文字以上 32 文字以下。一意。
- `password`: 必須。8 文字以上 72 文字以下。

Response: `201 Created`

```json
{
  "id": 1,
  "username": "alice",
  "createdAt": "2026-04-28T11:39:55+09:00",
  "updatedAt": "2026-04-28T11:39:55+09:00"
}
```

エラー:

- `400 VALIDATION_ERROR`
- `409 CONFLICT`: `username` が重複

## 用語

用語 API は全て公開 API。認証なしで作成、更新、削除できる。

用語は純粋に用語のみを保持する。説明文は持たない。

### Term

```json
{
  "id": 1,
  "term": "冪等性",
  "createdAt": "2026-04-28T11:39:55+09:00",
  "updatedAt": "2026-04-28T11:39:55+09:00"
}
```

制約:

- `term`: 必須。1 文字以上 255 文字以下。一意。

### GET /terms

Response: `200 OK`

```json
{
  "items": [
    {
      "id": 1,
      "term": "冪等性",
      "createdAt": "2026-04-28T11:39:55+09:00",
      "updatedAt": "2026-04-28T11:39:55+09:00"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1
  }
}
```

エラー:

- `400 VALIDATION_ERROR`: `limit` または `offset` が不正

### POST /terms

Request:

```json
{
  "term": "冪等性"
}
```

Response: `201 Created`

レスポンスボディは `Term`。

エラー:

- `400 VALIDATION_ERROR`
- `409 CONFLICT`: `term` が重複

### GET /terms/:termId

Response: `200 OK`

レスポンスボディは `Term`。

エラー:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`

### PATCH /terms/:termId

部分更新。少なくとも 1 項目を指定する。

Request:

```json
{
  "term": "冪等"
}
```

Response: `204 No Content`

エラー:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`
- `409 CONFLICT`: `term` が重複

### DELETE /terms/:termId

Response: `204 No Content`

用例が紐付いている用語は削除できない。削除可否は事前の用例件数確認ではなく、DB の外部キー制約で守り、外部キー制約エラーを `409 CONFLICT` に変換する。

エラー:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`
- `409 CONFLICT`: 用例が紐付いている

## 用例

### Example

```json
{
  "id": 1,
  "termId": 1,
  "userId": 1,
  "body": "PUT は冪等な操作として設計することが多い。",
  "collectedDate": "2026-04-28",
  "note": "API設計レビューでの発言",
  "createdAt": "2026-04-28T11:39:55+09:00",
  "updatedAt": "2026-04-28T11:39:55+09:00"
}
```

制約:

- `body`: 必須。1 文字以上 2000 文字以下。
- `collectedDate`: 必須。`YYYY-MM-DD`。
- `note`: 任意。1000 文字以下。
- 用例の重複チェックはしない。

### GET /terms/:termId/examples

公開 API。指定した用語に紐付く全ユーザーの用例を一覧取得する。

Response: `200 OK`

```json
{
  "items": [
    {
      "id": 1,
      "termId": 1,
      "userId": 1,
      "body": "PUT は冪等な操作として設計することが多い。",
      "collectedDate": "2026-04-28",
      "note": "API設計レビューでの発言",
      "createdAt": "2026-04-28T11:39:55+09:00",
      "updatedAt": "2026-04-28T11:39:55+09:00"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1
  }
}
```

エラー:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`: 用語が存在しない

### GET /examples/:exampleId

公開 API。用例詳細を取得する。

Response: `200 OK`

レスポンスボディは `Example`。

エラー:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`

### POST /terms/:termId/examples

認証必須 API。

Request:

```json
{
  "body": "PUT は冪等な操作として設計することが多い。",
  "collectedDate": "2026-04-28",
  "note": "API設計レビューでの発言"
}
```

Response: `201 Created`

レスポンスボディは `Example`。

エラー:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`: 用語が存在しない

### PATCH /examples/:exampleId

認証必須 API。所有者だけが更新できる。部分更新で、少なくとも 1 項目を指定する。

Request:

```json
{
  "body": "PUT は同じリクエストを複数回送っても結果が変わらないように設計する。"
}
```

更新可能項目:

- `body`
- `collectedDate`
- `note`

Response: `204 No Content`

エラー:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`: 他ユーザーの用例
- `404 NOT_FOUND`

### DELETE /examples/:exampleId

認証必須 API。所有者だけが削除できる。

Response: `204 No Content`

エラー:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`: 他ユーザーの用例
- `404 NOT_FOUND`
