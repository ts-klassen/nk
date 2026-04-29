# システム A の DB スキーマを作る

## 目的

書籍管理システムの `schema.sql` を作成する。

## テーブル

- `users`
- `books`
- `reading_notes`

## `users`

保持する情報:

- `id`
- `username`
- `password_hash`
- `created_at`
- `updated_at`

制約:

- `id` は `AUTO_INCREMENT`
- `username` は一意

## `books`

保持する情報:

- `id`
- `isbn`
- `title`
- `author`
- `published_date`
- `created_at`
- `updated_at`

制約:

- `id` は `AUTO_INCREMENT`
- `isbn` は一意
- `published_date` は nullable

## `reading_notes`

保持する情報:

- `id`
- `user_id`
- `book_id`
- `page`
- `body`
- `created_at`
- `updated_at`

制約:

- `id` は `AUTO_INCREMENT`
- `user_id` は `users.id` を参照する
- `book_id` は `books.id` を参照する
- `page` は正整数
- 1 ユーザー 1 冊に複数メモを許可する
- `ON DELETE CASCADE` は使わない
- `ON DELETE SET NULL` は使わない

## 削除仕様

読書メモが紐付いている書籍は削除できない。アプリ側で削除前に件数確認はせず、DB の外部キー制約エラーを `409 Conflict` に変換する。

## TODO

- [x] `schema.sql` を作る。
- [x] 外部キー制約を定義する。
- [x] 一意制約を定義する。
- [x] 日時カラムの型を決める。
- [x] `updated_at` の更新方法を決める。
- [x] 必要なら `seed.sql` を作る。

## 完了条件

- API 仕様を満たす DB スキーマになっている。
- 削除時の `409 Conflict` を実装できる。
- SQL 初学者にとって過度に複雑でない。
