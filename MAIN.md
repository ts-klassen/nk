# Node.js バックエンド研修メイン教材

## この教材のゴール

この研修では、完成済みの `system-a` を少しずつ読みながら、対応する `system-b` の機能を自分で実装する。

進め方は、`system-a` を全部読み終えてから `system-b` を作る形ではない。テーマごとに次の流れを繰り返す。

1. HTTP と API の考え方を確認する。
2. `system-a` の該当部分を読む。
3. `curl` で `system-a` の動作を確認する。
4. `system-b` の該当部分を実装する。
5. `curl` または公開テストで確認する。

実装テーマの順番は次のとおりである。

1. 認証なし CRUD: `books` を見て `terms` を作る。
2. ユーザー登録: `system-a` の `POST /users` を見て `system-b` に作る。
3. 認証付き CRUD: 読書メモと Basic 認証を見て、用例 API を作る。

各テーマの終了時点で、`system-b` はビルドでき、サーバーとして起動でき、そのテーマで実装した API を `curl` で確認できる状態にする。後続テーマの API は未実装でよい。未実装の URL は共通 fallback により `404 NOT_FOUND` を返せばよい。

公開テスト `npm run test:b` は、基本的に全テーマを実装した最後の確認で使う。途中段階で実行すると、後続テーマの API が未実装なので失敗する。

最終的には、次を説明・実装できる状態を目指す。

- バックエンドが担当する責務
- HTTP request / response の構成要素
- `curl` による API 呼び出し
- Express のルーティング
- REST API の基本的な URL と HTTP method の使い分け
- MySQL を使った CRUD
- 入力バリデーション
- 共通エラーレスポンス
- Basic 認証
- 所有者チェック
- `system-b` の公開テスト成功

JavaScript / TypeScript の文法は、フロントエンド課題で学習済みである前提で進める。この教材では、HTTP で JSON を受け取り、DB を操作し、JSON を返すバックエンドの作り方に集中する。

## 研修で扱うシステム

このリポジトリには 2 つのシステムがある。

| システム | 位置づけ | 内容 |
| --- | --- | --- |
| `system-a` | 教材用の完成実装 | 書籍管理 API |
| `system-b` | 受講生が実装する課題 | 用例採集 API |

`system-a` は答えを見る対象である。ただし、最初から全部を理解しようとしなくてよい。テーマごとに必要なルート、SQL、バリデーション、エラー処理だけを読む。

`system-b` は最終的に自作する対象である。`system-a` と構造は似ているが、扱うデータと一部の認証ルールが違う。名前の置き換えだけで進めず、「どのリソースに対する操作か」「どの操作に認証が必要か」「どのエラーを返すべきか」を確認しながら実装する。

## 事前準備

必要なもの:

- Node.js 22 以上
- npm
- Docker Compose
- `curl`

最初に依存関係をインストールし、MySQL を起動する。

```bash
npm install
npm run db:up
```

この研修では、フロントエンドは作らない。ブラウザ画面ではなく、`curl` と公開テストから API の動作を確認する。

## 第 1 章 バックエンドとは何か

### フロントエンドとバックエンド

Web アプリケーションは、大きくフロントエンドとバックエンドに分かれる。

フロントエンドは、ユーザーが直接触る画面を担当する。ボタンを押す、フォームに入力する、一覧を表示する、といった体験を作る。

バックエンドは、画面の裏側でデータとルールを担当する。

書籍管理 API なら、バックエンドは次のような仕事をする。

- 書籍一覧を返す。
- 新しい書籍を DB に保存する。
- 不正な入力を拒否する。
- 存在しない書籍 ID に `404 Not Found` を返す。
- 同じ ISBN の本を重複登録させない。
- 認証済みユーザーだけが読書メモを作れるようにする。

フロントエンドは「ユーザーに見える画面」を作る。バックエンドは「データを正しく扱う窓口」を作る。

### API とは何か

API は、別のプログラムから使うための入口である。

この研修で扱う API は、HTTP で JSON をやり取りする API である。

例:

```http
GET /books
```

このリクエストに対して、バックエンドは次のような JSON を返す。

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

ブラウザ画面は返さない。HTML ではなく、JSON を返す。

### リクエストとレスポンス

HTTP は、基本的にリクエストとレスポンスの往復で成り立つ。

リクエストには主に次の情報が入る。

| 要素 | 例 | 役割 |
| --- | --- | --- |
| method | `GET` / `POST` / `PATCH` / `DELETE` | 何をしたいか |
| path | `/books/1` | どの対象に対する操作か |
| query | `?limit=20&offset=0` | URL で渡す追加条件 |
| header | `Content-Type: application/json` | リクエストのメタ情報 |
| body | `{"title":"Node.js入門"}` | 作成・更新したいデータ |

レスポンスには主に次の情報が入る。

| 要素 | 例 | 役割 |
| --- | --- | --- |
| status | `200` / `201` / `400` / `404` | 処理結果を表す番号 |
| header | `Content-Type: application/json` | レスポンスのメタ情報 |
| body | `{"id":1,"title":"Node.js入門"}` | 返却データ |

バックエンド実装では、リクエストを読み、必要な処理を行い、適切なレスポンスを返す。

## 第 2 章 `curl` で HTTP を触る

### 練習用サーバーを起動する

最初は DB を使わない練習用サーバーを使う。

```bash
npm run start:practice
```

起動すると、通常は `http://127.0.0.1:3001` で待ち受ける。

別のターミナルから API を呼ぶ。

```bash
curl -i http://127.0.0.1:3001/hello
```

`-i` はレスポンスヘッダも表示するオプションである。最初のうちは必ず付ける。status と header を読む練習になる。

期待するレスポンス例:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"message":"hello"}
```

### GET と POST

`GET` はデータを取得するために使う。

```bash
curl -i http://127.0.0.1:3001/hello
```

`POST` はデータを作成する、またはサーバーに処理を依頼するために使う。

```bash
curl -i -X POST http://127.0.0.1:3001/hello
```

レスポンスの status に注目する。

- `GET /hello` は `200 OK`
- `POST /hello` は `201 Created`

同じ `/hello` でも、HTTP method が違えば別の API として扱われる。

### query parameter

URL の `?` 以降は query parameter である。

```bash
curl -i "http://127.0.0.1:3001/echo-query?word=backend"
```

レスポンス:

```json
{
  "word": "backend"
}
```

query parameter は、一覧取得のページングによく使う。

```bash
curl -i "http://127.0.0.1:3000/books?limit=10&offset=0"
```

### path parameter

URL の一部を値として扱うこともある。

```bash
curl -i http://127.0.0.1:3001/hello/alice
```

`/hello/:name` の `:name` に `alice` が入る。

レスポンス:

```json
{
  "message": "hello, alice"
}
```

後で出てくる `/books/1` や `/terms/1` も同じ考え方である。

### JSON body

`POST` や `PATCH` では、JSON の body を送る。

```bash
curl -i -X POST http://127.0.0.1:3001/echo-body \
  -H "content-type: application/json" \
  -d '{"name":"alice"}'
```

重要なのは `-H "content-type: application/json"` である。サーバーはこの header を見て、body を JSON として解釈する。

`-d` はリクエスト body を指定するオプションである。

レスポンス:

```json
{
  "name": "alice",
  "message": "hello, alice"
}
```

### 壊れた JSON

次のリクエストは JSON として壊れている。

```bash
curl -i -X POST http://127.0.0.1:3001/echo-body \
  -H "content-type: application/json" \
  -d '{"name":"alice"'
```

練習用サーバーは `400 Bad Request` を返す。

```json
{
  "error": {
    "code": "INVALID_JSON",
    "message": "JSON の形が不正です"
  }
}
```

ここで覚えることは、サーバーは「リクエストが正しい形で来る」と仮定してはいけない、という点である。

## 第 3 章 echo エンドポイントを作って HTTP を観察する

### debug エンドポイントを追加する

`system-a/src/practice-server.ts` を開き、`jsonErrorHandler` より前に次のコードを追加する。

```ts
app.post("/debug/request", (req: Request, res: Response) => {
  console.log("method:", req.method);
  console.log("path:", req.path);
  console.log("query:", req.query);
  console.log("headers:", req.headers);
  console.log("body:", req.body);

  res.json({
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      contentType: req.header("content-type"),
      trainingId: req.header("x-training-id")
    },
    body: req.body
  });
});
```

追加したら、練習用サーバーを再起動する。

```bash
npm run start:practice
```

### header と body を送る

別のターミナルで実行する。

```bash
curl -i -X POST "http://127.0.0.1:3001/debug/request?mode=practice" \
  -H "content-type: application/json" \
  -H "x-training-id: 001" \
  -d '{"message":"hello","count":1}'
```

見る場所は 2 つある。

1. `curl` を実行したターミナルのレスポンス
2. サーバーを起動しているターミナルの `console.log`

`console.log` に次の情報が出ることを確認する。

- `req.method`
- `req.path`
- `req.query`
- `req.headers`
- `req.body`

`content-type` を外した場合に `req.body` がどうなるかも確認する。

```bash
curl -i -X POST http://127.0.0.1:3001/debug/request \
  -d '{"message":"no content type"}'
```

ここまでで、HTTP リクエストの主要な要素を一通り見た。

## 第 4 章 REST API の基本

### リソースを URL で表す

REST API では、操作対象を URL で表し、操作内容を HTTP method で表す。

`system-a` の主なリソースは次の 3 つである。

| リソース | URL 例 |
| --- | --- |
| ユーザー | `/users` |
| 書籍 | `/books`, `/books/:bookId` |
| 読書メモ | `/books/:bookId/reading-notes`, `/reading-notes/:noteId` |

URL には動詞ではなく名詞を使う。

よい例:

```text
GET /books
POST /books
PATCH /books/1
DELETE /books/1
```

避ける例:

```text
GET /getBooks
POST /createBook
POST /deleteBook
```

### HTTP method の使い分け

| 操作 | method | 例 | 成功 status |
| --- | --- | --- | --- |
| 一覧取得 | `GET` | `GET /books` | `200 OK` |
| 詳細取得 | `GET` | `GET /books/1` | `200 OK` |
| 作成 | `POST` | `POST /books` | `201 Created` |
| 部分更新 | `PATCH` | `PATCH /books/1` | `204 No Content` |
| 削除 | `DELETE` | `DELETE /books/1` | `204 No Content` |

この研修では、更新と削除の成功時に body を返さず、`204 No Content` を返す。

### status code は仕様である

バックエンドは、JSON の中身だけでなく status code でも結果を伝える。

| status | 意味 | この教材での例 |
| --- | --- | --- |
| `200 OK` | 取得成功 | 一覧・詳細取得 |
| `201 Created` | 作成成功 | ユーザー・書籍・用語の作成 |
| `204 No Content` | body なしで成功 | 更新・削除 |
| `400 Bad Request` | 入力が不正 | ISBN 形式不正、日付不正 |
| `401 Unauthorized` | 認証が必要 | Basic 認証なし |
| `403 Forbidden` | 権限がない | 他ユーザーのデータを更新しようとした |
| `404 Not Found` | 対象がない | 存在しない ID |
| `409 Conflict` | データ状態と競合 | 一意制約違反、外部キー制約違反 |
| `500 Internal Server Error` | 想定外のサーバーエラー | バグや DB 障害など |

エラー時の body は全 API で同じ形にする。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

API ごとに違うエラー形式を返すと、呼び出し側が扱いづらい。共通形式は API 設計の重要な一部である。

## 第 5 章 実装前に読むファイル

### system-a の主要ファイル

| ファイル | 役割 |
| --- | --- |
| `system-a/src/server.ts` | HTTP サーバーを起動する |
| `system-a/src/app.ts` | Express アプリ本体。API ルートを定義する |
| `system-a/src/db.ts` | MySQL 接続と SQL 実行 |
| `system-a/src/errors.ts` | 共通エラー型とエラーハンドラ |
| `system-a/src/validation.ts` | 入力バリデーション |
| `system-a/src/auth.ts` | Basic 認証 |
| `system-a/src/time.ts` | 日付フォーマット |
| `system-a/sql/schema.sql` | DB テーブル定義 |

読むときは、リクエストの流れに沿う。

```text
curl
  -> Express
  -> app.get() / app.post() / app.patch() / app.delete()
  -> validator
  -> SQL
  -> mapper
  -> res.status(...).json(...) または res.status(...).send()
```

### system-b の実装場所

`system-b/src` に実装する。

最初は `system-b/src/server.ts` だけがある。必要に応じてファイルを追加してよい。

`system-a` と同じ分け方にすると進めやすい。

| 追加候補 | 役割 |
| --- | --- |
| `system-b/src/app.ts` | Express アプリ本体 |
| `system-b/src/db.ts` | MySQL 接続と SQL 実行 |
| `system-b/src/errors.ts` | 共通エラー |
| `system-b/src/validation.ts` | 入力バリデーション |
| `system-b/src/auth.ts` | Basic 認証 |
| `system-b/src/time.ts` | 日付フォーマット |
| `system-b/src/types.ts` | Express の型拡張など |

### 最初に作る共通土台

`system-b` の CRUD に入る前に、次の土台を作る。

- `createApp()`
- `express.json()`
- 存在しない URL の `404 NOT_FOUND`
- 共通エラーハンドラ
- `server.ts` から `createApp()` を起動する構成
- `db.ts` の `queryRows()` と `execute()`

DB 名のデフォルトは `backend_training_b` にする。

```bash
npm run db:reset:b
npm run build:b
```

この時点でも `system-b` は起動できる状態にする。

```bash
MYSQL_DATABASE=backend_training_b PORT=3001 npm run start:b
```

以降、`system-b/src` を変更したら `npm run build:b` を実行し直す。すでに `system-b` を起動している場合は、起動中のプロセスを止めてから再起動する。

まだ `terms`、`users`、`examples` は未実装でよい。存在しない URL は `404 NOT_FOUND` を返す。

## 第 6 章 テーマ 1: 認証なし CRUD

この章では、`system-a` の書籍 CRUD を読んで、`system-b` の用語 CRUD を実装する。

### system-a で読むもの

まず `system-a` を起動する。

```bash
npm run db:reset:a
npm run build:a
MYSQL_DATABASE=backend_training_a PORT=3000 npm run start:a
```

読む場所:

- `system-a/sql/schema.sql` の `books`
- `system-a/src/app.ts` の `mapBook()`
- `system-a/src/app.ts` の `findBook()`
- `system-a/src/app.ts` の `GET /books`
- `system-a/src/app.ts` の `POST /books`
- `system-a/src/app.ts` の `GET /books/:bookId`
- `system-a/src/app.ts` の `PATCH /books/:bookId`
- `system-a/src/app.ts` の `DELETE /books/:bookId`
- `system-a/src/validation.ts`
- `system-a/src/errors.ts`

書籍の API はすべて認証不要である。`system-b` の用語 API も同じく認証不要である。

### system-a を curl で確認する

書籍を作る。

```bash
curl -i -X POST http://127.0.0.1:3000/books \
  -H "content-type: application/json" \
  -d '{
    "isbn": "9784297127473",
    "title": "Node.js入門",
    "author": "山田太郎",
    "publishedDate": "2026-04-28"
  }'
```

一覧を取得する。

```bash
curl -i "http://127.0.0.1:3000/books?limit=10&offset=0"
```

詳細を取得する。

```bash
curl -i http://127.0.0.1:3000/books/1
```

部分更新する。

```bash
curl -i -X PATCH http://127.0.0.1:3000/books/1 \
  -H "content-type: application/json" \
  -d '{"title":"Node.js入門 改訂版"}'
```

削除する。

```bash
curl -i -X DELETE http://127.0.0.1:3000/books/1
```

### CRUD で見る実装パターン

`POST /books` の流れ:

```text
入力バリデーション
  -> INSERT
  -> 作成した行を SELECT
  -> mapper で JSON 形式へ変換
  -> 201 Created
```

`GET /books` の流れ:

```text
limit / offset のバリデーション
  -> COUNT(*) で total を取得
  -> SELECT ... LIMIT ? OFFSET ?
  -> items と pagination を返す
```

`PATCH /books/:bookId` の流れ:

```text
path parameter と body のバリデーション
  -> 対象の存在確認
  -> 指定された項目だけ UPDATE
  -> 204 No Content
```

`DELETE /books/:bookId` の流れ:

```text
path parameter のバリデーション
  -> 対象の存在確認
  -> DELETE
  -> 外部キー制約エラーなら 409 CONFLICT
  -> 削除成功なら 204 No Content
```

子データの件数を事前に数えて判断しない。親を参照する子データがある場合は、DB の外部キー制約が DELETE を止める。その MySQL エラーを `409 CONFLICT` に変換する。

### system-b に実装するもの

用語 CRUD を実装する。

```http
GET /terms
POST /terms
GET /terms/:termId
PATCH /terms/:termId
DELETE /terms/:termId
```

`Term` のレスポンス形:

```json
{
  "id": 1,
  "term": "排他制御",
  "createdAt": "2026-04-28T11:39:55+09:00",
  "updatedAt": "2026-04-28T11:39:55+09:00"
}
```

一覧レスポンス:

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

制約:

- `term`: 必須。1 文字以上 255 文字以下。一意。
- `limit`: 任意。デフォルト `20`。最小 `1`。最大 `100`。
- `offset`: 任意。デフォルト `0`。最小 `0`。

確認用 curl:

```bash
npm run db:reset:b
npm run build:b
MYSQL_DATABASE=backend_training_b PORT=3001 npm run start:b
```

別ターミナル:

```bash
curl -i -X POST http://127.0.0.1:3001/terms \
  -H "content-type: application/json" \
  -d '{"term":"排他制御"}'

curl -i "http://127.0.0.1:3001/terms?limit=10&offset=0"

curl -i http://127.0.0.1:3001/terms/1

curl -i -X PATCH http://127.0.0.1:3001/terms/1 \
  -H "content-type: application/json" \
  -d '{"term":"トランザクション制御"}'

curl -i -X DELETE http://127.0.0.1:3001/terms/1
```

`DELETE /terms/:termId` では、用例が紐付いている場合 `409 CONFLICT` を返す。実装では、`examples.term_id` の外部キー制約で MySQL が削除を止め、そのエラーを `409` に変換する。

この章の終了時点では、`users` と `examples` は未実装でよい。`system-b` は起動でき、`/terms` 系の API が動き、未実装の `/users` や `/examples` 系 API は `404 NOT_FOUND` を返せばよい。

この章だけの確認では `npm run test:b` は成功しない。公開テストにはユーザー登録と認証付き CRUD の確認も含まれるためである。

## 第 7 章 テーマ 2: ユーザー登録

この章では、`system-a` のユーザー登録を読んで、`system-b` に同じ `POST /users` を実装する。

### system-a で読むもの

読む場所:

- `system-a/sql/schema.sql` の `users`
- `system-a/src/app.ts` の `mapUser()`
- `system-a/src/app.ts` の `POST /users`
- `system-a/src/errors.ts` の重複エラー変換
- `system-a/src/validation.ts`

ユーザー登録 API は公開 API である。Basic 認証はまだ使わない。

### system-a を curl で確認する

```bash
curl -i -X POST http://127.0.0.1:3000/users \
  -H "content-type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```

確認すること:

- status が `201 Created`
- レスポンスに `id` と `username` が含まれる
- レスポンスに `password` や `passwordHash` が含まれない
- DB には平文パスワードではなく Argon2 のハッシュが保存される

同じ `username` でもう一度登録すると `409 CONFLICT` になる。

### system-b に実装するもの

実装する API:

```http
POST /users
```

制約:

- `username`: 必須。半角英数字と `_` のみ。3 文字以上 32 文字以下。一意。
- `password`: 必須。8 文字以上 72 文字以下。

実装の流れ:

```text
入力バリデーション
  -> argon2.hash()
  -> INSERT INTO users (username, password_hash)
  -> 作成した行を SELECT
  -> password_hash を含めず 201 Created
```

重複 `username` は MySQL の一意制約エラーを `409 CONFLICT` に変換する。

確認用 curl:

```bash
npm run build:b
MYSQL_DATABASE=backend_training_b PORT=3001 npm run start:b
```

別ターミナル:

```bash
curl -i -X POST http://127.0.0.1:3001/users \
  -H "content-type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```

この章の終了時点では、`terms` と `users` が動く状態にする。`examples` 系 API は未実装でよい。未実装の URL は共通エラー形式で `404 NOT_FOUND` を返す。

この章の終了時点でも `npm run test:b` はまだ成功しない。認証付きの用例 API が未実装だからである。

## 第 8 章 テーマ 3: 認証付き CRUD

この章では、`system-a` の Basic 認証と読書メモ API を読んで、`system-b` の用例 API を実装する。

### system-a で読むもの

読む場所:

- `system-a/src/auth.ts`
- `system-a/src/types.ts`
- `system-a/src/app.ts` の `mapReadingNote()`
- `system-a/src/app.ts` の `findReadingNote()`
- `system-a/src/app.ts` の `assertOwnReadingNote()`
- `system-a/src/app.ts` の `GET /books/:bookId/reading-notes`
- `system-a/src/app.ts` の `POST /books/:bookId/reading-notes`
- `system-a/src/app.ts` の `GET /reading-notes/:noteId`
- `system-a/src/app.ts` の `PATCH /reading-notes/:noteId`
- `system-a/src/app.ts` の `DELETE /reading-notes/:noteId`

Basic 認証では、次の header を送る。

```http
Authorization: Basic base64(username:password)
```

`curl` では `-u` を使える。

```bash
curl -i -u alice:password123 http://127.0.0.1:3000/books/1/reading-notes
```

### 401 と 403

認証・認可では `401` と `403` の違いが重要である。

| status | 意味 | 例 |
| --- | --- | --- |
| `401 Unauthorized` | 認証できていない | header がない、パスワードが間違っている |
| `403 Forbidden` | 認証済みだが権限がない | 他ユーザーのデータを更新しようとした |

`401 Unauthorized` では次の header も返す。

```http
WWW-Authenticate: Basic realm="backend-training"
```

### system-a を curl で確認する

先にユーザーと書籍を作成しておく。

```bash
curl -i -X POST http://127.0.0.1:3000/users \
  -H "content-type: application/json" \
  -d '{"username":"alice","password":"password123"}'

curl -i -X POST http://127.0.0.1:3000/books \
  -H "content-type: application/json" \
  -d '{
    "isbn": "9784297127473",
    "title": "Node.js入門",
    "author": "山田太郎",
    "publishedDate": "2026-04-28"
  }'
```

読書メモを作る。

```bash
curl -i -u alice:password123 -X POST http://127.0.0.1:3000/books/1/reading-notes \
  -H "content-type: application/json" \
  -d '{"page":123,"body":"第3章が参考になった"}'
```

認証を外すと `401 Unauthorized` になる。

```bash
curl -i -X POST http://127.0.0.1:3000/books/1/reading-notes \
  -H "content-type: application/json" \
  -d '{"page":123,"body":"認証なし"}'
```

### system-b の用例 API の違い

`system-b` の用例は、閲覧だけは認証不要である。作成、更新、削除には Basic 認証が必要である。

| 操作 | system-a 読書メモ | system-b 用例 |
| --- | --- | --- |
| 一覧取得 | 認証必須。自分の読書メモだけ返す | 認証不要。全ユーザーの用例を返す |
| 詳細取得 | 認証必須。所有者だけ閲覧可能 | 認証不要。誰でも閲覧可能 |
| 作成 | 認証必須 | 認証必須 |
| 更新 | 認証必須。所有者だけ | 認証必須。所有者だけ |
| 削除 | 認証必須。所有者だけ | 認証必須。所有者だけ |

この違いを間違えない。

### system-b に実装するもの

実装する API:

```http
GET /terms/:termId/examples
POST /terms/:termId/examples
GET /examples/:exampleId
PATCH /examples/:exampleId
DELETE /examples/:exampleId
```

`Example` のレスポンス形:

```json
{
  "id": 1,
  "termId": 1,
  "userId": 1,
  "body": "トランザクションは複数の処理をひとまとまりとして扱う。",
  "collectedDate": "2026-04-28",
  "note": "研修中の説明",
  "createdAt": "2026-04-28T11:39:55+09:00",
  "updatedAt": "2026-04-28T11:39:55+09:00"
}
```

制約:

- `body`: 必須。1 文字以上 2000 文字以下。
- `collectedDate`: 必須。実在する日付の `YYYY-MM-DD`。
- `note`: 任意。1000 文字以下。

作成の流れ:

```text
Basic 認証
  -> path parameter と body のバリデーション
  -> 用語の存在確認
  -> INSERT INTO examples
  -> 作成した行を SELECT
  -> 201 Created
```

更新の流れ:

```text
Basic 認証
  -> path parameter と body のバリデーション
  -> 用例の存在確認
  -> examples.user_id と req.user.id を比較
  -> 他ユーザーなら 403 FORBIDDEN
  -> 指定された項目だけ UPDATE
  -> 204 No Content
```

削除の流れ:

```text
Basic 認証
  -> path parameter のバリデーション
  -> 用例の存在確認
  -> examples.user_id と req.user.id を比較
  -> 他ユーザーなら 403 FORBIDDEN
  -> DELETE
  -> 204 No Content
```

確認用に最初から動かす場合は、DB を初期化して、ユーザーと用語を先に作る。

```bash
npm run db:reset:b
npm run build:b
MYSQL_DATABASE=backend_training_b PORT=3001 npm run start:b
```

別ターミナル:

```bash
curl -i -X POST http://127.0.0.1:3001/users \
  -H "content-type: application/json" \
  -d '{"username":"alice","password":"password123"}'

curl -i -X POST http://127.0.0.1:3001/terms \
  -H "content-type: application/json" \
  -d '{"term":"トランザクション"}'
```

DB 初期化直後なら、上の用語 ID は通常 `1` になる。続けて用例 API を確認する。

```bash
curl -i -u alice:password123 -X POST http://127.0.0.1:3001/terms/1/examples \
  -H "content-type: application/json" \
  -d '{
    "body": "トランザクションは複数の処理をひとまとまりとして扱う。",
    "collectedDate": "2026-04-28",
    "note": "研修中の説明"
  }'

curl -i http://127.0.0.1:3001/terms/1/examples

curl -i http://127.0.0.1:3001/examples/1

curl -i -u alice:password123 -X PATCH http://127.0.0.1:3001/examples/1 \
  -H "content-type: application/json" \
  -d '{"body":"更新後の用例本文"}'

curl -i -u alice:password123 -X DELETE http://127.0.0.1:3001/examples/1
```

この章の終了時点で、`system-b` の全 API が実装済みになる。この段階で `npm run test:b` を実行し、公開テストの成功を確認する。

## 第 9 章 system-a と system-b の対応表

### API 対応

| system-a | system-b |
| --- | --- |
| `POST /users` | `POST /users` |
| `GET /books` | `GET /terms` |
| `POST /books` | `POST /terms` |
| `GET /books/:bookId` | `GET /terms/:termId` |
| `PATCH /books/:bookId` | `PATCH /terms/:termId` |
| `DELETE /books/:bookId` | `DELETE /terms/:termId` |
| `GET /books/:bookId/reading-notes` | `GET /terms/:termId/examples` |
| `POST /books/:bookId/reading-notes` | `POST /terms/:termId/examples` |
| `GET /reading-notes/:noteId` | `GET /examples/:exampleId` |
| `PATCH /reading-notes/:noteId` | `PATCH /examples/:exampleId` |
| `DELETE /reading-notes/:noteId` | `DELETE /examples/:exampleId` |

### DB 対応

| 論点 | system-a | system-b |
| --- | --- | --- |
| 認証用ユーザー | `users` | `users` |
| 親リソース | `books` | `terms` |
| 子リソース | `reading_notes` | `examples` |
| 親の一意制約 | `books.isbn` | `terms.term` |
| 子の所有者 | `reading_notes.user_id` | `examples.user_id` |
| 親子の紐付け | `reading_notes.book_id` | `examples.term_id` |
| 子の本文 | `reading_notes.body` | `examples.body` |
| 子の固有項目 | `page` | `collected_date`, `note` |
| 親削除時の子データ | 外部キー制約エラーを `409` に変換 | 外部キー制約エラーを `409` に変換 |

## 第 10 章 公開テストで確認する

実装を進めるたびにビルドする。

```bash
npm run build:b
```

最後に公開テストを実行する。

```bash
npm run test:b
```

`npm run test:b` は TypeScript をビルドしてから、`system-b/test/system-b.test.mjs` を実行する。

手動確認用に `PORT=3001 npm run start:b` を起動したままにしている場合、公開テストも同じ port を使うため衝突する。テスト実行前に手動起動したサーバーは止める。

失敗した場合は、次を確認する。

- どのテスト名が失敗しているか。
- 期待 status と実際 status は何か。
- 期待 body と実際 body は何か。
- API 仕様では何を返すべきか。
- `system-a` の対応する実装はどこか。

テストを直すのではなく、実装を仕様に合わせる。

## 完了条件

`system-b` の完了条件は次のとおりである。

```bash
npm run test:b
```

が成功する。

加えて、次を自分で説明できる状態にする。

- バックエンドが担当する責務
- HTTP request / response の構成要素
- `GET` / `POST` / `PATCH` / `DELETE` の使い分け
- `200` / `201` / `204` / `400` / `401` / `403` / `404` / `409` の意味
- REST API で URL をリソースとして設計する理由
- `req.params` / `req.query` / `req.body` / `req.headers` の違い
- 入力バリデーションが必要な理由
- DB の主キー、外部キー、一意制約の役割
- 外部キー制約エラーを `409 CONFLICT` に変換する理由
- Basic 認証の流れ
- `401` と `403` の違い
- `system-a` と `system-b` の仕様差分

## 参考資料

詳細仕様は次のファイルを参照する。

- `docs/system-a/api.md`
- `docs/system-a/lesson.md`
- `docs/system-a/testing.md`
- `docs/system-b/api.md`
- `docs/system-b/assignment.md`
- `docs/consistency.md`

迷ったら、まず API 仕様を読む。次に `system-a` の対応する実装を読む。その後で `system-b` に実装する。
