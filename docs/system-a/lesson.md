# システム A 教材: 書籍管理 API

## この教材の目的

この教材では、書籍管理 API を題材にしてバックエンド開発の基本を学ぶ。

バックエンド未経験者は、先に [../../MAIN.md](../../MAIN.md) の「第 0 章 固定値を返す API を呼ぶ」で、`curl`、`GET`、`POST`、値の渡し方を確認する。

Node.js や Express の高度な使い方を覚えることは目的ではない。HTTP で JSON を返す API を作りながら、DB 連携、入力バリデーション、エラーハンドリング、Basic 認証を、別のバックエンド言語でも使える考え方として扱う。

## 作るもの

書籍管理 API を作る。

- ログイン不要で書籍を作成、取得、更新、削除できる。
- ユーザー登録すると、自分専用の読書メモを作成、取得、更新、削除できる。
- ログインした状態で、本に紐付いた自分の読書メモを一覧取得できる。
- 他ユーザーの読書メモは閲覧、更新、削除できない。

API 仕様は [api.md](api.md) を参照する。

## 使う技術

- Node.js 22 以上
- TypeScript
- Express v5
- MySQL
- Docker Compose
- `mysql2`
- `express-validator`
- `argon2`

ORM、migration ツール、JWT、セッション管理は使わない。

## セットアップ

```bash
npm install
npm run db:up
npm run db:reset:a
npm run build:a
MYSQL_DATABASE=backend_training_a PORT=3000 npm run start:a
```

別のターミナルから API を呼ぶ。

```bash
curl -s http://127.0.0.1:3000/books
```

## REST API と Express

### 到達目標

- HTTP メソッドとステータスコードの役割を説明できる。
- JSON を受け取り、JSON を返す API を理解できる。
- Express のルーティングを読める。
- 共通エラーレスポンスの形を理解できる。

### REST API の基本

この教材では、リソースを URL で表し、操作を HTTP メソッドで表す。

| 操作 | HTTP method | 例 |
| --- | --- | --- |
| 一覧取得 | `GET` | `GET /books` |
| 詳細取得 | `GET` | `GET /books/1` |
| 作成 | `POST` | `POST /books` |
| 更新 | `PATCH` | `PATCH /books/1` |
| 削除 | `DELETE` | `DELETE /books/1` |

成功時のステータスコードは次の方針にする。

- `POST`: `201 Created`
- `PATCH`: `204 No Content`
- `DELETE`: `204 No Content`
- `GET`: `200 OK`

### Express アプリ

`system-a/src/server.ts` はサーバーを起動するだけにする。API の中身は `system-a/src/app.ts` に置く。

起動だけを分けると、後でテストを書くときに Express アプリを再利用しやすい。

実装手順:

1. `system-a/src/server.ts` で `createApp()` を呼び、`app.listen()` で HTTP サーバーを起動する。
2. `system-a/src/app.ts` の `createApp()` で `express()` を作る。
3. `app.use(express.json())` を設定し、JSON リクエストボディを読めるようにする。
4. `app.get()`、`app.post()`、`app.patch()`、`app.delete()` で API 仕様に対応するルートを定義する。
5. 最後に存在しない URL を `404 NOT_FOUND` に変換する middleware と、共通エラーハンドラを登録する。

仕様とコードの対応:

| 仕様 | 対応するコード |
| --- | --- |
| JSON API | `system-a/src/app.ts` の `app.use(express.json())` |
| `GET /books` | `system-a/src/app.ts` の `app.get("/books", ...)` |
| `POST /books` | `system-a/src/app.ts` の `app.post("/books", ...)` |
| `PATCH /books/:bookId` | `system-a/src/app.ts` の `app.patch("/books/:bookId", ...)` |
| `DELETE /books/:bookId` | `system-a/src/app.ts` の `app.delete("/books/:bookId", ...)` |
| 存在しない URL の `404` | `system-a/src/app.ts` 末尾の fallback middleware |

### エラー形式

エラー時は HTML ではなく JSON を返す。

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "対象リソースが存在しません"
  }
}
```

API ごとに違う形のエラーを返すと、呼び出し側が扱いにくい。教材では全 API で同じ形式にする。

実装手順:

1. `system-a/src/errors.ts` に `AppError` を定義する。
2. API 内で想定済みのエラーは `throw new AppError(status, code, message)` で表す。
3. `errorHandler` で `AppError` を共通 JSON 形式に変換する。
4. JSON パース失敗も `400 VALIDATION_ERROR` に変換する。
5. 想定外エラーは `500 INTERNAL_SERVER_ERROR` として返す。

仕様とコードの対応:

| 仕様 | 対応するコード |
| --- | --- |
| 共通エラー形式 | `system-a/src/errors.ts` の `errorHandler` |
| `400 VALIDATION_ERROR` | `validationResult` と JSON パースエラー処理 |
| `404 NOT_FOUND` | `findBook()`、`findReadingNote()`、fallback middleware |
| `409 CONFLICT` | `isDuplicateEntry()` と削除前の子データ件数確認 |

## MySQL 連携と書籍 CRUD

### 到達目標

- Docker Compose で MySQL を起動できる。
- `schema.sql` の役割を説明できる。
- `mysql2` で SQL を実行する流れを読める。
- 書籍の CRUD を実装できる。
- `limit` / `offset` によるページングを理解できる。

### DB 初期化

この教材では migration ツールを使わない。DB は `schema.sql` から作る。

```bash
npm run db:reset:a
```

このコマンドは DB を作り直す。手元のデータは消える。

実装手順:

1. `system-a/sql/schema.sql` に `users`、`books`、`reading_notes` テーブルを定義する。
2. `scripts/reset-db.mjs` で DB を削除、作成し、`schema.sql` を実行する。
3. `npm run db:reset:a` から `scripts/reset-db.mjs system-a/sql/schema.sql backend_training_a` を呼ぶ。

仕様とコードの対応:

| 仕様 | 対応するコード |
| --- | --- |
| MySQL を Docker Compose で使う | `docker-compose.yml` |
| migration ツールを使わない | `scripts/reset-db.mjs` と `system-a/sql/schema.sql` |
| `AUTO_INCREMENT` 主キー | `system-a/sql/schema.sql` の各 `id` |
| `isbn` 一意 | `system-a/sql/schema.sql` の `uq_books_isbn` |

### SQL を直接書く

DB アクセスには `mysql2` を使う。ORM は使わない。

書籍一覧では 2 つの SQL を実行する。

- `COUNT(*)` で総件数を取る。
- `LIMIT` / `OFFSET` で一覧データを取る。

一覧レスポンスには `total` を必ず含める。

```json
{
  "items": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 0
  }
}
```

実装手順:

1. `system-a/src/db.ts` で `mysql2/promise` の connection pool を作る。
2. `queryRows()` で `SELECT` の結果を取得する。
3. `execute()` で `INSERT`、`UPDATE`、`DELETE` を実行する。
4. `GET /books` では `COUNT(*)` と `SELECT ... LIMIT ? OFFSET ?` を実行する。
5. DB の `snake_case` カラムを API の `camelCase` レスポンスへ変換する。

仕様とコードの対応:

| 仕様 | 対応するコード |
| --- | --- |
| `GET /books` の `items` | `app.get("/books", ...)` の `books.map(mapBook)` |
| `pagination.total` | `SELECT COUNT(*) AS total FROM books` |
| `limit` / `offset` | `validatePagination()` と `getPagination()` |
| 日時の `+09:00` 表記 | `system-a/src/time.ts` の `formatDateTime()` |
| `publishedDate` の `YYYY-MM-DD` | `system-a/src/time.ts` の `formatDate()` |

### 書籍削除

書籍に読書メモが紐付いている場合、書籍は削除できない。

この場合は `409 Conflict` を返す。親を削除したときに子を連動削除する設計にはしない。

実装手順:

1. `DELETE /books/:bookId` で対象書籍が存在するか `findBook()` で確認する。
2. `reading_notes` に `book_id` が一致する行があるか `COUNT(*)` で確認する。
3. 1 件以上あれば `409 CONFLICT` を返す。
4. 0 件なら `DELETE FROM books WHERE id = ?` を実行し、`204 No Content` を返す。

## 入力バリデーションとエラーハンドリング

### 到達目標

- 入力値を信用してはいけない理由を説明できる。
- `express-validator` を使って `body`、`param`、`query` を検証できる。
- `400`、`404`、`409` を使い分けられる。

### 入力バリデーション

入力バリデーションは API の入口で行う。

例:

- `bookId` は正整数である。
- `isbn` はハイフンなしの 10 桁または 13 桁である。
- `title` は空文字ではない。
- `limit` は 1 以上 100 以下である。

バリデーションエラーでは詳細配列を返さない。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

実装手順:

1. `system-a/src/validation.ts` に共通 validator を置く。
2. `validateId()` で path parameter の正整数チェックを行う。
3. `validatePagination()` で `limit` / `offset` を検証する。
4. `handleValidationErrors` で `express-validator` の結果を `400 VALIDATION_ERROR` に変換する。
5. `system-a/src/app.ts` で `body("isbn")` など API ごとの入力条件を定義する。
6. `publishedDate` は `YYYY-MM-DD` 形式だけでなく、実在する日付かも検証する。

仕様とコードの対応:

| 仕様 | 対応するコード |
| --- | --- |
| `bookId` は正整数 | `validateId("bookId")` |
| `limit` 最大 100 | `validatePagination()` |
| `isbn` は 10 桁または 13 桁 | `isbnRule()` |
| `publishedDate` は実在日付 | `isValidDateOnly()` と `publishedDateRule()` |
| 空の PATCH は `400` | `requireAtLeastOne()` |
| バリデーション詳細は返さない | `handleValidationErrors` |

### エラーの使い分け

| 状況 | status | code |
| --- | --- | --- |
| 入力値が不正 | `400` | `VALIDATION_ERROR` |
| 対象が存在しない | `404` | `NOT_FOUND` |
| `username` や `isbn` が重複 | `409` | `CONFLICT` |
| 読書メモありの書籍を削除 | `409` | `CONFLICT` |

`404` と `409` を混同しない。存在しないものを指定したら `404`、存在するが今の状態では操作できない場合は `409` と考える。

実装手順:

1. 存在確認用の `findBook()` と `findReadingNote()` を作る。
2. 対象がなければ `404 NOT_FOUND` を投げる。
3. MySQL の重複エラーは `isDuplicateEntry()` で検出し、`409 CONFLICT` に変換する。
4. 子データがある削除も `409 CONFLICT` にする。

## Basic 認証と読書メモ

### 到達目標

- Basic 認証の仕組みを説明できる。
- パスワードを平文保存してはいけない理由を説明できる。
- Argon2 でパスワードをハッシュ化できる。
- 所有者だけが扱えるリソースを実装できる。
- `401` と `403` を使い分けられる。

### ユーザー登録

ユーザー登録 API は公開 API とする。

```http
POST /users
```

パスワードは DB に平文保存しない。`argon2` でハッシュ化し、`password_hash` に保存する。

この教材では Argon2 のライブラリデフォルトパラメータを使う。パラメータ調整は扱わず、平文保存しないことと、ログイン時にハッシュを検証することに集中する。

実装手順:

1. `POST /users` で `username` と `password` を受け取る。
2. `argon2.hash()` でパスワードをハッシュ化する。
3. `users.password_hash` にハッシュ値を保存する。
4. レスポンスには `password` も `passwordHash` も含めない。
5. `username` 重複時は `409 CONFLICT` を返す。

### Basic 認証

読書メモ API では Basic 認証を要求する。

```http
Authorization: Basic base64(username:password)
```

認証失敗時は `401 Unauthorized` を返す。このとき `WWW-Authenticate: Basic realm="backend-training"` ヘッダも返す。

実装手順:

1. `system-a/src/auth.ts` に `requireAuth` middleware を作る。
2. `Authorization` ヘッダが `Basic ` で始まるか確認する。
3. Base64 をデコードし、`username:password` に分ける。
4. `users` テーブルから `username` に一致するユーザーを取得する。
5. `argon2.verify()` でパスワードを検証する。
6. 成功したら `req.user` に認証済みユーザーを入れる。
7. 失敗したら `WWW-Authenticate: Basic realm="backend-training"` を付けて `401 UNAUTHORIZED` を返す。

仕様とコードの対応:

| 仕様 | 対応するコード |
| --- | --- |
| Basic 認証必須 | 読書メモルートの `requireAuth` |
| 認証 ID は `username` | `parseBasicAuth()` と `SELECT ... WHERE username = ?` |
| `WWW-Authenticate` realm | `auth.ts` の `unauthorized()` |
| Argon2 検証 | `argon2.verify()` |

### 所有者チェック

読書メモは本人専用である。

- 自分の読書メモは閲覧、更新、削除できる。
- 他ユーザーの読書メモ ID にアクセスしたら `403 Forbidden`。
- 存在しない読書メモ ID にアクセスしたら `404 Not Found`。

`401` は認証できていない状態、`403` は認証済みだが権限がない状態で使う。

実装手順:

1. 読書メモの詳細、更新、削除ではまず `findReadingNote()` で対象メモを取得する。
2. `assertOwnReadingNote()` で `reading_notes.user_id` と `req.user.id` を比較する。
3. 一致しなければ `403 FORBIDDEN` を返す。
4. 一致した場合だけ、取得、更新、削除を続ける。
5. `GET /books/:bookId/reading-notes` では `WHERE book_id = ? AND user_id = ?` により自分のメモだけを返す。

仕様とコードの対応:

| 仕様 | 対応するコード |
| --- | --- |
| 自分のメモだけ一覧取得 | `GET /books/:bookId/reading-notes` の `WHERE book_id = ? AND user_id = ?` |
| 他ユーザーの読書メモは `403` | `assertOwnReadingNote()` |
| 読書メモ作成は認証必須 | `POST /books/:bookId/reading-notes` の `requireAuth` |
| 読書メモ更新・削除は所有者のみ | `PATCH` / `DELETE /reading-notes/:noteId` |

## 任意: API 結合テスト

任意で、Mocha / Chai で API 結合テストを書く。

単体テストではなく、DB を初期化して実際に HTTP リクエストを送るテストにする。

詳しい進め方は [testing.md](testing.md) を参照する。

テスト対象の例:

- ユーザー登録できる。
- `username` 重複時に `409` になる。
- 書籍を CRUD できる。
- 読書メモ API は認証が必要。
- 他ユーザーの読書メモは `403` になる。
- 読書メモがある書籍は削除できない。

## システム B 課題

ここまでに扱った考え方を使って、用例採集 API を一から実装する。

システム B では、システム A で扱った考え方を別ドメインに適用する。

- 書籍に相当するもの: 用語
- 読書メモに相当するもの: 用例
- 自分だけが見られる読書メモとは違い、用例は誰でも見られる
- ただし、用例の更新と削除は所有者だけができる

課題文は [../system-b/assignment.md](../system-b/assignment.md) を参照する。

## 発展課題

本編の後に任意で扱う。

### トランザクション

複数の SQL を 1 つの処理として扱いたい場合に使う。

例:

- 1 つ目の INSERT は成功した。
- 2 つ目の INSERT は失敗した。
- このとき 1 つ目だけ DB に残ると困る。

このような場合に、commit / rollback を使う。

### ストリーミング

大量のデータを一度にメモリへ載せず、少しずつ返すために使う。

例:

- 読書メモを JSON Lines でエクスポートする。
- 大量の用例を 1 行ずつ返す。

この教材の本編では扱わない。
