# ビジュアライザ開発エージェント向けガイド

このリポジトリはAtCoder Heuristic Contest（AHC）スタイルのビジュアライザ開発テンプレートです。
Rust の3つの関数を実装することで、ブラウザ上で動くビジュアライザを作成できます。

---

## プロジェクト構成

```
visualizer-template-public/
├── wasm/src/lib.rs       ← wasm_bindgen ラッパー（薄い層）
├── wasm/src/impl.rs      ← 実装本体（新規作成する）
├── wasm/Cargo.toml       ← クレート定義
├── src/                  ← フロントエンド（React/TypeScript）※原則変更不要
├── problem_description.txt  ← 問題文（コンテスト開始時に配置）
└── tools/src/            ← 公式テスター・入力生成コード（コンテスト開始時に配置）
```

**フロントエンド（`src/` 以下）は原則変更不要。開発者から明示的に指示があった場合のみ変更すること。**

---

## ビジュアライザ実装の基本方針

**`tools/src/` のコードはほぼ全て `wasm/src/impl.rs` にそのまま移植できる。新しく書く必要があるのは主に SVG 描画部分で、それ以外はコピーして使い回せることが多い。ただし、WASM インターフェースとの兼ね合いで一部の関数シグネチャや戻り値の型を若干調整することがある。**

### ファイル分割の方針

- **`wasm/src/impl.rs`**（新規作成）: `tools/src/` からコピーしたコード + SVG 描画 + 各種実装
- **`wasm/src/lib.rs`**: `impl.rs` を呼び出す薄い `wasm_bindgen` ラッパーのみ

`tools/src/` 内の以下を**全て** `impl.rs` にコピーして使い回す：
- 各種構造体（入力・出力・状態を表す struct/enum）
- 入力生成関数
- 入力パース関数・実装
- スコア計算関数
- 状態遷移・操作適用ロジック
- 各種ユーティリティ・ヘルパー関数

コピー後に WASM と非互換な箇所だけ修正する：
- `eprintln!` / `println!` → 削除または `web_sys::console::log_1` に変更
- ファイルI/O / `fn main()` → 削除
- `proconio::input!` はそのまま使える（`OnceSource::from(str)` 経由で）
- `#[wasm_bindgen]` は `lib.rs` 側の3関数にのみ付ける（`impl.rs` には付けない）

---

## 実装タスクの進め方

ビジュアライザ実装を依頼されたら以下の順で進める。**各ステップを完了してから次に進むこと**。

### 1. 前提条件チェック

以下が存在するか確認し、**なければ停止してユーザーに伝える**：

| 必要なもの | なかった場合のメッセージ |
|---|---|
| `problem_description.txt` | 「問題文をリポジトリルートに `problem_description.txt` として配置してください」 |
| `tools/src/` | 「公式から配布されるテスターコードを `tools/src/` に配置してください」 |

### 2. 仕様把握（最小限の読み込み）

1. `problem_description.txt` — 入出力フォーマット・スコア計算式
2. `tools/src/lib.rs` — 構造体・関数シグネチャのみ把握する（**`bin/` 以下は読まない**）
   - スコア計算・入力生成のロジック内部は**理解不要**。ブラックボックスとして使う
   - 把握すべきは関数シグネチャ（`fn gen(...)`, `fn parse_input(...)` など）と構造体定義のみ
3. `wasm/Cargo.toml` — さらっと確認する程度でよい。バージョン不一致などのビルドエラーが出た時に戻って修正する

### 3. wasm/src/impl.rs を新規作成して tools/src を移植

`wasm/src/impl.rs` を新規作成し、`tools/src/` のコードを全て移植する。

### 4. lib.rs を実装（薄いラッパー）

```rust
mod impl_vis;
use impl_vis::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct Ret {
    pub score: i64,
    pub err: String,
    pub svg: String,
}

#[wasm_bindgen]
pub fn gen(seed: i32, problemId: String) -> String {
    impl_vis::generate(seed, &problemId)
}

#[wasm_bindgen]
pub fn get_max_turn(input: String, output: String) -> usize {
    if output.trim().is_empty() { return 0; }
    impl_vis::calc_max_turn(&input, &output)
}

#[wasm_bindgen]
pub fn vis(input: String, output: String, turn: usize) -> Ret {
    match impl_vis::visualize(&input, &output, turn) {
        Ok((score, err, svg)) => Ret { score, err, svg },
        Err(e) => Ret { score: 0, err: e, svg: String::new() },
    }
}
```

※ 関数名は `impl.rs` に定義した実際の名前に合わせて調整すること。

### 5. get_max_turn の実装（impl.rs 内）

**0 を返すとスライダーが動かない。** 多くの場合は出力のアクション数がターン数：

```rust
pub fn calc_max_turn(input: &str, output: &str) -> usize {
    // parse_output 等を使って実際のアクション数を返す
    output.trim().lines().count() // 問題によって調整
}
```

### 6. vis の SVG描画実装（impl.rs 内）

`Ret` は lib.rs 側で定義するため、`impl_vis::visualize` は `(i64, String, String)` タプルで返す：

```rust
// impl_vis.rs
pub fn visualize(input: &str, output: &str, turn: usize) -> Result<(i64, String, String), String> {
    // 1. 入力をパース（impl.rs 内のパース関数を流用）
    // 2. 出力をパースして turn 番目までの操作を取得
    // 3. 状態を計算（impl.rs 内のスコア計算関数を流用）
    // 4. SVGを描画して返す
    let svg = draw_svg(/* 状態 */).map_err(|e| e.to_string())?;
    Ok((score, String::new(), svg))  // (score, err, svg)
}
```

SVG描画の基本パターン：

```rust
use svg::Document;
use svg::node::element::{Rectangle, Circle, Line};
use svg::node::element::Text as SvgText;  // テキストラベル

fn draw_svg(/* 状態の引数 */) -> Result<String, Box<dyn std::error::Error>> {
    let mut doc = Document::new()
        .set("viewBox", format!("0 0 600 600"))
        .set("width", 600).set("height", 600);

    // 矩形
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

### 7. ビルドと動作確認

```bash
cd wasm && wasm-pack build --target web --out-dir ../public/wasm && cd ..
yarn dev
```

- ビルドエラーが出たらまず `cd wasm && cargo check` で原因を特定する
- クレートのバージョン不一致が原因の場合のみ `wasm/Cargo.toml` を修正する

確認：seed入力で入力生成 → 出力貼り付けでスライダー更新 → スライダーでSVG描画

---

## 注意事項

- `getrandom` は `features = ["js"]` が必要（すでに Cargo.toml に設定済みのはず）
- `proconio::input!` は `OnceSource::from(input.as_str())` と組み合わせて使う
- `impl.rs` のモジュール名は `mod impl_vis;` などにする（`impl` はRustの予約語のため使えない）
- ビルドエラー時はまず `cd wasm && cargo check` で原因を特定してから修正する
