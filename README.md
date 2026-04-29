# Node.js バックエンド研修

新卒社員向けの Node.js / TypeScript / Express / MySQL バックエンド教材です。

目的は Node.js の先端機能を学ぶことではなく、HTTP で JSON を返すバックエンドの作り方を、固定値を返す `GET` / `POST` から順番に学ぶことです。途中で REST API、CRUD、DB 連携、入力バリデーション、エラーハンドリング、Basic 認証を扱います。

## 前提

- Node.js 22 以上
- Docker Compose
- npm

## 構成

- `MAIN.md`: System A/B を横断して学ぶ教科書型のメイン教材
- `docs/system-a/`: 書籍管理システムの教材と API 仕様
- `system-a/`: 教材用の完成実装
- `docs/system-b/`: 用例採集システムの課題文と API 仕様
- `system-b/`: 課題用の SQL、雛形、公開テスト
- `scripts/`: DB 初期化などの補助スクリプト
- `docs/consistency.md`: システム A/B の整合性確認表

## セットアップ

```bash
npm install
npm run db:up
```

最初は DB を使わない練習用サーバーで、`curl`、`GET`、`POST`、値の渡し方を確認します。

```bash
npm run start:practice
```

## システム A: 書籍管理

```bash
npm run db:reset:a
npm run build:a
MYSQL_DATABASE=backend_training_a PORT=3000 npm run start:a
```

教材は [docs/system-a/lesson.md](docs/system-a/lesson.md) を参照してください。

任意の API 結合テスト教材は [docs/system-a/testing.md](docs/system-a/testing.md) を参照してください。

## システム B: 用例採集

受講生は `system-b/src` に実装します。

```bash
npm run db:reset:b
npm run test:b
```

課題文は [docs/system-b/assignment.md](docs/system-b/assignment.md) を参照してください。

## 注意

- フロントエンドは作りません。
- フロントエンドと型やコードを共有しません。
- ORM と migration ツールは使いません。
- JWT とセッション管理は使いません。
- システム B のテストは全て公開されています。
