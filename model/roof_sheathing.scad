// Shed Model - Roof Sheathing (Zip System)
// 7/16" Zip sheathing on top of rafters, 4'x8' panels with visible gaps.
// Future layers (rigid foam, furring, metal roof) are TBD.
include <dimensions.scad>

// ============================================
// ROOF SHEATHING MODULE
// ============================================
// Sheathing sits on top of rafter upper surface.
// Covers from eave (wall face, y=0/y=144) to ridge (y=72) on each side.
// Extends to gable overhang edges in X direction.
// Panels are 48" wide (along ridge, X) x 96" long (up the slope).

roof_panel_width = 48;   // 4' along ridge (X direction)
roof_panel_length = 96;  // 8' up the slope
roof_panel_gap = 0.25;   // Visual gap between panels

module roof_panel(x, y, w, l) {
    if (w > roof_panel_gap && l > roof_panel_gap)
        translate([x + roof_panel_gap/2, y + roof_panel_gap/2, 0])
            cube([w - roof_panel_gap, l - roof_panel_gap, roof_sheathing_thickness]);
}

module roof_panel_grid(total_width, slope_length) {
    num_cols = floor(total_width / roof_panel_width);
    remainder_w = total_width - num_cols * roof_panel_width;
    num_rows = floor(slope_length / roof_panel_length);
    remainder_l = slope_length - num_rows * roof_panel_length;

    if (num_cols > 0) for (col = [0 : num_cols - 1]) {
        if (num_rows > 0) for (row = [0 : num_rows - 1]) {
            roof_panel(col * roof_panel_width, row * roof_panel_length,
                       roof_panel_width, roof_panel_length);
        }
        // Partial row at ridge
        if (remainder_l > roof_panel_gap)
            roof_panel(col * roof_panel_width, num_rows * roof_panel_length,
                       roof_panel_width, remainder_l);
    }
    // Partial column
    if (remainder_w > roof_panel_gap) {
        if (num_rows > 0) for (row = [0 : num_rows - 1]) {
            roof_panel(num_cols * roof_panel_width, row * roof_panel_length,
                       remainder_w, roof_panel_length);
        }
        if (remainder_l > roof_panel_gap)
            roof_panel(num_cols * roof_panel_width, num_rows * roof_panel_length,
                       remainder_w, remainder_l);
    }
}

module roof_sheathing() {
    // Slope length per side (eave to ridge along the slope)
    slope_length = truss_half_span / cos(truss_rafter_angle);

    // Roof width = shed length (no gable overhangs)
    total_width = shed_length;

    // Rafter top Z at the eave, relative to truss base (wall_top_z):
    // Bottom chord top = truss_member_depth
    // At eave (y=0), rafter bottom sits on chord top.
    // Rafter vertical thickness at plumb cut = truss_member_depth / cos(angle)
    rafter_top_z_eave = truss_member_depth + truss_member_depth / cos(truss_rafter_angle);

    // South roof plane: slopes from eave at y=0 up to ridge at y=half_span
    color(color_zip)
    translate([0, 0, wall_top_z + rafter_top_z_eave])
    rotate([truss_rafter_angle, 0, 0])
        roof_panel_grid(total_width, slope_length);

    // North roof plane: slopes from eave at y=shed_width down to ridge at y=half_span
    color(color_zip)
    translate([0, shed_width, wall_top_z + rafter_top_z_eave])
    rotate([-truss_rafter_angle, 0, 0])
    translate([0, -slope_length, 0])
        roof_panel_grid(total_width, slope_length);
}
