# ビジュアライザ開発エージェント向けガイド

このリポジトリはAtCoder Heuristic Contest（AHC）スタイルのビジュアライザ開発テンプレートです。
Rust の3つの関数を実装することで、ブラウザ上で動くビジュアライザを作成できます。

---

## プロジェクト構成

```
visualizer-template-public/
├── wasm/src/lib.rs       ← 【実装対象】Rust の3関数
├── wasm/Cargo.toml       ← 利用可能なクレート
├── src/                  ← フロントエンド（React/TypeScript）※原則変更不要
├── problem_description.txt  ← 問題文（コンテスト開始時に配置）
└── tools/src/            ← 公式テスター・入力生成コード（コンテスト開始時に配置）
```

**フロントエンド（`src/` 以下）は原則変更不要。開発者から明示的に指示があった場合のみ変更すること。**

---

## ビジュアライザ実装の基本方針

**`tools/src/` のコードはほぼ全て `wasm/src/lib.rs` にそのまま移植できる。新しく書く必要があるのは主に SVG 描画部分で、それ以外はコピーして使い回せることが多い。ただし、WASM インターフェースとの兼ね合いで一部の関数シグネチャや戻り値の型を若干調整することがある。**

`tools/src/` 内の以下を**全て** `lib.rs` にコピーして使い回す：
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
- `#[wasm_bindgen]` は外部から呼ぶ3関数にのみ付ける

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

以下の3つだけを読む：
1. `problem_description.txt` — 入出力フォーマット・スコア計算式
2. `tools/src/` 直下の `.rs` ファイルの関数名を確認（全部読まず、`gen` / `score` / `calc` 等を探す）
3. `wasm/Cargo.toml` — 利用可能なクレート確認

### 3. tools/src → wasm/src/lib.rs へ移植

入力生成・スコア計算・パースのコードを tools/src/ からコピーして `lib.rs` に移植する。

### 4. 3関数の実装

#### `gen(seed: i32, problemId: String) -> String`

```rust
#[wasm_bindgen]
pub fn gen(seed: i32, problemId: String) -> String {
    use rand::SeedableRng;
    use rand_chacha::ChaCha20Rng;
    let mut rng = ChaCha20Rng::seed_from_u64(seed as u64);
    // tools/src/ の入力生成ロジックを移植
}
```

#### `get_max_turn(input: String, output: String) -> usize`

**0 を返すとスライダーが動かない。** 多くの場合は行数がターン数：

```rust
#[wasm_bindgen]
pub fn get_max_turn(_input: String, output: String) -> usize {
    if output.trim().is_empty() { return 0; }
    output.trim().lines().count() // 問題によって調整
}
```

#### `vis(input: String, output: String, turn: usize) -> Ret`

```rust
// Ret { score: i64, err: String, svg: String }
#[wasm_bindgen]
pub fn vis(input: String, output: String, turn: usize) -> Ret {
    match vis_inner(&input, &output, turn) {
        Ok(ret) => ret,
        Err(e) => Ret { score: 0, err: e.to_string(), svg: String::new() },
    }
}
```

SVG描画の基本パターン：

```rust
use svg::Document;
use svg::node::element::{Rectangle, Circle, Line};

let mut doc = Document::new()
    .set("viewBox", (0, 0, 600, 600))
    .set("width", 600).set("height", 600);
doc = doc.add(Rectangle::new()
    .set("x", x).set("y", y).set("width", w).set("height", h)
    .set("fill", "#4488cc").set("stroke", "#000").set("stroke-width", 1));
doc.to_string()
```

### 5. ビルドと動作確認

```bash
cd wasm && wasm-pack build --target web --out-dir ../public/wasm && cd ..
yarn dev
```

確認：seed入力で入力生成 → 出力貼り付けでスライダー更新 → スライダーでSVG描画

---

## 注意事項

- `getrandom` は `features = ["js"]` が必要（すでに Cargo.toml に設定済みのはず）
- `proconio::input!` は `OnceSource::from(input.as_str())` と組み合わせて使う
- ビルドエラー時はまず `cd wasm && cargo check` で原因を特定してから修正する
