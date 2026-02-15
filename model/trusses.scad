// Shed Model - Trusses and Ladder Framing
include <dimensions.scad>

// ============================================
// TRUSS MODULES (Queen-Post Design)
// ============================================
// Queen-post truss with 6/12 pitch, 1' overhang
// Spans N-S (Y direction), positioned along X to align with south wall studs
//
// Truss anatomy:
//   - Bottom chord: horizontal, full length including overhangs
//   - Top chords (rafters): angled from eaves to peak
//   - Queen posts: vertical at 1/3 and 2/3 span points
//   - Straining beam: horizontal between queen post tops
//   - Web members: diagonal bracing

// Single truss member (2x4)
module truss_member(length) {
    cuboid([truss_member_width, length, truss_member_depth], anchor = CENTER);
}

// Angled truss member for rafters
// start_y, start_z and end_y, end_z define the member endpoints
module angled_member(start_y, start_z, end_y, end_z) {
    dy = end_y - start_y;
    dz = end_z - start_z;
    length = sqrt(dy*dy + dz*dz);
    angle = atan2(dz, dy);

    translate([0, (start_y + end_y)/2, (start_z + end_z)/2])
        rotate([angle, 0, 0])
            truss_member(length);
}

// Single queen-post truss at X position
// Truss sits on top of double top plate of walls
// alpha parameter controls transparency (1.0 = opaque, 0.25 = mostly transparent)
module queen_post_truss(x_pos, alpha = 1.0) {
    // === VERTICAL REFERENCE HEIGHTS (all measured to BOTTOM faces) ===
    // Bottom chord sits on top of wall plate
    bottom_chord_bottom = wall_top_z;
    bottom_chord_top = bottom_chord_bottom + truss_member_depth;

    // Queen posts sit ON TOP of bottom chord
    qp_bottom = bottom_chord_top;
    qp_top = qp_bottom + queen_post_height;

    // Straining beam: top edge flush with rafter bottom at SB inset
    sb_top_z = bottom_chord_top + straining_beam_z_above_chord;

    // Rafters: bottom edge follows roof slope from wall line
    // At walls (y=0, y=144): rafter bottom at bottom_chord_top
    // At center (y=72): rafter bottom at bottom_chord_top + truss_rise
    rafter_bottom_at_wall = bottom_chord_top;
    rafter_bottom_at_peak = bottom_chord_top + truss_rise;

    // === Y COORDINATES ===
    south_end = -truss_overhang;             // -12" (overhang tip)
    north_end = shed_width + truss_overhang; // 156" (overhang tip)
    south_wall = 0;                          // Wall line
    north_wall = shed_width;                 // 144" wall line
    center_y = shed_width / 2;               // 72" (peak)

    // Queen post Y positions (positioned so SB butts against inside faces)
    qp_south = queen_post_inset;             // 46.25"
    qp_north = shed_width - queen_post_inset; // 97.75"

    // Rafter bottom height at overhang tips (extends slope past wall)
    // Slope continues: drop 6" per 12" of overhang
    rafter_bottom_at_overhang = rafter_bottom_at_wall - truss_overhang * truss_pitch;

    color(color_truss, alpha)
    translate([x_pos, 0, 0]) {

        // === BOTTOM CHORD (horizontal, spans between walls only) ===
        // In a real truss, bottom chord doesn't extend to overhangs
        translate([0, center_y, bottom_chord_bottom + truss_member_depth/2])
            truss_member(truss_span - 2 * board_gap);  // 144" between walls, with gaps at ends

        // === TOP CHORDS (rafters) - from overhang to peak ===
        // Rafter centerline is truss_member_depth/2 above the bottom edge
        // Gap at peak where two rafters meet
        peak_gap_y = board_gap / 2 / cos(truss_rafter_angle);  // gap along rafter direction
        peak_gap_z = board_gap / 2 * truss_pitch / cos(truss_rafter_angle);

        // South rafter: from south overhang tip to just before peak
        angled_member(
            south_end, rafter_bottom_at_overhang + truss_member_depth/2,
            center_y - peak_gap_y, rafter_bottom_at_peak + truss_member_depth/2 - peak_gap_z
        );

        // North rafter: from just past peak to north overhang tip
        angled_member(
            center_y + peak_gap_y, rafter_bottom_at_peak + truss_member_depth/2 - peak_gap_z,
            north_end, rafter_bottom_at_overhang + truss_member_depth/2
        );

        // === QUEEN POSTS (vertical, sitting on bottom chord) ===
        // Gap at top and bottom where they meet chord and rafter
        qp_gap_height = queen_post_height - 2 * board_gap;

        // South queen post
        translate([0, qp_south, qp_bottom + board_gap + qp_gap_height/2])
            cuboid([truss_member_width, truss_member_depth, qp_gap_height], anchor = CENTER);

        // North queen post
        translate([0, qp_north, qp_bottom + board_gap + qp_gap_height/2])
            cuboid([truss_member_width, truss_member_depth, qp_gap_height], anchor = CENTER);

        // === STRAINING BEAM (horizontal, butts against QP inside faces) ===
        // Top edge flush with rafter bottom at SB endpoints
        // Gap at each end where it meets queen posts
        translate([0, center_y, sb_top_z - truss_member_depth/2])
            truss_member(straining_beam_width - 2 * board_gap);


    }
}

// All trusses at 24" o.c.
// End trusses (first and last) at full opacity, middle trusses transparent
module trusses() {
    truss_spacing = 24;  // 24" on center
    num_trusses = floor(shed_length / truss_spacing) + 1;  // 9 trusses

    for (i = [0 : num_trusses - 1]) {
        x_pos = i * truss_spacing;
        is_end_truss = (i == 0) || (i == num_trusses - 1);
        alpha = is_end_truss ? 1.0 : 0.25;
        queen_post_truss(x_pos, alpha);
    }
}

// ============================================
// LADDER FRAMING (Gable End Overhangs)
// ============================================
// Lookouts extend from second truss past end truss to fly rafter
// Creates the gable overhang on east and west ends

// Single lookout at a given Y position
// Extends from interior_truss_x past end_truss_x to fly_rafter_x
// Lookouts lie in the roof plane (rotated to match roof slope)
module lookout(y_pos, interior_x, fly_rafter_x) {
    lookout_length = abs(fly_rafter_x - interior_x);
    center_x = (interior_x + fly_rafter_x) / 2;

    // Rafter top at this Y position
    rafter_top_z = rafter_bottom_z_at_y(y_pos) + truss_member_depth;

    // Roof angle (positive value)
    roof_angle = atan(truss_pitch);  // ~26.57 degrees for 6/12

    // Determine which side of peak we're on
    center_y = shed_width / 2;
    is_south_side = (y_pos < center_y);

    // Rotation direction: south side tilts up toward center, north side tilts up toward center
    rot_angle = is_south_side ? roof_angle : -roof_angle;

    // Position lookout so its top surface is in the roof plane
    // After rotation, offset down by half the thickness (perpendicular to roof surface)
    z_offset = lookout_width / 2 * cos(roof_angle);
    y_offset = lookout_width / 2 * sin(roof_angle) * (is_south_side ? -1 : 1);

    color(color_truss, 0.25)
        translate([center_x, y_pos + y_offset, rafter_top_z - z_offset])
            rotate([rot_angle, 0, 0])
                cuboid([lookout_length, lookout_depth, lookout_width], anchor = CENTER);
}

// Fly rafter (runs parallel to main rafters at outer edge of lookouts)
// Top surface is coplanar with main rafters for flat roof sheathing
module fly_rafter(x_pos) {
    bottom_chord_top = wall_top_z + truss_member_depth;
    rafter_bottom_at_wall = bottom_chord_top;
    rafter_bottom_at_peak = bottom_chord_top + truss_rise;
    rafter_bottom_at_overhang = rafter_bottom_at_wall - truss_overhang * truss_pitch;

    south_end = -truss_overhang;
    north_end = shed_width + truss_overhang;
    center_y = shed_width / 2;

    // Fly rafter is coplanar with main rafters (no z_offset)
    color(color_truss, 0.25)
    translate([x_pos, 0, 0]) {
        // South side: overhang to peak
        angled_member(
            south_end, rafter_bottom_at_overhang + truss_member_depth/2,
            center_y, rafter_bottom_at_peak + truss_member_depth/2
        );

        // North side: peak to overhang
        angled_member(
            center_y, rafter_bottom_at_peak + truss_member_depth/2,
            north_end, rafter_bottom_at_overhang + truss_member_depth/2
        );
    }
}

// Complete ladder framing for both gable ends
module ladder_framing() {
    // Truss positions (from trusses module)
    truss_spacing = 24;
    west_end_truss = 0;
    west_interior_truss = 24;
    east_interior_truss = 168;
    east_end_truss = 192;

    // Fly rafter positions (overhang past walls)
    west_fly_rafter = -gable_overhang;    // -12"
    east_fly_rafter = shed_length + gable_overhang;  // 204"

    // Lookout Y positions along the rafter (from south overhang to north overhang)
    // Space them at lookout_spacing intervals
    lookout_y_positions = [
        for (y = [-truss_overhang : lookout_spacing : shed_width + truss_overhang])
            y
    ];

    // West gable ladder framing
    for (y = lookout_y_positions) {
        lookout(y, west_interior_truss, west_fly_rafter);
    }
    fly_rafter(west_fly_rafter);

    // East gable ladder framing
    for (y = lookout_y_positions) {
        lookout(y, east_interior_truss, east_fly_rafter);
    }
    fly_rafter(east_fly_rafter);
}
