// Shed Model - Wall Cladding Layers
// Layers (inside → outside): studs → Zip sheathing → furring → siding
// Zip sheathing is continuous wall+roof envelope.
// Wall panels: 4×8 sheets extending 1.75" below subfloor and 7" above wall top (truss end).
include <dimensions.scad>

// ============================================
// CLADDING DIMENSIONS (from 5-wall-layers.md)
// ============================================
osb_thickness = 7/16;           // 7/16" Zip System sheathing
furring_thickness = 0.75;       // 1×3 furring strip (actual ¾")
furring_width = 2.5;            // 1×3 actual width
siding_thickness = 5/16;        // HardiePlank 5/16"
siding_exposure = 6.25;         // 6.25" exposure per course
siding_plank_height = 8.25;     // Full plank height (overlap hidden)

// Colors
color_osb = [0.75, 0.65, 0.45];        // OSB tan
color_furring = [0.7, 0.6, 0.4];       // Furring strip wood
color_siding = [0.85, 0.85, 0.8];      // HardiePlank (primed white-ish)

cladding_gap = 0.125;  // Visual gap between elements

// ============================================
// HELPER: OSB sheathing — individual 4×8 sheets, installed vertically
// ============================================
// Sheets are 48" wide × 96" tall (wall_ht), placed left-to-right.
// Last sheet is cut to fit remaining width.
// door_left, door_right, door_top: rough opening to cut out (set door_left=-1 to skip)
osb_sheet_width = 48;    // 4' = 48"
osb_sheet_height = 96;   // 8' = 96"

module osb_sheet(x, width, z, height) {
    if (width > cladding_gap && height > cladding_gap) {
        echo(str("CUTLIST,OSB sheathing,7/16\" OSB,1,", width, "\" x ", height, "\""));
        translate([x + width/2, 0, z + height/2])
            cuboid([width - cladding_gap, osb_thickness - cladding_gap, height - cladding_gap], anchor=CENTER);
    }
}

module osb_panel(wall_length, wall_ht, door_left=-1, door_right=0, door_top=0) {
    sheet_ht = min(osb_sheet_height, wall_ht);
    num_full = floor(wall_length / osb_sheet_width);
    remainder = wall_length - num_full * osb_sheet_width;

    for (i = [0 : num_full - 1]) {
        sx = i * osb_sheet_width;
        sw = osb_sheet_width;
        _osb_sheet_with_cutout(sx, sw, sheet_ht, wall_ht, door_left, door_right, door_top);
    }
    // Last partial sheet
    if (remainder > cladding_gap) {
        sx = num_full * osb_sheet_width;
        _osb_sheet_with_cutout(sx, remainder, sheet_ht, wall_ht, door_left, door_right, door_top);
    }
}

// Internal: render one sheet, cutting around door opening if it overlaps
module _osb_sheet_with_cutout(sx, sw, sheet_ht, wall_ht, door_left, door_right, door_top) {
    sheet_right = sx + sw;
    if (door_left < 0 || sheet_right <= door_left || sx >= door_right) {
        // No overlap with door — full sheet
        osb_sheet(sx, sw, 0, sheet_ht);
    } else {
        // Sheet overlaps door opening — render pieces around it
        // Left of door within this sheet
        left_w = max(0, door_left - sx);
        if (left_w > cladding_gap)
            osb_sheet(sx, left_w, 0, sheet_ht);
        // Right of door within this sheet
        right_start = max(sx, door_right);
        right_w = sheet_right - right_start;
        if (right_w > cladding_gap)
            osb_sheet(right_start, right_w, 0, sheet_ht);
        // Above door within the overlap zone
        overlap_left = max(sx, door_left);
        overlap_right = min(sheet_right, door_right);
        above_w = overlap_right - overlap_left;
        above_h = sheet_ht - door_top;
        if (above_w > cladding_gap && above_h > cladding_gap)
            osb_sheet(overlap_left, above_w, door_top, above_h);
    }
}

// ============================================
// HELPER: Furring strips aligned with studs
// ============================================
// stud_xs: array of stud left-face X positions
// wall_ht: height of wall
module furring_strips(stud_xs, wall_ht, door_left=-1, door_right=0, door_top=0) {
    for (x = stud_xs) {
        strip_center_x = x + stud_thickness/2;
        if (door_left < 0) {
            // No opening
            echo(str("CUTLIST,Furring strip,1x3,1,", wall_ht, "\""));
            translate([strip_center_x, 0, wall_ht/2])
                cuboid([furring_width - cladding_gap, furring_thickness - cladding_gap, wall_ht - cladding_gap], anchor=CENTER);
        } else {
            // Check if strip is in the door opening
            strip_left = x;
            strip_right = x + stud_thickness;
            if (strip_right <= door_left || strip_left >= door_right) {
                // Fully outside opening — full height
                echo(str("CUTLIST,Furring strip,1x3,1,", wall_ht, "\""));
                translate([strip_center_x, 0, wall_ht/2])
                    cuboid([furring_width - cladding_gap, furring_thickness - cladding_gap, wall_ht - cladding_gap], anchor=CENTER);
            } else {
                // In the opening zone — only render above door
                above_height = wall_ht - door_top;
                if (above_height > 1) {
                    echo(str("CUTLIST,Furring strip (above door),1x3,1,", above_height, "\""));
                    translate([strip_center_x, 0, door_top + above_height/2])
                        cuboid([furring_width - cladding_gap, furring_thickness - cladding_gap, above_height - cladding_gap], anchor=CENTER);
                }
            }
        }
    }
}

// ============================================
// HELPER: Siding planks (individual pieces from siding_data.scad)
// ============================================
// Reads per-course plank arrays generated by tools/siding-cuts.js.
// Each course entry is an array of [x_start, x_end] pairs.
include <siding_data.scad>

num_siding_courses = ceil(wall_height / siding_exposure);

// Lap siding tilt: back face (Y=0) sits against furring.
// Top edge is flat (front at Y=-t, back at Y=0).
// Bottom edge kicks outward by one plank thickness
// (front at Y=-2t, back at Y=-t) because it laps over the course below.
// -Y is the outward/exterior direction in local coords.
// dir: -1 = exterior toward -Y (south/east), +1 = exterior toward +Y (north/west)
module siding_plank(w, h, dir=-1) {
    t = siding_thickness;
    d = dir;  // multiplier for Y direction
    polyhedron(
        points = [
            // Bottom 4 vertices (z=0) — kicked out by t
            [0, d*2*t, 0],  // 0: bottom-left front (exterior)
            [w, d*2*t, 0],  // 1: bottom-right front (exterior)
            [w, d*t,   0],  // 2: bottom-right back (wall side)
            [0, d*t,   0],  // 3: bottom-left back (wall side)
            // Top 4 vertices (z=h) — flush against furring
            [0, d*t,   h],  // 4: top-left front (exterior)
            [w, d*t,   h],  // 5: top-right front (exterior)
            [w, 0,     h],  // 6: top-right back (wall side)
            [0, 0,     h],  // 7: top-left back (wall side)
        ],
        // Face winding flips with direction to keep normals outward
        faces = dir < 0
            ? [
                [3, 2, 1, 0],  // bottom
                [4, 5, 6, 7],  // top
                [0, 1, 5, 4],  // front (exterior)
                [2, 3, 7, 6],  // back (wall side)
                [0, 4, 7, 3],  // left
                [1, 2, 6, 5],  // right
            ]
            : [
                [0, 1, 2, 3],  // bottom
                [7, 6, 5, 4],  // top
                [4, 5, 1, 0],  // front (exterior)
                [6, 7, 3, 2],  // back (wall side)
                [3, 7, 4, 0],  // left
                [5, 6, 2, 1],  // right
            ]
    );
}

module siding_planks(plank_data, dir=-1) {
    for (i = [0 : num_siding_courses - 1]) {
        course_bottom = i * siding_exposure;
        course_top = course_bottom + siding_plank_height;
        actual_height = min(course_top, wall_height) - course_bottom;
        if (actual_height > 0) {
            course = plank_data[i];
            for (j = [0 : len(course) - 1]) {
                plank = course[j];
                px = plank[0];
                pw = plank[1] - plank[0];
                if (pw > 0) {
                    echo(str("CUTLIST,Siding plank (course ", i, "),HardiePlank 5/16\",1,", pw, "\" x ", actual_height, "\""));
                    translate([px, 0, course_bottom])
                        siding_plank(pw - cladding_gap, actual_height - cladding_gap, dir);
                }
            }
        }
    }
}

// ============================================
// WALL CLADDING ASSEMBLIES
// ============================================

// Y offset from wall centerline to exterior face of each layer
// Stud exterior face is at stud_depth/2 from wall centerline
// OSB sits on exterior face of studs
// Furring sits on OSB
// Siding sits on furring

module wall_cladding() {
    // Common dimensions
    wall_ht = wall_height;
    zip_ht = 96;  // Full 4×8 panel: 1.75 below subfloor + 87.25 wall + 7 truss end
    zip_z_offset = -wall_sheathing_below_floor;  // Start below subfloor
    ns_length = shed_length;       // 192"
    ew_length = shed_width - 2 * stud_depth;  // 133" (short walls)

    // North wall stud positions (for furring alignment)
    door_ro_width = door_width + door_rough_opening_extra;  // 33"
    door_left_n = shed_length - 13.5 - door_ro_width;       // 145.5"
    door_right_n = shed_length - 13.5;                       // 178.5"
    door_ro_height = door_height + 0.75;                      // 77.25"

    // Stud positions for each wall (matching walls.scad)
    south_studs = [0, 14.5, 30.5, 46.5, 62.5, 78.5, 94.5, 110.5, 126.5, 142.5, 158.5, 174.5, 190.5];
    north_studs = [0, 14.5, 30.5, 46.5, 62.5, 78.5, 94.5, 110.5, 126.5, 142.5, 144, 178.5, 180, 190.5];
    ew_studs = [0, 16, 32, 48, 64, 80, 96, 112, 128, ew_length - stud_thickness];

    // All cladding is placed in the same coordinate frame as walls() in walls.scad.
    // Each wall module centers studs at local Y=0 (cuboid anchor=BOTTOM).
    // Exterior stud face is at local Y = -stud_depth/2 or +stud_depth/2.
    // rotate([0,0,90]) maps local +Y → world -X, local -Y → world +X.

    // Outward offset from stud exterior face for each layer center
    osb_offset = osb_thickness/2;
    furring_offset = osb_thickness + furring_thickness/2;
    // Siding back face is at local Y=0, so offset to furring outer face
    siding_offset = osb_thickness + furring_thickness;

    // --- SOUTH WALL (y=0, exterior = local -Y) ---
    // Same translate as walls(): [0, stud_depth/2, wall_bottom_z]
    // Exterior stud face at local Y = -stud_depth/2. Cladding goes further -Y.
    translate([0, stud_depth/2, wall_bottom_z]) {
        if (show_osb)
            color(color_zip)
            translate([0, -stud_depth/2 - osb_offset, zip_z_offset])
                osb_panel(ns_length, zip_ht);
        if (show_furring)
            color(color_furring)
            translate([0, -stud_depth/2 - furring_offset, 0])
                furring_strips(south_studs, wall_ht);
        if (show_siding)
            color(color_siding)
            translate([0, -stud_depth/2 - siding_offset, 0])
                siding_planks(south_siding);
    }

    // --- NORTH WALL (y=shed_width, exterior = local +Y) ---
    // Same translate as walls(): [0, shed_width - stud_depth/2, wall_bottom_z]
    // Exterior stud face at local Y = +stud_depth/2. Cladding goes further +Y.
    translate([0, shed_width - stud_depth/2, wall_bottom_z]) {
        if (show_osb)
            color(color_zip)
            translate([0, stud_depth/2 + osb_offset, zip_z_offset])
                osb_panel(ns_length, zip_ht, door_left_n, door_right_n, door_ro_height - zip_z_offset);
        if (show_furring)
            color(color_furring)
            translate([0, stud_depth/2 + furring_offset, 0])
                furring_strips(north_studs, wall_ht, door_left_n, door_right_n, door_ro_height);
        if (show_siding)
            color(color_siding)
            translate([0, stud_depth/2 + siding_offset, 0])
                siding_planks(north_siding, dir=1);
    }

    // --- WEST WALL (x=0, exterior faces -X) ---
    // Same translate+rotate as walls(): [stud_depth/2, stud_depth, wall_bottom_z] rotate 90
    // After rotation, local +Y → world -X (exterior direction).
    // Exterior stud face at local Y = +stud_depth/2. Cladding goes further +Y.
    // OSB and siding span full shed_width (wrapping over N/S wall ends).
    // In local coords, short wall runs 0..ew_length; full width is -stud_depth..ew_length+stud_depth.
    translate([stud_depth/2, stud_depth, wall_bottom_z])
    rotate([0, 0, 90]) {
        if (show_osb)
            color(color_zip)
            translate([-stud_depth, stud_depth/2 + osb_offset, zip_z_offset])
                osb_panel(shed_width, zip_ht);
        if (show_furring)
            color(color_furring)
            translate([0, stud_depth/2 + furring_offset, 0])
                furring_strips(ew_studs, wall_ht);
        if (show_siding)
            color(color_siding)
            translate([-(stud_depth + osb_thickness + furring_thickness + siding_thickness), stud_depth/2 + siding_offset, 0])
                siding_planks(west_siding, dir=1);
    }

    // --- EAST WALL (x=shed_length, exterior faces +X) ---
    // Same translate+rotate as walls(): [shed_length - stud_depth/2, stud_depth, wall_bottom_z] rotate 90
    // After rotation, local -Y → world +X (exterior direction).
    // Exterior stud face at local Y = -stud_depth/2. Cladding goes further -Y.
    // OSB and siding span full shed_width.
    translate([shed_length - stud_depth/2, stud_depth, wall_bottom_z])
    rotate([0, 0, 90]) {
        if (show_osb)
            color(color_zip)
            translate([-stud_depth, -stud_depth/2 - osb_offset, zip_z_offset])
                osb_panel(shed_width, zip_ht);
        if (show_furring)
            color(color_furring)
            translate([0, -stud_depth/2 - furring_offset, 0])
                furring_strips(ew_studs, wall_ht);
        if (show_siding)
            color(color_siding)
            translate([-(stud_depth + osb_thickness + furring_thickness + siding_thickness), -stud_depth/2 - siding_offset, 0])
                siding_planks(east_siding);
    }
}
