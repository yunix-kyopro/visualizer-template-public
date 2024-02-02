pub mod io;
pub mod vis;

use anyhow::Context as _;
use io::Input;
use io::Output;
use vis::{VisOption, VisResult};

/// Parse input
pub fn parse_input(s: &str) -> anyhow::Result<Input> {
    let mut s = s.split_whitespace().peekable();
    let input = Input::parse(&mut s).context("Failed to parse Input")?;
    Ok(input)
}

/// Parse single output
pub fn parse_output(s: &str) -> anyhow::Result<Output> {
    let outputs = parse_outputs(s)?;
    let last_output = outputs.into_iter().last().context("No output")?;
    Ok(last_output)
}

/// Parse multiple outputs
pub fn parse_outputs(s: &str) -> anyhow::Result<Vec<Output>> {
    let mut s = s.split_whitespace().peekable();
    let mut out = vec![];

    while s.peek().is_some() {
        out.push(Output::parse(&mut s).context("Failed to parse Output")?);
    }

    Ok(out)
}

/// Calculate score
pub fn calc_score(input: &Input, output: &Output) -> anyhow::Result<i64> {
    output
        .calc_score(input)
        .context("Failed to calculate score")
}

/// Visualize the output
pub fn visualize(
    input: &Input,
    outputs: &[Output],
    option: Option<VisOption>,
) -> anyhow::Result<VisResult> {
    vis::visualize(input, outputs, option).context("Failed to visualize")
}
