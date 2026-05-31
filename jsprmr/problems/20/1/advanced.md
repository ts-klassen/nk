# 貸出カードの親子クラス

## 問題

図書館の貸出カードを表す 2 つのクラスを定義し、`output` に次の 2 つのプロパティを持つオブジェクトを代入してください。

- `LoanCard`: 通常の貸出カードを表すクラス
- `PremiumLoanCard`: `LoanCard` を継承したプレミアム貸出カードを表すクラス

`LoanCard` には次の仕様を持たせてください。

- `static defaultLimit` は `3` とする
- `constructor(owner, limit)` で、利用者名 `owner` と貸出上限 `limit` を受け取る
- インスタンスの `owner` プロパティには利用者名を保存する
- インスタンスの `limit` プロパティには貸出上限を保存する
- 現在借りている冊数は外から直接書き換えられない状態として、最初は `0` にする
- getter `count` は現在借りている冊数を返す
- getter `remaining` はあと何冊借りられるかを返す。上限に達している場合は `0` を返す
- getter `canBorrow` は、まだ借りられるなら `true`、上限に達しているなら `false` を返す
- メソッド `borrow()` は、まだ借りられるなら冊数を 1 増やして `true` を返す。上限に達している場合は冊数を変えずに `false` を返す
- メソッド `returnBook()` は、借りている冊数が 1 以上なら冊数を 1 減らして `true` を返す。借りていない場合は冊数を変えずに `false` を返す
- 静的メソッド `createDefault(owner)` は、呼び出し元のクラスから `defaultLimit` を使って新しいインスタンスを作る

`PremiumLoanCard` には次の仕様を持たせてください。

- `LoanCard` を `extends` で継承する
- `static extraLimit` は `2` とする
- `constructor(owner, baseLimit)` で、親クラスには `baseLimit + PremiumLoanCard.extraLimit` を貸出上限として渡す
- `borrow()`、`returnBook()`、`count`、`remaining`、`canBorrow` は親クラスの機能を使えるようにする
- メソッド `borrowPair()` は、あと 2 冊以上借りられる場合だけ冊数を 2 増やして `true` を返す。あと 1 冊以下しか借りられない場合は冊数を変えずに `false` を返す
- `LoanCard` から継承した静的メソッド `createDefault(owner)` を呼び出すと、`baseLimit` に `defaultLimit` を使った `PremiumLoanCard` のインスタンスを作る

## 入力

`input` には、テストでインスタンスを作るときに使う利用者名や貸出上限が入っています。

この課題では、提出コードが `input` を直接使って値を計算する必要はありません。指定された 2 つのクラスを定義し、`output` に代入してください。

## 出力

`output` には、`LoanCard` と `PremiumLoanCard` の 2 つのクラスをプロパティとして持つオブジェクトを代入してください。

## 例

`input`:

```json
{
  "owner": "Mika",
  "limit": 2
}
```

期待される `output`:

```js
{
  LoanCard: LoanCard,
  PremiumLoanCard: PremiumLoanCard
}
```

この例では、テスト側で `new output.LoanCard("Mika", 2)` のようにインスタンスを作り、貸出と返却の動作を確認します。
