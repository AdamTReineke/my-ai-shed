// Shed Model - Floor Decking
include <dimensions.scad>

module plywood_sheet(width, depth) {
    color(color_plywood, floor_alpha)
        cuboid([width - sheet_gap, depth - sheet_gap, floor_thickness], anchor = BOTTOM);
}

module floor_decking() {
    floor_z = joist_bottom_z + joist_height;

    // Row 1 (South, y = 0-48") - above south beam - two full sheets
    translate([sheet_8ft / 2, sheet_4ft / 2, floor_z])
        plywood_sheet(sheet_8ft, sheet_4ft);
    translate([sheet_8ft + sheet_8ft / 2, sheet_4ft / 2, floor_z])
        plywood_sheet(sheet_8ft, sheet_4ft);

    // Row 2 (Center, y = 48-96") - half + full + half (staggered joints)
    translate([sheet_4ft / 2, sheet_4ft + sheet_4ft / 2, floor_z])
        plywood_sheet(sheet_4ft, sheet_4ft);  // West half sheet
    translate([sheet_4ft + sheet_8ft / 2, sheet_4ft + sheet_4ft / 2, floor_z])
        plywood_sheet(sheet_8ft, sheet_4ft);  // Center full sheet
    translate([sheet_4ft + sheet_8ft + sheet_4ft / 2, sheet_4ft + sheet_4ft / 2, floor_z])
        plywood_sheet(sheet_4ft, sheet_4ft);  // East half sheet

    // Row 3 (North, y = 96-144") - above north beam - two full sheets
    translate([sheet_8ft / 2, 2 * sheet_4ft + sheet_4ft / 2, floor_z])
        plywood_sheet(sheet_8ft, sheet_4ft);
    translate([sheet_8ft + sheet_8ft / 2, 2 * sheet_4ft + sheet_4ft / 2, floor_z])
        plywood_sheet(sheet_8ft, sheet_4ft);
}
