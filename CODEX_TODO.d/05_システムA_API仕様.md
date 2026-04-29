# システム A の API 仕様を作る

## 目的

書籍管理システムの API 仕様書を作成する。

## システム概要

ログイン不要で書籍 CRUD ができる。ユーザー登録すると、自分専用の読書メモを CRUD できる。

ログインした状態で、本に紐付いた自分の読書メモを全て見られる。他ユーザーの読書メモは見られない。他ユーザーの読書メモ ID にアクセスした場合は `403 Forbidden` とする。

## API 一覧

### 公開 API

- `POST /users`
- `GET /books`
- `POST /books`
- `GET /books/:bookId`
- `PATCH /books/:bookId`
- `DELETE /books/:bookId`

### 認証必須 API

- `GET /books/:bookId/notes`
- `POST /books/:bookId/notes`
- `GET /notes/:noteId`
- `PATCH /notes/:noteId`
- `DELETE /notes/:noteId`

## 書籍

```json
{
  "isbn": "9784385130781",
  "title": "新明解国語辞典",
  "author": "山田忠雄、倉持保男、上野善道、山田明雄、井島正博、笹原宏之",
  "publishedDate": "1972-01-24"
}
```

- `isbn`, `title`, `author` は必須。
- `publishedDate` は任意。
- `isbn` は一意。
- ISBN はハイフンなしの 10 桁または 13 桁文字列。
- `PATCH /books/:bookId` は部分更新。
- 読書メモが紐付いている書籍は削除できず、`409 Conflict` とする。

## 読書メモ

```json
{
  "page": 123,
  "body": "第3章が参考になった"
}
```

- `page` は必須の正整数。
- `body` は必須。
- 1 ユーザーが 1 冊に複数メモを作成できる。
- `PATCH /notes/:noteId` は部分更新。
- 存在しない本に読書メモを作る場合は `404 Not Found` とする。

## TODO

- [x] API 仕様書ファイルを作る。
- [x] 各 API のリクエスト形式を定義する。
- [x] 各 API のレスポンス形式を定義する。
- [x] 正常系ステータスコードを定義する。
- [x] 異常系ステータスコードを定義する。
- [x] 認証必須 API を仕様書上で明記する。
- [x] 一覧 API の `limit` / `offset` 仕様を明記する。

## 完了条件

- 仕様書だけを見てシステム A を実装できる。
- システム B の仕様と対応させられる構造になっている。
