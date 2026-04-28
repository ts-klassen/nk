# システム B の DB スキーマを作る

## 目的

用例採集システムの `schema.sql` を作成する。

## テーブル

- `users`
- `terms`
- `examples`

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

## `terms`

保持する情報:

- `id`
- `term`
- `created_at`
- `updated_at`

制約:

- `id` は `AUTO_INCREMENT`
- `term` は一意
- `description` は持たない

## `examples`

保持する情報:

- `id`
- `user_id`
- `term_id`
- `body`
- `collected_date`
- `note`
- `created_at`
- `updated_at`

制約:

- `id` は `AUTO_INCREMENT`
- `user_id` は `users.id` を参照する
- `term_id` は `terms.id` を参照する
- `note` は nullable
- 用例の重複チェックはしない
- `ON DELETE CASCADE` は使わない
- `ON DELETE SET NULL` は使わない

## 削除仕様

用例が紐付いている用語は削除できない。アプリ側で削除前に確認し、`409 Conflict` を返す。

## TODO

- [x] `schema.sql` を作る。
- [x] 外部キー制約を定義する。
- [x] 一意制約を定義する。
- [x] 日時カラムの型を決める。
- [x] `updated_at` の更新方法を決める。
- [x] 必要なら `seed.sql` を作る。

## 完了条件

- API 仕様を満たす DB スキーマになっている。
- 公開閲覧と所有者編集の両方を実装できる。
- 課題として受講生に提供できる SQL になっている。
