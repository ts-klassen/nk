# システム A API 仕様: 書籍管理

## 概要

書籍はログインなしで CRUD できる。ユーザー登録後は Basic 認証により、自分専用の読書メモを CRUD できる。

他ユーザーの読書メモは閲覧、更新、削除できない。他ユーザーの読書メモ ID にアクセスした場合は `403 Forbidden` を返す。

## 共通仕様

### データ形式

- リクエストボディは JSON。
- レスポンスボディも JSON。
- 動的 HTML は返さない。

### 日時

- `createdAt` / `updatedAt`: `2026-04-28T11:39:55+09:00` 形式。
- `publishedDate`: `YYYY-MM-DD` 形式、または `null`。
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

`INTERNAL_SERVER_ERROR` は想定外エラー時の実装上の共通コードである。通常の教材課題で意図的に発生させる対象ではない。

### Basic 認証

読書メモ API では Basic 認証が必要。

```http
Authorization: Basic base64(username:password)
```

認証失敗時は `401 Unauthorized` とし、次のヘッダを返す。

```http
WWW-Authenticate: Basic realm="backend-training"
```

パスワードは Argon2 でハッシュ化して保存する。Argon2 はライブラリのデフォルトパラメータを使う。教材ではパスワードを平文保存せず、ハッシュ化して検証する流れまでを扱い、Argon2 パラメータ調整は扱わない。

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

## 書籍

書籍 API は全て公開 API。認証なしで作成、更新、削除できる。

### Book

```json
{
  "id": 1,
  "isbn": "9784297127473",
  "title": "Node.js入門",
  "author": "山田太郎",
  "publishedDate": "2026-04-28",
  "createdAt": "2026-04-28T11:39:55+09:00",
  "updatedAt": "2026-04-28T11:39:55+09:00"
}
```

制約:

- `isbn`: 必須。ハイフンなしの 10 桁または 13 桁。一意。
- `title`: 必須。1 文字以上 255 文字以下。
- `author`: 必須。1 文字以上 255 文字以下。
- `publishedDate`: 任意。実在する日付の `YYYY-MM-DD`。

### GET /books

Response: `200 OK`

```json
{
  "items": [
    {
      "id": 1,
      "isbn": "9784297127473",
      "title": "Node.js入門",
      "author": "山田太郎",
      "publishedDate": "2026-04-28",
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

### POST /books

Request:

```json
{
  "isbn": "9784297127473",
  "title": "Node.js入門",
  "author": "山田太郎",
  "publishedDate": "2026-04-28"
}
```

Response: `201 Created`

レスポンスボディは `Book`。

エラー:

- `400 VALIDATION_ERROR`
- `409 CONFLICT`: `isbn` が重複

### GET /books/:bookId

Path parameter:

- `bookId`: 正整数。

Response: `200 OK`

レスポンスボディは `Book`。

エラー:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`

### PATCH /books/:bookId

部分更新。少なくとも 1 項目を指定する。

Request:

```json
{
  "title": "Node.js入門 改訂版"
}
```

更新可能項目:

- `isbn`
- `title`
- `author`
- `publishedDate`

Response: `204 No Content`

エラー:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`
- `409 CONFLICT`: `isbn` が重複

### DELETE /books/:bookId

Response: `204 No Content`

エラー:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`
- `409 CONFLICT`: 読書メモが紐付いている

## 読書メモ

読書メモ API は全て Basic 認証必須。読書メモは所有者だけが閲覧、更新、削除できる。

### Note

```json
{
  "id": 1,
  "bookId": 1,
  "page": 123,
  "body": "第3章が参考になった",
  "createdAt": "2026-04-28T11:39:55+09:00",
  "updatedAt": "2026-04-28T11:39:55+09:00"
}
```

制約:

- `page`: 必須。正整数。
- `body`: 必須。1 文字以上 2000 文字以下。
- 1 ユーザーが 1 冊に複数の読書メモを作成できる。

### GET /books/:bookId/notes

指定した本に紐付く、自分の読書メモだけを一覧取得する。

Response: `200 OK`

```json
{
  "items": [
    {
      "id": 1,
      "bookId": 1,
      "page": 123,
      "body": "第3章が参考になった",
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
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`: 書籍が存在しない

### POST /books/:bookId/notes

Request:

```json
{
  "page": 123,
  "body": "第3章が参考になった"
}
```

Response: `201 Created`

レスポンスボディは `Note`。

エラー:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`: 書籍が存在しない

### GET /notes/:noteId

Response: `200 OK`

レスポンスボディは `Note`。

エラー:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`: 他ユーザーの読書メモ
- `404 NOT_FOUND`

### PATCH /notes/:noteId

部分更新。少なくとも 1 項目を指定する。

Request:

```json
{
  "body": "第3章と第4章が参考になった"
}
```

更新可能項目:

- `page`
- `body`

Response: `204 No Content`

エラー:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`: 他ユーザーの読書メモ
- `404 NOT_FOUND`

### DELETE /notes/:noteId

Response: `204 No Content`

エラー:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`: 他ユーザーの読書メモ
- `404 NOT_FOUND`
