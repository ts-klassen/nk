# 24. イテレータとジェネレータ

## このページで学ぶこと

- イテレータは値を順番に取り出す仕組みであり、配列のようにすべての値を先に作る方法とは異なること
- IterableプロトコルとIteratorプロトコルが、`for...of`による反復処理の基盤になっていること
- `function*`と`yield`を使うジェネレータ関数で、Iterable Iteratorを簡潔に作れること
- Iteratorは内部状態を持つため、一度列挙し終えた同じIteratorは再利用できないこと
- `Iterator.from`、`Iterator.prototype`の各メソッド、ES2026の`Iterator.concat`を使ってIteratorを加工・変換できること
- Iteratorの遅延評価により、大きなデータや無限に続く値を必要な分だけ処理できること

## 課題で要求してよい知識

- 配列が値をあらかじめ作るのに対し、Iteratorは`next`メソッドが呼ばれたタイミングで値を生成できることを説明できる
- 遅延評価が、値を実際に要求されるまで計算を遅らせる仕組みであることを説明できる
- Iterableプロトコルでは、オブジェクトが`[Symbol.iterator]`メソッドを持ち、そのメソッドがIteratorを返すことを説明できる
- Iteratorプロトコルでは、オブジェクトが`next`メソッドを持ち、`next`メソッドが`{ value, done }`形式のオブジェクトを返すことを説明できる
- IterableとIteratorを区別し、両方のプロトコルを実装するオブジェクトがIterable Iteratorであることを説明できる
- `[Symbol.iterator]`メソッドと`next`メソッドを持つシンプルなIterable Iteratorを実装できる
- `for...of`がIterableの`[Symbol.iterator]`メソッドからIteratorを取得し、`next`メソッドを繰り返し呼び出して値を取り出すことを説明できる
- Iterable Iteratorを`for...of`で反復処理できる
- 配列、文字列、`Map`、`Set`がIterableであり、`for...of`で順番に値を取り出せることを説明できる
- `Map`を`for...of`で反復するとキーと値のペアを取り出せることを説明できる
- `function*`でジェネレータ関数を定義し、`yield`で順番に値を生成できる
- ジェネレータ関数を呼び出すとGeneratorオブジェクトが作られ、その`next`メソッドを呼ぶたびに次の`yield`まで実行が進むことを説明できる
- GeneratorオブジェクトがIterable Iteratorであり、`for...of`で反復処理できることを説明できる
- ジェネレータ関数の本体は、Generatorオブジェクトを作っただけでは実行されず、`next`メソッドが呼ばれて初めて進むことを説明できる
- 手書きのIterator実装と比べて、ジェネレータ関数と`yield`でIteratorを簡潔に実装できることを説明できる
- Iteratorは現在位置の内部状態を持つため、同じIteratorを一度最後まで列挙すると再度列挙できないことを説明できる
- 同じ値を何度も列挙したい場合は、新しいIteratorまたはGeneratorオブジェクトを作る必要があることを説明できる
- 配列などのビルトインIterableは、`[Symbol.iterator]`メソッドを呼び出すたびに新しいIteratorを返すため、複数回列挙できることを説明できる
- `Iterator.from`で配列、文字列、GeneratorオブジェクトなどのIterableからIteratorを作成できる
- 配列そのものはIteratorではないため、Iteratorメソッドを使うには`Iterator.from`や`values`/`keys`/`entries`でIteratorを取得する必要があることを説明できる
- Array、`Map`、`Set`の`keys`/`values`/`entries`メソッドが新しいIteratorを返すことを説明できる
- ES2026対応環境では、`Iterator.concat`で複数のIterableを順番に連結したIteratorを作成できる
- ES2026対応環境では、`next`メソッドだけを持つIterableではないIteratorは、`Iterator.concat`へ渡す前に`Iterator.from`で変換する必要があることを説明できる
- `Iterator.prototype.toArray`でIteratorのすべての要素を列挙した配列を作れる
- スプレッド構文や`Array.from`でもIteratorを配列に変換でき、`toArray`はIteratorメソッドチェーンの中で使いやすいことを説明できる
- `Iterator.prototype.take`で指定した数の要素だけを取り出すIteratorを作成できる
- `Iterator.prototype.map`で各要素を変換するIteratorを作成できる
- `Iterator.prototype.filter`で条件に一致する要素だけを含むIteratorを作成できる
- `Iterator.prototype.drop`で指定した数の要素をスキップしたIteratorを作成できる
- `Iterator.prototype.flatMap`で各要素を変換し、その結果をフラット化したIteratorを作成できる
- `Iterator.prototype.reduce`でIteratorの要素を単一の値に集約できる
- Iteratorメソッドをチェーンして、`filter`、`take`、`map`、`toArray`などを組み合わせた宣言的な処理を書ける
- Iteratorメソッドのチェーンでは必要な分だけ処理が進むため、大量のデータや無限シーケンスで配列より効率的に扱える場合があることを説明できる

## 前提として使う既習知識

- 変数宣言、関数定義、戻り値、オブジェクトリテラル、メソッド定義を使える
- 配列を作成し、要素を順番に処理できる
- `for...of`でIterableな値を反復処理できる
- `Map`と`Set`を作成し、基本的な値の追加や取得ができる
- 配列の`map`、`filter`、`reduce`、`flatMap`の基本的な動作を説明できる
- スプレッド構文と`Array.from`でIterableな値から配列を作れる

## 課題で要求しない知識（必要な場合のみ）

- `Symbol.asyncIterator`、Async Iterator、Async Generator、`for await...of`は要求しない
- `yield*`、`next`メソッドへの値の受け渡し、Generatorの`return`/`throw`メソッドは要求しない
- Iterator Helperの仕様詳細やブラウザ・Node.jsごとの実装状況の暗記は要求しない
- 独自Iteratorの`return`/`throw`メソッドや、反復処理の終了時処理の実装は要求しない

## 課題で扱う場合の注意

- `Iterator.from`やIteratorメソッドを実行させる課題では、これらを利用できる実行環境を指定する
- `Iterator.concat`はES2026の機能として扱い、実行させる課題ではES2026対応環境であることを明示する
- 配列にIteratorメソッドを直接呼び出させず、`Iterator.from(array)`や`array.values()`などでIteratorを作る必要があることを課題文で明確にする
- Iteratorは一度列挙すると消費されるため、同じIteratorを複数回使う課題では、その挙動を問うのか、新しいIteratorを作るべきなのかを明確にする
- 無限シーケンスを扱う課題では、`take`などで取り出す個数を制限し、`toArray`、スプレッド構文、`Array.from`、`reduce`を無制限に適用させない
