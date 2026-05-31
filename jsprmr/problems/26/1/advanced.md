# UTCメンテナンス枠

## 問題

メンテナンスの開始日時と継続時間、確認したい日時が与えられます。

開始日時はUTCの年月日・時分として、`input.start` に分かれて入っています。`input.start.month` は `1` が1月、`12` が12月です。

確認したい日時は `input.check` にISO 8601形式の文字列として入っています。

開始日時から終了日時を計算し、確認したい日時がメンテナンス枠の前・枠内・後のどれに当たるかを判定してください。メンテナンス枠は開始日時を含み、終了日時を含みません。

`input.check` から作った `Date` インスタンスが不正な日時の場合は、時刻の比較をせずに状態を `"invalid"` にしてください。

## 入力

`input` には次の形のオブジェクトが入っています。

```js
{
  start: {
    year: 2026,
    month: 6,
    day: 1,
    hour: 23,
    minute: 30
  },
  durationMinutes: 90,
  check: "2026-06-02T00:15:00.000Z"
}
```

- `start` はメンテナンス開始日時をUTCで表します。
- `durationMinutes` はメンテナンスの継続時間を分単位で表す正の整数です。
- `check` は確認したい日時の文字列です。

開始日時の時刻値は、UTCとして扱ってください。年月日などの数値からUTCの時刻値を作るには `Date.UTC` を使えます。

## 出力

`output` に次の形のオブジェクトを代入してください。

```js
{
  startIso: "2026-06-01T23:30:00.000Z",
  endIso: "2026-06-02T01:00:00.000Z",
  status: "inside"
}
```

- `startIso` は開始日時を `toISOString()` で変換した文字列です。
- `endIso` は終了日時を `toISOString()` で変換した文字列です。
- `status` は次のいずれかの文字列です。
  - `"invalid"`: `input.check` が不正な日時
  - `"before"`: 確認日時が開始日時より前
  - `"inside"`: 確認日時が開始日時以上、終了日時より前
  - `"after"`: 確認日時が終了日時以上

## 例

`input`:

```json
{
  "start": {
    "year": 2026,
    "month": 6,
    "day": 1,
    "hour": 23,
    "minute": 30
  },
  "durationMinutes": 90,
  "check": "2026-06-02T00:15:00.000Z"
}
```

期待される `output`:

```json
{
  "startIso": "2026-06-01T23:30:00.000Z",
  "endIso": "2026-06-02T01:00:00.000Z",
  "status": "inside"
}
```
