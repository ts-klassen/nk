# Node.js バックエンド研修メイン教材

## はじめに

この教材では、2 つの小さなシステムを扱う。ひとつは見本として参照する `system-a`、もうひとつは課題として実装する `system-b` である。どちらも、何かを記録し、後から探し、必要に応じて直せるようにするためのシステムである。

### 書籍管理システム

`system-a` は、書籍管理システムである。

書籍管理システムは、個人の蔵書、部署の本棚、研修用の参考書、社内図書室などで、本の情報を整理するために使う。本は、所有しているだけでは後から探しにくい。誰が見ても同じ本であると分かる情報を残しておくことで、一覧で確認したり、特定の本を探したり、重複して登録しないようにしたりできる。

このシステムでは、書籍としてタイトル、著者、出版日、ISBN を管理する。ISBN は、書籍を識別するために出版物へ割り当てられる番号である。同じタイトルの本でも、版や出版形態が違えば別の ISBN になることがある。人間にとっての「本の名前」だけでは曖昧な場合があるため、システムでは ISBN を使って同じ本の重複登録を防ぐ。

また、このシステムでは書籍そのものだけでなく、読書メモも扱う。読書メモは、本を読んだ人が自分のために残す記録である。たとえば、参考になったページ、後で読み返したい章、実務で使えそうな内容、疑問に思ったことなどを書く。読書メモは本と関連付けて保存するが、内容は書いた本人のものなので、他の人が閲覧・編集・削除できないようにする。

### 用例採集システム

`system-b` は、用例採集システムである。

用例採集システムは、言葉の使われ方を集めるために使う。新しい業務用語、専門用語、社内だけで使われる言い回し、設計やレビューで頻繁に出る表現は、辞書的な説明だけでは理解しにくい。実際にどの文脈で、どのような文として使われていたかを残すことで、後から学習や共有に使える。

このシステムでは、まず用語を管理する。用語とは、意味を確認したい言葉や、チーム内で共通理解を持ちたい言葉である。たとえば「排他制御」「冪等性」「トランザクション」のような言葉を登録する。用語だけを登録しても、実際の使われ方は分からないため、このシステムでは用例も集める。なお、用例採集のバイアスを防ぐため、用語に意味は付与しない。どれだけ離れた用法であっても、真逆の意味であっても、同じ用語に用例を登録する。

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

初回だけ、MySQL 接続用の `.env` を作る。パスワードは固定値にせず、`openssl` で生成する。

```bash
cp .env.example .env
```

次に、MySQL 用のパスワードを生成する。

```bash
openssl rand -hex 32
```

表示された文字列を、`.env` の `MYSQL_PASSWORD=` の右側に書く。

DB を起動、初期化、API サーバー起動、テスト実行するターミナルでは、最初に次の 3 行を実行する。新しいターミナルを開いた場合も、そのターミナルで最初に同じ 3 行を実行する。

```bash
set -a
source .env
set +a
```

`.env` には `MYSQL_DATABASE` と `PORT` を書かない。`system-a`、`system-b`、練習用サーバーで使う値が違うため、サーバー起動時に明示する。

```bash
npm install
npm run db:up
```

`npm install` は、この教材で使うライブラリをインストールする。`npm run db:up` は、この教材の `package.json` に用意されているコマンドで、データベースを起動する。

すでに古いパスワードで MySQL の volume を作っている場合、新しい `MYSQL_PASSWORD` ではログインできない。その場合は、教材用 DB のデータを消してよいことを確認してから volume を削除する。

```bash
npm run db:destroy
npm run db:up
```

`db:down` と `db:destroy` は npm 標準のコマンドではなく、この教材の `package.json` に定義した script である。`db:down` は MySQL コンテナを停止するだけで、DB データは残る。`db:destroy` は Docker volume を削除するため、DB データも消える。

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

練習用サーバーの `/hello` に対して、HTTP メソッド `PATCH` でリクエストを送れ。

レスポンスのステータスを確認せよ。

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
| `types.ts` | `req.user` などの型定義 |

最初に実装する項目:

- `createApp()`
- `express.json()`
- 共通エラーハンドラ
- `queryRows()` / `execute()`
- `server.ts` から `createApp()` を起動する処理

`db.ts` では `MYSQL_PASSWORD` と `MYSQL_DATABASE` を環境変数から読む。`MYSQL_DATABASE` にデフォルト値を置いてはいけない。設定し忘れた場合は、別システムの DB に接続するより、起動時に失敗させる。

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
課題としては、起動さえすれば良い。
他の項目は、第 6 章以降、必要に迫られたら作るでも良い。

ヒント: 最低限起動させるだけであれば、 10 行程度の簡単な server.ts でも十分。

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

### `mysql2` で SQL を実行する

この教材では ORM は使わず、SQL を直接書く。Node.js から MySQL に接続するために `mysql2` を使う。

`system-a/src/db.ts` は、MySQL への接続処理をまとめたファイルである。アプリケーションの各 API から毎回接続設定を書くのではなく、`queryRows()` と `execute()` を呼ぶ。

`queryRows()` は `SELECT` 用である。結果は行の配列として返る。

```ts
const rows = await queryRows<BookRow[]>(
  "SELECT * FROM books WHERE id = ?",
  [bookId]
);
```

`execute()` は `INSERT`、`UPDATE`、`DELETE` 用である。`INSERT` 後は `insertId` で作成された行の ID を取得できる。

```ts
const result = await execute(
  "INSERT INTO books (isbn, title, author, published_date) VALUES (?, ?, ?, ?)",
  [req.body.isbn, req.body.title, req.body.author, req.body.publishedDate ?? null]
);

const bookId = Number(result.insertId);
```

SQL の中の `?` はプレースホルダーである。`?` の位置に、後ろの配列の値が順番に入る。

ユーザー入力を SQL 文字列へ直接埋め込んではいけない。

悪い例:

```ts
const sql = `SELECT * FROM books WHERE title = '${req.query.title}'`;
```

この書き方では、ユーザーが送った文字列が SQL の一部として解釈される。たとえば入力に `' OR 1=1 --` のような SQL 断片が含まれると、本来とは違う条件で検索されたり、別の SQL として実行されたりする危険がある。これを SQL インジェクションという。

良い例:

```ts
const rows = await queryRows<BookRow[]>(
  "SELECT * FROM books WHERE title = ?",
  [req.query.title]
);
```

この書き方では、SQL の構造と値を分けて MySQL に渡す。`req.query.title` は SQL の命令ではなく、検索値として扱われる。

プレースホルダーにできるのは値だけである。テーブル名、カラム名、`ORDER BY` の向きなどをユーザー入力から直接作ってはいけない。どうしても動的に変える場合は、許可する値をコード側で固定して選ぶ。

`PATCH /books/:bookId` の `UPDATE` では、リクエストボディのキーをそのまま SQL に入れているのではない。`isbn`、`title`、`author`、`publishedDate` のような許可済みフィールドだけを確認し、コード内で決めた DB カラム名を使う。

```ts
const assignments: string[] = [];
const values: unknown[] = [];

if (Object.prototype.hasOwnProperty.call(req.body, "isbn")) {
  assignments.push("isbn = ?");
  values.push(req.body.isbn);
}
if (Object.prototype.hasOwnProperty.call(req.body, "publishedDate")) {
  assignments.push("published_date = ?");
  values.push(req.body.publishedDate);
}
```

この場合、SQL に入るカラム名はコード内の固定文字列だけである。ユーザー入力は `values` に入り、`?` の値として渡される。

### 日時フォーマット

`created_at` / `updated_at` は MySQL の `DATETIME` である。`DATETIME` はタイムゾーン情報を持たないため、この教材では「DB に保存されている `DATETIME` は UTC として扱う」という規約にする。

`docker-compose.yml` では MySQL のデフォルトタイムゾーンを `+00:00` にしている。さらに `system-a/src/db.ts` では、SQL を実行する接続ごとに `SET time_zone = '+00:00'` を実行する。これにより、`CURRENT_TIMESTAMP` で作られる `created_at` / `updated_at` も UTC の時刻になる。

日時については、次の 3 つを分けて考える。

| 場所 | 方針 |
| --- | --- |
| DB 保存 | UTC の `DATETIME` として保存する |
| API 出力 | `Asia/Tokyo` に変換して RFC 3339 date-time として返す |
| API 入力 | Luxon で ISO の日時表現を読み、UTC に変換して保存する |

この教材では、API の日時は次の形で返す。

```text
2026-04-28T11:39:55+09:00
```

これは RFC 3339 の date-time 形式である。DB には UTC で保存し、API レスポンスを作るときに `Asia/Tokyo` の時刻へ変換して `+09:00` を付ける。

たとえば DB の `created_at` が UTC の `2026-04-28 02:39:55` なら、API では次のように返す。

```text
2026-04-28T11:39:55+09:00
```

`system-a` を作った人は、宗教上の理由で `2026-04-28 11:39:55` のようなスペース区切りを API に出せないため、`system-a/src/app.ts` でレスポンス用の文字列に変換している。日時の扱いには Luxon を使う。

`DateTime.fromSQL(value, { zone: "utc" })` で、DB から来た `DATETIME` 文字列を UTC として解釈する。`setZone("Asia/Tokyo")` で東京時間に変換し、`toISO()` で `T` 区切りと `+09:00` を含む文字列にする。具体的なコードは `system-a/src/app.ts` の `formatDateTime()` を読む。

この処理は Luxon に任せる。独自の RFC 3339 パーサーや日時専用モジュールは作らない。Node.js 標準の `Date` は UTC への変換には使えるが、入力文字列によっては実行環境のタイムゾーンに影響され、存在しない日付を別の日付へ正規化して受け入れることもある。そのため、入力日時の解釈、検証、タイムゾーン変換は Luxon で行う。

`mysql2` の設定では `dateStrings: true` を指定しているため、MySQL の `DATETIME` は基本的に文字列として届く。その文字列は UTC として扱う。DB に UTC ではない値を書き込むと、日時の解釈がずれる。

リクエストボディで日時を受け取る API では、`Date.parse()` や正規表現だけで処理しない。Luxon の `DateTime.fromISO()` で ISO の日時表現を読み取り、UTC の `YYYY-MM-DD HH:mm:ss` に変換して保存する。

入力で受け入れる形式は、Luxon の `fromISO()` が受け付ける ISO datetime に限定する。`Z`、`+09:00`、`+0900`、小数秒付きなどはライブラリに任せる。スペース区切りの日時は受け入れない。タイムゾーン指定がない ISO datetime は、この教材では UTC として扱う。

`publishedDate` のような日付だけの値は、日時ではないので `DateTime.fromSQL(value, { zone: "utc" }).toISODate()` で `YYYY-MM-DD` にする。`null` の場合は `null` のまま返す。

`system-b` でも、同じ API 仕様にするなら Luxon を使って同じ方針で実装する。DB には UTC で保存し、レスポンスの `createdAt` / `updatedAt` は `2026-04-28T11:39:55+09:00` の形にそろえる。

### CRUD 処理の読み方

`books` テーブルのカラム名は `snake_case` である。一方、API レスポンスでは JavaScript で扱いやすい `camelCase` を使う。`mapBook()` は DB の行を API の JSON に変換する関数である。

```text
published_date -> publishedDate
created_at     -> createdAt
updated_at     -> updatedAt
```

`findBook()` は、指定された ID の本を 1 件取得する関数である。本が存在しない場合は `404 NOT_FOUND` を投げる。詳細取得、更新、削除のどこでも同じ確認が必要なので、関数に分けている。

各 API は次の順番で読む。

| API | 主な流れ |
| --- | --- |
| `GET /books` | `limit` / `offset` を検証し、総件数と一覧を `SELECT` する |
| `POST /books` | JSON body を検証し、`INSERT` し、作成した行を返す |
| `GET /books/:bookId` | `bookId` を検証し、`findBook()` で取得する |
| `PATCH /books/:bookId` | `bookId` と body を検証し、存在確認してから `UPDATE` する |
| `DELETE /books/:bookId` | `bookId` を検証し、存在確認してから `DELETE` する |

### 入力バリデーション

API に届く値は、すべて外部入力である。正しい画面から送られてくるとは限らないし、`curl` で任意の値を送ることもできる。そのため、SQL を実行する前に入力値を検証する。

この教材では `express-validator` を使う。検証する場所は 3 種類ある。

| 入力の場所 | Express で読む場所 | 例 |
| --- | --- | --- |
| path parameter | `req.params` | `/books/:bookId` の `bookId` |
| query parameter | `req.query` | `/books?limit=10&offset=0` の `limit` / `offset` |
| JSON body | `req.body` | `POST /books` の `isbn` / `title` / `author` |

`system-a/src/validation.ts` には、複数の API で使う共通 validator がある。

```ts
export function validateId(name: string): RequestHandler[] {
  return [
    param(name).isInt({ min: 1 }).toInt(),
    handleValidationErrors
  ];
}
```

`param(name)` は path parameter を検証する。`isInt({ min: 1 })` は 1 以上の整数か確認する。`toInt()` は文字列として届いた値を数値へ変換する。

`validatePagination()` は query parameter を検証する。

```ts
query("limit").optional().isInt({ min: 1, max: 100 }).toInt()
query("offset").optional().isInt({ min: 0 }).toInt()
```

`optional()` は、その項目が省略されてもよいという意味である。省略された場合、`getPagination()` が `limit = 20`、`offset = 0` を使う。

JSON body の検証は `system-a/src/app.ts` にある。

```ts
body("isbn").isString().matches(/^(?:\d{10}|\d{13})$/)
body("title").isString().trim().isLength({ min: 1, max: 255 })
body("author").isString().trim().isLength({ min: 1, max: 255 })
```

`body("title")` は JSON body の `title` を検証する。`trim()` は前後の空白を取り除く。空白だけの文字列は、`trim()` 後に長さ 0 になり、`isLength({ min: 1 })` で不正になる。

`POST /books` では、必要な項目をすべて検証してから処理に入る。

```ts
[
  body("isbn").isString().matches(/^(?:\d{10}|\d{13})$/),
  body("title").isString().trim().isLength({ min: 1, max: 255 }),
  body("author").isString().trim().isLength({ min: 1, max: 255 }),
  body("publishedDate")
    .optional({ nullable: true })
    .isString()
    .bail()
    .custom(isValidDateOnly),
  handleValidationErrors
]
```

`PATCH /books/:bookId` は部分更新なので、すべての項目を必須にはしない。ただし、更新する項目が 1 つもないリクエストは意味がないため、`requireAtLeastOne()` で少なくとも 1 項目が含まれることを確認する。

```ts
[
  ...validateId("bookId"),
  requireAtLeastOne(["isbn", "title", "author", "publishedDate"]),
  body("isbn").optional().isString().matches(/^(?:\d{10}|\d{13})$/),
  body("title").optional().isString().trim().isLength({ min: 1, max: 255 }),
  body("author").optional().isString().trim().isLength({ min: 1, max: 255 }),
  body("publishedDate")
    .optional({ nullable: true })
    .isString()
    .bail()
    .custom(isValidDateOnly),
  handleValidationErrors
]
```

どの検証でも、失敗した場合は `handleValidationErrors` が `400 VALIDATION_ERROR` に変換する。API ごとにバラバラのエラー形式を返さない。

アプリケーション側のバリデーションと、DB の制約は役割が違う。文字数、形式、数値範囲は API の入口で `400` にする。一方、`isbn` の一意制約や外部キー制約は DB に最終判断させ、MySQL のエラーを `409 CONFLICT` に変換する。

`isbn` は一意である。同じ ISBN を登録しようとすると MySQL が一意制約エラーを返す。`system-a/src/errors.ts` の `isDuplicateEntry()` は、MySQL の `errno` が `1062` かどうかを見て、`409 CONFLICT` に変換する。

書籍に読書メモが紐付いている場合、書籍は削除できない。このとき MySQL は外部キー制約エラーを返す。`isReferencedByForeignKey()` は `errno` が `1451` かどうかを見て、`409 CONFLICT` に変換する。

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

`system-b` でも、`system-a` と同じ考え方で入力を検証する。

| API | 検証する値 |
| --- | --- |
| `GET /terms` | `limit` / `offset` |
| `POST /terms` | body の `term` |
| `GET /terms/:termId` | path の `termId` |
| `PATCH /terms/:termId` | path の `termId`、body に `term` が 1 項目以上あること、`term` の形式 |
| `DELETE /terms/:termId` | path の `termId` |

`termId` は 1 以上の整数でなければならない。`term` は文字列で、前後の空白を取り除いた後に 1 文字以上 255 文字以下でなければならない。空文字、空白だけの文字列、長すぎる文字列は `400 VALIDATION_ERROR` にする。

`PATCH /terms/:termId` は部分更新だが、この章で更新できる項目は `term` だけである。そのため、空の JSON `{}` は `400 VALIDATION_ERROR` にする。

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

ユーザー登録では、ユーザー名とパスワードを受け取る。ただし、パスワードをそのままデータベースへ保存してはいけない。

理由は、データベースの内容が漏れたときの被害が大きすぎるからである。平文のパスワードが保存されていると、漏れた瞬間にそのサービスへログインできる。さらに、利用者が別サービスでも同じパスワードを使っている場合、被害は他のサービスにも広がる。

管理者や開発者も、利用者のパスワードを知る必要はない。ログイン時に確認できれば十分である。そのため、システムはパスワードそのものではなく、パスワードから作ったハッシュを保存する。

ハッシュは一方向の変換である。パスワードからハッシュを作ることはできるが、ハッシュから元のパスワードを取り出すことはできない。ログイン時は、入力されたパスワードと保存済みハッシュを照合する。

この教材ではパスワードハッシュに Argon2 を使う。Argon2 は、パスワード保存用に設計されたハッシュアルゴリズムである。通常の高速なハッシュ関数ではなく、攻撃者が大量の候補パスワードを試しにくいように、計算コストをかける作りになっている。

ユーザー登録では `argon2.hash()` を使う。

```ts
const passwordHash = await argon2.hash(req.body.password);
```

`passwordHash` には、ハッシュ本体だけでなく、Argon2 の種類、パラメータ、ソルトも含まれる。ソルトとは、同じパスワードでも毎回違うハッシュになるように加えられるランダムな値である。

Argon2 の結果は、たとえば次のような文字列になる。

```text
$argon2id$v=19$m=65536,t=3,p=4$...
```

同じ `password123` を登録しても、ソルトが違うため、保存されるハッシュ文字列は毎回同じにはならない。

データベースには `password` ではなく `password_hash` を保存する。API レスポンスにも `password` や `passwordHash` は含めない。ハッシュは元のパスワードそのものではないが、認証に使う重要な値なので、外へ返す必要はない。

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

必要であれば、MySQL に入った値も確認する。

```bash
docker-compose exec mysql mysql -uroot -p"$MYSQL_PASSWORD" backend_training_a_volatile \
  -e "SELECT id, username, password_hash FROM users;"
```

`password_hash` は長い Argon2 文字列になっている。`password123` という平文がそのまま入っていないことを確認する。

`password` は 8 文字以上 72 文字以下に制限する。短すぎるパスワードは推測されやすい。長さの上限は、極端に大きい入力でサーバーに余計な負荷をかけさせないためにも必要である。

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

HTTP リクエストには、メソッド、URL、ヘッダー、ボディーがある。認証情報はボディーではなく、ヘッダーに入れて送る。

Basic 認証では、`Authorization` というヘッダーを使う。

```http
Authorization: Basic base64(username:password)
```

`Authorization` がヘッダー名である。`Basic` は認証方式の名前である。その後ろに、`username:password` を Base64 エンコードした文字列を書く。

Base64 は暗号化ではない。文字列の表現を変えているだけなので、誰でも元に戻せる。この教材では学習用に HTTP で確認するが、実際のサービスで Basic 認証を使う場合は HTTPS が前提である。

Linux では `base64` コマンドでエンコードできる。`echo` は通常末尾に改行を付けるため、`-n` を付けて改行を出さないようにする。

```bash
echo -n 'alice:password123' | base64
```

結果は次のようになる。

```text
YWxpY2U6cGFzc3dvcmQxMjM=
```

この文字列を `Authorization` ヘッダーに入れる。

```bash
curl -i \
  -H "Authorization: Basic YWxpY2U6cGFzc3dvcmQxMjM=" \
  http://127.0.0.1:3000/books/1/reading-notes
```

元に戻せることも確認できる。

```bash
echo -n 'YWxpY2U6cGFzc3dvcmQxMjM=' | base64 -d
```

この例のパスワードは単純な文字だけを使っている。実際のパスワードに `'`、`$`、空白、`!` などシェルで特別扱いされる文字が含まれる場合、コマンドに直接書くと別の意味で解釈されることがある。その場合は、手で Base64 を作るより、後で説明する `curl -u` に任せる方が扱いやすい。

毎回 Base64 を自分で作るのは面倒である。`curl` では `-u` を使うと、`username:password` から `Authorization: Basic ...` ヘッダーを自動で作ってくれる。

```bash
curl -i -u alice:password123 http://127.0.0.1:3000/books/1/reading-notes
```

つまり、上の `-H "Authorization: Basic ..."` と `-u alice:password123` は同じ種類のリクエストである。

サーバー側では、`system-a/src/auth.ts` の `requireAuth` が認証を担当する。

処理の流れ:

1. `req.header("Authorization")` でヘッダーを読む。
2. `Basic ` で始まっているか確認する。
3. `Basic ` の後ろを Base64 デコードする。
4. `username:password` を `:` で分ける。
5. `username` で `users` テーブルを検索する。
6. `argon2.verify()` で、入力されたパスワードと保存済み `password_hash` を照合する。
7. 正しければ `req.user` に認証済みユーザー情報を入れる。

ログイン確認では `argon2.hash()` ではなく `argon2.verify()` を使う。

```ts
const verified = await argon2.verify(user.password_hash, credentials.password);
```

保存済みハッシュには Argon2 のパラメータとソルトが含まれているため、`verify()` はその情報を使って入力パスワードを検証できる。

認証に失敗した場合は `401 Unauthorized` を返す。Basic 認証では、`401` のレスポンスに次のヘッダーも付ける。

```http
WWW-Authenticate: Basic realm="backend-training"
```

`realm` は、認証が必要な範囲の名前である。この教材では固定で `backend-training` とする。

`401` と `403`:

| ステータス | 意味 |
| --- | --- |
| `401` | 認証できていない |
| `403` | 認証済みだが権限がない |

たとえば、パスワードが間違っている場合は `401` である。正しいユーザーとして認証できたが、他人の読書メモを更新しようとした場合は `403` である。

所有者チェックは、DB の行に入っている `user_id` と `req.user.id` を比べて行う。`system-a/src/app.ts` の `assertOwnReadingNote()` がその処理である。

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

確認用にユーザーと本が必要である。第6章の `system-a` 動作確認で `DELETE /books/1` まで実行していると、`books.id = 1` の本は残っていない。DB を初期化してから `system-a` を起動し直す。

```bash
npm run db:reset:a
npm run build:a
MYSQL_DATABASE=backend_training_a_volatile PORT=3000 npm run start:a
```

別のターミナルで、ユーザーと本を作成する。

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

## 第 9 章 振る舞いテスト

すべての API を実装した後に実行する。

```bash
MYSQL_DATABASE=backend_training_b_test_volatile npm run test:b
```

手動確認用に `MYSQL_DATABASE=backend_training_b_volatile PORT=3001 npm run start:b` を起動している場合は、停止してから実行する。

### 課題

`MYSQL_DATABASE=backend_training_b_test_volatile npm run test:b` が通るようにせよ。

テストが失敗した場合は、失敗メッセージと API 仕様を照らし合わせて `system-b/src` の実装を直せ。テストを通すためだけに振る舞いテストを書き換えるな。

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

## 付録 B. 教材上の単純化と実務での注意

この教材では、バックエンド開発の基本を学びやすくするために、実務ではそのまま採用しない設計や運用も扱っている。

次の表は、「教材では実施したが、実際の開発ではめったに実施しない、または実施前に必ず検討すべきこと」のまとめである。教材の実装が間違いという意味ではない。学習用に範囲を絞った結果であり、実務では追加の判断が必要になる。

| 教材・演習で扱ったこと | 実務での注意 |
| --- | --- |
| 認証なしで共有リソースを作成・更新・削除できる | 誰でも共有データを変更できる設計はまれである。閲覧は公開でも、作成・更新・削除はログイン、ロール、承認、監査ログを組み合わせることが多い。 |
| 誰でも `DELETE /books/:bookId` や `DELETE /terms/:termId` を実行できる | 共有リソースの削除は影響範囲が広い。管理者だけ、作成者だけ、または一定条件を満たす場合だけ許可するのが一般的である。 |
| `DELETE` で即座に物理削除する | 物理削除すると復元、監査、問い合わせ対応が難しくなる。実務では論理削除、アーカイブ、削除予約、復元期間、関連データの扱いを先に決める。 |
| 子データがある親リソースを外部キー制約で削除拒否する | 制約に任せる方針自体は有効である。ただし実務では、拒否するのか、子データごと削除するのか、別の親へ移すのかを業務要件として決める。 |
| アプリケーションから MySQL に `root` 相当のユーザーで接続する | 実務のアプリ用 DB ユーザーは最小権限にする。通常実行に `DROP`、`ALTER`、ユーザー管理権限は不要であり、migration 用、運用用、アプリ実行用のユーザーを分ける。 |
| `db:destroy` や `db:reset:*` で DB や volume を消して作り直す | ローカル学習用の操作である。本番や共有環境では、バックアップ、承認、対象環境の確認、復旧手順なしに破壊的操作を実行しない。 |
| `schema.sql` を流し直してスキーマを作る | 実務では migration ツールで変更履歴を管理することが多い。既存データを残したまま、順番に、安全に、再現可能な形でスキーマを変更する必要がある。 |
| Basic 認証を HTTP で試す | Basic 認証の値は Base64 であり暗号化ではない。実務で Basic 認証を使う場合も HTTPS が前提であり、一般的なサービスではセッション、OIDC/OAuth、API トークンなどを検討する。 |
| `curl -u alice:password123` のようにパスワードをコマンドに直接書く | 手元の演習では分かりやすいが、実務ではシェル履歴やプロセス一覧に残る可能性がある。パスワード入力プロンプト、環境変数、シークレット管理を使う。 |
| `.env` に DB パスワードを置く | ローカル開発ではよく使うが、`.env` を Git にコミットしてはいけない。本番ではシークレット管理サービス、権限管理、ローテーションを使う。 |
| ユーザー登録を username と password だけで完結させる | 実務では、メール確認、パスワードリセット、アカウント停止、レート制限、不正登録対策、監査ログなどが必要になることが多い。 |
| 所有者かどうかだけで権限を判定する | 教材では分かりやすいが、実務では管理者、チーム、組織、テナント、共有設定など複数の権限軸が入ることが多い。 |
| 用例をログインなしで誰でも閲覧できる | 公開範囲は業務要件で決める。社内発言、顧客情報、著作物、個人情報を含む可能性があるデータは、公開前に分類とマスキングを検討する。 |
| 単純な CRUD をトランザクションなしで実装する | 1 件の単純な `INSERT` や `UPDATE` だけなら問題になりにくい。複数テーブルを更新する処理、在庫や残高のように競合が起きる処理では、トランザクションとロックを検討する。 |
| 一覧 API で毎回 `COUNT(*)` して `total` を返す | 小さいテーブルでは扱いやすい。大きいテーブルでは `COUNT(*)` が重くなることがあり、インデックス設計、カーソルページング、概算件数、`total` を返さない設計を検討する。 |
| SQL を API ハンドラー内に直接書く | 学習には分かりやすい。実務では、処理が増えるにつれて repository 層、クエリビルダー、ORM、SQL レビュー、テストデータ管理などを検討する。ただし、プレースホルダーで値を渡す方針は実務でも重要である。 |
| エラーメッセージを固定文言にして詳細を返さない | 内部情報を返さない方針はよい。一方で実務では、利用者向けの詳細、開発者向けログ、問い合わせ用の request id、監視通知を分けて設計する。 |
| 想定外エラーを `console.error` するだけにする | 教材では十分だが、実務では構造化ログ、監視、アラート、トレース、監査ログを用意する。特に認証失敗、権限エラー、削除操作は後から追跡できるようにする。 |
| ローカル Docker の MySQL 1 台だけで確認する | 実務ではバックアップ、リストア、監視、接続数、タイムアウト、冗長化、メンテナンス、バージョンアップ方針が必要になる。 |
| API レスポンスの時刻を常に `Asia/Tokyo` に変換する | 日本向けの教材としては分かりやすい。実務では API 契約として、UTC で返すのか、利用者のタイムゾーンで返すのか、日付だけの項目をどう扱うのかを明示する。 |
| 連番の `AUTO_INCREMENT` ID をそのまま API に出す | 一般的な設計ではあるが、ID が推測可能になる。推測されても権限チェックで守れる設計にするか、必要に応じて UUID や ULID などを検討する。 |
| 認証 API にレート制限を置かない | 教材では省略している。実務ではログイン試行、ユーザー登録、パスワードリセットなどにレート制限や不正検知を入れる。 |
| フロントエンドやブラウザ利用を考慮しない | この教材では API とコマンド確認に集中している。ブラウザから使う場合は、CORS、Cookie、CSRF、SameSite、画面側の入力制御も設計対象になる。 |

## 参考資料

- `docs/system-a/api.md`
- `docs/system-a/lesson.md`
- `docs/system-a/testing.md`
- `docs/system-b/api.md`
- `docs/system-b/assignment.md`
- `docs/consistency.md`
