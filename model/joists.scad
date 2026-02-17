// Shed Model - Joists, Rim Joists, Blocking, and Hurricane Ties
include <dimensions.scad>

board_gap = 0.125;  // Visible gap between boards for clarity

// Single joist running along Y axis
module joist(x_pos) {
    echo(str("CUTLIST,Floor joist (x=", x_pos, "),PT 2x8,1,", joist_length, "\""));
    color(color_pt_wood, wood_alpha)
        translate([x_pos, shed_width / 2, joist_bottom_z])
            cuboid([joist_thickness - board_gap, joist_length - board_gap, joist_height - board_gap], anchor = BOTTOM);
}

// Rim joist running along X axis
module rim_joist(y_pos) {
    echo(str("CUTLIST,Rim joist (y=", y_pos, "),PT 2x8,1,", shed_length, "\""));
    color(color_pt_wood, wood_alpha)
        translate([shed_length / 2, y_pos, joist_bottom_z])
            cuboid([shed_length - board_gap, rim_thickness - board_gap, rim_height - board_gap], anchor = BOTTOM);
}

// ============================================
// BLOCKING AT BEAM LINES
// ============================================
// Blocking transfers diaphragm shear from the plywood floor to the beams
// Material: PT 2x8 (matches joists)
// Length: 14.5" each (16" o.c. minus 1.5" joist thickness)
// Quantity: 12 blocks per beam line x 2 beams = 24 blocks
// Location: Between each joist pair, directly over each beam

blocking_length = joist_spacing - joist_thickness;  // 14.5"
blocking_stagger = joist_thickness;  // 1.5" offset from beam center for staggered layout

// Single blocking piece between two joists
module blocking_piece(x_center, y_pos, length) {
    echo(str("CUTLIST,Blocking (x=", x_center, " y=", y_pos, "),PT 2x8,1,", length, "\""));
    color(color_pt_wood, wood_alpha)
        translate([x_center, y_pos, joist_bottom_z])
            cuboid([length - board_gap, joist_thickness - board_gap, joist_height - board_gap], anchor = BOTTOM);
}

// All blocking at both beam lines — staggered for face-nailing
module blocking() {
    for (by = beam_y) {
        for (i = [0 : num_joists - 2]) {
            x_left = joist_x(i);
            x_right = joist_x(i + 1);
            x_center = (x_left + x_right) / 2;
            blk_len = abs(x_left - x_right) - joist_thickness;
            // Alternate blocks offset north/south of beam centerline
            stagger = (i % 2 == 0 ? 1 : -1) * blocking_stagger;
            blocking_piece(x_center, by + stagger, blk_len);
        }
    }
}

// ============================================
// HURRICANE TIE MODULE (Simpson H2.5ASS)
// ============================================
// H2.5ASS: Twisted strap hurricane tie (316 stainless steel)
// Both flanges are vertical - one flat against the beam side face,
// the other flat against the joist side face. At the beam/joist corner,
// each flange has a triangular gusset: the beam flange's triangle extends
// above the beam top, and the joist flange's triangle extends below the
// joist bottom. The two triangles share an edge at the corner.
// Dimensions: 1-3/8" wide, 18 gauge (~0.048")

// Single H2.5ASS hurricane tie
// Joist runs along Y (north-south), sits on top of beam (runs along X)
// x_pos = joist center X, y_pos = beam center Y
// js (joist_side):  1 = east face, -1 = west face of joist
// bs (beam_side):   1 = south face, -1 = north face of beam
// (Note: beam_side sign is intentionally flipped so that -1 = interior
//  for the north beam and 1 = interior for the south beam)
//
// Each flange is a trapezoid defined directly as a polyhedron:
//   Beam flange:  XZ plane at beam_face_y - taller on the joist side
//   Joist flange: YZ plane at joist_face_x - taller on the beam side
// The two flanges share an edge at the corner where beam and joist meet.
//
module h25a_tie(x_pos, y_pos, js, bs) {
    echo(str("CUTLIST,Hurricane tie (x=", x_pos, " y=", y_pos, "),Simpson H2.5ASS,1,1.375\" strap"));
    bt = joist_bottom_z;  // Beam top = joist bottom
    g = h25a_gauge;
    gus = h25a_gusset_height;

    // Outer faces of lumber (+ gauge offset to sit outside, not clip)
    beam_visual_half = beam_center_ply/2 + 0.125 + beam_outer_ply;  // 2.875"
    joist_face = x_pos + js * (joist_thickness/2 + g);   // Joist outer face X
    beam_face = y_pos + bs * (beam_visual_half + g);     // Beam outer face Y

    color(color_steel) {
        // === BEAM FLANGE (XZ plane, against beam side) ===
        // Y: thin slab from beam_face outward by gauge
        // X: long edge at joist_face, short edge away from joist
        bx_long  = joist_face;                         // At joist - long edge
        bx_short = joist_face + js * h25a_width;       // Away from joist - short edge
        by0 = beam_face;
        by1 = beam_face + bs * g;

        beam_pts = [
            // Short edge: bt down to bt - beam_flange
            [bx_short, by0, bt - h25a_beam_flange],    // 0: short, bottom
            [bx_short, by0, bt],                        // 1: short, top (at beam top)
            // Long edge: bt + gusset down to bt - beam_flange
            [bx_long,  by0, bt + gus],                  // 2: long, top (gusset above bt)
            [bx_long,  by0, bt - h25a_beam_flange],     // 3: long, bottom
            // Back face (same shape offset by gauge)
            [bx_short, by1, bt - h25a_beam_flange],    // 4
            [bx_short, by1, bt],                        // 5
            [bx_long,  by1, bt + gus],                  // 6
            [bx_long,  by1, bt - h25a_beam_flange],     // 7
        ];
        beam_faces = [
            [0,1,2,3], [7,6,5,4],   // Front, back
            [0,4,5,1], [2,6,7,3],   // Short side, long side
            [0,3,7,4], [1,5,6,2],   // Bottom, top
        ];
        polyhedron(points = beam_pts, faces = beam_faces, convexity = 1);

        // === JOIST FLANGE (YZ plane, against joist side) ===
        // X: thin slab from joist_face outward by gauge
        // Y: long edge at beam_face, short edge away from beam
        jy_long  = beam_face;                          // At beam - long edge
        jy_short = beam_face + bs * h25a_width;        // Away from beam - short edge
        jx0 = joist_face;
        jx1 = joist_face + js * g;

        joist_pts = [
            // Short edge: bt up to bt + joist_flange
            [jx0, jy_short, bt],                        // 0: short, bottom (at beam top)
            [jx0, jy_short, bt + h25a_joist_flange],    // 1: short, top
            // Long edge: bt - gusset up to bt + joist_flange
            [jx0, jy_long,  bt + h25a_joist_flange],    // 2: long, top
            [jx0, jy_long,  bt - gus],                  // 3: long, bottom (gusset below bt)
            // Back face
            [jx1, jy_short, bt],                        // 4
            [jx1, jy_short, bt + h25a_joist_flange],    // 5
            [jx1, jy_long,  bt + h25a_joist_flange],    // 6
            [jx1, jy_long,  bt - gus],                  // 7
        ];
        joist_faces = [
            [0,1,2,3], [7,6,5,4],   // Front, back
            [0,4,5,1], [2,6,7,3],   // Short side, long side
            [0,3,7,4], [1,5,6,2],   // Bottom, top
        ];
        polyhedron(points = joist_pts, faces = joist_faces, convexity = 1);
    }
}
