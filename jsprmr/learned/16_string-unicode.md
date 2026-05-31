# 16. 文字列とUnicode

## このページで学ぶこと

- JavaScript の文字列は内部的に Unicode を UTF-16 で扱うことを学ぶ
- Code Point と Code Unit の違いを学ぶ
- サロゲートペアによって、2 つの Code Unit で 1 つの Code Point を表す場合があることを学ぶ
- サロゲートペアを含む文字列では、`length` やインデックスアクセスが見た目の文字数と一致しない場合があることを学ぶ
- 文字列を Code Point ごとに扱うための `codePointAt`、`String.fromCodePoint`、Unicode エスケープ、正規表現の `u` フラグ、`Array.from`、`for...of` を学ぶ

## 課題で要求してよい知識

- JavaScript は文字コードとして Unicode、内部的なエンコード方式として UTF-16 を採用していることを説明できる
- JavaScript の内部コードが UTF-16 であることと、JavaScript ファイル自体の文字コードが UTF-8 などでよいことを区別できる
- Code Point が Unicode における文字ごとの一意な ID であることを説明できる
- `String.prototype.codePointAt` を使って、指定したインデックスにある文字の Code Point を取得できる
- `String.fromCodePoint` を使って、Code Point から対応する文字列を作成できる
- `\u{...}` の形式で、Code Point の 16 進数表現を使った Unicode エスケープを書ける
- `Number.prototype.toString(16)` を使って、Code Point の数値を 16 進数文字列へ変換できる
- Code Unit が UTF-16 で変換された JavaScript 文字列の構成単位であることを説明できる
- Code Point と Code Unit が同じ値になる文字列と、サロゲートペアを含むため異なる値になる文字列を区別できる
- サロゲートペアでは、上位サロゲートと下位サロゲートの 2 つの Code Unit で 1 つの Code Point を表すことを説明できる
- 上位サロゲートの範囲が `\uD800` から `\uDBFF`、下位サロゲートの範囲が `\uDC00` から `\uDFFF` であることを説明できる
- `\uXXXX\uXXXX` のように 2 つの Code Unit のエスケープを並べて、サロゲートペアの文字を表現できる
- `\u{...}` で Code Point を直接書いても、JavaScript の内部では UTF-16 の Code Unit として保持されることを説明できる
- 文字列の `length` プロパティは Code Unit の個数を返すため、サロゲートペアの文字では `2` になる場合があることを説明できる
- 文字列のインデックスアクセスは Code Unit 単位であるため、サロゲートペアの片方だけを取り出す場合があることを説明できる
- 正規表現の `u` フラグが、文字列を Code Point 単位で扱うためのフラグであることを説明できる
- サロゲートペアを含む文字列に対して、正規表現の `.` が `u` フラグなしでは Code Unit 単位、`u` フラグありでは Code Point 単位にマッチすることを説明できる
- `Array.from` を使って、文字列を Code Point ごとの配列へ変換できる
- `Array.from(str).length` によって、文字列中の Code Point の個数を数えられる
- `Array.from` と配列の `filter` を組み合わせて、文字列中に含まれる特定の Code Point の個数を数えられる
- `for...of` を使って、文字列を Code Point ごとに反復処理できる
- Code Point の個数を数えても、制御文字などの見えない文字があるため、視覚的な文字列の長さと一致しない場合があることを説明できる

## 前提として使う既習知識

- 文字列リテラル、文字列の `length`、インデックスアクセスを使える
- 文字列メソッドと静的メソッドを呼び出せる
- 数値、文字列、配列を扱える
- 関数定義、条件分岐、ループを使える
- `for...of` で反復処理できる
- 配列の `map`、`filter`、`push`、`length` を使える
- 正規表現リテラルと `String.prototype.match` の基本的な結果を読める

## 課題で要求しない知識（必要な場合のみ）

- Unicode の歴史、仕様全体、符号化方式全般の詳細は要求しない
- UTF-8、Shift_JIS など JavaScript の内部コード以外の文字コードの詳細は要求しない
- Unicode 正規化、結合文字、書記素クラスタ、文字幅、照合順序、ロケール処理は要求しない
- `Intl.Segmenter` など、このページで紹介されていない国際化 API は要求しない
- `Symbol.iterator` の実装や独自 iterable オブジェクトの作成は要求しない
- 正規表現の `u` フラグと `.` の違いを超える高度な正規表現の知識は要求しない
- DOM、ブラウザ表示、ファイル保存時の文字コード設定などの環境依存の知識は要求しない

## 課題で扱う場合の注意

- 「文字数」を問う課題では、Code Unit の個数、Code Point の個数、視覚的な文字数のどれを求めるのかを明示する
- サロゲートペアを含む例を使う場合は、`length` やインデックスアクセスが Code Unit 単位であることを評価対象にするか、Code Point 単位で扱うことを評価対象にするかを明示する
- Code Point ごとの処理を求める場合は、`Array.from` と `for...of` のどちらを使ってもよいか、特定の方法に固定するかを課題文で明示する
- 視覚的な文字列の長さを厳密に扱う課題は、このページの範囲を超えるため避ける
