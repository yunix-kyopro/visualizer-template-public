# make-visualizer

ヒューリスティックコンテスト用ビジュアライザを実装します。
**以下の手順を順番に実行してください。次のステップに進む前に各ステップを完了させること。**

---

## ステップ1: 前提条件チェック

以下が存在するか確認してください（存在しなければ停止してユーザーに伝える）:

- `problem_description.txt` → なければ「問題文をリポジトリルートに `problem_description.txt` として配置してください」と伝えて停止
- `tools/src/` → なければ「公式から配布されるテスターコードを `tools/src/` に配置してください」と伝えて停止

---

## ステップ2: 問題仕様の把握（最小限の読み込み）

以下の**2ファイルだけ**を読んで仕様を把握してください:

1. `problem_description.txt` — 入出力フォーマット・スコア計算式を確認
2. `tools/src/lib.rs` — 構造体・関数シグネチャを把握する（**`bin/` 以下は読まない**）
3. `wasm/Cargo.toml` — 利用可能なクレートをさらっと確認する（深く読む必要はない。ビルドエラーでバージョン不一致が出た場合のみ戻って修正する）

### tools/src/lib.rs の読み方
- スコア計算・入力生成のロジック内部は**理解不要**。ブラックボックスとして使う
- 把握すべきは以下のみ:
  - 公開されている関数のシグネチャ（`fn gen(...)`, `fn parse_input(...)`, `fn compute_score_details(...)` など）
  - 構造体の定義（`Input`, `Output`, `Action` など）
- ロジックの詳細を読もうとしなくてよい。必要になったら都度参照する

仕様の把握ができたら実装に進んでください（このステップで実装は行わない）。

---

## ステップ3: wasm/src/impl.rs を新規作成して tools/src のコードを移植

**`wasm/src/impl.rs`** を新規作成し、`tools/src/` のコードをそこにコピーする。
`lib.rs` はこのファイルを呼び出す薄いラッパーとして保つ。

### impl.rs にコピーする対象

`tools/src/` 内の全ファイルを読み、以下を含むコードを**全て** `impl.rs` にコピーする:

- **各種構造体**（入力・出力・状態を表す struct/enum）
- **入力生成関数**（`gen`, `generate`, `make_input` など）
- **入力パース関数・実装**（`parse`, `from_str`, `read` など）
- **スコア計算関数**（`score`, `calc_score`, `evaluate` など）
- **状態遷移・操作適用ロジック**（`apply`, `simulate`, `step` など）
- **各種ユーティリティ・ヘルパー関数**

新しく書く必要があるのは主に SVG 描画部分。それ以外は全てコピーして使い回すことが多い。
ただし、WASM インターフェースとの兼ね合いで一部の関数シグネチャや戻り値の型を若干調整することがある。

### コピー後に修正する箇所（WASM 非互換部分のみ）

- `eprintln!` / `println!` → 削除するか `web_sys::console::log_1` に変更
- `use std::io` などのファイルI/O → 削除
- `fn main()` → 削除
- `proconio::input!` はそのまま使える（`OnceSource::from(str)` 経由で）
- `#[wasm_bindgen]` は `lib.rs` 側の3関数にのみ付ける（`impl.rs` には付けない）

---

## ステップ4: lib.rs を実装

`wasm/src/lib.rs` は `impl.rs` を呼び出す薄いラッパーとして実装する。

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
    impl_vis::generate(seed, &problemId)  // impl.rs の関数を呼ぶ
}

#[wasm_bindgen]
pub fn get_max_turn(input: String, output: String) -> usize {
    if output.trim().is_empty() {
        return 0;
    }
    impl_vis::calc_max_turn(&input, &output)  // impl.rs の関数を呼ぶ
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

### impl.rs / lib.rs 間の Ret の扱い

`Ret` 構造体は **lib.rs 側で定義**する（`#[wasm_bindgen]` を impl.rs に付けないため）。
`impl_vis::visualize` は `Result<(i64, String, String), String>` を返し、lib.rs 側でタプルを `Ret` に変換する。

```rust
// ---- impl_vis.rs ----
pub fn visualize(input: &str, output: &str, turn: usize) -> Result<(i64, String, String), String> {
    // 1. 入力をパース（impl.rs 内のパース関数を流用）
    // 2. 出力をパースして turn 番目までの操作を取得
    // 3. 状態を計算（impl.rs 内のスコア計算関数を流用）
    // 4. SVGを描画して返す
    let svg = draw_svg(/* 状態 */)?;
    Ok((score, String::new(), svg))  // (score, err, svg) のタプルで返す
}

// ---- lib.rs ----
#[wasm_bindgen]
pub fn vis(input: String, output: String, turn: usize) -> Ret {
    match impl_vis::visualize(&input, &output, turn) {
        Ok((score, err, svg)) => Ret { score, err, svg },
        Err(e) => Ret { score: 0, err: e, svg: String::new() },
    }
}
```

### SVG描画の基本パターン

```rust
use svg::Document;
use svg::node::element::{Rectangle, Circle, Line};
use svg::node::element::Text as SvgText;  // テキストラベル

fn draw_svg(/* 状態の引数 */) -> Result<String, Box<dyn std::error::Error>> {
    let size = 600;
    let mut doc = Document::new()
        .set("viewBox", format!("0 0 {} {}", size, size))
        .set("width", size).set("height", size);

    // 矩形
    doc = doc.add(Rectangle::new()
        .set("x", x).set("y", y)
        .set("width", w).set("height", h)
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
        .set("text-anchor", "middle")
        .set("font-size", 12)
        .set("fill", "#ffffff"));

    Ok(doc.to_string())
}
```

---

## ステップ5: ビルドと動作確認

```bash
cd wasm && wasm-pack build --target web --out-dir ../public/wasm && cd ..
yarn dev
```

- ビルドエラーが出たらまず `cd wasm && cargo check` で原因を特定する
- クレートが足りない場合のみ `wasm/Cargo.toml` を確認・追加する

ブラウザで確認:
1. seed 入力 → 入力エリアに問題入力が表示される（`gen` OK）
2. 出力貼り付け → スライダーの上限が更新される（`get_max_turn` OK）
3. スライダーを動かす → SVG が描画される（`vis` OK）

---

## 注意事項

- `wasm/Cargo.toml` はさらっと確認する程度でよい。バージョン不一致などのビルドエラーが出た時に戻って修正する
- `getrandom` は `features = ["js"]` が必要（すでに設定済みのはず）
- `proconio::input!` は `OnceSource::from(input.as_str())` と組み合わせて使う
- `impl.rs` のモジュール名はファイル名に合わせる（`mod impl_vis;` など。`impl` はRustの予約語のため使えない）
