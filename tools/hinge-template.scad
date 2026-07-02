// Hinge mortise router template for Diablo DR16560 pattern bit
// Bit: 1/2" cutter dia, 5/16" cut depth, 5/8" bearing dia
// Hinge: 4" tall, 1/4" radius corners, leaf width TBD
//
// Units: inches. Set $fn high enough for smooth arcs.
//
// USAGE
//   Rectangular plate with the hinge slot cut through the middle and a long
//   anchor slot at each end. The anchor slots run along y (the short side of
//   the plate) so the template can be slid forward/back over the workpiece
//   before the screws are tightened. Each anchor slot has a flat-bottomed
//   counterbore for a #10 pan-head screw plus a narrower through-slot for
//   the shank — head sits in plastic, threads pass freely.
//
//   The bearing rides the hinge-slot walls; the slot is enlarged by 1/16"
//   per side for bearing/cutter offset.
//
// PRINTING
//   Print flat, counterbore side UP. The bearing-riding face (bottom) prints
//   against the bed, and the counterbores print without supports.

// ---- Parameters ----
hinge_length    = 4.09375;  // 4" nominal + 3/32" (printed mortise ran short)
hinge_corner_r  = 0.250;

cutter_dia      = 0.500;
bearing_dia     = 0.625;
offset          = (bearing_dia - cutter_dia) / 2;   // 0.0625

slot_length     = hinge_length + 2 * offset;        // 4.125
slot_corner_r   = hinge_corner_r + offset;          // 0.3125

template_thickness = 0.625;   // 5/8": bit extends 5/8" from router base,
                              // bearing rides top, cutter tip exits bottom
                              // to set ~1/16" mortise depth

// ---- Plate ----
plate_length = 7.000;   // along x (parallel to hinge slot)
plate_depth  = 4.000;   // along y
plate_corner = 0.25;

// ---- Anchor slots ----
// #10 pan-head wood screw
screw_shank_dia  = 0.205;   // shank/thread clearance through plate
screw_head_dia   = 0.545;   // #10 pan head ~0.385", +clearance for screwdriver
counterbore_depth = 0.25;   // leaves 0.375" of plastic under the head

// Bearing sweep: hinge-slot edge is at x = ±slot_length/2 = ±2.0625.
// The bearing rides the slot wall; its outer edge reaches an additional
// bearing_dia/2 = 0.3125 outward. Keep anchor slots clear of x = ±2.375.
bearing_clear_x = slot_length/2 + bearing_dia/2 + 0.0625;  // 2.4375

// Anchor slot geometry (oriented along y, centered on plate ends in x)
anchor_slot_length = 2.75;          // travel along y (plate is 4" tall)
anchor_x = (plate_length/2 + bearing_clear_x) / 2;  // midway between
                                                    // bearing-clear and edge
                                                    // ≈ 2.969

$fn = 96;

// ---- Coordinate system ----
//   x: along hinge length (slot centered on x=0)
//   y: across plate (slot centered on y=0)
//   z: up. Bearing-riding surface is the bottom (z=0).
//      Counterbores open upward from z = template_thickness.

module rounded_rect(w, d, r) {
    hull() {
        translate([-w/2 + r, -d/2 + r]) circle(r);
        translate([ w/2 - r, -d/2 + r]) circle(r);
        translate([-w/2 + r,  d/2 - r]) circle(r);
        translate([ w/2 - r,  d/2 - r]) circle(r);
    }
}

// Slot y dimension. Oversized intentionally — the template is screwed to a
// scrap board that gets clamped to the workpiece, and that scrap acts as the
// depth fence (stops the bearing at the actual leaf-width line). The slot
// just needs to clear the bit/bearing comfortably and give chips room to
// escape; it does NOT define mortise depth.
slot_y          = 2.000;

module hinge_slot() {
    // Centered on origin, fully through the plate.
    translate([0, 0, -0.01])
        linear_extrude(height = template_thickness + 0.02)
            rounded_rect(slot_length, slot_y, slot_corner_r);
}

// One anchor slot at the given x. Through-slot for the shank, plus a wider
// counterbore opening from the top for the screw head.
module anchor_slot(x) {
    slot_r_shank = screw_shank_dia / 2;
    slot_r_head  = screw_head_dia  / 2;
    // Length between centers of the end semicircles
    span = anchor_slot_length - screw_head_dia;  // counterbore controls width

    // Through-slot (shank clearance) — full thickness
    translate([x, 0, -0.01])
        linear_extrude(height = template_thickness + 0.02)
            hull() {
                translate([0, -span/2]) circle(slot_r_shank);
                translate([0,  span/2]) circle(slot_r_shank);
            }

    // Counterbore (head recess) — flat-bottomed, opens to top
    translate([x, 0, template_thickness - counterbore_depth])
        linear_extrude(height = counterbore_depth + 0.01)
            hull() {
                translate([0, -span/2]) circle(slot_r_head);
                translate([0,  span/2]) circle(slot_r_head);
            }
}

module hinge_template() {
    difference() {
        linear_extrude(height = template_thickness)
            rounded_rect(plate_length, plate_depth, plate_corner);
        hinge_slot();
        anchor_slot( anchor_x);
        anchor_slot(-anchor_x);
    }
}

// Convert inches to mm for STL export (slicers assume mm).
scale(25.4) hinge_template();
