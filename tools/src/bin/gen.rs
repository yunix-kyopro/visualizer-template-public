use anyhow::Context;
use clap::Parser;
use std::{
    fs::File,
    io::{prelude::*, BufReader, BufWriter},
    path::PathBuf,
};
use tools::io::{GenOption, Input};

#[derive(Parser, Debug)]
struct Args {
    /// Path to seeds.txt
    seeds_path: PathBuf,
    /// Path to output directory
    #[clap(short = 'd', long = "dir", default_value = "in")]
    dir: PathBuf,
}

fn main() -> anyhow::Result<()> {
    let args = Args::parse();

    if !args.dir.exists() {
        std::fs::create_dir(&args.dir)?;
    }

    let seeds = File::open(&args.seeds_path)
        .with_context(|| format!("No such seed file: {}", &args.seeds_path.to_string_lossy()))?;
    let reader = BufReader::new(seeds);

    for (id, line) in reader.lines().enumerate() {
        let line = line?;
        let line = line.trim();

        if line.len() == 0 {
            continue;
        }

        let seed: u64 = line
            .parse()
            .with_context(|| format!("Parse failed: {}", line))?;
        let option = GenOption { seed };
        let input = Input::gen(option);
        write_input(&input, &args.dir, id)?;
    }

    Ok(())
}

fn write_input(input: &Input, out_dir: &PathBuf, id: usize) -> anyhow::Result<()> {
    let file = File::create(out_dir.join(format!("{:04}.txt", id)))?;
    let mut writer = BufWriter::new(file);
    write!(writer, "{input}")?;
    Ok(())
}
