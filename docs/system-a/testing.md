# 任意教材: システム A の API 結合テスト

## 位置づけ

この教材は任意である。本編の後に必要に応じて扱う。

目的は、DB 込みの REST API を BDD スタイルでテストする流れを体験することである。単体テストは扱わない。

## 扱う範囲

扱うもの:

- Mocha / Chai
- BDD スタイルの `describe` / `it`
- `fetch` による HTTP リクエスト
- テスト実行ごとの DB 初期化
- 正常系と異常系
- Basic 認証つき API のテスト

扱わないもの:

- 単体テスト
- mock / stub
- フロントエンドとの結合
- テストの網羅率計測

## BDD スタイル

BDD スタイルでは、テスト対象の振る舞いを文章として読めるように書く。

```js
describe("書籍 API", () => {
  it("ログインなしで書籍を作成できる", async () => {
    // ここに HTTP リクエストと検証を書く
  });
});
```

`describe` は対象や状況を表す。`it` は期待する振る舞いを表す。

## DB 初期化

API 結合テストでは、テスト実行ごとに DB を初期化する。

```text
DROP DATABASE
CREATE DATABASE
schema.sql 実行
テスト実行
```

この教材では `scripts/reset-db.mjs` を使える。

```bash
npm run db:reset:a
```

テストコードから初期化する場合も、同じ流れにする。前回のテスト実行で残ったデータに依存しないことが重要である。

## サンプルテスト

以下は、書籍作成と ISBN 重複を確認するサンプルである。

```js
import { expect } from "chai";

const baseUrl = "http://127.0.0.1:3000";

async function postJson(path, body, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();

  return {
    status: response.status,
    headers: response.headers,
    body: text ? JSON.parse(text) : undefined
  };
}

describe("書籍 API", () => {
  it("ログインなしで書籍を作成できる", async () => {
    const response = await postJson("/books", {
      isbn: "9784297127473",
      title: "Node.js入門",
      author: "山田太郎",
      publishedDate: "2026-04-28"
    });

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      isbn: "9784297127473",
      title: "Node.js入門",
      author: "山田太郎",
      publishedDate: "2026-04-28"
    });
    expect(response.body).to.have.property("id").that.is.a("number");
  });

  it("ISBN が重複したら 409 を返す", async () => {
    const isbn = "9784297127480";
    const created = await postJson("/books", {
      isbn,
      title: "重複確認用の本",
      author: "鈴木一郎"
    });
    expect(created.status).to.equal(201);

    const response = await postJson("/books", {
      isbn,
      title: "別の本",
      author: "佐藤花子"
    });

    expect(response.status).to.equal(409);
    expect(response.body).to.deep.equal({
      error: {
        code: "CONFLICT",
        message: "リソースが競合しています"
      }
    });
  });
});
```

## Basic 認証のヘルパー

読書メモ API をテストするときは Basic 認証ヘッダを作る。

```js
function auth(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}
```

利用例:

```js
await postJson(
  "/books/1/notes",
  {
    page: 123,
    body: "第3章が参考になった"
  },
  {
    authorization: auth("alice", "password123")
  }
);
```

## 受講生が書くテスト

任意で、以下のテストを書く。

1. ユーザー登録できる。
2. `username` 重複時に `409 CONFLICT` を返す。
3. 書籍を作成できる。
4. ISBN 重複時に `409 CONFLICT` を返す。
5. 書籍一覧が `limit` / `offset` / `total` を返す。
6. 読書メモを作成できる。
7. 認証なしで読書メモを作成しようとすると `401 UNAUTHORIZED` と `WWW-Authenticate` を返す。
8. 他ユーザーの読書メモ詳細を取得しようとすると `403 FORBIDDEN` を返す。
9. 読書メモがある書籍を削除しようとすると `409 CONFLICT` を返す。

## テストを書く順序

1. DB 初期化処理を用意する。
2. テスト用サーバーを起動する。
3. `postJson` や `request` などの HTTP ヘルパーを用意する。
4. ユーザー登録と書籍作成の正常系を書く。
5. 重複や不正入力などの異常系を書く。
6. Basic 認証が必要な読書メモ API のテストを書く。
7. 所有者チェックのテストを書く。

## 注意

テストは API 仕様に対して書く。実装の内部関数や SQL の書き方には依存しない。

テストデータは、各テストの前提が読み取れるように作る。別の `it` が先に実行されていることに強く依存すると、後でテストを追加したときに壊れやすい。
