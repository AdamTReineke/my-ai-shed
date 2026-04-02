// Shed Model - Purlin & Batten Grid
// Two-layer roof grid for metal roofing attachment.
// Layer 1 (battens): 2x4 flat, running up the slope, aligned with trusses.
// Layer 2 (purlins): 2x4 flat, running E-W over battens, 5 rows per slope.
include <dimensions.scad>

module purlins() {
    slope_length = truss_half_span / cos(truss_rafter_angle);
    rafter_top_z_eave = truss_member_depth + truss_member_depth / cos(truss_rafter_angle);
    foam_z = roof_sheathing_thickness + polyiso_thickness;

    // Batten length: from ridge gap to past-wall overhang
    ridge_gap_slope = batten_ridge_gap / cos(truss_rafter_angle);
    overhang_slope = batten_overhang / cos(truss_rafter_angle);
    batten_length = slope_length - ridge_gap_slope + overhang_slope;

    // Purlin row positions (distance from ridge along slope)
    // Row 1: ridge (flush with batten top = ridge_gap_slope from peak)
    // Row 3: wall edge (slope_length from peak)
    // Row 5: eave (bottom of battens = slope_length + overhang_slope)
    // Rows 2,4: evenly spaced between ridge and wall
    ridge_pos = ridge_gap_slope;
    wall_pos = slope_length;
    eave_pos = slope_length + overhang_slope;
    span = wall_pos - ridge_pos;
    purlin_dists = [
        ridge_pos,
        ridge_pos + span / 3,
        ridge_pos + 2 * span / 3,
        wall_pos,
        eave_pos
    ];

    // Butt joint: two halves meet at nearest truss to center
    // Center of shed is at shed_length/2 = 96". Nearest truss X is 96".
    center_truss_x = 96;  // truss_xs[4]

    for (side = ["south", "north"]) {
        if (side == "south") {
            color(color_stud)
            translate([0, 0, wall_top_z + rafter_top_z_eave])
            rotate([truss_rafter_angle, 0, 0])
                _roof_grid(slope_length, foam_z, ridge_gap_slope, batten_length,
                           overhang_slope, purlin_dists, center_truss_x, side);
        } else {
            color(color_stud)
            translate([0, shed_width, wall_top_z + rafter_top_z_eave])
            rotate([-truss_rafter_angle, 0, 0])
            translate([0, -slope_length, 0])
                _roof_grid(slope_length, foam_z, ridge_gap_slope, batten_length,
                           overhang_slope, purlin_dists, center_truss_x, side);
        }
    }
}

// Full grid for one slope: battens + purlins
module _roof_grid(slope_length, foam_z, ridge_gap_slope, batten_length,
                  overhang_slope, purlin_dists, center_truss_x, side) {
    // --- Battens (vertical, up the slope) ---
    // In rotated frame: Y=slope_length is at ridge, Y=0 is at wall, Y<0 is overhang
    // Batten runs from (slope_length - ridge_gap_slope) down to (-overhang_slope)
    for (i = [0 : len(truss_xs) - 1]) {
        tx = truss_xs[i];
        bx = tx - batten_width / 2;
        translate([bx, -overhang_slope, foam_z])
            cube([batten_width, batten_length, batten_height]);
        echo(str("CUTLIST,Batten B", i+1, " (", side, " truss=", tx, "),2x4,1,", batten_length, "\""));
    }

    // --- Purlins (horizontal, over battens) ---
    purlin_z = foam_z + batten_height;
    for (i = [0 : len(purlin_dists) - 1]) {
        d = purlin_dists[i];
        py = slope_length - d - purlin_width / 2;

        // West half: from -gable_overhang to center_truss_x
        west_len = center_truss_x + purlin_gable_overhang;
        translate([-purlin_gable_overhang, py, purlin_z])
            cube([west_len, purlin_width, purlin_height]);

        // East half: from center_truss_x to shed_length + gable_overhang
        east_len = shed_length - center_truss_x + purlin_gable_overhang;
        translate([center_truss_x, py, purlin_z])
            cube([east_len, purlin_width, purlin_height]);

        label = i == 0 ? "ridge" :
                i == len(purlin_dists) - 1 ? "eave" :
                i == len(purlin_dists) - 2 ? "wall" :
                str("field-", i);
        echo(str("CUTLIST,Purlin P", i+1, " ", label, " (", side, "),2x4,2,west=", west_len, "\" east=", east_len, "\""));
    }
}
