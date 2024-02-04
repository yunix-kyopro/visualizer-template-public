use svg::{
    node::{
        element::{Circle, Group, Line, Rectangle, Title},
        Text,
    },
    Node,
};

/// Initialize an SVG document.
#[allow(dead_code)]
pub(super) fn init_svg(
    view_width: f64,
    view_height: f64,
    view_padding: f64,
) -> svg::node::element::SVG {
    let doc = svg::Document::new()
        .set("id", "vis")
        .set(
            "viewBox",
            (
                -view_padding,
                -view_padding,
                view_width + view_padding * 2.0,
                view_height + view_padding * 2.0,
            ),
        )
        .set("width", view_width + view_padding * 2.0)
        .set("height", view_height + view_padding * 2.0)
        .set("style", "background-color:white");
    doc
}

/// Color
#[derive(Debug, Clone, Copy)]
pub(super) enum Color {
    /// RGB color
    RGB(u8, u8, u8),
    /// Named color (e.g. "red")
    Name(&'static str),
}

impl From<Color> for String {
    fn from(c: Color) -> String {
        match c {
            Color::RGB(r, g, b) => format!("#{:02x}{:02x}{:02x}", r, g, b),
            Color::Name(name) => name.to_string(),
        }
    }
}

impl From<&'static str> for Color {
    fn from(s: &'static str) -> Color {
        Color::Name(s)
    }
}

#[derive(Debug, Clone, Copy)]
pub(super) struct Stroke(pub Color, pub f64);

/// Convert a value to a color.
///
/// required: 0 <= v <= 1
#[allow(dead_code)]
pub(super) fn get_color(v: f64) -> Color {
    let v = v.clamp(0.0, 1.0);

    let (r, g, b) = if v < 0.5 {
        let x = v * 2.0;
        (
            30. * (1.0 - x) + 144. * x,
            144. * (1.0 - x) + 255. * x,
            255. * (1.0 - x) + 30. * x,
        )
    } else {
        let x = v * 2.0 - 1.0;
        (
            144. * (1.0 - x) + 255. * x,
            255. * (1.0 - x) + 30. * x,
            30. * (1.0 - x) + 70. * x,
        )
    };

    Color::RGB(r.round() as u8, g.round() as u8, b.round() as u8)
}

/// Create a rectangle.
#[allow(dead_code)]
pub(super) fn create_rect<V: Into<svg::node::Value>>(
    x: V,
    y: V,
    width: V,
    height: V,
    fill: Option<Color>,
    stroke: Option<Stroke>,
) -> Rectangle {
    let mut rect = Rectangle::new()
        .set("x", x)
        .set("y", y)
        .set("width", width)
        .set("height", height);

    if let Some(fill) = fill {
        rect = rect.set("fill", String::from(fill));
    }

    if let Some(Stroke(color, width)) = stroke {
        rect = rect
            .set("stroke", String::from(color))
            .set("stroke-width", width);
    }

    rect
}

/// Create a circle.
#[allow(dead_code)]
pub(super) fn create_circle<V: Into<svg::node::Value>>(
    x: V,
    y: V,
    r: V,
    fill: Option<Color>,
    stroke: Option<Stroke>,
) -> Circle {
    let mut circle = Circle::new().set("cx", x).set("cy", y).set("r", r);

    if let Some(fill) = fill {
        circle = circle.set("fill", String::from(fill));
    }

    if let Some(Stroke(color, width)) = stroke {
        circle = circle
            .set("stroke", String::from(color))
            .set("stroke-width", width);
    }

    circle
}

/// Create a line.
#[allow(dead_code)]
pub(super) fn create_line<V: Into<svg::node::Value>>(
    x1: V,
    y1: V,
    x2: V,
    y2: V,
    stroke_width: V,
    color: Color,
) -> Line {
    Line::new()
        .set("x1", x1)
        .set("y1", y1)
        .set("x2", x2)
        .set("y2", y2)
        .set("stroke", String::from(color))
        .set("stroke-width", stroke_width)
}

/// Create a text label.
#[allow(dead_code)]
pub(super) fn create_text<V: Into<svg::node::Value>, S: Into<String>>(
    x: V,
    y: V,
    size: V,
    s: S,
) -> svg::node::element::Text {
    svg::node::element::Text::new()
        .set("x", x)
        .set("y", y)
        .set("font-size", size)
        .set("text-anchor", "middle")
        .add(svg::node::Text::new(s))
}

/// Append a title (=tooltip) to a node.
#[allow(dead_code)]
pub(super) fn with_title(node: impl Into<Box<dyn Node>>, title: impl Into<String>) -> Group {
    Group::new()
        .add(Title::new().add(Text::new(title)))
        .add(node)
}
