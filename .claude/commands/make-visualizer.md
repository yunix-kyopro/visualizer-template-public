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

以下の**3ファイルだけ**を読んで仕様を把握してください:

1. `problem_description.txt` — 入出力フォーマット・スコア計算式を確認
2. `tools/src/` 直下の **`*.rs` ファイル一覧** を確認し、`gen` / `score` / `calc` などの関数が含まれるファイルを特定する（全部読まなくてよい、関数名だけ把握する）
3. `wasm/Cargo.toml` — 利用可能なクレートを確認

仕様の把握ができたら実装に進んでください（このステップで実装は行わない）。

---

## ステップ3: tools/src のコードを wasm/src/lib.rs へ丸ごとコピー

**`tools/src/` のコードはほぼ全て `wasm/src/lib.rs` にそのまま移植できる。**

新しく書く必要があるのは主に SVG 描画部分。それ以外は全てコピーして使い回すことが多い。
ただし、WASM インターフェースとの兼ね合いで一部の関数シグネチャや戻り値の型を若干調整することがある。

### コピーする対象

`tools/src/` 内の全ファイルを読み、以下を含むコードを**全て** `lib.rs` にコピーする:

- **各種構造体**（入力・出力・状態を表す struct/enum）
- **入力生成関数**（`gen`, `generate`, `make_input` など）
- **入力パース関数・実装**（`parse`, `from_str`, `read` など）
- **スコア計算関数**（`score`, `calc_score`, `evaluate` など）
- **状態遷移・操作適用ロジック**（`apply`, `simulate`, `step` など）
- **各種ユーティリティ・ヘルパー関数**

コピー後に WASM と非互換な箇所だけ修正する:
- `eprintln!` / `println!` → 削除するか `web_sys::console::log_1` に変更
- `use std::io` などのファイルI/O → 削除
- `fn main()` → 削除
- `proconio::input!` はそのまま使える（`OnceSource::from(str)` 経由で）
- `#[wasm_bindgen]` は外部から呼ぶ3関数（`gen`, `vis`, `get_max_turn`）にのみ付ける

### `gen()` の実装

```rust
#[wasm_bindgen]
pub fn gen(seed: i32, problemId: String) -> String {
    use rand::SeedableRng;
    use rand_chacha::ChaCha20Rng;
    let mut rng = ChaCha20Rng::seed_from_u64(seed as u64);
    // tools/src/ の入力生成ロジックをここに移植
}
```

### `get_max_turn()` の実装

出力を行に分割してターン数を数えるだけのケースが多い:

```rust
#[wasm_bindgen]
pub fn get_max_turn(_input: String, output: String) -> usize {
    if output.trim().is_empty() {
        return 0;
    }
    // 多くの場合は output.lines().count() でOK
    // 問題によって調整する
    output.trim().lines().count()
}
```

---

## ステップ4: vis() の実装（SVG描画）

`vis()` は SVG を返す。tools/src/ のスコア計算を使いつつ、状態を SVG で描画する。

```rust
#[wasm_bindgen]
pub fn vis(input: String, output: String, turn: usize) -> Ret {
    match vis_inner(&input, &output, turn) {
        Ok(ret) => ret,
        Err(e) => Ret { score: 0, err: e.to_string(), svg: String::new() },
    }
}

fn vis_inner(input: &str, output: &str, turn: usize) -> Result<Ret, Box<dyn std::error::Error>> {
    // 1. 入力をパース（tools/src/ のパース関数を流用）
    // 2. 出力をパースして turn 番目までの操作を取得
    // 3. 状態を計算（tools/src/ のスコア計算関数を流用）
    // 4. SVGを描画して返す

    let svg = draw_svg(/* 状態 */)?;
    Ok(Ret { score: /* スコア */, err: String::new(), svg })
}
```

SVG描画の基本パターン:

```rust
use svg::Document;
use svg::node::element::{Rectangle, Circle, Line, Text};

fn draw_svg(/* 状態の引数 */) -> Result<String, Box<dyn std::error::Error>> {
    let size = 600;
    let mut doc = Document::new()
        .set("viewBox", (0, 0, size, size))
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

    Ok(doc.to_string())
}
```

---

## ステップ5: ビルドと動作確認

```bash
cd wasm && wasm-pack build --target web --out-dir ../public/wasm && cd ..
yarn dev
```

ブラウザで確認:
1. seed 入力 → 入力エリアに問題入力が表示される（`gen` OK）
2. 出力貼り付け → スライダーの上限が更新される（`get_max_turn` OK）
3. スライダーを動かす → SVG が描画される（`vis` OK）

ビルドエラーが出た場合は `cd wasm && cargo check` で原因を特定してから修正する。

---

## 注意事項

- `getrandom` は `features = ["js"]` が必要（すでに Cargo.toml に設定済みのはず）
- `proconio::input!` は `OnceSource::from(input.as_str())` と組み合わせて使う
- `wasm-pack build` が遅い場合、まず `cargo check` でエラーがないか確認してから実行する
