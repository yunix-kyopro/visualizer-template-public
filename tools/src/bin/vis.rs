use anyhow::Context;
use clap::Parser;
use std::{fs, path::PathBuf};
use tools::{parse_input, parse_outputs, vis::VisResult, visualize};

#[derive(Parser, Debug)]
struct Args {
    /// Path to input.txt
    input: PathBuf,
    /// Path to output.txt
    output: PathBuf,
    /// Path to vis.html
    #[clap(short = 'v', long = "vis", default_value = "vis.html")]
    vis_out: PathBuf,
}

fn main() -> anyhow::Result<()> {
    let args = Args::parse();

    let (score, svg) = match get_vis_result(&args) {
        Ok(vis_result) => (vis_result.score, vis_result.svg),
        Err(err) => {
            eprintln!("{:?}", err);
            (0, svg::Document::new())
        }
    };

    println!("Score = {score}");

    let vis = format!("<html><body>{}</body></html>", svg);
    std::fs::write(&args.vis_out, &vis)?;

    Ok(())
}

fn get_vis_result(args: &Args) -> anyhow::Result<VisResult> {
    let input_str = fs::read_to_string(&args.input)
        .with_context(|| format!("No such input file: {}", &args.input.to_string_lossy()))?;
    let input = parse_input(&input_str)?;
    let output_str = fs::read_to_string(&args.output)
        .with_context(|| format!("No such output file: {}", &args.output.to_string_lossy()))?;
    let outputs = parse_outputs(&input, &output_str)?;

    let vis_result = visualize(&input, &outputs, None)?;

    Ok(vis_result)
}
