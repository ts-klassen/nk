# 22. 非同期処理: Promise/Async Function

## このページで学ぶこと

- 同期処理と非同期処理の実行順序の違い
- 非同期処理がメインスレッド上で実行される場合の性質と、同期的にブロックする処理の影響
- 非同期処理で発生する例外と、`try...catch` だけでは扱えないケース
- `Promise` による非同期処理の状態、結果、エラーの扱い方
- Promiseチェーン、`Promise.all`、`Promise.race` による複数の非同期処理の扱い方
- Async Functionと `await` 式によるPromiseベースの非同期処理の書き方
- エラーファーストコールバックという非同期エラー処理の慣習

## 課題で要求してよい知識

- 同期処理はひとつの処理が終わるまで次の処理へ進まないことを説明できる
- 同期的にブロックする処理が、後続の処理やブラウザのUI更新を遅らせることを説明できる
- 非同期処理は完了を待たずに次の処理へ進むため、コード上の並びと実行順序が異なる場合があることを説明できる
- `setTimeout(コールバック関数, delay)` が、指定時間後にコールバック関数を呼び出すようタイマーへ登録する非同期処理であることを説明できる
- `setTimeout` で登録したコールバック関数よりも、後続の同期処理が先に実行される場合の実行順序を予測できる
- 基本的な非同期処理はメインスレッドで実行されるため、重い同期処理によって非同期コールバックの実行も遅れることを説明できる
- 並行処理と並列処理の違いを、メインスレッドで切り替えながら実行する処理と別スレッドで同時に実行する処理として区別できる
- `try...catch` は `try` ブロック内で同期的に発生した例外をキャッチする構文であり、後から実行される非同期コールバック内の例外は外側の `try...catch` ではキャッチできないことを説明できる
- 非同期コールバック内で発生する例外を、そのコールバック関数内の `try...catch` で扱える
- `Promise` が非同期処理の状態や結果を表すビルトインオブジェクトであることを説明できる
- `new Promise((resolve, reject) => { ... })` でPromiseインスタンスを作成し、成功時に `resolve`、失敗時に `reject` を呼び出せる
- `resolve` に渡した値が `then` の成功時コールバックに渡り、`reject` に渡した値が失敗時コールバックや `catch` に渡ることを説明できる
- `then(onFulfilled, onRejected)` で成功時と失敗時の処理を登録できる
- `catch(onRejected)` が `then(undefined, onRejected)` と同じ失敗時処理を登録する糖衣構文であることを説明できる
- 失敗時の処理だけを登録する場合に、`then(undefined, onRejected)` より `catch(onRejected)` を使える
- Promiseコンストラクタ内で発生した例外が、`reject` された場合と同じように失敗として扱われることを説明できる
- Promiseの `Pending`、`Fulfilled`、`Rejected`、`Settled` の状態を区別できる
- Promiseの内部状態はインスタンスから直接取り出せないことを説明できる
- Promiseは一度 `Fulfilled` または `Rejected` になると、それ以降は状態が変化せず、登録したコールバックも状態変化に対して一度だけ呼ばれることを説明できる
- すでに状態が変化済みのPromiseに `then` や `catch` を登録しても、コールバックは非同期なタイミングで実行されることを説明できる
- `Promise.resolve(value)` で `Fulfilled` なPromiseを作り、`then` でその値を受け取れる
- `Promise.reject(error)` で `Rejected` なPromiseを作り、`catch` でそのエラーを受け取れる
- `Promise.resolve` と `Promise.reject` が `new Promise` を使った書き方の糖衣構文であることを説明できる
- Promiseコンストラクタに渡したexecutor関数はインスタンス作成時に同期的に実行され、`then` や `catch` のコールバック関数は非同期なタイミングで実行されることを説明できる
- `then` と `catch` が新しいPromiseインスタンスを返すため、Promiseチェーンを書ける
- Promiseチェーンで `Rejected` になった場合、次の失敗時の処理まで成功時の処理がスキップされることを説明できる
- `then` や `catch` のコールバック関数内で例外が発生すると、次の失敗時の処理へ伝わることを説明できる
- `catch` で失敗を処理した後、次の `then` の成功時処理へ戻る場合があることを説明できる
- Promiseチェーンのコールバック関数で返した値が、次の `then` の引数として渡ることを説明できる
- Promiseチェーンのコールバック関数でPromiseを返すと、そのPromiseの状態が次のチェーンへ引き継がれることを説明できる
- `finally` を使って、Promiseの成功失敗にかかわらず最後に実行する処理を登録できる
- Promiseチェーンで、前の非同期処理の完了後に次の非同期処理を開始する逐次処理を書ける
- `Promise.all` にPromiseの配列を渡し、すべて成功した場合に結果の配列を受け取れる
- `Promise.all` の結果配列の順序が、渡したPromise配列の順序に対応することを説明できる
- `Promise.all` では、渡したPromiseのうちひとつでも失敗すると返り値のPromiseも失敗することを説明できる
- `Promise.race` にPromiseの配列を渡し、最初に `Settled` になったPromiseと同じ状態になるPromiseを作れる
- `Promise.race` を使って、非同期処理とタイムアウト用Promiseを競争させる処理を書ける
- `async function`、async関数式、async Arrow Function、asyncメソッドを定義できる
- Async FunctionはPromiseの上に作られた構文であり、必ずPromiseを返すことを説明できる
- Async Functionで値を `return` した場合は、その値で解決されるPromiseを返すことを説明できる
- Async FunctionでPromiseを `return` した場合は、そのPromiseの状態が返り値のPromiseに反映されることを説明できる
- Async Function内で例外が発生した場合は、`Rejected` なPromiseを返すことを説明できる
- `await` 式が右辺のPromiseが `Fulfilled` または `Rejected` になるまでAsync Function内の処理を待つことを説明できる
- `await` 式で `Fulfilled` なPromiseの値を取り出して変数へ代入できる
- `await` 式の右辺が `Rejected` なPromiseの場合、エラーが投げられることを説明できる
- `await` 式で発生したエラーをAsync Function内の `try...catch` でキャッチできる
- Promiseチェーンで書いた逐次処理を、Async Functionと `await` 式で同じ順序の処理として書ける
- Async Function内で `for` 文と `await` 式を組み合わせ、配列の要素に対する非同期処理を順番に実行できる
- `Promise.all` と `await` 式を組み合わせ、複数の非同期処理の結果を配列としてまとめて受け取れる
- `await` 式はAsync Functionの直下、またはModuleのトップレベルで利用できることを説明できる
- Async Function内で `await` している間も、Async Functionの外側の処理は停止しないことを説明できる
- `forEach` のコールバック関数内で `await` しても、外側のAsync Functionがそのコールバックの完了を待つわけではないことを説明できる
- コールバック関数を使わない `for` 文と `await`、または `Promise.all` を使って、`forEach` とAsync Functionの組み合わせによる意図しない挙動を避けられる
- ModuleのトップレベルではAsync Functionで囲まずに `await` 式を使えることを説明できる
- エラーファーストコールバックでは、失敗時は1番目の引数にエラーオブジェクト、成功時は1番目の引数に `null`、2番目以降に結果を渡すことを説明できる
- エラーファーストコールバックがJavaScriptの言語仕様ではなく、非同期処理を扱うための慣習であることを説明できる

## 前提として使う既習知識

- 変数宣言、条件分岐、反復処理、関数定義、Arrow Functionを使える
- オブジェクトや配列を作成し、プロパティや要素を読み書きできる
- メソッド呼び出し、メソッドチェーン、コールバック関数を使える
- `try...catch`、`throw`、`Error` オブジェクトによる同期的な例外処理を使える
- `new` 演算子によるインスタンス作成を説明できる
- 分割代入やテンプレートリテラルなど、本文のサンプルで使われる基本構文を読める

## 課題で要求しない知識（必要な場合のみ）

- Web Workerや `postMessage` を使った並列処理の実装は要求しない
- 実際のHTTPリクエスト、Fetch API、Node.jsの `fs.readFile` の詳しい使い方は要求しない
- イベントループ、タスクキュー、マイクロタスクキューなど、本文で詳説していない実行モデルの知識は要求しない
- `Promise.allSettled`、`Promise.any`、`AbortController` など本文で扱っていないPromise関連APIは要求しない
- Async Iterator、Async Generator、`for await...of` は要求しない
- モジュールの読み込み順序、ビルドツール、ブラウザやNode.jsごとのTop-Level `await` 対応状況の詳細は要求しない

## 課題で扱う場合の注意

- タイマーやランダムな待ち時間を使う課題では、厳密なミリ秒単位の実行時刻ではなく、実行順序や状態変化を評価する
- Promiseを返す関数をテストする課題では、返されたPromiseを待ってから結果を評価する必要がある
- 逐次処理と並行処理のどちらを求めるかを課題文で明示する
- `Promise.all` や `Promise.race` を使わせる場合は、成功時と失敗時の期待する挙動を課題文で明示する
- `await` をトップレベルで使わせる場合は、実行コンテキストがModuleであることを課題文や実行環境で明示する
- 非同期処理のエラーを扱う課題では、未処理のPromise rejectionが残らないように、`catch` または `try...catch` で扱う条件を明示する
