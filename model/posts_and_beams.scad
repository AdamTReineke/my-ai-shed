// Shed Model - Posts and Beams
include <dimensions.scad>

// 6x6 Post - height varies based on ground elevation
module post(x, y) {
    top_z = pier_top_z(x, y);
    post_bottom = top_z + post_base_height;
    height = post_height_at(x, y);

    // Only render if post height is positive (> min threshold)
    if (height > 2) {
        echo(str("CUTLIST,Post (x=", x, " y=", y, "),PT 6x6,1,", height, "\""));
        color(color_pt_wood, wood_alpha)
            translate([x, y, post_bottom])
                cuboid([post_width, post_depth, height], anchor = BOTTOM);
        cc66_cap(x, y);
    }
}

// Beam running along X axis
// 3-ply built-up: 2x10 + 3x10 + 2x10 (5.5" x 9.25")
module beam(y_pos) {
    board_gap = 0.125;  // Visible gap between plies for clarity
    echo(str("CUTLIST,Beam ply outer (y=", y_pos, "),PT 2x10,2,", shed_length, "\""));
    echo(str("CUTLIST,Beam ply center (y=", y_pos, "),PT 3x10,1,", shed_length, "\""));

    color(color_pt_wood, wood_alpha) {
        // Outer ply 1 (south face) - 2x10 (1.5" thick)
        ply1_y = y_pos - beam_center_ply/2 - board_gap - beam_outer_ply/2;
        translate([shed_length / 2, ply1_y, beam_bottom_z])
            cuboid([shed_length, beam_outer_ply, beam_height], anchor = BOTTOM);

        // Center ply - 3x10 (2.5" thick)
        translate([shed_length / 2, y_pos, beam_bottom_z])
            cuboid([shed_length, beam_center_ply, beam_height], anchor = BOTTOM);

        // Outer ply 2 (north face) - 2x10 (1.5" thick)
        ply3_y = y_pos + beam_center_ply/2 + board_gap + beam_outer_ply/2;
        translate([shed_length / 2, ply3_y, beam_bottom_z])
            cuboid([shed_length, beam_outer_ply, beam_height], anchor = BOTTOM);
    }
}
