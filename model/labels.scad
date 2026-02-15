// Shed Model - Compass Labels
include <dimensions.scad>

module compass_label(text_str) {
    color(label_color)
        linear_extrude(label_height)
            text(text_str, size = label_size, halign = "center", valign = "center", font = "Arial:style=Bold");
}

module compass_labels() {
    label_z = 0;  // At ground bottom
    offset_dist = 30;            // Distance outside shed footprint

    // NORTH label (y = shed_width + offset, centered on x)
    translate([shed_length / 2, shed_width + offset_dist, label_z])
        compass_label("NORTH");

    // SOUTH label (y = -offset, centered on x)
    translate([shed_length / 2, -offset_dist, label_z])
        rotate([0, 0, 180])
            compass_label("SOUTH");

    // EAST label (x = shed_length + offset, centered on y)
    translate([shed_length + offset_dist, shed_width / 2, label_z])
        rotate([0, 0, -90])
            compass_label("EAST (uphill)");

    // WEST label (x = -offset, centered on y)
    translate([-offset_dist, shed_width / 2, label_z])
        rotate([0, 0, 90])
            compass_label("WEST (downhill)");
}
