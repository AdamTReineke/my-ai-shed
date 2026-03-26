// Shed Model - Roof Polyiso Insulation
// 2" rigid foam on top of Zip sheathing, one slab per slope.
include <dimensions.scad>

module roof_polyiso() {
    slope_length = truss_half_span / cos(truss_rafter_angle);
    total_width = shed_length;

    rafter_top_z_eave = truss_member_depth + truss_member_depth / cos(truss_rafter_angle);

    // South slope
    color(color_polyiso)
    translate([0, 0, wall_top_z + rafter_top_z_eave + roof_sheathing_thickness])
    rotate([truss_rafter_angle, 0, 0])
        cube([total_width, slope_length, polyiso_thickness]);

    // North slope
    color(color_polyiso)
    translate([0, shed_width, wall_top_z + rafter_top_z_eave + roof_sheathing_thickness])
    rotate([-truss_rafter_angle, 0, 0])
    translate([0, -slope_length, 0])
        cube([total_width, slope_length, polyiso_thickness]);

    echo("CUTLIST,Polyiso 2\" rigid foam (south slope),2\" polyiso,1,192\" x 80.5\"");
    echo("CUTLIST,Polyiso 2\" rigid foam (north slope),2\" polyiso,1,192\" x 80.5\"");
}
