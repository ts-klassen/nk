# システム B の API 仕様を作る

## 目的

用例採集システムの API 仕様書を作成する。

## システム概要

ログイン不要で用語 CRUD ができる。ユーザー登録すると、用例を CRUD できる。

ログインせずに、用語に紐付いた用例を全て見られる。他ユーザーからも用例は見られるが、編集削除は所有者だけができる。

## API 一覧

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

## 用語

```json
{
  "term": "冪等性"
}
```

- `term` は必須。
- `term` は一意。
- `description` は持たない。
- `PATCH /terms/:termId` は部分更新。
- 用例が紐付いている用語は削除できず、`409 Conflict` とする。

## 用例

```json
{
  "body": "PUT は冪等な操作として設計することが多い。",
  "collectedDate": "2026-04-28",
  "note": "API設計レビューでの発言"
}
```

- `body` は必須。
- `collectedDate` は必須。
- `note` は任意。
- 用例の重複チェックはしない。
- `PATCH /examples/:exampleId` は部分更新。
- 存在しない用語に用例を作る場合は `404 Not Found` とする。
- 他ユーザーの用例を更新・削除しようとした場合は `403 Forbidden` とする。

## TODO

- [ ] API 仕様書ファイルを作る。
- [ ] 各 API のリクエスト形式を定義する。
- [ ] 各 API のレスポンス形式を定義する。
- [ ] 正常系ステータスコードを定義する。
- [ ] 異常系ステータスコードを定義する。
- [ ] 認証必須 API を仕様書上で明記する。
- [ ] 公開閲覧と所有者編集の違いを明記する。

## 完了条件

- 受講生が API 仕様書だけを見てシステム B を実装できる。
- システム A で学んだ構造と対応している。
