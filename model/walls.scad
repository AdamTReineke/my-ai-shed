// Shed Model - Wall Framing
include <dimensions.scad>

// ============================================
// WALL FRAMING - EXPLICIT STUD PLACEMENT
// ============================================
// Studs are placed explicitly with:
// - End studs at both ends of each wall
// - Interior studs at 16" o.c.
// - Door framing integrated into layout

board_gap = 0.125;  // Visible gap between boards for clarity

// Single stud (color applied at wall level)
// x_pos is the position of the stud's LEFT face
module stud_at(x_pos, height, label="Stud") {
    if (height > board_gap) {
    echo(str("CUTLIST,", label, " (x=", x_pos, "),2x6,1,", height, "\""));
    translate([x_pos + stud_thickness/2, 0, 0])
        cuboid([stud_thickness - board_gap, stud_depth - board_gap, height - board_gap], anchor = BOTTOM);
    }
}

// Bottom plate segment
module plate_segment(start_x, end_x) {
    length = end_x - start_x;
    if (length > 0) {
        echo(str("CUTLIST,Bottom plate,2x6,1,", length, "\""));
        translate([start_x + length/2, 0, 0])
            cuboid([length - board_gap, plate_depth - board_gap, plate_thickness - board_gap], anchor = BOTTOM);
    }
}

// Top plate (double) segment
module top_plate_segment(start_x, end_x, z_pos) {
    length = end_x - start_x;
    if (length > 0) {
        echo(str("CUTLIST,Top plate (double),2x6,2,", length, "\""));
        translate([start_x + length/2, 0, z_pos]) {
            cuboid([length - board_gap, plate_depth - board_gap, plate_thickness - board_gap], anchor = BOTTOM);
            translate([0, 0, plate_thickness])
                cuboid([length - board_gap, plate_depth - board_gap, plate_thickness - board_gap], anchor = BOTTOM);
        }
    }
}

// Header
module header_at(start_x, end_x, z_pos, height) {
    length = end_x - start_x;
    echo(str("CUTLIST,Door header,2x6 + 1/2\" ply spacer,1,", length, "\""));
    translate([start_x + length/2, 0, z_pos])
        cuboid([length - board_gap, stud_depth - board_gap, height - board_gap], anchor = BOTTOM);
}

// Door frame (white U-shape: two side jambs + head jamb)
// Positioned centered in the rough opening
module door_frame(ro_left_x, ro_width) {
    frame_left = ro_left_x + (ro_width - door_width) / 2;  // Center frame in R.O.
    frame_right = frame_left + door_width;

    color("white")
    translate([0, 0, 0]) {
        // Left jamb
        translate([frame_left + door_frame_side/2, 0, door_height/2])
            cuboid([door_frame_side - board_gap, door_frame_thickness - board_gap, door_height - board_gap], anchor = CENTER);

        // Right jamb
        translate([frame_right - door_frame_side/2, 0, door_height/2])
            cuboid([door_frame_side - board_gap, door_frame_thickness - board_gap, door_height - board_gap], anchor = CENTER);

        // Head jamb
        translate([frame_left + door_width/2, 0, door_height - door_frame_side/2])
            cuboid([door_interior_width - board_gap, door_frame_thickness - board_gap, door_frame_side - board_gap], anchor = CENTER);
    }
}

// South wall (no door) - EXPLICIT STUD LAYOUT
// Wall length: 192" (16')
// Studs at 16" o.c. from east end, aligned with joist centers
// Joist centers: 191.25, 175.25, ... so stud left faces: 190.5, 174.5, ...
module south_wall() {
    length = shed_length;  // 192"
    stud_height = wall_height - 3 * plate_thickness;
    top_plate_z = plate_thickness + stud_height;

    // Explicit stud positions (left face of each stud)
    // 16" o.c. from west end to align with joists
    stud_x = [
        0,                                              // West end stud
        15.25, 31.25, 47.25, 63.25, 79.25, 95.25,     // 16" o.c. from west
        111.25, 127.25, 143.25, 159.25, 175.25,        // continue
        length - stud_thickness                         // East end stud (190.5")
    ];

    // Bottom plate - full length
    plate_segment(0, length);

    // Top plate - full length
    top_plate_segment(0, length, top_plate_z);

    // All studs
    for (x = stud_x) {
        translate([0, 0, plate_thickness])
            stud_at(x, stud_height);
    }
}

// North wall (with door) - EXPLICIT STUD LAYOUT
// Wall length: 192" (16')
// Door: 33" rough opening (31.5" + 1.5") at east end
// Door R.O. from x=145.5" to x=178.5"
// Layout: king(142.5") | jack(144") | R.O.(145.5"-178.5") | jack(178.5") | king(180")
// Note: West king stud at 142.5" does NOT land on a 16" o.c. mark (west-aligned)
module north_wall() {
    length = shed_length;  // 192"
    stud_height = wall_height - 3 * plate_thickness;
    top_plate_z = plate_thickness + stud_height;

    // Door dimensions
    door_ro_width = door_width + door_rough_opening_extra;  // 33"
    door_ro_height = door_height + 0.75;  // 77.25" (¾" shimming above frame)

    // Door position: 13.5" from east end to R.O. right edge
    // R.O. clear opening: 145.5" to 178.5"
    door_left = length - 13.5 - door_ro_width;           // 145.5" (R.O. left edge)
    door_right = length - 13.5;                           // 178.5" (R.O. right edge)

    // Jack studs sit against R.O. edges (outside the opening)
    jack_left_x = door_left - stud_thickness;            // 144"
    jack_right_x = door_right;                           // 178.5"

    // King studs sit outside jack studs
    king_left_x = jack_left_x - stud_thickness;          // 142.5" (lands on 16" o.c. stud!)
    king_right_x = jack_right_x + stud_thickness;        // 180"

    // Header: (2) 2×6 with ½" plywood spacer = 3.5" thick × 5.5" tall
    // Bears on jack studs, bottom at top of R.O.
    header_z = plate_thickness + door_ro_height;
    header_height = stud_depth;  // 5.5" (actual depth of 2×6)

    // Regular studs - 16" o.c. from west end, aligned with joists
    // West section: 0 to king_left (142.5")
    // King stud at 142.5" is NOT on a 16" o.c. mark — extra stud
    west_studs = [
        0,                          // West end stud
        15.25, 31.25, 47.25, 63.25, 79.25, 95.25,  // 16" o.c. from west
        111.25, 127.25,            // last regular stud before king
        king_left_x                 // King stud (142.5") — extra, not on layout
    ];

    // East section: king_right to end
    east_studs = [
        king_right_x,               // King stud (180")
        length - stud_thickness     // End stud (190.5")
    ];

    // Bottom plate - with gap for door R.O.
    plate_segment(0, door_left);                    // West of door: 0 to 147"
    plate_segment(door_right, length);              // East of door: 180" to 192"

    // Top plate - full length (continuous over door)
    top_plate_segment(0, length, top_plate_z);

    // West section studs (full height)
    for (x = west_studs) {
        translate([0, 0, plate_thickness])
            stud_at(x, stud_height);
    }

    // East section studs (full height)
    for (x = east_studs) {
        translate([0, 0, plate_thickness])
            stud_at(x, stud_height);
    }

    // Jack studs (door height only)
    translate([0, 0, plate_thickness]) {
        stud_at(jack_left_x, door_ro_height, "Jack stud");
        stud_at(jack_right_x, door_ro_height, "Jack stud");
    }

    // Header (bears on jack studs, spans from left jack left face to right jack right face)
    header_at(jack_left_x, jack_right_x + stud_thickness, header_z, header_height);

    // Cripple studs above header (fill gap between header top and top plate bottom)
    cripple_z = header_z + header_height;
    cripple_height = stud_height - door_ro_height - header_height;
    if (cripple_height > 1) {
        cripple_positions = [
            jack_left_x,                                        // Above left jack
            door_left + (door_ro_width - stud_thickness) / 2,   // Center of opening
            jack_right_x,                                        // Above right jack
        ];
        for (cx = cripple_positions)
            translate([0, 0, cripple_z])
                stud_at(cx, cripple_height, "Cripple stud");
    }
}

// East/West walls (shortened to fit between N/S walls)
// Wall length: 133" (144" - 2 * 5.5")
module ew_short_wall() {
    length = shed_width - 2 * stud_depth;  // 133"
    stud_height = wall_height - 3 * plate_thickness;
    top_plate_z = plate_thickness + stud_height;

    // Explicit stud positions
    // Start at 0, end at 131.5", regular 16" spacing between
    stud_y = [
        0,                          // Start stud
        16, 32, 48, 64, 80, 96,     // Regular spacing
        112, 128,                   // Regular spacing
        length - stud_thickness     // End stud at 131.5"
    ];

    // Bottom plate - full length
    plate_segment(0, length);

    // Top plate - full length
    top_plate_segment(0, length, top_plate_z);

    // All studs
    for (y = stud_y) {
        translate([0, 0, plate_thickness])
            stud_at(y, stud_height);
    }
}

// Complete wall assembly
// Long walls (North/South, blue) run full 16' length along X axis
// Short walls (East/West, yellow) fit between them along Y axis
module walls() {
    // South wall (y = 0, facing north) - BLUE - 16' long, no door
    echo("CUTLIST,--- South Wall (192\" no door) ---,,,");
    color(color_stud, wall_alpha)
    translate([0, stud_depth / 2, wall_bottom_z])
        south_wall();

    // North wall (y = 144", facing south) - BLUE - 16' long, with door
    echo("CUTLIST,--- North Wall (192\" with door) ---,,,");
    color(color_stud, wall_alpha)
    translate([0, shed_width - stud_depth / 2, wall_bottom_z])
        north_wall();

    // Door frame and slab (rendered outside wall color for independent colors)
    translate([0, shed_width - stud_depth / 2, wall_bottom_z]) {
        door_ro_width = door_width + door_rough_opening_extra;
        door_left = shed_length - 13.5 - door_ro_width;
        door_frame(door_left, door_ro_width);

        // Door slab (closed position, inside the frame)
        frame_left = door_left + (door_ro_width - door_width) / 2;
        color("white")
        translate([frame_left + door_frame_side + door_interior_width/2,
                   -door_frame_thickness/2 + door_slab_thickness/2,
                   door_height/2])
            cuboid([door_interior_width - board_gap,
                    door_slab_thickness - board_gap,
                    door_height - board_gap], anchor = CENTER);
    }

    // West wall (x = 0, facing east) - YELLOW - shortened, fits between N/S walls
    echo("CUTLIST,--- West Wall (133\") ---,,,");
    color(color_stud, wall_alpha)
    translate([stud_depth / 2, stud_depth, wall_bottom_z])
        rotate([0, 0, 90])
            ew_short_wall();

    // East wall (x = 192", facing west) - YELLOW - shortened, fits between N/S walls
    echo("CUTLIST,--- East Wall (133\") ---,,,");
    color(color_stud, wall_alpha)
    translate([shed_length - stud_depth / 2, stud_depth, wall_bottom_z])
        rotate([0, 0, 90])
            ew_short_wall();
}
