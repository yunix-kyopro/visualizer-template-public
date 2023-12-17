use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn gen(seed: i32) -> String {
    "".to_string()
}

#[wasm_bindgen(getter_with_clone)]
pub struct Ret {
    pub score: i64,
    pub err: String,
    pub svg: String,
}

#[wasm_bindgen]
pub fn vis(_input: String, _output: String, turn: usize) -> Ret {
    Ret {
        score: 0,
        err: "".to_string(),
        svg: "".to_string(),
    }
}

#[wasm_bindgen]
pub fn get_max_turn(_input: String, _output: String) -> usize {
    0
}
