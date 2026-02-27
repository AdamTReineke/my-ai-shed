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
    pier_top = is_saddle_position(x)
        ? beam_bottom_z
        : beam_bottom_z - post_height_at(spec[0], spec[1]) - post_base_height;
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

// ABU66SS U-channel helper - renders the bracket with base plate at base_z, centered at (cx, cy)
// interior_w: clear interior width (N-S); the member being held sits inside this gap.
// The U opens upward; member slides in from above.
module abu66ss_channel(cx, cy, base_z, interior_w) {
    wall_h = abu66ss_height - abu66ss_base_h;
    exterior_width = interior_w + 2 * abu66ss_gauge;
    color(color_steel) translate([cx, cy, base_z]) {
        // Base plate (spans exterior width)
        cuboid([abu66ss_length, exterior_width, abu66ss_base_h], anchor = BOTTOM);
        // North wall — inner face at +interior_w/2
        translate([0,  interior_w/2 + abu66ss_gauge/2, abu66ss_base_h])
            cuboid([abu66ss_length, abu66ss_gauge, wall_h], anchor = BOTTOM);
        // South wall — inner face at -interior_w/2
        translate([0, -interior_w/2 - abu66ss_gauge/2, abu66ss_base_h])
            cuboid([abu66ss_length, abu66ss_gauge, wall_h], anchor = BOTTOM);
        // No end walls — ABU66SS is open on E and W faces (member slides in from top)
    }
}

// Post base (Simpson ABU66SS) - for positions WITH posts
// Base plate sits on pier top; post slides in from above (interior = post width)
module post_base(x, y) {
    echo(str("CUTLIST,Post base (x=", x, " y=", y, "),Simpson ABU66SS,1,post base"));
    base_z = beam_bottom_z - post_height_at(x, y) - post_base_height;
    abu66ss_channel(x, y, base_z, post_width);
}

// Beam saddle (Simpson ABU66SS) - for positions with NO post
// Base plate at beam_bottom_z; walls rise up around beam sides (interior = beam visual width)
module beam_saddle(x, y) {
    echo(str("CUTLIST,Beam saddle (x=", x, " y=", y, "),Simpson ABU66SS,1,beam saddle"));
    beam_visual_width = beam_total_thickness + 2 * board_gap;
    abu66ss_channel(x, y, beam_bottom_z, beam_visual_width);
}

// CC66 post cap - sits at top of post, cradles beam from above
// Two U-channels sharing a base plate at beam_bottom_z:
//   Lower U (open upward):  base plate at beam_bottom_z, arms drop down E-W post faces
//   Upper U (open downward): base plate at beam_bottom_z, walls rise up N/S beam faces then cap plate at top
module cc66_cap(x, y) {
    echo(str("CUTLIST,CC66 post cap (x=", x, " y=", y, "),Simpson CC66,1,post cap"));
    beam_top_z = beam_bottom_z + beam_height;
    color(color_steel) {
        translate([x, y, beam_bottom_z]) {
            // Shared base plate at beam_bottom_z
            cuboid([cc66_saddle_height, cc66_saddle_depth, cc66_gauge], anchor = BOTTOM);

            // Upper U (open upward) — base plate at beam_bottom_z, walls rise 5.5" up N/S beam faces
            // Interior = 5.5" (beam width) + 1/16" each side for visual clearance
            upper_u_inner = 5.5/2 + 1/16;  // inner face offset from center
            // South wall
            translate([0, -(upper_u_inner + cc66_gauge/2), cc66_gauge])
                cuboid([cc66_saddle_height, cc66_gauge, 5.5], anchor = BOTTOM);
            // North wall
            translate([0,  (upper_u_inner + cc66_gauge/2), cc66_gauge])
                cuboid([cc66_saddle_height, cc66_gauge, 5.5], anchor = BOTTOM);

            // Lower U (upright, open upward) — arms drop down E-W post faces
            translate([-post_width/2 - cc66_gauge/2, 0, 0])
                cuboid([cc66_gauge, cc66_saddle_depth, cc66_arm_drop], anchor = TOP);
            translate([ post_width/2 + cc66_gauge/2, 0, 0])
                cuboid([cc66_gauge, cc66_saddle_depth, cc66_arm_drop], anchor = TOP);
        }
    }
}
