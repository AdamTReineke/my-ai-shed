// Shed Model - Eave Framing
// Outriggers, sub-fascia, fly rafters, eave fascia, barge boards.
include <dimensions.scad>

module eave_framing() {
    slope_length = truss_half_span / cos(truss_rafter_angle);
    rafter_top_z_eave = truss_member_depth + truss_member_depth / cos(truss_rafter_angle);
    foam_z = roof_sheathing_thickness + polyiso_thickness;

    for (side = ["south", "north"]) {
        if (side == "south") {
            color(color_stud)
            translate([0, 0, wall_top_z + rafter_top_z_eave])
            rotate([truss_rafter_angle, 0, 0])
                _eave_slope_assembly(slope_length, foam_z, side);
        } else {
            color(color_stud)
            translate([0, shed_width, wall_top_z + rafter_top_z_eave])
            rotate([-truss_rafter_angle, 0, 0])
            translate([0, -slope_length, 0])
                _eave_slope_assembly(slope_length, foam_z, side);
        }
    }
}

module _eave_slope_assembly(slope_length, foam_z, side) {
    // --- Outriggers: 2x4 on edge at each truss, at eave end ---
    // Outrigger extends from eave tip back toward ridge
    // Top edge flush with foam top
    outrigger_z = foam_z - truss_member_depth;  // 3.5" tall on edge, top at foam_z
    for (i = [0 : len(truss_xs) - 1]) {
        tx = truss_xs[i];
        translate([tx - truss_member_width/2, -slope_overhang, outrigger_z])
            cube([truss_member_width, outrigger_length, truss_member_depth]);
        echo(str("CUTLIST,Outrigger (", side, " truss ", i, "),2x4,1,", outrigger_length, "\""));
    }

    // --- Sub-fascia: 1x8 at outrigger tips, perpendicular to slope ---
    // Runs full purlin length E-W
    // Positioned at eave tip (Y = -slope_overhang), standing perpendicular to slope
    color(color_fascia)
    translate([-purlin_overhang, -slope_overhang - fascia_thickness, outrigger_z])
        cube([purlin_length, fascia_thickness, fascia_height]);
    echo(str("CUTLIST,Sub-fascia (", side, "),1x8,1,216\""));

    // --- Eave fascia: 1x8 on exterior face of sub-fascia ---
    color(color_fascia)
    translate([-purlin_overhang, -slope_overhang - 2 * fascia_thickness, outrigger_z])
        cube([purlin_length, fascia_thickness, fascia_height]);
    echo(str("CUTLIST,Eave fascia (", side, "),1x8 cedar/primed,1,216\""));

    // --- Fly rafters: 2x4 on edge at gable ends ---
    // West fly rafter
    west_x = truss_xs[0] - purlin_overhang;
    color(color_stud)
    translate([west_x - fly_rafter_thickness, 0, outrigger_z])
        cube([fly_rafter_thickness, slope_length, fly_rafter_depth]);
    echo(str("CUTLIST,Fly rafter west (", side, "),2x4,1,", slope_length, "\""));

    // East fly rafter
    east_x = truss_xs[len(truss_xs) - 1] + purlin_overhang;
    color(color_stud)
    translate([east_x, 0, outrigger_z])
        cube([fly_rafter_thickness, slope_length, fly_rafter_depth]);
    echo(str("CUTLIST,Fly rafter east (", side, "),2x4,1,", slope_length, "\""));

    // --- Barge boards: 1x8 on exterior face of fly rafters ---
    // West barge
    color(color_fascia)
    translate([west_x - fly_rafter_thickness - fascia_thickness, 0, outrigger_z])
        cube([fascia_thickness, slope_length, fascia_height]);
    echo(str("CUTLIST,Barge board west (", side, "),1x8 cedar/primed,1,", slope_length, "\""));

    // East barge
    color(color_fascia)
    translate([east_x + fly_rafter_thickness, 0, outrigger_z])
        cube([fascia_thickness, slope_length, fascia_height]);
    echo(str("CUTLIST,Barge board east (", side, "),1x8 cedar/primed,1,", slope_length, "\""));
}
