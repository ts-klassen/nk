# Node.js バックエンド研修: REST API と CRUD

書籍管理 API を読み、用例採集 API を実装する

## この教材の目的

この教材は、バックエンド開発が未経験の新卒社員を対象にした研修教材である。

目的は、Node.js の先端機能や Express 固有の高度な設計技法を覚えることではない。HTTP で JSON をやり取りする API を作りながら、言語やフレームワークが変わっても必要になるバックエンド開発の基本を身につけることである。

この教材では、最初から専門用語を大量に説明しない。まずは DB を使わない小さな API を `curl` で呼び、HTTP リクエストと JSON レスポンスを実際に見る。そのあとで、完成実装である書籍管理 API を読み、最後に用例採集 API を実装する。

用例採集 API は、用語と、その用語が実際に使われた文を記録する API である。この題材を使って、REST API、CRUD、DB 連携、入力バリデーション、エラーハンドリング、Basic 認証、所有者チェックを学ぶ。

## このファイルの読み方

`MAIN.md` は主教材である。学習順序、演習、System B の課題要件、API 仕様をこのファイルにまとめている。

詳細資料やソースコードも参照するが、研修の流れはこのファイルだけで追える構成にしている。仕様を確認したいときは、まずこのファイルに戻る。

関連ファイル:

- `README.md`: セットアップと全体構成
- `docs/system-a/api.md`: System A の API 仕様
- `docs/system-a/lesson.md`: System A の補足教材
- `docs/system-a/testing.md`: System A の任意テスト教材
- `docs/system-b/api.md`: System B の API 仕様
- `docs/system-b/assignment.md`: System B の課題文
- `system-a/`: 完成実装
- `system-b/`: 課題実装の置き場と公開テスト

## 最初に覚える言葉

バックエンドは、リクエストを受け取り、処理をして、レスポンスを返すプログラムである。

最初はこれだけで十分である。

```text
curl
  -> HTTP リクエスト
  -> バックエンド
  -> HTTP レスポンス
  -> JSON
```

この教材でよく使う言葉を、先に短く整理する。

| 言葉 | まずはこう理解する |
| --- | --- |
| HTTP | ブラウザや `curl` とサーバーが通信するときの決まり |
| リクエスト | クライアントからサーバーへ送る要求 |
| レスポンス | サーバーからクライアントへ返す結果 |
| JSON | データを文字列で表す形式 |
| API | 外から呼び出せるサーバーの入口 |
| エンドポイント | `GET /hello` のような API の入口 |
| HTTP メソッド | `GET` や `POST` のような操作の種類 |
| ステータスコード | `200` や `404` のような処理結果の番号 |

より大きな設計上の言葉は、実際に動かしてから扱う。最初にすべて覚える必要はない。

## 第 0 章 固定値を返す API を呼ぶ

まずは DB を使わない練習用サーバーを起動する。

```bash
npm install
npm run start:practice
```

`start:practice` は `system-a/src/practice-server.ts` をビルドして起動する。ポートはデフォルトで `3001` である。

別のターミナルを開き、`curl` で API を呼ぶ。

```bash
curl -i http://127.0.0.1:3001/hello
```

レスポンス例:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
```

```json
{
  "message": "hello"
}
```

`curl` は HTTP リクエストを送るコマンドである。`-i` を付けると、レスポンスボディだけでなく、ステータスコードやヘッダも表示される。

JSON だけを確認したい場合は `-s` を使う。

```bash
curl -s http://127.0.0.1:3001/hello
```

### GET は値を読む

`GET /hello` は、サーバーから値を読むリクエストである。

練習用サーバーの実装は固定値を返すだけである。

```ts
app.get("/hello", (_req, res) => {
  res.json({
    message: "hello"
  });
});
```

まだ DB も SQL も出てこない。まずは「URL にアクセスすると JSON が返る」ことを確認する。

### POST も固定値で見る

次に `POST` を呼ぶ。

```bash
curl -i -X POST http://127.0.0.1:3001/hello
```

レスポンス例:

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
```

```json
{
  "message": "created"
}
```

`-X POST` は、HTTP メソッドとして `POST` を使う指定である。

`GET` は値を読むときに使うことが多く、`POST` は新しいものを作るときに使うことが多いメソッドである。この段階では、まず `GET` と `POST` は別の種類のリクエストだと理解できれば十分である。

### query で値を渡す

バックエンドには、URL の query で値を渡せる。

```bash
curl -s "http://127.0.0.1:3001/echo-query?word=backend"
```

レスポンス:

```json
{
  "word": "backend"
}
```

`?word=backend` の部分が query である。

```text
http://127.0.0.1:3001/echo-query?word=backend
                                 ^^^^^^^^^^^^^
```

一覧 API の `limit` や `offset` も query で渡す。

```bash
curl -s "http://127.0.0.1:3001/echo-query?word=limit"
```

### path で値を渡す

URL の途中に値を入れることもできる。

```bash
curl -s http://127.0.0.1:3001/hello/alice
```

レスポンス:

```json
{
  "message": "hello, alice"
}
```

`/hello/:name` の `:name` は、URL のその位置に入った値を受け取るための書き方である。

System A で出てくる `GET /books/:bookId` も同じ考え方である。

```text
GET /books/1
           ^
           bookId として 1 を受け取る
```

### JSON ボディで値を渡す

`POST` では、JSON ボディで値を渡すことがよくある。

```bash
curl -s -X POST http://127.0.0.1:3001/echo-body \
  -H "Content-Type: application/json" \
  -d '{"name":"alice"}'
```

レスポンス:

```json
{
  "name": "alice",
  "message": "hello, alice"
}
```

ここで新しく出てきた `curl` の指定は 2 つである。

| 指定 | 意味 |
| --- | --- |
| `-H "Content-Type: application/json"` | 送るデータが JSON であることを伝える |
| `-d '{"name":"alice"}'` | リクエストボディとして JSON を送る |

バックエンド側では `express.json()` が JSON ボディを読み取り、`req.body` に入れる。

### 第 0 章の確認

ここまでで確認したこと:

- `curl` で HTTP リクエストを送れる。
- `GET` は値を読むときに使うことが多い。
- `POST` は値を作るときに使うことが多い。
- レスポンスにはステータスコードと JSON ボディがある。
- query、path、JSON ボディでバックエンドに値を渡せる。

ここまでできてから、REST API と CRUD という名前を付ける。

REST API は、URL と HTTP メソッドを使ってリソースを操作する API の設計である。リソースとは、書籍、用語、読書メモ、用例のような「API で扱うもの」である。

CRUD は、次の 4 つの操作の頭文字である。

| CRUD | 意味 | HTTP メソッドの例 |
| --- | --- | --- |
| Create | 作る | `POST` |
| Read | 読む | `GET` |
| Update | 更新する | `PATCH` |
| Delete | 削除する | `DELETE` |

つまり、この教材で扱う「REST API で CRUD する」とは、書籍や用語のような対象を、HTTP の入口から作成、取得、更新、削除できるようにすることである。

## この教材で作るもの

この教材では、2 つの JSON API を扱う。

### System A: 書籍管理 API

System A は完成実装である。受講者はコードを読み、動かしながらバックエンドの基本を学ぶ。題材は書籍と読書メモである。

できること:

- 書籍を作成、取得、更新、削除できる。
- ユーザー登録後、自分専用の読書メモを作成、取得、更新、削除できる。

### System B: 用例採集 API

System B は実装課題である。System A で学んだ考え方を使い、一から実装する。題材は用語と用例である。

できるようにすること:

- 用語を作成、取得、更新、削除できる。
- ユーザー登録後、用例を作成、取得、更新、削除できる。
- 用例は誰でも読める。
- 用例の更新と削除は所有者だけができる。

## 学ぶこと

この教材で扱う中心テーマは次の通りである。

- REST API の設計
- JSON リクエストと JSON レスポンス
- HTTP メソッドとステータスコード
- CRUD
- MySQL との接続
- SQL を直接実行する構成
- 入力バリデーション
- 共通エラーレスポンス
- Basic 認証
- Argon2 によるパスワードハッシュ化
- 所有者チェック
- DB を使った API 結合テスト

実務では、バックエンドが Erlang、Go、Perl、Rust などで書かれていることもある。だから、この教材ではフロントエンドとの型共有やコード共有を前提にしない。共有するのはコードではなく、API 仕様である。

## 前提

必要な環境:

- Node.js 22 以上
- npm
- Docker Compose

使う主なライブラリ:

- `express`
- `mysql2`
- `express-validator`
- `argon2`
- `mocha`
- `chai`

この教材で使わないもの:

- ORM
- migration ツール
- JWT
- セッション管理
- 動的 HTML 生成
- フロントエンド
- フロントエンドと共有する型やコード

## System A を起動する

MySQL を起動する。

```bash
npm run db:up
```

System A の DB を初期化する。

```bash
npm run db:reset:a
```

System A をビルドする。

```bash
npm run build:a
```

System A を起動する。

```bash
MYSQL_DATABASE=backend_training_a PORT=3000 npm run start:a
```

別のターミナルで疎通確認する。

```bash
curl -s http://127.0.0.1:3000/books
```

空の一覧が JSON で返れば起動できている。

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

## 学習の進め方

次の順序で読み、手を動かす。

| 順序 | 学習内容 | 演習 |
| --- | --- | --- |
| 1 | `curl`、`GET`、`POST`、query、path、JSON ボディ | 練習用サーバーで固定値 API を呼ぶ |
| 2 | REST API、JSON、エラー形式、Express の入口 | System A の仕様とルートを対応づける |
| 3 | MySQL、`schema.sql`、CRUD、ページング | System A の DB 処理を読み、System B の DB を理解する |
| 4 | 入力バリデーション、`400`、`404`、`409` | System B の入力制約とエラーを実装する |
| 5 | Basic 認証、Argon2、所有者チェック、`401`、`403` | System A の認証実装を読み、System B の用例権限を設計する |
| 6 | 用例採集 API の実装 | 公開テストを使って System B を完成させる |

## System B の題材

System B では、用語と用例を管理する API を作る。

ここでいう用語とは、社内チャット、レビュー、障害対応、設計相談などで出てくる言葉である。用例とは、その用語が実際に使われた文である。

たとえば、次のような用語を登録する。

- 冪等性
- 可観測性
- 結果整合性
- リグレッション
- 横展開
- 暫定対応
- 社内だけで通じる略語
- 特定プロジェクトだけで使われる呼び名

用語は名前だけを持つ。

```json
{
  "term": "冪等性"
}
```

用例は、実際に見聞きした文、採集日、備考を持つ。

```json
{
  "body": "PUT は冪等な操作として設計することが多い。",
  "collectedDate": "2026-04-28",
  "note": "API設計レビューでの発言"
}
```

この課題の中心は、用語集を作ることではない。用語と用例という親子リソースを使い、CRUD、認証、所有者チェック、エラー処理を実装することである。

辞書で一般的な意味を調べることと、現場で実際に使われた文を記録することは違う。この違いを題材にすると、用語そのものを表す親リソースと、ユーザーが登録する子リソースを自然に分けられる。

### コラム: なぜ用語に description を持たせないのか

用語登録時に説明文を書く設計は自然に見える。

しかし、この課題では `terms` に `description` を持たせない。説明文が先にあると、その説明に引っ張られて用例の集め方が偏るからである。

まず用語だけを登録する。次に、実際に見聞きした用例を集める。定義はこの API の外であとから作る。

この割り切りにより、System B のリソース構造は単純になる。用語は親リソース、用例は子リソースである。

## System A と System B の対応

System A は学習用の完成実装、System B は課題用の未完成実装である。

| 観点 | System A: 書籍管理 | System B: 用例採集 |
| --- | --- | --- |
| 親リソース | 書籍 `books` | 用語 `terms` |
| 子リソース | 読書メモ `reading_notes` | 用例 `examples` |
| ユーザー | `users` | `users` |
| 親 CRUD | 認証不要 | 認証不要 |
| 子作成 | 認証必須 | 認証必須 |
| 子一覧 | 本人だけ | 誰でも |
| 子詳細 | 本人だけ | 誰でも |
| 子更新・削除 | 所有者だけ | 所有者だけ |
| 親削除 | 子があると `409` | 子があると `409` |

System B は System A の単純な名前変更ではない。特に、子リソースの公開範囲が違う。

- 読書メモは本人だけが読める。
- 用例は誰でも読める。
- どちらも更新と削除は所有者だけができる。

この差分を正しく実装できるかが、課題の重要な点である。

## 第 1 章 API は約束である

REST API では、URL がリソースを表し、HTTP メソッドが操作を表す。

| 操作 | HTTP メソッド | System A | System B |
| --- | --- | --- | --- |
| 一覧取得 | `GET` | `GET /books` | `GET /terms` |
| 詳細取得 | `GET` | `GET /books/:bookId` | `GET /terms/:termId` |
| 作成 | `POST` | `POST /books` | `POST /terms` |
| 更新 | `PATCH` | `PATCH /books/:bookId` | `PATCH /terms/:termId` |
| 削除 | `DELETE` | `DELETE /books/:bookId` | `DELETE /terms/:termId` |

成功時のステータスコードは次のように統一する。

| 操作 | status | body |
| --- | --- | --- |
| `GET` | `200 OK` | 返す |
| `POST` | `201 Created` | 作成後のリソースを返す |
| `PATCH` | `204 No Content` | 返さない |
| `DELETE` | `204 No Content` | 返さない |

`204 No Content` ではレスポンスボディを返さない。更新後の値を確認したい場合は、利用者が改めて `GET` する。

### System A で確認すること

読むファイル:

- `system-a/src/server.ts`
- `system-a/src/app.ts`

確認すること:

1. `server.ts` は `createApp()` を呼び、HTTP サーバーを起動している。
2. `app.ts` の `createApp()` が Express アプリを組み立てている。
3. `app.use(express.json())` により JSON リクエストボディを読める。
4. `app.get()`、`app.post()`、`app.patch()`、`app.delete()` が API 仕様の URL と対応している。

対応表:

| 仕様 | System A のコード |
| --- | --- |
| `GET /books` | `app.get("/books", ...)` |
| `POST /books` | `app.post("/books", ...)` |
| `GET /books/:bookId` | `app.get("/books/:bookId", ...)` |
| `PATCH /books/:bookId` | `app.patch("/books/:bookId", ...)` |
| `DELETE /books/:bookId` | `app.delete("/books/:bookId", ...)` |

### 演習 1

System B の用語 API について、対応する Express ルートを書き出す。

| 仕様 | 自分で書くルート |
| --- | --- |
| `GET /terms` | |
| `POST /terms` | |
| `GET /terms/:termId` | |
| `PATCH /terms/:termId` | |
| `DELETE /terms/:termId` | |

確認:

- `POST /terms` 成功時は `201 Created`。
- `PATCH /terms/:termId` 成功時は `204 No Content`。
- `DELETE /terms/:termId` 成功時は `204 No Content`。

### コラム: 教材用の割り切り

この教材では、書籍と用語は認証なしで作成、更新、削除できる。通常の業務システムなら危険な仕様である。

この仕様にしているのは、学習の焦点を分けるためである。

親リソースでは CRUD と DB 連携を学ぶ。子リソースでは Basic 認証と所有者チェックを学ぶ。すべてに認証を入れると、初学者は「CRUD で詰まっているのか」「認証で詰まっているのか」を切り分けにくくなる。

教材では、現実的な仕様よりも学習の分解を優先する場面がある。

## 第 2 章 エラーは仕様である

API のエラー形式は統一する。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

使うエラーコード:

| status | code | message | 例 |
| --- | --- | --- | --- |
| `400` | `VALIDATION_ERROR` | `入力値が不正です` | 入力値が不正 |
| `401` | `UNAUTHORIZED` | `認証が必要です` | Basic 認証がない、または不正 |
| `403` | `FORBIDDEN` | `この操作は許可されていません` | 他ユーザーのデータを更新しようとした |
| `404` | `NOT_FOUND` | `対象リソースが存在しません` | 指定 ID のリソースがない |
| `409` | `CONFLICT` | `リソースが競合しています` | 一意制約違反、子データあり削除 |
| `500` | `INTERNAL_SERVER_ERROR` | `サーバーエラーが発生しました` | 想定外エラー |

`500 INTERNAL_SERVER_ERROR` は想定外エラー用である。通常の課題実装で意図的に起こす対象ではない。

### System A で確認すること

読むファイル:

- `system-a/src/errors.ts`
- `system-a/src/app.ts`

確認すること:

1. `AppError` が `status`、`code`、`message` を持つ。
2. `errorHandler` が `AppError` を共通 JSON 形式に変換する。
3. JSON パース失敗は `400 VALIDATION_ERROR` になる。
4. 想定外エラーは `500 INTERNAL_SERVER_ERROR` になる。
5. `isDuplicateEntry()` が MySQL の重複エラーを検出する。

実装対応:

| 仕様 | System A のコード |
| --- | --- |
| 共通エラーレスポンス | `errors.ts` の `errorHandler` |
| `404 NOT_FOUND` | `findBook()`、`findReadingNote()` |
| `409 CONFLICT` | `isDuplicateEntry()`、削除前の子データ確認 |
| 不明 URL の `404` | `app.ts` 末尾の fallback ミドルウェア |

### 演習 2

System B で、次の場合に返す status / code / message を書く。

| 状況 | status | code | message |
| --- | --- | --- | --- |
| `term` が空文字 | | | |
| `username` が重複 | | | |
| 存在しない用語 ID | | | |
| 認証なしで用例作成 | | | |
| 他ユーザーの用例を削除 | | | |
| 用例がある用語を削除 | | | |

この表を埋めてから実装する。エラーは後付けの処理ではなく、API 仕様の一部である。

## 第 3 章 DB は状態を持つ

API はリクエストを受けてレスポンスを返す。しかし、バックエンドはそれだけではない。状態を持つ。

書籍を作成したら、次の一覧取得でその書籍が返る。用語を更新したら、次の詳細取得で更新後の値が返る。この「次にも残るもの」を DB が担う。

この教材では MySQL を使う。ORM は使わない。

### System A の DB スキーマ

`system-a/sql/schema.sql` を読む。

主要テーブル:

- `users`
- `books`
- `reading_notes`

`users`:

| カラム | 意味 |
| --- | --- |
| `id` | ユーザー ID |
| `username` | Basic 認証に使う ID。一意 |
| `password_hash` | Argon2 ハッシュ |
| `created_at` | 作成日時 |
| `updated_at` | 更新日時 |

`books`:

| カラム | 意味 |
| --- | --- |
| `id` | 書籍 ID |
| `isbn` | ISBN。一意 |
| `title` | タイトル |
| `author` | 著者 |
| `published_date` | 出版日。nullable |
| `created_at` | 作成日時 |
| `updated_at` | 更新日時 |

`reading_notes`:

| カラム | 意味 |
| --- | --- |
| `id` | 読書メモ ID |
| `user_id` | 所有者 |
| `book_id` | 紐付く書籍 |
| `page` | ページ |
| `body` | メモ本文 |
| `created_at` | 作成日時 |
| `updated_at` | 更新日時 |

### System B の DB スキーマ

`system-b/sql/schema.sql` を読む。

主要テーブル:

- `users`
- `terms`
- `examples`

`terms`:

| カラム | 意味 |
| --- | --- |
| `id` | 用語 ID |
| `term` | 用語。一意 |
| `created_at` | 作成日時 |
| `updated_at` | 更新日時 |

`examples`:

| カラム | 意味 |
| --- | --- |
| `id` | 用例 ID |
| `user_id` | 採集したユーザー |
| `term_id` | 紐付く用語 |
| `body` | 用例本文 |
| `collected_date` | 採集日 |
| `note` | 備考。nullable |
| `created_at` | 作成日時 |
| `updated_at` | 更新日時 |

### 演習 3

次の対応を埋める。

| System A | System B |
| --- | --- |
| `books.isbn` | |
| `reading_notes.book_id` | |
| `reading_notes.user_id` | |
| `reading_notes.body` | |
| `reading_notes.page` | |

確認:

- 用語に説明文はない。
- 用例の重複チェックはしない。
- 用例がある用語は削除できない。
- `ON DELETE CASCADE` は使わない。

### コラム: SQL を直接書く理由

ORM を使うと、SQL を直接書かずに DB を操作できる。しかし、この教材では `mysql2` で SQL を直接実行する。

理由は、API と DB の対応を見えるようにするためである。

- 一覧取得は `SELECT`
- 作成は `INSERT`
- 更新は `UPDATE`
- 削除は `DELETE`
- 総件数は `COUNT(*)`

JOIN などの複雑な SQL は別の機会に学ぶ。この教材では、API が DB 状態をどう読み書きするかに集中する。

## 第 4 章 MySQL に接続する

System A の DB 接続は `system-a/src/db.ts` にある。

確認すること:

1. `mysql2/promise` を使っている。
2. `createPool()` で connection pool を作っている。
3. 接続情報は環境変数から読む。
4. `queryRows()` は `SELECT` 用。
5. `execute()` は `INSERT`、`UPDATE`、`DELETE` 用。

環境変数:

| 変数 | デフォルト |
| --- | --- |
| `MYSQL_HOST` | `127.0.0.1` |
| `MYSQL_PORT` | `3306` |
| `MYSQL_USER` | `root` |
| `MYSQL_PASSWORD` | `rootpass` |
| `MYSQL_DATABASE` | `backend_training_a` |

System B でも同じ考え方で DB 接続を作る。

### 演習 4

System B の `system-b/src` に DB 接続ファイルを作る場合、どの関数を用意するとよいか考える。

最低限、次の 2 つがあると扱いやすくなる。

- `queryRows(sql, params)`: `SELECT` 結果を返す
- `execute(sql, params)`: `INSERT` / `UPDATE` / `DELETE` の結果を返す

System A の `db.ts` を参考にしてよい。ただし、System B の DB 名は `backend_training_b` を使う。

## 第 5 章 一覧 API とページング

一覧 API は配列を返すだけでは足りない。

この教材では、一覧レスポンスを次の形に統一する。

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

仕様:

- `limit`: 任意。デフォルト `20`。最小 `1`。最大 `100`
- `offset`: 任意。デフォルト `0`。最小 `0`
- `total`: 条件に合う総件数
- 並び順: `id ASC`

### System A で確認すること

`GET /books` の実装を見る。

確認すること:

1. `validatePagination()` が `limit` / `offset` を検証している。
2. `getPagination()` がデフォルト値を決めている。
3. `SELECT COUNT(*) AS total FROM books` で総件数を取る。
4. `SELECT * FROM books ORDER BY id ASC LIMIT ? OFFSET ?` で一覧を取る。

### System B で演習すること

System B には一覧 API が 2 つある。

- `GET /terms`
- `GET /terms/:termId/examples`

どちらも `limit` / `offset` / `total` を実装する。

演習:

1. 用語を 2 件作り、`GET /terms?limit=1&offset=1` が 2 件目だけを返すようにする。
2. 同じ用語に用例を 2 件作り、`GET /terms/:termId/examples?limit=1&offset=1` が 2 件目だけを返すようにする。
3. `limit=101` は `400 VALIDATION_ERROR` にする。

公開テストは、用語一覧と用例一覧の両方でページングを確認する。

## 第 6 章 入力値は信用しない

API の利用者は、常に正しい JSON を送るとは限らない。

例:

- `bookId` に `abc` が来る。
- `limit` に `101` が来る。
- `publishedDate` に `2026-99-99` が来る。
- `PATCH` の body に `null` が来る。
- 必須項目が空文字になる。

入力不正は `400 VALIDATION_ERROR` にする。

### System A で確認すること

読むファイル:

- `system-a/src/validation.ts`
- `system-a/src/app.ts`

確認すること:

| 仕様 | System A のコード |
| --- | --- |
| ID は正整数 | `validateId()` |
| `limit` は 1 から 100 | `validatePagination()` |
| `offset` は 0 以上 | `validatePagination()` |
| 空の PATCH は `400` | `requireAtLeastOne()` |
| PATCH body が `null` なら `400` | `requireAtLeastOne()` |
| ISBN は 10 桁または 13 桁 | `isbnRule()` |
| `publishedDate` は実在日付 | `isValidDateOnly()` |

### System B の入力制約

ユーザー:

| 項目 | 制約 |
| --- | --- |
| `username` | 必須。半角英数字と `_`。3 文字以上 32 文字以下。一意 |
| `password` | 必須。8 文字以上 72 文字以下 |

用語:

| 項目 | 制約 |
| --- | --- |
| `term` | 必須。1 文字以上 255 文字以下。一意 |

用例:

| 項目 | 制約 |
| --- | --- |
| `body` | 必須。1 文字以上 2000 文字以下 |
| `collectedDate` | 必須。実在する日付の `YYYY-MM-DD` |
| `note` | 任意。1000 文字以下 |

ページング:

| 項目 | 制約 |
| --- | --- |
| `limit` | 任意。1 以上 100 以下。デフォルト 20 |
| `offset` | 任意。0 以上。デフォルト 0 |

### 演習 5

System B で、次を `400 VALIDATION_ERROR` にする。

1. `POST /terms` に `{ "term": "" }`
2. `GET /terms?limit=101`
3. `POST /terms/:termId/examples` に `collectedDate: "2026-99-99"`
4. `PATCH /examples/:exampleId` に JSON `null`

### コラム: DB に怒られる前に API が断る

不正な値を DB まで流すと、MySQL がエラーを返すことがある。そのエラーをそのまま `500` にすると、API 利用者にはサーバー故障のように見える。

入力不正は利用者が直せる問題である。だから `400 VALIDATION_ERROR` にする。

## 第 7 章 CRUD を実装する

CRUD は次の 4 つである。

- Create: 作成
- Read: 取得
- Update: 更新
- Delete: 削除

System A では書籍 CRUD を読む。System B では用語 CRUD を実装する。

### System A の書籍 API

Book:

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

書籍 API:

| API | 認証 | 成功 |
| --- | --- | --- |
| `GET /books` | 不要 | `200 OK` |
| `POST /books` | 不要 | `201 Created` |
| `GET /books/:bookId` | 不要 | `200 OK` |
| `PATCH /books/:bookId` | 不要 | `204 No Content` |
| `DELETE /books/:bookId` | 不要 | `204 No Content` |

書籍の一意制約:

- `isbn` は一意。
- 重複時は `409 CONFLICT`。

削除制約:

- 読書メモが紐付いている書籍は削除できない。
- この場合は `409 CONFLICT`。

### System B の用語 API

Term:

```json
{
  "id": 1,
  "term": "冪等性",
  "createdAt": "2026-04-28T11:39:55+09:00",
  "updatedAt": "2026-04-28T11:39:55+09:00"
}
```

用語 API:

| API | 認証 | 成功 |
| --- | --- | --- |
| `GET /terms` | 不要 | `200 OK` |
| `POST /terms` | 不要 | `201 Created` |
| `GET /terms/:termId` | 不要 | `200 OK` |
| `PATCH /terms/:termId` | 不要 | `204 No Content` |
| `DELETE /terms/:termId` | 不要 | `204 No Content` |

用語の一意制約:

- `term` は一意。
- 重複時は `409 CONFLICT`。

削除制約:

- 用例が紐付いている用語は削除できない。
- この場合は `409 CONFLICT`。

### 演習 6

System B に用語 CRUD を実装する。

実装順:

1. `GET /terms`
2. `POST /terms`
3. `GET /terms/:termId`
4. `PATCH /terms/:termId`
5. `DELETE /terms/:termId`

各 API で確認すること:

- 存在しない ID は `404 NOT_FOUND`
- 不正な ID は `400 VALIDATION_ERROR`
- `term` 重複は `409 CONFLICT`
- PATCH は部分更新
- PATCH は少なくとも 1 項目を要求する
- 用例あり用語削除は `409 CONFLICT`

## 第 8 章 ユーザー登録と Basic 認証

この教材では、認証用ユーザーを作る。

ユーザー登録 API は公開 API である。

```http
POST /users
```

Request:

```json
{
  "username": "alice",
  "password": "password123"
}
```

Response:

```json
{
  "id": 1,
  "username": "alice",
  "createdAt": "2026-04-28T11:39:55+09:00",
  "updatedAt": "2026-04-28T11:39:55+09:00"
}
```

レスポンスに `password` や `passwordHash` を含めてはいけない。

DB には平文パスワードを保存しない。Argon2 でハッシュ化し、`password_hash` に保存する。

### Basic 認証

Basic 認証では、リクエストヘッダに `username:password` を Base64 でエンコードして送る。

```http
Authorization: Basic base64(username:password)
```

認証失敗時は `401 UNAUTHORIZED` とし、次のヘッダを返す。

```http
WWW-Authenticate: Basic realm="backend-training"
```

### System A で確認すること

読むファイル:

- `system-a/src/auth.ts`
- `system-a/src/app.ts`

確認すること:

1. `parseBasicAuth()` が `Authorization` ヘッダを読む。
2. Base64 をデコードし、`username` と `password` に分ける。
3. DB から `username` に一致するユーザーを取得する。
4. `argon2.verify()` でパスワードを検証する。
5. 認証成功時、`req.user` にユーザー情報を入れる。
6. 認証失敗時、`WWW-Authenticate` ヘッダ付きで `401` を返す。

### System B で演習すること

System B でも同じ仕様で `POST /users` と Basic 認証ミドルウェアを実装する。

公開テストは、ユーザー登録後に DB の `password_hash` を直接確認する。

満たすべきこと:

- `password_hash` は平文パスワードと異なる。
- `password_hash` は `$argon2` で始まる。
- `argon2.verify(password_hash, password)` が成功する。

レスポンスにパスワードを出さないだけでは足りない。DB に平文保存していないことまで仕様である。

## 第 9 章 認証と認可は違う

認証と認可は別のものである。

- 認証: あなたは誰か
- 認可: あなたはその操作をしてよいか

Basic 認証に成功しても、他人のデータを更新してよいとは限らない。

この教材では、次のステータスコードを使い分ける。

| 状況 | status | code |
| --- | --- | --- |
| 認証情報がない、または不正 | `401` | `UNAUTHORIZED` |
| 認証済みだが権限がない | `403` | `FORBIDDEN` |

### System A の読書メモ

ReadingNote:

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

読書メモ API:

| API | 認証 | 公開範囲 |
| --- | --- | --- |
| `GET /books/:bookId/reading-notes` | 必須 | 自分のメモだけ |
| `POST /books/:bookId/reading-notes` | 必須 | 自分のメモを作る |
| `GET /reading-notes/:noteId` | 必須 | 所有者だけ |
| `PATCH /reading-notes/:noteId` | 必須 | 所有者だけ |
| `DELETE /reading-notes/:noteId` | 必須 | 所有者だけ |

読むコード:

- `assertOwnReadingNote()`
- `GET /books/:bookId/reading-notes`
- `GET /reading-notes/:noteId`
- `PATCH /reading-notes/:noteId`
- `DELETE /reading-notes/:noteId`

確認すること:

- 一覧では `WHERE book_id = ? AND user_id = ?` により自分のメモだけ返す。
- 詳細、更新、削除では所有者チェックをする。
- 他ユーザーの読書メモなら `403 FORBIDDEN`。

### System B の用例

Example:

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

用例 API:

| API | 認証 | 公開範囲 |
| --- | --- | --- |
| `GET /terms/:termId/examples` | 不要 | 誰でも |
| `GET /examples/:exampleId` | 不要 | 誰でも |
| `POST /terms/:termId/examples` | 必須 | 認証ユーザーが作成 |
| `PATCH /examples/:exampleId` | 必須 | 所有者だけ |
| `DELETE /examples/:exampleId` | 必須 | 所有者だけ |

用例の更新可能項目:

- `body`
- `collectedDate`
- `note`

### 演習 7

System B に用例 API を実装する。

実装順:

1. `POST /terms/:termId/examples`
2. `GET /terms/:termId/examples`
3. `GET /examples/:exampleId`
4. `PATCH /examples/:exampleId`
5. `DELETE /examples/:exampleId`

確認すること:

- 用例作成は Basic 認証必須。
- 存在しない用語への用例作成は `404 NOT_FOUND`。
- 用例一覧は認証不要。
- 用例一覧は `limit` / `offset` / `total` を返す。
- 用例詳細は認証不要。
- 用例更新は所有者だけ。
- 用例削除は所有者だけ。
- 他ユーザーの更新・削除は `403 FORBIDDEN`。
- 認証なしの更新・削除は `401 UNAUTHORIZED`。

## 第 10 章 日時形式をそろえる

API では日時形式も仕様である。

この教材では次の形式を使う。

| 種類 | 形式 | 例 |
| --- | --- | --- |
| 日時 | RFC 3339 風 | `2026-04-28T11:39:55+09:00` |
| 日付 | `YYYY-MM-DD` | `2026-04-28` |

System A では `system-a/src/time.ts` が DB の日時を API レスポンス形式に変換している。

System B でも同じ形式にする。

### 演習 8

System B のレスポンスで、次を確認する。

1. `createdAt` は `+09:00` で終わる。
2. `updatedAt` は `+09:00` で終わる。
3. `collectedDate` は `YYYY-MM-DD`。
4. `note` がない場合もレスポンスに `note` を含める。

この課題では、`note` は任意であるが、レスポンスでは `note` を含める。値がなければ `null` とする。

## 第 11 章 親削除と `409 CONFLICT`

書籍に読書メモがある場合、書籍は削除できない。

用語に用例がある場合、用語は削除できない。

この教材では `ON DELETE CASCADE` を使わない。親を消したら子も消える、という設計にはしない。

理由:

- 子データはユーザーが作った情報である。
- 親を消しただけで子が消えると、データ消失に気づきにくい。
- 初学者が削除の副作用を追いにくい。

したがって、親に子がある場合は `409 CONFLICT` を返す。

### System A で確認すること

`DELETE /books/:bookId` の実装を見る。

確認すること:

1. まず書籍の存在確認をする。
2. `reading_notes` に該当 `book_id` があるか `COUNT(*)` で確認する。
3. 1 件以上あれば `409 CONFLICT`。
4. 0 件なら `DELETE FROM books WHERE id = ?`。

### System B で演習すること

`DELETE /terms/:termId` で同じことを実装する。

確認:

- 存在しない用語は `404 NOT_FOUND`。
- 用例がある用語は `409 CONFLICT`。
- 用例がない用語は `204 No Content`。

## 第 12 章 公開テストを読む

System B には非公開テストがない。すべてのテストが見える。

公開テストは仕様の代わりではない。仕様を満たしているかを確認するための補助資料である。

読むファイル:

- `system-b/test/system-b.test.mjs`

公開テストが確認する主な要件:

- ユーザー登録できる。
- `username` 重複時に `409`。
- パスワードが Argon2 でハッシュ保存されている。
- 認証なしの用例作成は `401`。
- 不正な Basic 認証は `401`。
- `WWW-Authenticate: Basic realm="backend-training"` を返す。
- 用語 CRUD ができる。
- 用語一覧が `limit` / `offset` / `total` を返す。
- `term` 重複時に `409`。
- 用例を作成できる。
- 用例一覧が `limit` / `offset` / `total` を返す。
- 用例詳細はログインなしで読める。
- 用例の `body`、`collectedDate`、`note` を更新できる。
- 認証なしの用例更新・削除は `401`。
- 他ユーザーの用例更新・削除は `403`。
- 用例あり用語削除は `409`。
- 存在しないリソースは `404`。
- 入力エラーは `400`。

### 演習 9

まず、テスト名だけを上から読む。

次に、各テストがどの API を呼んでいるかを書き出す。

最後に、該当 API の仕様をこの `MAIN.md` から探す。

この順序で読むと、公開テストが仕様のどの部分を確認しているかが見える。

## 第 13 章 System B 実装課題

ここからは、System B の用例採集 API を実装する。

実装場所:

- `system-b/src`

提供されているもの:

- `system-b/sql/schema.sql`
- `system-b/test/system-b.test.mjs`
- `system-b/tsconfig.json`
- `system-b/src/server.ts` の最小雛形

実装してよいもの:

- `system-b/src` 配下のファイル追加
- Express アプリ
- DB 接続
- エラー処理
- バリデーション
- 認証ミドルウェア
- API ルート

変更しないほうがよいもの:

- `system-b/sql/schema.sql`
- `system-b/test/system-b.test.mjs`

公開テストを読むためにテストファイルを見るのは問題ない。ただし、テストの期待値だけに合わせた場当たり的な実装ではなく、API 仕様を満たす実装にする。

### 実装順序

1. Express アプリを作る。
2. MySQL 接続を作る。
3. 共通エラー処理を作る。
4. 入力バリデーションを作る。
5. `POST /users` を実装する。
6. Basic 認証ミドルウェアを作る。
7. 用語 CRUD を実装する。
8. 用語一覧のページングを実装する。
9. 用例作成を実装する。
10. 用例一覧と用例詳細を実装する。
11. 用例更新と削除を実装する。
12. 所有者チェックを実装する。
13. 用例あり用語削除の `409` を実装する。
14. 公開テストを実行し、仕様との差分を直す。

### 実行コマンド

DB を初期化する。

```bash
npm run db:reset:b
```

ビルドする。

```bash
npm run build:b
```

公開テストを実行する。

```bash
npm run test:b
```

最初は失敗する。まだ実装していないからである。失敗内容を読み、次に実装する API を決める。

## System B API 仕様

ここからは、System B の API 仕様をまとめる。

### 共通レスポンス

エラー:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

一覧:

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

### POST /users

公開 API。認証用ユーザーを作成する。

Request:

```json
{
  "username": "alice",
  "password": "password123"
}
```

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
- `409 CONFLICT`: `username` 重複

### GET /terms

公開 API。用語一覧を取得する。

Query:

- `limit`
- `offset`

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

公開 API。用語を作成する。

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
- `409 CONFLICT`: `term` 重複

### GET /terms/:termId

公開 API。用語詳細を取得する。

Response: `200 OK`

レスポンスボディは `Term`。

エラー:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`

### PATCH /terms/:termId

公開 API。用語を部分更新する。少なくとも 1 項目を指定する。

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
- `409 CONFLICT`: `term` 重複

### DELETE /terms/:termId

公開 API。用語を削除する。

Response: `204 No Content`

エラー:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`
- `409 CONFLICT`: 用例が紐付いている

### GET /terms/:termId/examples

公開 API。指定した用語に紐付く全ユーザーの用例を一覧取得する。

Query:

- `limit`
- `offset`

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

認証必須 API。用例を作成する。

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

認証必須 API。所有者だけが用例を部分更新できる。少なくとも 1 項目を指定する。

更新可能項目:

- `body`
- `collectedDate`
- `note`

Request:

```json
{
  "body": "PUT は同じリクエストを複数回送っても結果が変わらないように設計する。",
  "collectedDate": "2026-04-29",
  "note": "更新後の備考"
}
```

Response: `204 No Content`

エラー:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`: 他ユーザーの用例
- `404 NOT_FOUND`

### DELETE /examples/:exampleId

認証必須 API。所有者だけが用例を削除できる。

Response: `204 No Content`

エラー:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`: 他ユーザーの用例
- `404 NOT_FOUND`

## 実装チェックリスト

System B 実装時に確認する。

- `POST /users` はパスワードを Argon2 でハッシュ化して保存している。
- `POST /users` のレスポンスにパスワードやハッシュを含めていない。
- Basic 認証失敗時は `401 UNAUTHORIZED`。
- Basic 認証失敗時は `WWW-Authenticate: Basic realm="backend-training"` を返している。
- 用語 CRUD は認証不要。
- 用例作成、更新、削除は認証必須。
- 用例一覧と詳細は認証不要。
- 他ユーザーの用例更新・削除は `403 FORBIDDEN`。
- 用語一覧は `limit` / `offset` / `total` に対応している。
- 用例一覧も `limit` / `offset` / `total` に対応している。
- `term` 重複は `409 CONFLICT`。
- `username` 重複は `409 CONFLICT`。
- 用例がある用語削除は `409 CONFLICT`。
- 存在しない用語・用例は `404 NOT_FOUND`。
- 入力不正は `400 VALIDATION_ERROR`。
- 想定外エラー以外で `500` を返していない。
- フロントエンドとの型共有やコード共有をしていない。
- ORM を使っていない。

## よくある失敗

### `PATCH` でレスポンスボディを返してしまう

この教材では `PATCH` 成功時は `204 No Content` である。ボディは返さない。

### 用例詳細に認証を要求してしまう

System B の用例は誰でも読める。認証が必要なのは作成、更新、削除である。

### 他ユーザーの用例を `404` にしてしまう

System B では他ユーザーの用例も読める。更新や削除をしようとしたときは `403 FORBIDDEN` である。

### 用例一覧にページングを入れ忘れる

`GET /terms` だけでなく、`GET /terms/:termId/examples` もページング対象である。

### パスワードを平文保存してしまう

レスポンスに出さないだけでは不十分である。DB の `password_hash` に Argon2 ハッシュを保存する。

### バリデーションを DB 任せにする

入力不正は `400 VALIDATION_ERROR` である。DB エラーが `500` になる前に API 側で検証する。

## 発展課題

本編の後に任意で扱う。

### トランザクション

複数の SQL を 1 つの処理として扱いたい場合に使う。

例:

- 用例を作成する。
- 同時に採集ログを別テーブルに書く。
- 片方だけ成功すると困る。

この場合、commit / rollback が必要になる。

### ストリーミング

大量の用例を一度にメモリへ載せず、少しずつ返したい場合に使う。

例:

- 用例を JSON Lines でエクスポートする。
- 大量の用語一覧を少しずつ返す。

本編では扱わない。

## 最後に

バックエンド実装は、仕様をコードに翻訳する作業である。

この教材では小さな API を作る。しかし、その中にはバックエンド開発で繰り返し使う基本が入っている。

- API は約束である。
- DB は状態を持つ。
- 入力値は信用しない。
- エラーは仕様である。
- 認証と認可は違う。
- テストは仕様を確認する手段である。

System B の用例採集 API は、REST API、CRUD、DB、バリデーション、Basic 認証、所有者チェックを一通り実装するための題材である。

実装が終わったら、公開テストが通るかだけでなく、各 API がこの `MAIN.md` の仕様を満たしているかを確認する。テストに合わせるのではなく、仕様に合わせる。それがこの教材の到達点である。
