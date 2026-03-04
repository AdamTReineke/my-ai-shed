// Shed Model - Roof Sheathing (Zip System)
// 7/16" Zip sheathing on top of rafters, continuous with wall Zip envelope.
// Future layers (rigid foam, furring, metal roof) are TBD.
include <dimensions.scad>

// ============================================
// ROOF SHEATHING MODULE
// ============================================
// Sheathing sits on top of rafter upper surface.
// Covers from eave (wall face, y=0/y=144) to ridge (y=72) on each side.
// Extends to gable overhang edges in X direction.

module roof_sheathing() {
    // Slope length per side (eave to ridge along the slope)
    slope_length = truss_half_span / cos(truss_rafter_angle);

    // Total width including gable overhangs (X direction)
    total_width = shed_length + 2 * gable_overhang;

    // Rafter top Z at the eave, relative to truss base (wall_top_z):
    // Bottom chord top = truss_member_depth
    // At eave (y=0), rafter bottom sits on chord top.
    // Rafter vertical thickness at plumb cut = truss_member_depth / cos(angle)
    rafter_top_z_eave = truss_member_depth + truss_member_depth / cos(truss_rafter_angle);

    // South roof plane: slopes from eave at y=0 up to ridge at y=half_span
    // Positive X-rotation tilts +Y edge upward (toward ridge)
    color(color_zip)
    translate([-gable_overhang, 0, wall_top_z + rafter_top_z_eave])
    rotate([truss_rafter_angle, 0, 0])
        cube([total_width, slope_length, roof_sheathing_thickness]);

    // North roof plane: slopes from eave at y=shed_width down to ridge at y=half_span
    // Negative X-rotation tilts -Y edge upward (toward ridge)
    color(color_zip)
    translate([-gable_overhang, shed_width, wall_top_z + rafter_top_z_eave])
    rotate([-truss_rafter_angle, 0, 0])
    translate([0, -slope_length, 0])
        cube([total_width, slope_length, roof_sheathing_thickness]);
}
