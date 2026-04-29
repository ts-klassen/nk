# Node.js バックエンド教材作成 TODO

## 目的

新卒社員向けに、Node.js / TypeScript / Express / MySQL を使ったバックエンド教材と課題を作成する。

この教材の目的は、Node.js の先端機能や Express 固有の高度な知識を身につけることではない。REST API、CRUD、DB 連携、入力バリデーション、エラーハンドリング、Basic 認証を通じて、バックエンド開発の基礎を学ぶことを目的にする。

## 現在の状態

- [x] 要件ヒアリング
- [x] システム A / B の基本仕様決定
- [x] TODO 作成
- [x] 教材本文作成
- [x] システム A 実装
- [x] システム B 課題文作成
- [x] システム B 公開テスト作成
- [x] 全体整合性確認

## 作成する成果物

- 教材
- システム A の実装
- システム A の API 仕様書
- システム A の DB スキーマ SQL
- 課題文
- システム B の API 仕様書
- システム B の DB スキーマ SQL
- システム B の公開テスト
- 実行手順

## 作成しないもの

- フロントエンド
- フロントエンドと共有する型・コード
- 非公開テスト
- 受講生向けセルフチェックリスト
- migration ツール
- ORM を使った実装
- JWT 認証
- セッション管理
- 動的 HTML 生成

## 決定済み技術方針

- Node.js 22 以上
- Express v5
- TypeScript
- `tsc` によるビルド
- MySQL
- Docker Compose
- `express`
- `mysql2`
- `mocha`
- `chai`
- `express-validator`
- `argon2`
- ORM は使わない
- SQL を直接書く
- migration ツールは使わない
- `schema.sql` と必要に応じて `seed.sql` を使う

## 共通 API 方針

- JSON ベースの REST API とする。
- API 仕様書は Markdown で厳密に書く。
- `POST` 成功時は `201 Created` とする。
- `PATCH` 成功時は `204 No Content` とする。
- `DELETE` 成功時は `204 No Content` とする。
- 一覧 API は `limit` / `offset` を使う。
- `limit` のデフォルトは `20`、最大は `100` とする。
- `offset` のデフォルトは `0` とする。
- 一覧の並び順は `id ASC` とする。
- 一覧レスポンスには `total` を必ず含める。
- `createdAt` / `updatedAt` は RFC 3339 風の日時文字列にする。
- 日付だけの項目は `YYYY-MM-DD` にする。
- 主キーは MySQL の `AUTO_INCREMENT` とする。

## 共通エラー方針

エラーレスポンスは次の形式に統一する。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です"
  }
}
```

使うエラーコードは次の通り。

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `INTERNAL_SERVER_ERROR`

HTTP ステータスコードとの対応は次の通り。

- `400 Bad Request`: 入力バリデーションエラー
- `401 Unauthorized`: Basic 認証失敗
- `403 Forbidden`: 認証済みだが権限がない
- `404 Not Found`: 対象リソースが存在しない
- `409 Conflict`: 一意制約違反、または子データがあるため削除できない
- `500 Internal Server Error`: 想定外のサーバーエラー

`401 Unauthorized` では `WWW-Authenticate: Basic realm="backend-training"` ヘッダを返す。

## システム A: 書籍管理

ログイン不要で書籍 CRUD ができる。ユーザー登録すると、自分専用の読書メモを CRUD できる。

ログインした状態で、本に紐付いた自分の読書メモを全て見られる。他ユーザーの読書メモは見られず、他ユーザーの読書メモ ID にアクセスした場合は `403 Forbidden` とする。

### リソース

- ユーザー
- 書籍
- 読書メモ

### 公開 API

- `POST /users`
- `GET /books`
- `POST /books`
- `GET /books/:bookId`
- `PATCH /books/:bookId`
- `DELETE /books/:bookId`

### 認証必須 API

- `GET /books/:bookId/reading-notes`
- `POST /books/:bookId/reading-notes`
- `GET /reading-notes/:noteId`
- `PATCH /reading-notes/:noteId`
- `DELETE /reading-notes/:noteId`

## システム B: 用例採集

ログイン不要で用語 CRUD ができる。ユーザー登録すると、用例を CRUD できる。

ログインせずに、用語に紐付いた用例を全て見られる。他ユーザーからも用例は見られるが、編集削除は所有者だけができる。

### リソース

- ユーザー
- 用語
- 用例

### 公開 API

- `POST /users`
- `GET /terms`
- `POST /terms`
- `GET /terms/:termId`
- `PATCH /terms/:termId`
- `DELETE /terms/:termId`
- `GET /terms/:termId/examples`
- `GET /examples/:exampleId`

### 認証必須 API

- `POST /terms/:termId/examples`
- `PATCH /examples/:exampleId`
- `DELETE /examples/:exampleId`

## 作業一覧

1. [全体構成を設計する](CODEX_TODO.d/01_全体構成.md)
2. [共通 API 規約を定義する](CODEX_TODO.d/02_共通API規約.md)
3. [共通認証仕様を定義する](CODEX_TODO.d/03_共通認証仕様.md)
4. [共通 DB・テスト実行方針を定義する](CODEX_TODO.d/04_共通DBとテスト実行.md)
5. [システム A の API 仕様を作る](CODEX_TODO.d/05_システムA_API仕様.md)
6. [システム A の DB スキーマを作る](CODEX_TODO.d/06_システムA_DBスキーマ.md)
7. [システム A を実装する](CODEX_TODO.d/07_システムA_実装.md)
8. [システム A の教材を書く](CODEX_TODO.d/08_システムA_教材.md)
9. [システム A の任意テスト教材を作る](CODEX_TODO.d/09_システムA_任意テスト教材.md)
10. [システム B の API 仕様を作る](CODEX_TODO.d/10_システムB_API仕様.md)
11. [システム B の DB スキーマを作る](CODEX_TODO.d/11_システムB_DBスキーマ.md)
12. [システム B の課題文を作る](CODEX_TODO.d/12_システムB_課題文.md)
13. [システム B の公開テストを作る](CODEX_TODO.d/13_システムB_公開テスト.md)
14. [学習構成を整理する](CODEX_TODO.d/14_学習構成.md)
15. [全体の整合性を確認する](CODEX_TODO.d/15_整合性確認.md)

## 現在の完了状態

教材本文、システム A 実装、システム B 課題文、システム B 公開テスト、整合性確認まで完了している。

以後はレビュー指摘があれば、この TODO 群と成果物の両方を更新し、完了状態との矛盾が残らないようにする。
