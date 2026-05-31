# 実行結果から表示値を選ぶ

## 問題

`input` には、確認したい文字列が入っています。

次の 4 つのコード片 A から D を読んで、REPL の評価結果、JavaScript ファイルでの表示、エラーの違いを考えてください。

A は、新しい Web コンソールの REPL で上から 1 行ずつ実行します。

```js
const currentMemo = input;
currentMemo;
```

B は、JavaScript ファイルとして実行します。

```js
const currentMemo = input;
currentMemo;
console.log(currentMemo);
```

C は、新しい Web コンソールの REPL で上から 1 行ずつ実行します。

```js
const currentMemo = input;
const currentMemo = "changed";
```

D は、JavaScript ファイルとして実行します。

```js
console.log(notDeclaredMemo);
```

REPL では、変数宣言の行は `undefined` と表示され、変数名だけの行はその変数の値が表示されます。

JavaScript ファイルでは、変数名だけの行を書いても評価結果は自動では表示されません。`console.log(currentMemo)` では、`currentMemo` の値が表示されます。

同じ REPL で同じ `const` 変数名を再宣言しようとすると `SyntaxError` になります。存在しない変数を参照しようとすると `ReferenceError` になります。

4 つのコード片の中で、`undefined` やエラー名ではなく、値として表示される文字列を `output` に代入してください。

## 入力

`input` には文字列が入っています。

## 出力

`output` に、値として表示される文字列を代入してください。

## 例

`input`:

```json
"ready"
```

期待される `output`:

```json
"ready"
```
