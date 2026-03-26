// Shed Model - Purlins
// 2x4 flat purlins for metal roofing attachment, 5 per slope.
// Each purlin run is two 2x4-10' pieces butt-joined over an interior truss.
include <dimensions.scad>

module purlins() {
    slope_length = truss_half_span / cos(truss_rafter_angle);
    rafter_top_z_eave = truss_member_depth + truss_member_depth / cos(truss_rafter_angle);
    foam_z = roof_sheathing_thickness + polyiso_thickness;

    // Purlin distances from ridge along slope
    purlin_dists = [0, 24, 48, 72, 93.9];

    for (side = ["south", "north"]) {
        if (side == "south") {
            color(color_stud)
            translate([0, 0, wall_top_z + rafter_top_z_eave])
            rotate([truss_rafter_angle, 0, 0])
                _purlin_row(slope_length, foam_z, purlin_dists, side);
        } else {
            color(color_stud)
            translate([0, shed_width, wall_top_z + rafter_top_z_eave])
            rotate([-truss_rafter_angle, 0, 0])
            translate([0, -slope_length, 0])
                _purlin_row(slope_length, foam_z, purlin_dists, side);
        }
    }
}

module _purlin_row(slope_length, foam_z, dists, side) {
    for (i = [0 : len(dists) - 1]) {
        d = dists[i];
        y_pos = slope_length - d - purlin_width / 2;
        translate([-purlin_overhang, y_pos, foam_z])
            cube([purlin_length, purlin_width, purlin_height]);
        echo(str("CUTLIST,Purlin P", i+1, " (", side, " d=", d, "\"),2x4-10',2,~108\" butt-joined"));
    }
}
