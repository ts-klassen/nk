# Node.js バックエンド研修メイン教材

## はじめに

この教材では、2 つの小さなシステムを扱う。ひとつは見本として参照する `system-a`、もうひとつは課題として実装する `system-b` である。どちらも、何かを記録し、後から探し、必要に応じて直せるようにするためのシステムである。

### 書籍管理システム

`system-a` は、書籍管理システムである。

書籍管理システムは、個人の蔵書、部署の本棚、研修用の参考書、社内図書室などで、本の情報を整理するために使う。本は、所有しているだけでは後から探しにくい。誰が見ても同じ本であると分かる情報を残しておくことで、一覧で確認したり、特定の本を探したり、重複して登録しないようにしたりできる。

このシステムでは、書籍としてタイトル、著者、出版日、ISBN を管理する。ISBN は、書籍を識別するために出版物へ割り当てられる番号である。同じタイトルの本でも、版や出版形態が違えば別の ISBN になることがある。人間にとっての「本の名前」だけでは曖昧な場合があるため、システムでは ISBN を使って同じ本の重複登録を防ぐ。

また、このシステムでは書籍そのものだけでなく、読書メモも扱う。読書メモは、本を読んだ人が自分のために残す記録である。たとえば、参考になったページ、後で読み返したい章、実務で使えそうな内容、疑問に思ったこと、誰かに共有したい観点などを書く。読書メモは本と関連付けて保存するが、内容は書いた本人のものなので、他の人が無断で閲覧・編集できないようにする。

### 用例採集システム

`system-b` は、用例採集システムである。

用例採集システムは、言葉の使われ方を集めるために使う。新しい業務用語、専門用語、社内だけで使われる言い回し、設計やレビューで頻繁に出る表現は、辞書的な説明だけでは理解しにくい。実際にどの文脈で、どのような文として使われていたかを残すことで、後から学習や共有に使える。

このシステムでは、まず用語を管理する。用語とは、意味を確認したい言葉や、チーム内で共通理解を持ちたい言葉である。たとえば「排他制御」「冪等性」「トランザクション」のような言葉を登録する。用語だけを登録しても、実際の使われ方は分からないため、このシステムでは用例も集める。

用例とは、その用語が使われている具体的な文である。たとえば、会議で出た発言、設計書の一文、コードレビューのコメント、学習中に読んだ資料の一節などが用例になる。用例には、本文だけでなく、いつ集めたか、どこで見たか、なぜ残したかといった補足メモも付けられる。用例は他の人も閲覧できるが、登録した本人だけが編集・削除できる。

### この教材での進め方

第1章から第5章では、バックエンドの基本、動かし方、ファイルの役割を確認する。第6章からは、`system-a` の一部を確認し、その直後に `system-b` の対応する部分を実装する。見本をすべて確認してから課題全体を実装するのではなく、機能ごとに確認し、動かし、実装し、結果を確かめる。

## 第 1 章 バックエンドとは何か

フロントエンドは画面を担当する。バックエンドは画面には直接表示されない部分で、データとルールを担当する。

書籍管理のサーバーでは、バックエンドは次の処理を行う。

- 書籍一覧を返す。
- 新しい書籍をデータベースに保存する。
- 不正な入力を拒否する。
- 存在しない書籍 ID に `404 Not Found` を返す。
- 同じ ISBN の本を重複登録させない。
- ログインしているユーザーだけが読書メモを作れるようにする。

API は、別のプログラムから使うための入口である。

この教材では、HTTP でデータをやり取りする API を扱う。HTTP は、Web で要求と結果をやり取りするためのルールである。

JSON は、プログラム同士でデータを渡すための書き方である。JavaScript のオブジェクトに近い形で書く。

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

### `jq`

`jq` は、JSON を整形したり、必要な値だけを取り出したりするためのコマンドである。

AlmaLinux では `dnf` でインストールする。

```bash
sudo dnf install -y jq
jq --version
```

`jq .` は JSON 全体を読みやすく表示する。`jq` の `.` は、今見ている JSON 全体を表す。

`.message` は JSON 全体の `message` フィールドを取り出す。`.pagination.limit` のように `.` をつなげると、ネストしたオブジェクトの内側のフィールドを取り出せる。

```bash
echo '{"message":"hello"}' | jq .
echo '{"message":"hello"}' | jq '.message'
echo '{"pagination":{"limit":20,"offset":0}}' | jq '.pagination.limit'
```

配列は `[0]` のように番号で指定する。番号は `0` から始まる。`.items[0]` は `items` の先頭要素、`.items[0].id` は先頭要素の `id` フィールドである。

配列の各要素を順に取り出す場合は `.items[]` と書く。そこからさらに `.id` をつなげると、各要素の `id` だけを取り出せる。

```bash
echo '{"items":[{"id":1},{"id":2}]}' | jq '.items[0]'
echo '{"items":[{"id":1},{"id":2}]}' | jq '.items[0].id'
echo '{"items":[{"id":1},{"id":2}]}' | jq '.items[].id'
```

文字列の引用符を外して表示したい場合は `-r` を付ける。

```bash
echo '{"message":"hello"}' | jq -r '.message'
```

### 課題

次の JSON から、2 件目の `title` だけを `jq` で表示せよ。

```json
{
  "items": [
    {
      "id": 1,
      "title": "Node.js入門"
    },
    {
      "id": 2,
      "title": "HTTP入門"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 2
  }
}
```

## 第 2 章 `curl` でリクエストを送る

`curl` は、ターミナルからサーバーに要求を送るためのコマンドである。

### 準備

この教材では、Linux 環境のターミナルでコマンドを実行する。コマンドは、この教材のファイル一式を配置したディレクトリで実行する。`package.json` がある場所である。

`npm` は、Node.js のプロジェクトで使うコマンドである。この教材では、必要なライブラリをインストールしたり、あらかじめ用意された起動コマンドを実行したりするために使う。

```bash
npm install
npm run db:up
```

`npm install` は、この教材で使うライブラリをインストールする。`npm run db:up` は、この教材の `package.json` に用意されているコマンドで、データベースを起動する。

この研修ではフロントエンドは作らない。動作確認はコマンドとテストで行う。

練習用サーバーを起動する。

```bash
npm run start:practice
```

### GET

```bash
curl -i http://127.0.0.1:3001/hello
```

`-i` はレスポンスヘッダーも表示する。

ステータスは結果を表す番号、ヘッダーは補足情報、ボディーは内容である。

確認する項目:

- ステータス: `200 OK`
- ヘッダー: `Content-Type`
- ボディー: `{"message":"hello"}`

### POST

```bash
curl -i -X POST http://127.0.0.1:3001/hello
```

同じ URL でも、HTTP メソッドが違うと別の処理になる。

### query parameter

```bash
curl -i "http://127.0.0.1:3001/echo-query?word=backend"
```

`?word=backend` の部分が query parameter である。後の章で `limit` / `offset` を指定するときに使う。

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

`-H` はヘッダー、`-d` はリクエストボディーを指定する。

不正な形式の JSON も送る。

```bash
curl -i -X POST http://127.0.0.1:3001/echo-body \
  -H "content-type: application/json" \
  -d '{"name":"alice"'
```

サーバーは `400 Bad Request` を返す。外部から送られる入力は信用できるとは限らない。

### 課題

存在しないエンドポイントにリクエストを送り、ステータスを確認せよ。

練習用サーバーに対して、定義されていない任意の URL へ `GET` リクエストを送れ。`-i` を使い、`404 Not Found` になることを確認せよ。

## 第 3 章 echo エンドポイント

`system-a/src/practice-server.ts` に次の処理を追加する。追加位置は `jsonErrorHandler` より前。

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

次のリクエストを送る。

```bash
curl -i -X POST "http://127.0.0.1:3001/debug/request?mode=practice" \
  -H "content-type: application/json" \
  -H "x-training-id: 001" \
  -d '{"message":"hello","count":1}'
```

`curl` のレスポンスと、サーバー側の `console.log` の両方を確認する。

### 課題

クエリパラメータを `&` で 1 つ増やし、ヘッダーとボディーのフィールドも 1 つずつ増やしてリクエストせよ。

直前の `curl` コマンドを元にして、URL、`-H`、`-d` をそれぞれ変更せよ。レスポンスとサーバー側の `console.log` を見て、`query`、`headers`、`body` に増やした値が入っていることを確認せよ。

## 第 4 章 REST API の基本

REST API では、操作対象を URL で表し、操作内容を HTTP メソッドで表す。

| 操作 | メソッド | 例 | 成功ステータス |
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

エラー形式は全 API で統一する。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

主なステータス:

| ステータス | 用途 |
| --- | --- |
| `400` | 入力が不正 |
| `401` | ログイン確認が必要 |
| `403` | 権限がない |
| `404` | 対象がない |
| `409` | 一意制約や外部キー制約に違反 |

### 課題

`echo-body` に対して、未実装の HTTP メソッド `PATCH` でリクエストを送り、ステータスを確認せよ。

`POST /echo-body` と別のリクエストとして扱われることを確認せよ。

## 第 5 章 system-b の基本構成

`system-b/src` に実装する。`system-a` と同じ分け方にすると、対応関係を追いやすい。

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

最初に実装する項目:

- `createApp()`
- `express.json()`
- 共通エラーハンドラ
- `queryRows()` / `execute()`
- `server.ts` から `createApp()` を起動する処理

確認:

ここで使う `*_volatile` の DB は、学習中に簡単に削除して作り直せるようにしている。大事なデータは入れないこと。

```bash
npm run db:reset:b
npm run build:b
MYSQL_DATABASE=backend_training_b_volatile PORT=3001 npm run start:b
```

### 課題

`npm run start:b` を成功させよ。

まず `system-b/src/server.ts` から Express サーバーを起動できる状態にせよ。必要なファイルを `system-b/src` に追加し、`npm run build:b` が通ることを確認してから起動せよ。

## 第 6 章 テーマ 1: 認証なし CRUD

「認証なし」とは、ログインしなくても使えるという意味である。

CRUD は `Create`、`Read`、`Update`、`Delete` の略である。追加、取得、変更、削除をまとめて指す。

この章では、`system-a` の書籍 API を確認し、`system-b` の用語 API を実装する。

### system-a の確認箇所

`system-a` を起動する。

```bash
npm run db:reset:a
npm run build:a
MYSQL_DATABASE=backend_training_a_volatile PORT=3000 npm run start:a
```

確認するファイルと処理:

- `system-a/sql/schema.sql` の `books`
- `system-a/src/app.ts` の `mapBook()`
- `system-a/src/app.ts` の `findBook()`
- `GET /books`
- `POST /books`
- `GET /books/:bookId`
- `PATCH /books/:bookId`
- `DELETE /books/:bookId`

### system-a の動作確認

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

### system-b の実装

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

第6章の時点では用例 API はまだ実装しないが、`examples` テーブルは `system-b/sql/schema.sql` にすでに定義されている。`examples.term_id` は `terms.id` を参照するため、後で `examples.term_id = 1` の行が作られると、`terms.id = 1` の用語は削除できなくなる。

`DELETE /terms/:termId` は、その状態になっても正しく動くように実装する。

1. `termId` が数値として正しいか確認する。
2. `SELECT ... FROM terms WHERE id = ?` で用語が存在するか確認する。存在しなければ `404 NOT_FOUND` を返す。
3. `DELETE FROM terms WHERE id = ?` を実行する。
4. MySQL が外部キー制約エラーを返した場合は、`409 CONFLICT` に変換する。`mysql2` のエラーでは `errno` が `1451` になる。
5. 削除できた場合は `204 No Content` を返す。

削除前に `examples` の件数を数えて判定しない。用語を削除してよいかどうかは、`examples.term_id` から `terms.id` への外部キー制約でデータベースに判定させる。

確認:

```bash
npm run db:reset:b
npm run build:b
MYSQL_DATABASE=backend_training_b_volatile PORT=3001 npm run start:b
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

### 課題

`system-b` に用語 CRUD を実装せよ。

仕様通りに実装し、上の `curl` で確認せよ。

## 第 7 章 テーマ 2: ユーザー登録

この章では、`system-a` のユーザー登録処理を確認し、`system-b` に同じ処理を実装する。

### system-a の確認箇所

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

確認する項目:

- レスポンスに `password` / `passwordHash` を含めない。
- データベースには Argon2 のハッシュを保存する。
- `username` 重複は `409 CONFLICT`。

### system-b の実装

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
  -> password_hash を含めずに 201 Created を返す
```

確認:

```bash
npm run build:b
MYSQL_DATABASE=backend_training_b_volatile PORT=3001 npm run start:b
```

```bash
curl -i -X POST http://127.0.0.1:3001/users \
  -H "content-type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```

### 課題

`system-b` にユーザー登録 API を実装せよ。

仕様通りに実装し、上の `curl` で確認せよ。

## 第 8 章 テーマ 3: 認証付き CRUD

認証とは、リクエストしてきた相手が誰であるかを確認することである。この教材では Basic 認証を使う。

```http
Authorization: Basic base64(username:password)
```

`curl` では `-u` を使う。

```bash
curl -i -u alice:password123 http://127.0.0.1:3000/books/1/reading-notes
```

`401` と `403`:

| ステータス | 意味 |
| --- | --- |
| `401` | 認証できていない |
| `403` | 認証済みだが権限がない |

### system-a の確認箇所

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

### system-b の実装

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

`system-a` との違い:

| 操作 | system-a 読書メモ | system-b 用例 |
| --- | --- | --- |
| 一覧取得 | 認証必須。自分の読書メモのみ | 認証不要。全ユーザーの用例 |
| 詳細取得 | 認証必須。所有者のみ | 認証不要。誰でも閲覧可能 |
| 作成 | 認証必須 | 認証必須 |
| 更新 | 認証必須。所有者のみ | 認証必須。所有者のみ |
| 削除 | 認証必須。所有者のみ | 認証必須。所有者のみ |

確認:

```bash
npm run db:reset:b
npm run build:b
MYSQL_DATABASE=backend_training_b_volatile PORT=3001 npm run start:b
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

### 課題

`system-b` に用例 CRUD と Basic 認証を実装せよ。

仕様通りに実装し、上の `curl` で確認せよ。

## 第 9 章 公開テスト

すべての API を実装した後に実行する。

```bash
npm run test:b
```

手動確認用に `PORT=3001 npm run start:b` を起動している場合は、停止してから実行する。

### 課題

`npm run test:b` が通るようにせよ。

テストが失敗した場合は、失敗メッセージと API 仕様を照らし合わせて `system-b/src` の実装を直せ。テストを通すためだけに公開テストを書き換えるな。

## 付録 A. 対応表

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

## 参考資料

- `docs/system-a/api.md`
- `docs/system-a/lesson.md`
- `docs/system-a/testing.md`
- `docs/system-b/api.md`
- `docs/system-b/assignment.md`
- `docs/consistency.md`
