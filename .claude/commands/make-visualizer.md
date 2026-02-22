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

## ステップ2: 問題仕様の把握（最小限の読み込み）

1. `problem_description.txt` — 入出力フォーマット・スコア計算式を確認
2. `tools/src/lib.rs` — 構造体と関数シグネチャを把握する（**`bin/` 以下は読まない**）
   - 指示がなければロジックの詳細は理解しなくていい。ブラックボックスとして使う
   - まず把握すべきは: 公開関数のシグネチャ（`fn gen(...)` など）と構造体定義（`Input`, `Output`, `Action` など）
3. `wasm/Cargo.toml` — さらっと確認する程度でよい。バージョン不一致のビルドエラーが出た時だけ戻って修正する

仕様の把握ができたら実装に進む（このステップで実装は行わない）。

---

## ステップ3: wasm/src/impl_vis.rs に実装

`wasm/src/impl_vis.rs` はプレースホルダーとして既に存在しています。
**このファイルを上書きして**、`tools/src/` のコードを移植し、3つの `pub fn` を実装してください。

### impl_vis.rs に書くもの

`tools/src/` 内の全ファイルを読み、以下を全てコピーして使い回す:
- 各種構造体・enum（`Input`, `Output`, `Action` など）
- 入力生成・パース・スコア計算・状態遷移などの全ロジック
- 各種ユーティリティ・ヘルパー関数

新しく書くのは主に SVG 描画部分（`draw_svg` など）。ロジックは全てコピーして流用できることが多い。
ただし、WASM インターフェースとの兼ね合いで一部の関数シグネチャや型を若干調整することがある。

### WASM 非互換な箇所だけ修正する

- `eprintln!` / `println!` → 削除するか `web_sys::console::log_1` に変更
- ファイルI/O / `fn main()` → 削除
- `proconio::input!` はそのまま使える（`OnceSource::from(str)` 経由で）
- `#[wasm_bindgen]` は付けない（lib.rs 側のみに付く）

### impl_vis.rs が公開する3つの関数

`lib.rs` から以下の関数名で呼び出されるため、**必ずこのシグネチャで実装すること**:

```rust
pub fn generate(seed: i32, problem_id: &str) -> String
pub fn calc_max_turn(input: &str, output: &str) -> usize
pub fn visualize(input: &str, output: &str, turn: usize) -> Result<(i64, String, String), String>
//                                                                    ^score  ^err    ^svg
```

`get_max_turn` の注意: **0 を返すとスライダーが動かない**。出力が空でなければ必ず 1 以上を返すこと。

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

---

## ステップ4: lib.rs の確認（通常変更不要）

`wasm/src/lib.rs` は既に `impl_vis` を呼び出すラッパーとして実装済みです。
`impl_vis.rs` の関数名をデフォルト（`generate` / `calc_max_turn` / `visualize`）から変えた場合のみ修正してください。

---

## ステップ5: ビルドと動作確認

```bash
cd wasm && wasm-pack build --target web --out-dir ../public/wasm && cd ..
yarn dev
```

- ビルドエラーが出たらまず `cd wasm && cargo check` で原因を特定する
- クレートのバージョン不一致が原因の場合のみ `wasm/Cargo.toml` を修正する

ブラウザで確認:
1. seed 入力 → 入力エリアに問題入力が表示される（`gen` OK）
2. 出力貼り付け → スライダーの上限が更新される（`get_max_turn` OK）
3. スライダーを動かす → SVG が描画される（`vis` OK）

---

## 注意事項

- `proconio::input!` は `OnceSource::from(input.as_str())` と組み合わせて使う
- `getrandom` は `features = ["js"]` が必要（すでに Cargo.toml に設定済みのはず）
- `impl` はRustの予約語のためモジュール名に使えない（ファイル名は `impl_vis.rs`）
