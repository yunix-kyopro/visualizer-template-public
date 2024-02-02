mod helpers;

use crate::{
    io::{Input, Output},
    vis::helpers::{circle, color, init_svg, rect, with_title},
};
use svg::Document;

/// **(CUSTOMIZE IT!)**  Option for visualization
#[derive(Debug, Clone)]
pub struct VisOption {
    pub turn: usize,
}

/// **(CUSTOMIZE IT!)** Result of visualization
#[derive(Debug, Clone)]
pub struct VisResult {
    pub score: i64,
    pub svg: Document,
}

/// **(CUSTOMIZE IT!)** Visualize the output
pub(super) fn visualize(
    input: &Input,
    outputs: &[Output],
    option: Option<VisOption>,
) -> anyhow::Result<VisResult> {
    let option = option.unwrap_or(VisOption {
        turn: outputs.len() - 1,
    });

    const VIEW_SIZE: f64 = 600.0;
    const VIEW_PADDING: f64 = 10.0;
    let doc = init_svg(VIEW_SIZE, VIEW_PADDING);

    // Draw Input
    let x = 30.0 * (input.n as f64 + 1.0);
    let doc = doc.add(rect(x, 10.0, 60.0, 60.0, color(0.5)));

    todo!("Write code to visualize here.");

    // Draw Output
    if outputs.len() == 0 {
        return Ok(VisResult { score: 0, svg: doc });
    }

    let output = &outputs[option.turn];
    let score = output.calc_score(input)?;

    let y = 10.0 * (output.k as f64 + 1.0);
    let doc = doc.add(with_title(circle(200., y, 20., "gray".into()), "hoge"));

    Ok(VisResult { score, svg: doc })
}
