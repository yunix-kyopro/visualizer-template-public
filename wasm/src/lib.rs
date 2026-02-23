mod impl_vis;

use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct Ret {
    pub score: i64,
    pub err: String,
    pub svg: String,
}

#[wasm_bindgen]
pub fn gen(seed: i32, problem_id: String) -> String {
    impl_vis::generate(seed, &problem_id)
}

#[wasm_bindgen]
pub fn get_max_turn(input: String, output: String) -> usize {
    impl_vis::calc_max_turn(&input, &output)
}

#[wasm_bindgen]
pub fn vis(input: String, output: String, turn: usize) -> Ret {
    match impl_vis::visualize(&input, &output, turn) {
        Ok((score, err, svg)) => Ret { score, err, svg },
        Err(e) => Ret {
            score: 0,
            err: e,
            svg: String::new(),
        },
    }
}
