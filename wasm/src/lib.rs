use wasm_bindgen::prelude::*;
mod util;

#[wasm_bindgen]
pub fn gen(seed: i32) -> String {
    util::gen(seed as u64).to_string()
}

#[wasm_bindgen(getter_with_clone)]
pub struct Ret {
    pub score: i64,
    pub err: String,
    pub svg: String,
}

#[wasm_bindgen]
pub fn vis(_input: String, _output: String, turn: usize) -> Ret {
    let input = util::parse_input(&_input);
    let output = util::parse_output(&_output, input.m);
    let (score, err, svg) = util::vis(&input, &output, turn as usize);
    Ret {
        score: score,
        err: err.to_string(),
        svg: svg.to_string(),
    }
}

#[wasm_bindgen]
pub fn get_max_turn(_input: String, _output: String) -> usize {
    let input = util::parse_input(&_input);
    let output = util::parse_output(&_output, input.m);
    (output.v - 1) as usize
}
