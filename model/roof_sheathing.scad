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
// ZIP System installation: long edge (8') perpendicular to framing (along ridge, X).
// 4' edge runs up the slope across framing members.
// Alternating rows staggered by half a panel (48") to exceed 24" minimum.

roof_panel_width = 96;   // 8' along ridge (X direction) — long edge perpendicular to framing
roof_panel_length = 48;  // 4' up the slope — short edge across framing
roof_panel_gap = 0.25;   // Visual gap between panels
roof_stagger = 48;       // Half-panel stagger between rows (exceeds 24" min)

module roof_panel(x, y, w, l, side="", row=0, note="") {
    if (w > roof_panel_gap && l > roof_panel_gap) {
        translate([x + roof_panel_gap/2, y + roof_panel_gap/2, 0])
            cube([w - roof_panel_gap, l - roof_panel_gap, roof_sheathing_thickness]);
        echo(str("CUTLIST,Roof sheathing (", side, " row ", row, note, "),ZIP System 7/16\",1,", w, "\" x ", l, "\""));
    }
}

module roof_panel_grid(total_width, slope_length, side="") {
    num_rows = floor(slope_length / roof_panel_length);
    remainder_l = slope_length - num_rows * roof_panel_length;

    // Total rows including partial
    total_rows = (remainder_l > roof_panel_gap) ? num_rows + 1 : num_rows;

    for (row = [0 : total_rows - 1]) {
        // Stagger even rows by half a panel
        x_offset = (row % 2 == 1) ? roof_stagger : 0;
        row_y = row * roof_panel_length;
        row_h = (row < num_rows) ? roof_panel_length : remainder_l;
        is_partial_row = (row >= num_rows);

        // Leading partial panel on staggered rows
        if (x_offset > 0)
            roof_panel(0, row_y, x_offset, row_h, side, row, " lead partial");

        // Full panels
        num_full = floor((total_width - x_offset) / roof_panel_width);
        for (col = [0 : num_full - 1]) {
            roof_panel(x_offset + col * roof_panel_width, row_y,
                       roof_panel_width, row_h, side, row,
                       is_partial_row ? " ripped" : "");
        }

        // Trailing partial panel
        trail_x = x_offset + num_full * roof_panel_width;
        trail_w = total_width - trail_x;
        if (trail_w > roof_panel_gap)
            roof_panel(trail_x, row_y, trail_w, row_h, side, row, " trail partial");
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
        roof_panel_grid(total_width, slope_length, "south");

    // North roof plane: slopes from eave at y=shed_width down to ridge at y=half_span
    color(color_zip)
    translate([0, shed_width, wall_top_z + rafter_top_z_eave])
    rotate([-truss_rafter_angle, 0, 0])
    translate([0, -slope_length, 0])
        roof_panel_grid(total_width, slope_length, "north");
}
