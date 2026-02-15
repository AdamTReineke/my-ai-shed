// Shed Model - Ground Surface
include <dimensions.scad>

// Ground surface using polyhedron (VNF approach)
module ground_surface() {
    // Create triangulated ground mesh from 4x4 grid
    top_points = [
        for (yi = [0:3])
            for (xi = [0:3])
                [ground_x[xi], ground_y[yi], ground_height(ground_x[xi], ground_y[yi])]
    ];

    // Bottom points at z=0 for solid ground
    bottom_points = [
        for (yi = [0:3])
            for (xi = [0:3])
                [ground_x[xi], ground_y[yi], 0]
    ];

    all_points = concat(top_points, bottom_points);

    // Top surface triangles (indices 0-15)
    top_faces = [
        for (yi = [0:2])
            for (xi = [0:2])
                let(
                    bl = yi * 4 + xi,
                    br = yi * 4 + xi + 1,
                    tl = (yi + 1) * 4 + xi,
                    tr = (yi + 1) * 4 + xi + 1
                )
                each [[bl, br, tr], [bl, tr, tl]]
    ];

    // Bottom surface (indices 16-31, reversed winding)
    bottom_faces = [
        for (yi = [0:2])
            for (xi = [0:2])
                let(
                    bl = 16 + yi * 4 + xi,
                    br = 16 + yi * 4 + xi + 1,
                    tl = 16 + (yi + 1) * 4 + xi,
                    tr = 16 + (yi + 1) * 4 + xi + 1
                )
                each [[bl, tr, br], [bl, tl, tr]]
    ];

    // Side faces
    south_faces = [for (i = [0:2]) each [[i, i+1, 16+i+1], [i, 16+i+1, 16+i]]];
    north_faces = [for (i = [0:2]) let(t = 12+i, b = 28+i) each [[t+1, t, b], [t+1, b, b+1]]];
    west_faces = [for (i = [0:2]) let(t = i*4, b = 16+i*4) each [[t, t+4, b+4], [t, b+4, b]]];
    east_faces = [for (i = [0:2]) let(t = 3+i*4, b = 19+i*4) each [[t+4, t, b], [t+4, b, b+4]]];

    all_faces = concat(top_faces, bottom_faces, south_faces, north_faces, west_faces, east_faces);

    color(color_ground, ground_alpha)
        polyhedron(points = all_points, faces = all_faces, convexity = 2);
}
