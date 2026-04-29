# システム B 課題: 用例採集 API

## 課題

用例採集 API を一から実装する。

API 仕様は [api.md](api.md) を参照する。DB スキーマは `system-b/sql/schema.sql` を使う。振る舞いテストは `system-b/test` にある。

## 作るもの

- ユーザー登録 API
- Basic 認証
- 用語 CRUD
- 用例 CRUD
- 共通エラーレスポンス
- 入力バリデーション
- MySQL 連携
- 用語削除時の子データあり `409 Conflict`
- 用例の所有者チェック

## 重要な仕様

用語はログインなしで CRUD できる。

用例はログインなしで閲覧できる。作成、更新、削除には Basic 認証が必要。用例の更新と削除は所有者だけができる。

用語は純粋に用語のみを保持する。説明文は持たない。

## 提供物

- `docs/system-b/api.md`: API 仕様書
- `system-b/sql/schema.sql`: DB スキーマ
- `system-b/test/system-b.test.ts`: 振る舞いテスト
- `system-b/src/server.ts`: 最小の雛形

## 実行方法

依存関係をインストールする。

```bash
npm install
```

初回だけ、MySQL 接続用の `.env` を作る。

```bash
cp .env.example .env
```

MySQL 用のパスワードを生成する。

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

MySQL を起動する。

```bash
npm run db:up
```

テストを実行する。

```bash
MYSQL_DATABASE=backend_training_b_test_volatile npm run test:b
```

`npm run test:b` は TypeScript をビルドしてから振る舞いテストを実行する。
振る舞いテストは `MYSQL_DATABASE` に指定した DB を作り直す。
安全のため、テストが初期化できる DB 名は `_volatile` で終わる名前だけに制限している。

## 実装場所

`system-b/src` に実装する。

必要に応じてファイルを追加してよい。`system-b/sql/schema.sql` と `docs/system-b/api.md` の仕様から外れないこと。

## 技術条件

- Node.js 22 以上
- TypeScript
- Express v5
- MySQL
- `mysql2`
- `luxon`
- `express-validator`
- `argon2`
- Mocha / Chai

ORM、migration ツール、JWT、セッション管理は使わない。

## API 実装方針

### ユーザー

`POST /users` は公開 API。

パスワードは Argon2 でハッシュ化して保存する。レスポンスにパスワードやハッシュ値を含めない。

### 用語

用語 API は全て公開 API。

- `GET /terms`
- `POST /terms`
- `GET /terms/:termId`
- `PATCH /terms/:termId`
- `DELETE /terms/:termId`

`term` は一意。重複時は `409 Conflict`。

用語に用例が紐付いている場合、用語削除は `409 Conflict`。
削除前に用例件数を確認するのではなく、DB の外部キー制約で削除を拒否し、その外部キー制約エラーを `409 Conflict` に変換する。

### 用例

用例の取得 API は公開 API。

- `GET /terms/:termId/examples`
- `GET /examples/:exampleId`

用例の作成、更新、削除は Basic 認証必須。

- `POST /terms/:termId/examples`
- `PATCH /examples/:exampleId`
- `DELETE /examples/:exampleId`

他ユーザーの用例を更新または削除しようとした場合は `403 Forbidden`。

## エラーレスポンス

全 API で次の形式を使う。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

使うエラーコード:

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `INTERNAL_SERVER_ERROR`

`INTERNAL_SERVER_ERROR` は想定外エラー時の共通コードである。通常の課題実装で意図的に発生させる対象ではなく、振る舞いテストの主対象にも含めない。

`401 Unauthorized` では `WWW-Authenticate` ヘッダを返す。

```http
WWW-Authenticate: Basic realm="backend-training"
```

## 提出

リポジトリ丸ごとを提出する。

提出物には、実装したソースコード、SQL、振る舞いテストを実行できる状態の設定を含める。
