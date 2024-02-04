use std::{fmt::Display, str::FromStr};
use thiserror::Error;

/// Read a token and parse it into a value.
#[allow(dead_code)]
pub(super) fn read<T: Copy + PartialOrd + Display + FromStr>(
    token: Option<&str>,
    lb: T,
    ub: T,
) -> Result<T, TokenParseError<T>> {
    if let Some(v) = token {
        if let Ok(v) = v.parse::<T>() {
            if v < lb || ub < v {
                Err(TokenParseError::OutOfRange(v))
            } else {
                Ok(v)
            }
        } else {
            Err(TokenParseError::ParseError(v.to_string()))
        }
    } else {
        Err(TokenParseError::UnexpectedEOF)
    }
}

#[derive(Debug, Error)]
pub enum TokenParseError<T: Display> {
    #[error("Out of range: {0}")]
    OutOfRange(T),
    #[error("Parse error: {0}")]
    ParseError(String),
    #[error("Unexpected EOF")]
    UnexpectedEOF,
}
