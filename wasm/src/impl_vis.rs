/// tools/src/ のコードをここにコピーして移植してください。
/// 新しく書くのは主に SVG 描画部分（draw_svg 関数など）です。
///
/// このファイルに書くもの:
///   - tools/src/ から移植した構造体・enum
///   - 入力生成・パース・スコア計算・状態遷移などのロジック
///   - visualize() / calc_max_turn() の実装
///   - SVG描画関数
///
/// lib.rs から呼び出される pub 関数:
///   pub fn generate(seed: i32, problem_id: &str) -> String
///   pub fn calc_max_turn(input: &str, output: &str) -> usize
///   pub fn visualize(input: &str, output: &str, turn: usize) -> Result<(i64, String, String), String>

pub fn generate(_seed: i32, _problem_id: &str) -> String {
    todo!("tools/src/ の入力生成コードを移植してください")
}

pub fn calc_max_turn(_input: &str, output: &str) -> usize {
    if output.trim().is_empty() {
        return 0;
    }
    todo!("出力をパースしてターン数を返してください")
}

/// (score, err, svg) のタプルを返す
pub fn visualize(_input: &str, _output: &str, _turn: usize) -> Result<(i64, String, String), String> {
    todo!("入力・出力をパースして SVG を描画してください")
}
