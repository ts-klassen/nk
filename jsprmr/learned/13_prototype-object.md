# 13. プロトタイプオブジェクト

## このページで学ぶこと

- 空のオブジェクトでも `toString` などのビルトインメソッドを呼び出せる理由を、`Object.prototype` の継承として説明する
- `Object.prototype` に定義されたプロトタイプメソッドと、インスタンスに定義されたメソッドの関係を扱う
- `Object.hasOwn` 静的メソッドと `in` 演算子が、プロトタイプオブジェクト上のプロパティを扱うかどうかの違いを扱う
- `Object.create` 静的メソッドで継承元のプロトタイプオブジェクトを明示する方法を扱う
- `Array` などのビルトインオブジェクトも `Object.prototype` を継承していることを扱う
- `Object.create(null)` で `Object.prototype` を継承しないオブジェクトを作成できることを扱う

## 課題で要求してよい知識

- ほとんどすべてのオブジェクトが `Object.prototype` を継承していることを説明できる
- `Object.prototype` に定義された `toString` などのメソッドを、プロトタイプメソッドとして説明できる
- オブジェクトリテラルや `new Object` で作成したオブジェクトから、`Object.prototype` のメソッドを呼び出せることを説明できる
- `obj.toString === Object.prototype.toString` のような比較結果を、プロトタイプメソッドの参照として予測できる
- インスタンスにプロトタイプメソッドと同じ名前のメソッドがある場合、インスタンスのメソッドが優先して呼び出されることを説明できる
- `Object.hasOwn(obj, propertyName)` はオブジェクト自身が持つプロパティだけを判定することを説明できる
- `propertyName in obj` はオブジェクト自身だけでなく、継承元の `prototype` オブジェクト上のプロパティも判定することを説明できる
- `Object.hasOwn` 静的メソッドと `in` 演算子で、`toString` のような継承されたプロパティに対する判定結果が異なることを予測できる
- `Object.create(Object.prototype)` で、`Object.prototype` を継承する新しいオブジェクトを作成できる
- `Object.create(null)` で、`Object.prototype` を継承しない本当に空のオブジェクトを作成できる
- `Object.create(null)` で作成したオブジェクトでは、`hasOwnProperty` などの `Object.prototype` のメソッドを利用できないことを説明できる
- `Object.prototype` を継承しないオブジェクトに対しても、`Object.hasOwn` 静的メソッドで自身のプロパティの有無を判定できる
- `Array` のインスタンスが `Array.prototype` を継承し、さらに `Array.prototype` が `Object.prototype` を継承していることを説明できる
- `Array` のインスタンスから `Object.prototype.hasOwnProperty` などを参照できる理由を説明できる
- `Array.prototype.toString` のように、より近いプロトタイプオブジェクト上のメソッドが `Object.prototype` の同名メソッドより優先されることを説明できる

## 前提として使う既習知識

- オブジェクトリテラルでオブジェクトを作成できる
- オブジェクトのプロパティやメソッドへアクセスできる
- メソッドを定義して呼び出せる
- `Object.hasOwn` 静的メソッドと `in` 演算子でプロパティの存在を判定できる
- 厳密等価演算子で値や参照を比較できる

## 課題で要求しない知識（必要な場合のみ）

- プロトタイプチェーンの詳細な探索アルゴリズムは要求しない
- `class` 構文、コンストラクタ、継承構文を使ったプロトタイプの仕組みは要求しない
- `Map` オブジェクトの詳しい使い方は要求しない
- `Object#toString` のような `#` を使った短縮表記の使用は要求しない

## 課題で扱う場合の注意

- このページではプロトタイプチェーンの詳しい仕組みは後の章に委ねているため、課題では「インスタンスからプロトタイプメソッドを呼び出せる」範囲に留める
- `Object.create(null)` で作成したオブジェクトでは `hasOwnProperty` を呼び出せないため、プロパティの存在確認には `Object.hasOwn` を使う条件を明示する
- `Array` と `Object` の継承関係を扱う場合、教材中の `Object.create` によるコードは実装そのものではなく関係を示すイメージであることを前提にする
