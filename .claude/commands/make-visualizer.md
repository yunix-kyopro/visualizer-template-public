# make-visualizer

ヒューリスティックコンテスト用ビジュアライザを実装します。
**以下の手順を順番に実行してください。次のステップに進む前に各ステップを完了させること。**

---

## ステップ1: 前提条件チェック

以下を確認し、問題があれば停止してユーザーに伝えてください:

- `problem_description.txt` を読んで、プレースホルダーのまま（「コンテストの問題文をここに記載してください」のような内容）であれば停止して「problem_description.txt に問題文を記載してください」と伝える
- `tools/src/` が存在しなければ停止して「公式から配布されるテスターコードを `tools/src/` に配置してください」と伝える

両方問題なければステップ2へ進む。

---

## ステップ2: 問題を読んでビジュアライザ設計を提案する

以下の2ファイルを読む:

1. `problem_description.txt` — 入出力フォーマット・状態・スコア計算を確認
2. `tools/src/lib.rs` — 構造体定義と公開関数のシグネチャを把握（**`tools/src/bin/` 以下は読まない**）

読んだら、**実装せずに**以下の内容をユーザーに提示してください:

### 提示する内容

**【ビジュアライザ設計案】** として以下を箇条書きで示す:

- **描画する要素**: フィールド・エージェント・目的地・障害物など、何をSVGに描くか
- **ターンの定義**: `calc_max_turn` が返す値（出力の行数 or 操作数など）
- **ターンごとの状態変化**: スライダーを動かすと何が変わるか
- **スコア表示**: `visualize` が返すスコアの計算方法

提示した後、**「この設計で実装しますか？」とユーザーに確認を取り、承認を得てからステップ3へ進む。**

---

## ステップ3: wasm/src/impl_vis.rs を実装

ユーザーの承認を得たら実装に入る。

### lib.rs の内容を impl_vis.rs の先頭に結合する

**まず以下のシェルコマンドを実行して**、`tools/src/lib.rs` の内容を `wasm/src/impl_vis.rs` のプレースホルダー関数の**上**に結合する:

```bash
cat tools/src/lib.rs wasm/src/impl_vis.rs > /tmp/impl_vis_combined.rs && mv /tmp/impl_vis_combined.rs wasm/src/impl_vis.rs
```

これにより `impl_vis.rs` は以下の構造になる:
1. `tools/src/lib.rs` の全内容（構造体・ロジック・ユーティリティ）
2. 既存のプレースホルダー関数（`generate` / `calc_max_turn` / `visualize`）

**`tools/src/bin/` 以下は読まない。lib.rs のみ結合すること。**

新しく書くのは主にプレースホルダーを埋める SVG 描画部分（`draw_svg` など）。

### WASM 非互換な箇所だけ修正する

- `eprintln!` / `println!` → 削除するか `web_sys::console::log_1` に変更
- ファイルI/O / `fn main()` → 削除
- `proconio::input!` はそのまま使える（`OnceSource::from(str)` 経由で）
- `#[wasm_bindgen]` は付けない（lib.rs 側のみに付く）

**`tools/src/lib.rs` にはビジュアライザに不要なコードが含まれることがある。**
スコア計算・状態遷移・パース関数はビジュアライザでも必要だが、外部プロセスを起動・制御するためのコード（`exec` 関数、`read_line` 関数、`use std::process::ChildStdout` などの import）はビジュアライザには不要なので、遠慮なく削除すること。

### impl_vis.rs が公開する3つの関数

`lib.rs` から以下の関数名で呼び出されるため、**必ずこのシグネチャで実装すること**:

```rust
pub fn generate(seed: i32, problem_id: &str) -> String
pub fn calc_max_turn(input: &str, output: &str) -> usize
pub fn visualize(input: &str, output: &str, turn: usize) -> Result<(i64, String, String), String>
//                                                                    ^score  ^err    ^svg
```

`calc_max_turn` の注意: **0 を返すとスライダーが動かない**。出力が空でなければ必ず 1 以上を返すこと。

#### `generate` における `problem_id` の扱い

`tools/src/lib.rs` の `gen` 関数が問題カテゴリ（A/B/C など）を引数に取る場合でも、**そのカテゴリが存在しない問題もある**。

- `gen` が問題カテゴリを引数に取らない（引数が seed だけ）場合: `problem_id` を無視してそのまま呼ぶ
- `gen` が問題カテゴリを引数に取る場合: `problem_id`（"A", "B", "C" など）を `char` に変換して渡す。ただし、`problem_id` が空文字列・未知の値のときはデフォルト値（最初の問題カテゴリ）にフォールバックする

```rust
// problem_id が不要な場合の例
pub fn generate(seed: i32, _problem_id: &str) -> String {
    let input = gen(seed as u64);
    format!("{}", input)
}

// problem_id がある場合の例（A/B/C が存在するとき）
pub fn generate(seed: i32, problem_id: &str) -> String {
    let problem = problem_id.chars().next().unwrap_or('A');
    let input = gen(seed as u64, problem);
    format!("{}", input)
}
```

### visualize の実装パターン

```rust
pub fn visualize(input: &str, output: &str, turn: usize) -> Result<(i64, String, String), String> {
    // 1. 入力をパース（コピーしたパース関数を流用）
    // 2. 出力をパースして turn 番目までの操作を取得
    // 3. 状態を計算（コピーしたスコア計算関数を流用）
    // 4. SVGを描画して返す
    let svg = draw_svg(/* 状態 */).map_err(|e| e.to_string())?;
    Ok((score, String::new(), svg))  // (score, err, svg)
}
```

### SVG描画の基本パターン

```rust
use svg::Document;
use svg::node::element::{Rectangle, Circle, Line};
use svg::node::element::Text as SvgText;

fn draw_svg(/* 状態の引数 */) -> Result<String, Box<dyn std::error::Error>> {
    let size = 600;
    let mut doc = Document::new()
        .set("viewBox", format!("0 0 {size} {size}"))
        .set("width", size).set("height", size);

    // 矩形
    doc = doc.add(Rectangle::new()
        .set("x", x).set("y", y).set("width", w).set("height", h)
        .set("fill", "#4488cc").set("stroke", "#000").set("stroke-width", 1));

    // 円
    doc = doc.add(Circle::new()
        .set("cx", cx).set("cy", cy).set("r", r).set("fill", "#cc4444"));

    // 線
    doc = doc.add(Line::new()
        .set("x1", x1).set("y1", y1).set("x2", x2).set("y2", y2)
        .set("stroke", "#000").set("stroke-width", 2));

    // テキスト（svg 0.17: Text::new() は文字列を引数に取る）
    doc = doc.add(SvgText::new("ラベル")
        .set("x", x).set("y", y)
        .set("text-anchor", "middle").set("font-size", 12).set("fill", "#fff"));

    Ok(doc.to_string())
}
```

> **注意**: `wasm/src/lib.rs` の確認は通常不要。`generate` / `calc_max_turn` / `visualize` 以外の関数名を使った場合のみ修正すること。

---

## ステップ4: ビルドと動作確認

まず `cargo check` でコンパイルエラーを確認し、通ったら `wasm-pack build` を実行する:

```bash
cd wasm && cargo check
```

エラーがなければ:

```bash
wasm-pack build --target web --out-dir ../public/wasm
```

- `cargo check` でエラーが出たら原因を特定して修正してから `wasm-pack build` を実行する
- クレートのバージョン不一致が原因の場合のみ `wasm/Cargo.toml` を修正する

ビルドが完了したらユーザーに `yarn dev` でサーバーを起動して動作確認するよう伝える:
1. seed 入力 → 入力エリアに問題入力が表示される（`gen` OK）
2. 出力貼り付け → スライダーの上限が更新される（`get_max_turn` OK）
3. スライダーを動かす → SVG が描画される（`vis` OK）

---

## 注意事項

- `proconio::input!` は `OnceSource::from(input.as_str())` と組み合わせて使う
- `getrandom` は `features = ["js"]` が必要（すでに Cargo.toml に設定済みのはず）
- `impl` はRustの予約語のためモジュール名に使えない（ファイル名は `impl_vis.rs`）
