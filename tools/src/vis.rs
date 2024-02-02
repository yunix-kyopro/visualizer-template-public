mod helpers;

use crate::{
    io::{Input, Output},
    vis::helpers::{circle, color, rect, with_title},
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
    let output = &outputs[option.turn];
    let score = output.calc_score(input)?;

    const VIEW_SIZE: f64 = 600.0;
    const VIEW_PADDING: f64 = 10.0;
    let doc = svg::Document::new()
        .set("id", "vis")
        .set(
            "viewBox",
            (
                -VIEW_PADDING,
                -VIEW_PADDING,
                VIEW_SIZE + VIEW_PADDING * 2.0,
                VIEW_SIZE + VIEW_PADDING * 2.0,
            ),
        )
        .set("width", VIEW_SIZE + VIEW_PADDING * 2.0)
        .set("height", VIEW_SIZE + VIEW_PADDING * 2.0)
        .set("style", "background-color:white");

    let doc = doc.add(rect(10.0, 10.0, 60.0, 60.0, &color(0.5)));
    let doc = doc.add(with_title(circle(200., 200., 20., "gray"), "hoge"));

    todo!("Write code to visualize here.");

    Ok(VisResult { score, svg: doc })
}
