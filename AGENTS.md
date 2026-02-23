# ビジュアライザ開発エージェント向けガイド

このリポジトリはAtCoder Heuristic Contest（AHC）スタイルのビジュアライザ開発テンプレートです。
Rust + WebAssembly + React 構成で、ブラウザ上で動くビジュアライザを作成できます。

---

## プロジェクト構成

```
visualizer-template-public/
├── wasm/src/lib.rs       ← wasm_bindgen ラッパー（実装済み・通常変更不要）
├── wasm/src/impl_vis.rs  ← 実装本体（ここを実装する）
├── wasm/Cargo.toml       ← クレート定義
├── src/                  ← フロントエンド（React/TypeScript）※原則変更不要
├── problem_description.txt  ← 問題文（コンテスト開始時に記載）
└── tools/src/            ← 公式テスター・入力生成コード（コンテスト開始時に配置）
```

**フロントエンド（`src/` 以下）は原則変更不要。開発者から明示的に指示があった場合のみ変更すること。**

---

## ビジュアライザ実装の基本方針

**`tools/src/lib.rs` のコードはほぼ全て `wasm/src/impl_vis.rs` にそのまま移植できる。新しく書く必要があるのは主に SVG 描画部分で、それ以外はコピーして使い回せることが多い。**

`tools/src/lib.rs` 内の以下を全て `impl_vis.rs` にコピーして使い回す：
- 各種構造体・enum（`Input`, `Output`, `Action` など）
- 入力生成・パース・スコア計算・状態遷移などのロジック
- 各種ユーティリティ・ヘルパー関数

**`tools/src/bin/` 以下は読まない**。lib.rs のみ参照すること。

コピー後に WASM と非互換な箇所だけ修正する：
- `eprintln!` / `println!` → 削除または `web_sys::console::log_1` に変更
- ファイルI/O / `fn main()` → 削除
- `proconio::input!` はそのまま使える（`OnceSource::from(str)` 経由で）
- `#[wasm_bindgen]` は付けない（lib.rs 側のみ）
- `gen` 関数内の `_ => panic!(...)` ブランチ → WASM では panic がランタイムエラーになるため、デフォルト値を返すように置き換える
  ```rust
  // 変更前
  _ => { panic!("Unknown problem: {}", problem) }
  // 変更後（問題Aのパラメータをデフォルトとして使う例）
  _ => (0, rng.gen_range(1..=100) as f64, rng.gen_range(1..=20) as f64 * 0.01),
  ```

**`tools/src/lib.rs` にはビジュアライザに不要なコードが含まれることがある。**
スコア計算・状態遷移・パース関数はビジュアライザでも必要だが、外部プロセスを起動・制御するためのコード（`exec` 関数、`read_line` 関数、`use std::process::ChildStdout` などの import）はビジュアライザには不要なので、遠慮なく削除すること。

---

## 実装タスクの進め方

ビジュアライザ実装を依頼されたら以下の順で進める。**各ステップを完了してから次に進むこと**。

### 1. 前提条件チェック

- `problem_description.txt` を読んでプレースホルダーのままなら停止して「problem_description.txt に問題文を記載してください」と伝える
- `tools/src/` が存在しなければ停止して「公式から配布されるテスターコードを `tools/src/` に配置してください」と伝える

### 2. 問題を読んでビジュアライザ設計を提案・確認

以下を読む:
1. `problem_description.txt` — 入出力フォーマット・状態・スコア計算
2. `tools/src/lib.rs` — 構造体と公開関数のシグネチャ（**`bin/` 以下は読まない**）

読んだら**実装せず**、以下の内容を **【ビジュアライザ設計案】** としてユーザーに提示する:
- **描画する要素**: フィールド・エージェント・目的地・障害物など
- **ターンの定義**: `calc_max_turn` が返す値（操作数・行数など）
- **ターンごとの状態変化**: スライダーを動かすと何が変わるか
- **スコア表示**: スコアの計算方法

**「この設計で実装しますか？」とユーザーに確認を取り、承認を得てから実装へ進む。**

### 3. impl_vis.rs を実装

#### まず lib.rs の内容を impl_vis.rs の先頭に結合する

以下のシェルコマンドを実行して、`tools/src/lib.rs` の内容を `wasm/src/impl_vis.rs` のプレースホルダー関数の**上**に結合する:

```bash
cat tools/src/lib.rs wasm/src/impl_vis.rs > /tmp/impl_vis_combined.rs && mv /tmp/impl_vis_combined.rs wasm/src/impl_vis.rs
```

これにより `impl_vis.rs` は以下の構造になる:
1. `tools/src/lib.rs` の全内容（構造体・ロジック・ユーティリティ）
2. 既存のプレースホルダー関数（`generate` / `calc_max_turn` / `visualize`）

その後、プレースホルダー関数を実装し、WASM 非互換な箇所（`eprintln!`、ファイルI/O、`fn main()` など）を修正する。

`lib.rs` から以下のシグネチャで呼び出されるため、**必ずこの関数名・シグネチャで実装すること**:

```rust
pub fn generate(seed: i32, problem_id: &str) -> String
pub fn calc_max_turn(input: &str, output: &str) -> usize
pub fn visualize(input: &str, output: &str, turn: usize) -> Result<(i64, String, String), String>
//                                                                    ^score  ^err    ^svg
```

`calc_max_turn` の注意: **0 を返すとスライダーが動かない**。出力が空でなければ 1 以上を返すこと。

`generate` で `gen` に問題カテゴリを渡す場合、`unwrap_or` だけでは `gen` 内の `panic!` を防げない。`match` で既知のカテゴリのみを通すこと:
```rust
pub fn generate(seed: i32, problem_id: &str) -> String {
    let problem = match problem_id.chars().next().unwrap_or('A') {
        'B' => 'B',
        'C' => 'C',
        _ => 'A',  // 未知の値は 'A' にフォールバック
    };
    let input = gen(seed as u64, problem);
    format!("{}", input)
}
```

> **`wasm/src/lib.rs` の確認は通常不要**。`generate` / `calc_max_turn` / `visualize` 以外の関数名を使った場合のみ修正すること。

### 4. SVG描画の基本パターン（impl_vis.rs 内）

```rust
use svg::Document;
use svg::node::element::{Rectangle, Circle, Line};
use svg::node::element::Text as SvgText;

fn draw_svg(/* 状態の引数 */) -> Result<String, Box<dyn std::error::Error>> {
    let size = 600;
    let mut doc = Document::new()
        .set("viewBox", format!("0 0 {size} {size}"))
        .set("width", size).set("height", size);

    doc = doc.add(Rectangle::new()
        .set("x", x).set("y", y).set("width", w).set("height", h)
        .set("fill", "#4488cc").set("stroke", "#000").set("stroke-width", 1));

    // テキスト（svg 0.17: Text::new() は文字列を引数に取る）
    doc = doc.add(SvgText::new("ラベル")
        .set("x", x).set("y", y)
        .set("text-anchor", "middle").set("font-size", 12).set("fill", "#fff"));

    Ok(doc.to_string())
}
```

### 5. ビルドと動作確認

まず `cargo check` でエラーを確認してから `wasm-pack build` を実行する:

```bash
cd wasm && cargo check
```

エラーがなければ:

```bash
wasm-pack build --target web --out-dir ../public/wasm
```

- `cargo check` でエラーが出たら原因を特定して修正してから `wasm-pack build` を実行する
- クレートのバージョン不一致が原因の場合のみ `wasm/Cargo.toml` を修正する

ビルドが完了したらユーザーに `yarn dev` でサーバーを起動して動作確認するよう伝える。
確認：seed入力で入力生成 → 出力貼り付けでスライダー更新 → スライダーでSVG描画

---

## 注意事項

- `proconio::input!` は `OnceSource::from(input.as_str())` と組み合わせて使う
- `getrandom` は `features = ["js"]` が必要（すでに Cargo.toml に設定済みのはず）
- `impl` はRustの予約語のためモジュール名に使えない（ファイル名は `impl_vis.rs`）
- ビルドエラー時はまず `cd wasm && cargo check` で原因を特定してから修正する
