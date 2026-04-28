# 整合性確認

## 目的

システム A: 書籍管理と、システム B: 用例採集の対応関係を確認する。

システム B は、システム A で学んだ構造を別ドメインへ適用する課題である。ただし、読書メモは本人だけが閲覧できる一方、用例は誰でも閲覧できる。この差分は意図的な課題差分である。

## API 対応表

| 論点 | システム A: 書籍管理 | システム B: 用例採集 |
| --- | --- | --- |
| 認証用ユーザー作成 | `POST /users` | `POST /users` |
| 親リソース一覧 | `GET /books` | `GET /terms` |
| 親リソース作成 | `POST /books` | `POST /terms` |
| 親リソース詳細 | `GET /books/:bookId` | `GET /terms/:termId` |
| 親リソース更新 | `PATCH /books/:bookId` | `PATCH /terms/:termId` |
| 親リソース削除 | `DELETE /books/:bookId` | `DELETE /terms/:termId` |
| 子リソース一覧 | `GET /books/:bookId/reading-notes` | `GET /terms/:termId/examples` |
| 子リソース作成 | `POST /books/:bookId/reading-notes` | `POST /terms/:termId/examples` |
| 子リソース詳細 | `GET /reading-notes/:noteId` | `GET /examples/:exampleId` |
| 子リソース更新 | `PATCH /reading-notes/:noteId` | `PATCH /examples/:exampleId` |
| 子リソース削除 | `DELETE /reading-notes/:noteId` | `DELETE /examples/:exampleId` |

## 認証・公開範囲対応表

| 論点 | システム A: 書籍管理 | システム B: 用例採集 |
| --- | --- | --- |
| 親リソース CRUD | 認証不要 | 認証不要 |
| 子リソース作成 | Basic 認証必須 | Basic 認証必須 |
| 子リソース一覧 | Basic 認証必須。自分の読書メモだけ返す | 認証不要。全ユーザーの用例を返す |
| 子リソース詳細 | Basic 認証必須。所有者だけ閲覧可能 | 認証不要。誰でも閲覧可能 |
| 子リソース更新 | Basic 認証必須。所有者だけ更新可能 | Basic 認証必須。所有者だけ更新可能 |
| 子リソース削除 | Basic 認証必須。所有者だけ削除可能 | Basic 認証必須。所有者だけ削除可能 |
| 他ユーザーの子リソース | `403 FORBIDDEN` | 閲覧は可能。更新・削除は `403 FORBIDDEN` |

## DB 対応表

| 論点 | システム A: 書籍管理 | システム B: 用例採集 |
| --- | --- | --- |
| ユーザー | `users` | `users` |
| 親リソース | `books` | `terms` |
| 子リソース | `reading_notes` | `examples` |
| ユーザー一意制約 | `users.username` | `users.username` |
| 親リソース一意制約 | `books.isbn` | `terms.term` |
| 子リソース所有者 | `reading_notes.user_id` | `examples.user_id` |
| 親子紐付け | `reading_notes.book_id` | `examples.term_id` |
| 子リソース本文 | `reading_notes.body` | `examples.body` |
| 子リソース固有項目 | `page` | `collected_date`, `note` |
| 親削除時の子データ | 子データがあれば `409 CONFLICT` | 子データがあれば `409 CONFLICT` |
| `ON DELETE CASCADE` | 使わない | 使わない |
| `ON DELETE SET NULL` | 使わない | 使わない |

## エラー仕様対応表

| status | code | message | A の主な発生箇所 | B の主な発生箇所 |
| --- | --- | --- | --- | --- |
| `400` | `VALIDATION_ERROR` | `入力値が不正です` | 書籍・読書メモ・ページングの不正入力 | 用語・用例・ページングの不正入力 |
| `401` | `UNAUTHORIZED` | `認証が必要です` | 認証なし、または不正な認証で読書メモ API を呼ぶ | 認証なし、または不正な認証で用例の作成・更新・削除を呼ぶ |
| `403` | `FORBIDDEN` | `この操作は許可されていません` | 他ユーザーの読書メモを参照・更新・削除する | 他ユーザーの用例を更新・削除する |
| `404` | `NOT_FOUND` | `対象リソースが存在しません` | 存在しない書籍・読書メモ | 存在しない用語・用例 |
| `409` | `CONFLICT` | `リソースが競合しています` | `username` 重複、`isbn` 重複、読書メモあり書籍削除 | `username` 重複、`term` 重複、用例あり用語削除 |
| `500` | `INTERNAL_SERVER_ERROR` | `サーバーエラーが発生しました` | 想定外エラー | 想定外エラー |

`INTERNAL_SERVER_ERROR` は実装上の共通コードであり、通常の教材課題で意図的に起こす対象ではない。

## システム B 公開テスト対応表

| テスト観点 | 公開テスト |
| --- | --- |
| ユーザー登録成功 | `ユーザーを登録できる` |
| `username` 重複 | `username が重複したら 409 を返す` |
| 認証なし | `認証なしで用例を作ろうとすると 401 と WWW-Authenticate を返す`、`認証なしで用例を更新・削除しようとすると 401 と WWW-Authenticate を返す` |
| 不正な Basic 認証 | `不正な Basic 認証は 401 と WWW-Authenticate を返す` |
| 用語 CRUD | `用語を取得・更新・削除できる` |
| `term` 重複 | `term が重複したら 409 を返す`、`PATCH で term が重複したら 409 を返す` |
| ページング | `用語一覧は limit, offset, total を返す` |
| 用例作成 | `認証済みユーザーは用例を作成できる` |
| 用例公開閲覧 | `ログインなしで用語に紐付く用例を一覧取得できる`、`ログインなしで用例詳細を取得できる` |
| 用例所有者操作 | `所有者は用例を更新・削除できる` |
| 他ユーザー操作拒否 | `他ユーザーの用例は更新・削除できない` |
| 子データあり削除拒否 | `用例が紐付いている用語は削除できない` |
| 存在しないリソース | `存在しないリソースは 404 を返す` |
| 存在しない親への子作成 | `存在しない用語に用例を作ろうとすると 404 を返す` |
| 入力エラー | `不正な入力は 400 と VALIDATION_ERROR を返す` |

## 確認結果

- フロントエンドとの型共有やコード共有はない。
- ORM と migration ツールは使っていない。
- API 仕様書は Markdown で記述している。
- システム B のテストは全て公開されている。
- 非公開テストは作っていない。
- 受講生向けセルフチェックリストは作っていない。
- 評価基準は課題文に書いていない。
