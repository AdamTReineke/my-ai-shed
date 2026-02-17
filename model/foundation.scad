// Shed Model - Foundation (Piers, Post Bases, Beam Saddles)
include <dimensions.scad>

// Concrete pier - 3-part construction matching as-built BigFoot + sonotube design
// spec = [x_pos, y_pos, bf_index, above_cone, total_height]
//   Part 1 (bottom): bore-hole cylinder at BigFoot base diameter
//   Part 2 (middle): BigFoot frustum tapering from base dia to tube dia
//   Part 3 (top):    sonotube cylinder at tube diameter
module pier(spec) {
    // echo(str("CUTLIST,Concrete pier (x=", spec[0], " y=", spec[1], "),Concrete + BigFoot + Sonotube,1,", spec[4], "\" total depth"));
    x = spec[0];
    y = spec[1];
    bf = bf_specs[spec[2]];
    above_cone = spec[3];
    total_height = spec[4];

    bf_height = bf[0];
    bf_top_dia = bf[1];
    bf_base_dia = bf[2];
    tube_dia = bf[3];

    below_cone = total_height - bf_height - above_cone;

    // Pier top position depends on support type
    ground_z = ground_height(x, y);
    pier_top = is_saddle_position(x)
        ? beam_bottom_z - post_base_height
        : ground_z + pier_above_ground;
    pier_bottom = pier_top - total_height;

    color(color_concrete, pier_alpha) {
        // 1. Below-cone cylinder (bore hole filled with concrete)
        if (below_cone > 0) {
            translate([x, y, pier_bottom])
                cyl(d = bf_base_dia, h = below_cone, anchor = BOTTOM);
        }

        // 2. BigFoot frustum (wide base tapers to sonotube diameter)
        translate([x, y, pier_bottom + max(0, below_cone)])
            cyl(d1 = bf_base_dia, d2 = bf_top_dia, h = bf_height, anchor = BOTTOM);

        // 3. Sonotube above cone
        translate([x, y, pier_bottom + max(0, below_cone) + bf_height])
            cyl(d = tube_dia, h = above_cone, anchor = BOTTOM);
    }
}

// Post base (simplified Simpson ABU66SS style) - for positions WITH posts
module post_base(x, y) {
    echo(str("CUTLIST,Post base (x=", x, " y=", y, "),Simpson ABU66SS,1,6\" x 6\" base plate"));
    base_size = 6;
    base_plate_height = 0.25;
    top_z = pier_top_z(x, y);

    color(color_steel)
        translate([x, y, top_z]) {
            // Bottom plate
            up(base_plate_height / 2)
                cuboid([base_size, base_size, base_plate_height], anchor = CENTER);
            // Standoff corners (4 small posts)
            for (dx = [-2, 2])
                for (dy = [-2, 2])
                    translate([dx, dy, base_plate_height])
                        cuboid([0.5, 0.5, post_base_height], anchor = BOTTOM);
        }
}

// Beam saddle (Simpson ABU66SS style) - for east positions with NO post
// Beam sits directly in saddle mounted on pier
module beam_saddle(x, y) {
    echo(str("CUTLIST,Beam saddle (x=", x, " y=", y, "),Simpson ABU66SS,1,6\" x 6\" saddle"));
    saddle_width = 6;        // Saddle width
    saddle_height = beam_height;  // Tall enough to support beam
    plate_height = 0.25;

    // Saddle mounts at beam bottom elevation (pier must be taller here)
    saddle_bottom = beam_bottom_z - post_base_height;

    color(color_steel)
        translate([x, y, saddle_bottom]) {
            // Bottom plate on pier
            up(plate_height / 2)
                cuboid([saddle_width, saddle_width, plate_height], anchor = CENTER);
            // Side flanges that hold beam
            for (dy = [-beam_total_thickness/2 - 0.25, beam_total_thickness/2 + 0.25])
                translate([0, dy, plate_height])
                    cuboid([saddle_width, 0.25, saddle_height], anchor = BOTTOM);
        }
}
