# Node.js バックエンド研修メイン教材

## はじめに

この教材では、2 つの小さなシステムを扱う。ひとつは見本として読む `system-a`、もうひとつは自分で実装する `system-b` である。どちらも、何かを記録し、あとから探し、必要に応じて直せるようにするためのシステムである。

### 書籍管理システム

`system-a` は、書籍管理システムである。

書籍管理システムは、個人の蔵書、部署の本棚、研修用の参考書、社内図書室などで、本の情報を整理するために使う。本は、手元にあるだけでは探しにくい。誰が見ても同じ本だと分かる情報を残しておくことで、あとから一覧で見たり、特定の本を探したり、重複して登録しないようにしたりできる。

このシステムでは、書籍としてタイトル、著者、出版日、ISBN を管理する。ISBN は、書籍を識別するために出版物へ割り当てられる番号である。同じタイトルの本でも、版や出版形態が違えば別の ISBN になることがある。人間にとっての「本の名前」だけでは曖昧な場合があるため、システムでは ISBN を使って同じ本の重複登録を防ぐ。

また、このシステムでは書籍そのものだけでなく、読書メモも扱う。読書メモは、本を読んだ人が自分のために残す記録である。たとえば、参考になったページ、あとで読み返したい章、実務で使えそうな内容、疑問に思ったこと、誰かに共有したい観点などを書く。読書メモは本に紐付くが、内容は書いた本人のものなので、他の人が勝手に見たり直したりできないようにする。

### 用例採集システム

`system-b` は、用例採集システムである。

用例採集システムは、言葉の使われ方を集めるために使う。新しい業務用語、専門用語、社内だけで使われる言い回し、設計やレビューでよく出る表現は、辞書的な説明だけでは理解しにくい。実際にどの文脈で、どのような文として使われていたかを残すことで、あとから学習や共有に使える。

このシステムでは、まず用語を管理する。用語とは、意味を確認したい言葉や、チーム内で共通理解を持ちたい言葉である。たとえば「排他制御」「冪等性」「トランザクション」のような言葉を登録する。用語だけを登録しても、実際の使われ方は分からないため、このシステムでは用例も集める。

用例とは、その用語が使われている具体的な文である。たとえば、会議で出た発言、設計書の一文、コードレビューのコメント、学習中に読んだ資料の一節などが用例になる。用例には、本文だけでなく、いつ集めたか、どこで見たか、なぜ残したかといった補足メモも付けられる。用例は他の人も読めるが、登録した本人だけが直したり削除したりできる。

### この教材での進め方

第1章から第5章では、バックエンドの基本、動かし方、ファイルの役割を確認する。第6章からは、`system-a` の一部を読み、その直後に `system-b` の対応する部分を実装する。見本を全部読んでから課題を作るのではなく、機能ごとに読む、動かす、実装する、確認する、を繰り返す。

## 第 1 章 バックエンドとは何か

フロントエンドは画面を担当する。バックエンドは画面の裏側で、データとルールを担当する。

書籍管理のサーバーなら、バックエンドは次を行う。

- 書籍一覧を返す。
- 新しい書籍をデータベースに保存する。
- 不正な入力を拒否する。
- 存在しない書籍 ID に `404 Not Found` を返す。
- 同じ ISBN の本を重複登録させない。
- ログイン済みユーザーだけが読書メモを作れるようにする。

API は、別のプログラムから使うための入口である。

この教材では、HTTP でデータをやり取りする API を扱う。HTTP は、Web で要求と結果をやり取りするための決まりである。

JSON は、プログラム同士でデータを渡すための書き方である。JavaScript の object に近い形で書く。

```http
GET /books
```

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

## セットアップ

```bash
npm install
npm run db:up
```

この研修ではフロントエンドは作らない。動作確認はコマンドとテストで行う。

## 第 2 章 `curl` で HTTP を触る

`curl` は、ターミナルからサーバーに要求を送るためのコマンドである。

練習用サーバーを起動する。

```bash
npm run start:practice
```

### GET

```bash
curl -i http://127.0.0.1:3001/hello
```

`-i` はレスポンスヘッダも表示する。

status は結果番号、header は補足情報、body は中身である。

確認するもの:

- status: `200 OK`
- header: `Content-Type`
- body: `{"message":"hello"}`

### POST

```bash
curl -i -X POST http://127.0.0.1:3001/hello
```

同じ URL でも、HTTP method が違えば別の処理になる。

### query parameter

```bash
curl -i "http://127.0.0.1:3001/echo-query?word=backend"
```

`?word=backend` の部分が query parameter。後で `limit` / `offset` に使う。

### path parameter

```bash
curl -i http://127.0.0.1:3001/hello/alice
```

`/hello/:name` の `:name` に `alice` が入る。

### JSON body

```bash
curl -i -X POST http://127.0.0.1:3001/echo-body \
  -H "content-type: application/json" \
  -d '{"name":"alice"}'
```

`-H` はヘッダ、`-d` はリクエスト body を指定する。

壊れた JSON も送る。

```bash
curl -i -X POST http://127.0.0.1:3001/echo-body \
  -H "content-type: application/json" \
  -d '{"name":"alice"'
```

サーバーは `400 Bad Request` を返す。外から来る入力は信用しない。

## 第 3 章 echo エンドポイント

`system-a/src/practice-server.ts` に追加する。追加位置は `jsonErrorHandler` より前。

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

再起動する。

```bash
npm run start:practice
```

リクエストする。

```bash
curl -i -X POST "http://127.0.0.1:3001/debug/request?mode=practice" \
  -H "content-type: application/json" \
  -H "x-training-id: 001" \
  -d '{"message":"hello","count":1}'
```

`curl` のレスポンスと、サーバー側の `console.log` の両方を見る。

## 第 4 章 REST API の基本

REST API では、操作対象を URL で表し、操作内容を HTTP method で表す。

| 操作 | method | 例 | 成功 status |
| --- | --- | --- | --- |
| 一覧取得 | `GET` | `GET /books` | `200 OK` |
| 詳細取得 | `GET` | `GET /books/1` | `200 OK` |
| 作成 | `POST` | `POST /books` | `201 Created` |
| 部分更新 | `PATCH` | `PATCH /books/1` | `204 No Content` |
| 削除 | `DELETE` | `DELETE /books/1` | `204 No Content` |

URL には動詞ではなく名詞を使う。

```text
GET /books
POST /books
PATCH /books/1
DELETE /books/1
```

エラー形式は全 API でそろえる。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

主な status:

| status | 用途 |
| --- | --- |
| `400` | 入力が不正 |
| `401` | ログイン確認が必要 |
| `403` | 権限がない |
| `404` | 対象がない |
| `409` | 一意制約や外部キー制約に違反 |

## 第 5 章 system-b の土台

`system-b/src` に実装する。`system-a` と同じ分け方にすると進めやすい。

| ファイル | 役割 |
| --- | --- |
| `app.ts` | URL ごとの処理 |
| `server.ts` | サーバー起動 |
| `db.ts` | MySQL 接続と SQL 実行 |
| `errors.ts` | 共通エラーレスポンス |
| `validation.ts` | 入力チェック |
| `auth.ts` | ログイン確認 |
| `time.ts` | 日付フォーマット |
| `types.ts` | `req.user` などの型定義 |

最初に作るもの:

- `createApp()`
- `express.json()`
- 共通エラーハンドラ
- `queryRows()` / `execute()`
- `server.ts` から `createApp()` を起動する処理

確認:

```bash
npm run db:reset:b
npm run build:b
MYSQL_DATABASE=backend_training_b PORT=3001 npm run start:b
```

## 第 6 章 テーマ 1: 認証なし CRUD

認証なしは、ログインしなくても使えるという意味。

CRUD は `Create`、`Read`、`Update`、`Delete` の略。追加、取得、変更、削除のこと。

この章では、`system-a` の `books` を読んで、`system-b` の `terms` を作る。

### system-a で読む

起動する。

```bash
npm run db:reset:a
npm run build:a
MYSQL_DATABASE=backend_training_a PORT=3000 npm run start:a
```

読む場所:

- `system-a/sql/schema.sql` の `books`
- `system-a/src/app.ts` の `mapBook()`
- `system-a/src/app.ts` の `findBook()`
- `GET /books`
- `POST /books`
- `GET /books/:bookId`
- `PATCH /books/:bookId`
- `DELETE /books/:bookId`

### system-a を curl で確認

```bash
curl -i -X POST http://127.0.0.1:3000/books \
  -H "content-type: application/json" \
  -d '{
    "isbn": "9784297127473",
    "title": "Node.js入門",
    "author": "山田太郎",
    "publishedDate": "2026-04-28"
  }'

curl -i "http://127.0.0.1:3000/books?limit=10&offset=0"

curl -i http://127.0.0.1:3000/books/1

curl -i -X PATCH http://127.0.0.1:3000/books/1 \
  -H "content-type: application/json" \
  -d '{"title":"Node.js入門 改訂版"}'

curl -i -X DELETE http://127.0.0.1:3000/books/1
```

### system-b に実装

```http
GET /terms
POST /terms
GET /terms/:termId
PATCH /terms/:termId
DELETE /terms/:termId
```

`Term`:

```json
{
  "id": 1,
  "term": "排他制御",
  "createdAt": "2026-04-28T11:39:55+09:00",
  "updatedAt": "2026-04-28T11:39:55+09:00"
}
```

制約:

- `term`: 必須。1 文字以上 255 文字以下。一意。
- `limit`: 任意。デフォルト `20`。最小 `1`。最大 `100`。
- `offset`: 任意。デフォルト `0`。最小 `0`。

削除時、用例が紐付く用語は削除できない。データベースの外部キー制約エラーを `409 CONFLICT` に変換する。

確認:

```bash
npm run db:reset:b
npm run build:b
MYSQL_DATABASE=backend_training_b PORT=3001 npm run start:b
```

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

## 第 7 章 テーマ 2: ユーザー登録

この章では、`system-a` の `POST /users` を読んで、`system-b` に実装する。

### system-a で読む

- `system-a/sql/schema.sql` の `users`
- `system-a/src/app.ts` の `mapUser()`
- `system-a/src/app.ts` の `POST /users`
- `system-a/src/errors.ts`

確認:

```bash
curl -i -X POST http://127.0.0.1:3000/users \
  -H "content-type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```

確認すること:

- レスポンスに `password` / `passwordHash` を含めない。
- データベースには Argon2 のハッシュを保存する。
- `username` 重複は `409 CONFLICT`。

### system-b に実装

```http
POST /users
```

制約:

- `username`: 必須。半角英数字と `_` のみ。3 文字以上 32 文字以下。一意。
- `password`: 必須。8 文字以上 72 文字以下。

流れ:

```text
入力チェック
  -> argon2.hash()
  -> INSERT INTO users
  -> 作成した行を SELECT
  -> password_hash を含めず 201 Created
```

確認:

```bash
npm run build:b
MYSQL_DATABASE=backend_training_b PORT=3001 npm run start:b
```

```bash
curl -i -X POST http://127.0.0.1:3001/users \
  -H "content-type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```

## 第 8 章 テーマ 3: 認証付き CRUD

認証とは、リクエストしてきた相手が誰か確認すること。この教材では Basic 認証を使う。

```http
Authorization: Basic base64(username:password)
```

`curl` では `-u` を使う。

```bash
curl -i -u alice:password123 http://127.0.0.1:3000/books/1/reading-notes
```

`401` と `403`:

| status | 意味 |
| --- | --- |
| `401` | 認証できていない |
| `403` | 認証済みだが権限がない |

### system-a で読む

- `system-a/src/auth.ts`
- `system-a/src/types.ts`
- `system-a/src/app.ts` の `mapReadingNote()`
- `system-a/src/app.ts` の `findReadingNote()`
- `system-a/src/app.ts` の `assertOwnReadingNote()`
- `GET /books/:bookId/reading-notes`
- `POST /books/:bookId/reading-notes`
- `GET /reading-notes/:noteId`
- `PATCH /reading-notes/:noteId`
- `DELETE /reading-notes/:noteId`

確認:

```bash
curl -i -u alice:password123 -X POST http://127.0.0.1:3000/books/1/reading-notes \
  -H "content-type: application/json" \
  -d '{"page":123,"body":"第3章が参考になった"}'
```

### system-b に実装

```http
GET /terms/:termId/examples
POST /terms/:termId/examples
GET /examples/:exampleId
PATCH /examples/:exampleId
DELETE /examples/:exampleId
```

`Example`:

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

system-a との違い:

| 操作 | system-a 読書メモ | system-b 用例 |
| --- | --- | --- |
| 一覧取得 | 認証必須。自分の読書メモだけ | 認証不要。全ユーザーの用例 |
| 詳細取得 | 認証必須。所有者だけ | 認証不要。誰でも閲覧可能 |
| 作成 | 認証必須 | 認証必須 |
| 更新 | 認証必須。所有者だけ | 認証必須。所有者だけ |
| 削除 | 認証必須。所有者だけ | 認証必須。所有者だけ |

確認:

```bash
npm run db:reset:b
npm run build:b
MYSQL_DATABASE=backend_training_b PORT=3001 npm run start:b
```

```bash
curl -i -X POST http://127.0.0.1:3001/users \
  -H "content-type: application/json" \
  -d '{"username":"alice","password":"password123"}'

curl -i -X POST http://127.0.0.1:3001/terms \
  -H "content-type: application/json" \
  -d '{"term":"トランザクション"}'

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

## 第 9 章 対応表

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

## 第 10 章 公開テスト

全 API を実装したら実行する。

```bash
npm run test:b
```

手動確認用に `PORT=3001 npm run start:b` を起動している場合は、止めてから実行する。

## 参考資料

- `docs/system-a/api.md`
- `docs/system-a/lesson.md`
- `docs/system-a/testing.md`
- `docs/system-b/api.md`
- `docs/system-b/assignment.md`
- `docs/consistency.md`
