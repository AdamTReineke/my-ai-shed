// Simple block with a counterbored through-hole for a #8 screw.
// Units: mm.
//
// Hole is centered on the yz face (x = 0 / x = depth) and runs through
// along x. Counterbore opens from the +x face so the screw head seats
// flush; shank clearance continues through to the -x face.

// ---- Block ----
depth  = 22;   // x
width  = 30;   // y
height = 14;   // z

// ---- #8 screw (flat/bugle head, like a drywall screw) ----
shank_dia       = 4.5;   // #8 shank ~4.2 mm + clearance
head_dia        = 8.5;   // #8 flat head ~8.2 mm + clearance
// 82° included angle is the US standard for flathead wood screws.
// Countersink depth = (head_dia - shank_dia) / 2 / tan(41°) ≈ 2.30 mm.
countersink_angle = 82;
countersink_depth = (head_dia - shank_dia) / 2 / tan(countersink_angle / 2);

// Straight cylindrical recess above the countersink, sized to accept a
// plug that hides the screw head.
plug_recess_depth = 3;

// ---- Slot on top (xy plane) ----
// Protrudes upward from the top face. Spans the full width (y).
slot_from_back  = 9;   // gap from -x face (back) to slot
slot_thickness  = 6;   // along x — derived: 22 - 9 - 7
slot_from_front = 7;   // gap from slot to +x face (front)
slot_height     = 3;   // along z

$fn = 96;

module screw_block() {
    difference() {
        translate([0, -width/2, 0])
            cube([depth, width, height]);

        // Through-hole for shank, along x
        translate([-0.01, 0, height/2])
            rotate([0, 90, 0])
                cylinder(h = depth + 0.02, d = shank_dia);

        // Countersink cone, sunk plug_recess_depth below the +x face so
        // a flat plug at head_dia can sit above it.
        translate([depth - plug_recess_depth - countersink_depth, 0, height/2])
            rotate([0, 90, 0])
                cylinder(h = countersink_depth + 0.01,
                         d1 = shank_dia, d2 = head_dia);

        // Plug recess: straight cylinder at head_dia from +x face inward.
        translate([depth - plug_recess_depth, 0, height/2])
            rotate([0, 90, 0])
                cylinder(h = plug_recess_depth + 0.01, d = head_dia);
    }

    // Slot protruding above the top face
    translate([slot_from_back, -width/2, height])
        cube([slot_thickness, width, slot_height]);
}

screw_block();
