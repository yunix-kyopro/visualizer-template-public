use svg::{
    node::{
        element::{Circle, Group, Line, Rectangle, Title},
        Text,
    },
    Node,
};

/// Convert a value to a color.
///
/// required: 0 <= v <= 1
pub(super) fn color(v: f64) -> String {
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
    format!(
        "#{:02x}{:02x}{:02x}",
        r.round() as i32,
        g.round() as i32,
        b.round() as i32
    )
}

/// Create a rectangle.
pub(super) fn rect(x: f64, y: f64, w: f64, h: f64, fill: &str) -> Rectangle {
    Rectangle::new()
        .set("x", x)
        .set("y", y)
        .set("width", w)
        .set("height", h)
        .set("fill", fill)
}

/// Create a circle.
pub(super) fn circle(x: f64, y: f64, r: f64, fill: &str) -> Circle {
    Circle::new()
        .set("cx", x)
        .set("cy", y)
        .set("r", r)
        .set("fill", fill)
}

/// Create a line.
pub(super) fn line(x1: f64, y1: f64, x2: f64, y2: f64, stroke_width: f64, color: &str) -> Line {
    Line::new()
        .set("x1", x1)
        .set("y1", y1)
        .set("x2", x2)
        .set("y2", y2)
        .set("stroke", color)
        .set("stroke-width", stroke_width)
}

/// Create a text label.
pub(super) fn text(x: f64, y: f64, size: f64, s: &str) -> svg::node::element::Text {
    svg::node::element::Text::new()
        .set("x", x)
        .set("y", y)
        .set("font-size", size)
        .set("text-anchor", "middle")
        .add(svg::node::Text::new(s))
}

/// Append a title (=tooltip) to a node.
pub(super) fn with_title(node: impl Into<Box<dyn Node>>, title: &str) -> Group {
    Group::new()
        .add(Title::new().add(Text::new(title)))
        .add(node)
}
