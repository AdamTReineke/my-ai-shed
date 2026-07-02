// Shed Model - Wall Cladding Layers
// Layers (inside → outside): studs → Zip sheathing → furring → siding
// Zip sheathing is continuous wall+roof envelope.
// Wall panels: 4×8 sheets extending 1.75" below subfloor and 7" above wall top (truss end).
// Siding install details (starter strip, bug mesh, corner caps, eave closure
// blocks, gable courses) per docs/13-siding.md.
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

// ============================================
// SIDING INSTALL DETAILS (from 13-siding.md)
// ============================================
// Vertical layout: the starter strip sits at the furring bottoms (bottom edge
// of the wall Zip); course 0 hangs ~¼" below it as a drip over the Z-flashing.
// 16 courses; the top course is ripped to end at the top of the wall Zip.
starter_strip_height = 1.25;    // ripped from one HardiePlank
siding_start_z = -(wall_sheathing_below_floor + 0.25);  // course 0 bottom (rel. wall bottom)
siding_top_ns = 96 - wall_sheathing_below_floor;        // N/S rip line = top of wall Zip panel

// Bug mesh closing the bottom of the rainscreen gap
mesh_thickness = 0.05;

// Metal outside corners: one per corner per course (64 total)
corner_cap_leg = 1.25;          // leg width over each wall face
corner_cap_gauge = 0.05;        // exaggerated for visibility

// Eave-wall closure block under P4 (13-siding.md Top-of-Wall Transitions):
// 1× stock in each batten bay on ¾" spacers (mounting face flush with the
// furring plane), top edge beveled 26.6° tight under the P4 purlin; the
// ripped top siding course laps its bottom edge ~1" and face-nails into it.
closure_block_thickness = 0.75;   // 1×6 stock
closure_block_standoff = 0.75;    // rainscreen standoff off the wall Zip
closure_block_lap = 1;            // siding lap over block bottom edge

// E/W siding wraps the N/S wall buildup at each corner
siding_wrap = osb_thickness + furring_thickness + siding_thickness;  // 1.5"

// Gable siding/furring top cut: ~¾" below the rake underside (exhaust slot)
gable_slot = 0.75;
gable_eave_clip_z = wall_height + truss_end_height - gable_slot;
gable_peak_clip_z = gable_eave_clip_z + truss_half_span * truss_pitch;

// Colors
color_osb = [0.75, 0.65, 0.45];        // OSB tan
color_furring = [0.7, 0.6, 0.4];       // Furring strip wood
color_siding = [0.85, 0.85, 0.8];      // HardiePlank (primed white-ish)
color_mesh = [0.25, 0.25, 0.25];       // Bug mesh (dark screen)
color_corner_metal = [0.85, 0.87, 0.9]; // Aluminum corner caps

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
// HELPER: Gable furring strips (E/W walls)
// ============================================
// Like furring_strips but each strip extends up the gable, stopping ~¾" below
// the rake underside to leave the rainscreen exhaust slot (13-siding.md).
// gable_x_start: local X offset of the wall OSB start (typically -stud_depth)
// stud_xs: stud positions in the short-wall local frame (0-based)
// z_start: the Z offset the strips are translated to (e.g. zip_z_offset)
module gable_furring_strips(stud_xs, base_ht, gable_x_start, z_start) {
    for (x = stud_xs) {
        strip_center_x = x + stud_thickness/2;
        // Convert stud local X to world Y to find rafter height
        world_y = x - gable_x_start;
        dist_from_eave = min(world_y, shed_width - world_y);
        rafter_top = wall_height + truss_end_height + dist_from_eave * truss_pitch;
        // Strip height from z_start to ¾" below rake underside (at least base_ht)
        strip_ht = max(base_ht, rafter_top - gable_slot - z_start);
        echo(str("CUTLIST,Furring strip,1x3,1,", strip_ht, "\""));
        translate([strip_center_x, 0, strip_ht/2])
            cuboid([furring_width - cladding_gap, furring_thickness - cladding_gap, strip_ht - cladding_gap], anchor=CENTER);
    }
}

// ============================================
// HELPER: Siding planks (individual pieces from siding_data.scad)
// ============================================
// Reads per-course plank arrays generated by tools/siding-cuts.js.
// Each course entry is an array of [x_start, x_end] pairs.
include <siding_data.scad>

// Lap siding tilt: back face (Y=0) sits against furring.
// Top edge is flat (front at Y=-t, back at Y=0).
// Bottom edge kicks outward by one plank thickness
// (front at Y=-2t, back at Y=-t) because it laps over the course below.
// -Y is the outward/exterior direction in local coords.
// dir: -1 = exterior toward -Y (south/east), +1 = exterior toward +Y (north/west)
// top_push: pushes the top edge off the furring plane — used for the ripped
// top course on eave walls, whose top rests on the closure block face.
// Built as a 2D cross-section extruded along the wall so booleans work
// regardless of direction (hand-wound polyhedra broke intersection()).
module siding_plank(w, h, dir=-1, top_push=0) {
    t = siding_thickness;
    d = dir;  // multiplier for Y direction
    // rotate([90,0,90]) maps: profile X → wall Y, profile Y → Z, extrude → wall X
    rotate([90, 0, 90])
    linear_extrude(w)
        polygon([
            [d*2*t,          0],  // bottom front (exterior) — kicked out by t
            [d*t,            0],  // bottom back (wall side)
            [d*top_push,     h],  // top back — flush against furring (or block)
            [d*(top_push+t), h],  // top front (exterior)
        ]);
}

// Courses start at siding_start_z and rise at 6.25" exposure.
// top_z: rip line for the top course (N/S = top of wall Zip).
// block_top: top course leans out against the eave closure block face and
//   face-nails into it (N/S eave walls only).
module siding_planks(plank_data, dir=-1, top_z=siding_top_ns, block_top=false) {
    for (i = [0 : len(plank_data) - 1]) {
        course_bottom = siding_start_z + i * siding_exposure;
        course_top = course_bottom + siding_plank_height;
        actual_height = min(course_top, top_z) - course_bottom;
        ripped = course_top > top_z + 0.01;
        if (actual_height > 0.25) {
            course = plank_data[i];
            for (j = [0 : len(course) - 1]) {
                plank = course[j];
                px = plank[0];
                pw = plank[1] - plank[0];
                if (pw > 0) {
                    echo(str("CUTLIST,Siding plank (course ", i, ripped ? ", ripped" : "", "),HardiePlank 5/16\",1,", pw, "\" x ", actual_height, "\""));
                    translate([px, 0, course_bottom])
                        siding_plank(pw - cladding_gap, actual_height - cladding_gap, dir,
                                     top_push = (ripped && block_top) ? closure_block_thickness : 0);
                }
            }
        }
    }
}

// ============================================
// HELPER: Gable siding (E/W walls)
// ============================================
// Rectangular courses from the cut list continue up the gable triangle
// (measure-in-place per 13-siding.md), plank ends cut at the roof pitch.
// Everything is clipped ~¾" below the rake underside for the exhaust slot.

// Rake clip line (Z above wall bottom) at siding-local X.
// Siding local X=0 is siding_wrap outboard of the framing corner (world Y = px - siding_wrap).
function gable_clip_z(px) =
    let(wy = px - siding_wrap)
    gable_eave_clip_z + min(wy, shed_width - wy) * truss_pitch;

// Clip prism: everything below the rake slot line, spanning the siding thickness
module gable_clip() {
    x_lo = -2;
    x_hi = shed_width + 2 * siding_wrap + 2;
    x_peak = shed_width / 2 + siding_wrap;
    z_lo = siding_start_z - 2;
    translate([0, 3, 0])
    rotate([90, 0, 0])
    linear_extrude(6)
        polygon([
            [x_lo, z_lo],
            [x_hi, z_lo],
            [x_hi, gable_clip_z(x_hi)],
            [x_peak, gable_clip_z(x_peak)],
            [x_lo, gable_clip_z(x_lo)],
        ]);
}

module gable_siding(plank_data, dir=-1) {
    ew_clad_length = shed_width + 2 * siding_wrap;  // 147"
    // Highest course with at least 1" of plank at the peak
    max_gable_course = floor((gable_peak_clip_z - 1 - siding_start_z) / siding_exposure);
    intersection() {
        union() {
            // Rectangular courses from the cut list (tops clipped at the rake)
            siding_planks(plank_data, dir, top_z=999);
            // Gable triangle courses above the cut list — measure-in-place
            for (i = [len(plank_data) : 1 : max_gable_course]) {
                zb = siding_start_z + i * siding_exposure;
                wy_lo = max(0, (zb - gable_eave_clip_z) / truss_pitch);
                px0 = max(0.125, wy_lo + siding_wrap);
                px1 = min(ew_clad_length - 0.125, shed_width - wy_lo + siding_wrap);
                if (px1 - px0 > 1) {
                    echo(str("CUTLIST,Gable siding (course ", i, ", ends cut 26.6°),HardiePlank 5/16\",1,", px1 - px0, "\" x ", siding_plank_height, "\""));
                    translate([px0, 0, zb])
                        siding_plank(px1 - px0 - cladding_gap, siding_plank_height, dir);
                }
            }
        }
        gable_clip();
    }
}

// ============================================
// HELPER: Gable peak sheathing above rectangular wall panels
// ============================================
// Fills the triangular gable area from the top of the 4×8 Zip panels
// up to the rafter top surface.  Panels are 48" wide (same as wall sheets),
// each one a trapezoid whose top edge follows the roof slope.
//
// Placed in the same local coordinate frame as the E/W wall OSB:
//   local X = 0 at south eave (world Y=0), local X = shed_width at north eave
//   local Z = 0 at wall_bottom_z
//
// gable_x_start: local X where OSB starts (typically -stud_depth)

module gable_peak_panel(x_left, x_right, z_bottom, z_top_left, z_top_right, peak_x=-1, peak_z=0) {
    // Trapezoidal or pentagonal panel as a thin slab (osb_thickness in Y).
    // If peak_x >= 0, the panel straddles the ridge and gets a 5th vertex at the peak.
    w = x_right - x_left;
    t = osb_thickness;
    gap = cladding_gap;
    hl = max(0, z_top_left - z_bottom);
    hr = max(0, z_top_right - z_bottom);
    hp = max(0, peak_z - z_bottom);
    px = peak_x - x_left;  // peak X in local coords

    if (w > gap && (hl > gap || hr > gap || hp > gap)) {
        max_h = max(hl, max(hr, hp));
        shape = peak_x >= 0 ? "pentagon" : "trapezoid";
        echo(str("CUTLIST,Gable OSB,7/16\" OSB,1,", w, "\" x ", max_h, "\" (", shape, ")"));
        translate([x_left + gap/2, 0, z_bottom + gap/2])
        if (peak_x >= 0) {
            // Pentagon: bottom-left, bottom-right, top-right, peak, top-left
            polyhedron(
                points = [
                    // Back face (Y=0)
                    [0,      0, 0],          // 0: bottom-left
                    [w-gap,  0, 0],          // 1: bottom-right
                    [w-gap,  0, hr - gap],   // 2: top-right
                    [px,     0, hp - gap],   // 3: peak
                    [0,      0, hl - gap],   // 4: top-left
                    // Front face (Y=t)
                    [0,      t, 0],          // 5: bottom-left
                    [w-gap,  t, 0],          // 6: bottom-right
                    [w-gap,  t, hr - gap],   // 7: top-right
                    [px,     t, hp - gap],   // 8: peak
                    [0,      t, hl - gap],   // 9: top-left
                ],
                faces = [
                    [4, 3, 2, 1, 0],        // back
                    [5, 6, 7, 8, 9],        // front
                    [0, 1, 6, 5],           // bottom
                    [2, 3, 8, 7],           // top-right slope
                    [3, 4, 9, 8],           // top-left slope
                    [0, 5, 9, 4],           // left
                    [1, 2, 7, 6],           // right
                ]
            );
        } else {
            // Trapezoid: 4 corners
            polyhedron(
                points = [
                    [0,     0, 0],           // 0: bottom-left
                    [w-gap, 0, 0],           // 1: bottom-right
                    [w-gap, 0, hr - gap],    // 2: top-right
                    [0,     0, hl - gap],    // 3: top-left
                    [0,     t, 0],           // 4: bottom-left
                    [w-gap, t, 0],           // 5: bottom-right
                    [w-gap, t, hr - gap],    // 6: top-right
                    [0,     t, hl - gap],    // 7: top-left
                ],
                faces = [
                    [3, 2, 1, 0],  // back
                    [4, 5, 6, 7],  // front
                    [0, 1, 5, 4],  // bottom
                    [2, 3, 7, 6],  // top
                    [0, 4, 7, 3],  // left
                    [1, 2, 6, 5],  // right
                ]
            );
        }
    }
}

module gable_peak_sheathing(gable_x_start, total_width) {
    // Gable sheathing starts at single top plate top, covering the bottom chord
    // E/W single top plate top is at wall_height - plate_thickness
    z_bottom = wall_height - plate_thickness;  // 85.75" above wall_bottom_z

    // Rafter top Z at a given local X position (where local X = world Y)
    function rafter_top_z(local_x) =
        let(world_y = local_x - gable_x_start,
            dist_from_eave = min(world_y, shed_width - world_y))
        wall_height + truss_end_height + dist_from_eave * truss_pitch;

    // Ridge peak in local X coords
    peak_local_x = shed_width / 2 + gable_x_start;
    peak_z = rafter_top_z(peak_local_x);

    t = osb_thickness - cladding_gap;
    gap = cladding_gap;

    // Two trapezoids: one for each side of the ridge.
    // Each is cut from a single 4×8 sheet (base ~72", peak height ~36", eave height ~7").
    half_w = total_width / 2;

    // Height at ridge (peak) and at eave
    h_peak = max(0, peak_z - z_bottom);           // ~36" at ridge
    h_eave = max(0, rafter_top_z(gable_x_start) - z_bottom);  // ~7.4" at eave

    // Left trapezoid: short edge at eave (left), tall edge at ridge (right)
    xl_left = gable_x_start;

    echo(str("CUTLIST,Gable OSB,7/16\" OSB,1,", half_w, "\" x ", h_peak, "\" (trapezoid, left half)"));
    translate([xl_left + gap/2, 0, z_bottom + gap/2])
    polyhedron(
        points = [
            // Back face (Y=0)
            [0,            0, 0],              // 0: bottom-left (eave)
            [half_w - gap, 0, 0],              // 1: bottom-right (ridge base)
            [half_w - gap, 0, h_peak - gap],   // 2: top-right (peak)
            [0,            0, h_eave - gap],   // 3: top-left (eave top)
            // Front face (Y=t)
            [0,            t, 0],              // 4: bottom-left (eave)
            [half_w - gap, t, 0],              // 5: bottom-right (ridge base)
            [half_w - gap, t, h_peak - gap],   // 6: top-right (peak)
            [0,            t, h_eave - gap],   // 7: top-left (eave top)
        ],
        faces = [
            [3, 2, 1, 0],   // back
            [4, 5, 6, 7],   // front
            [0, 1, 5, 4],   // bottom
            [1, 2, 6, 5],   // right (vertical at ridge)
            [2, 3, 7, 6],   // top (roof slope)
            [0, 4, 7, 3],   // left (short vertical at eave)
        ]
    );

    // Right trapezoid: tall edge at ridge (left), short edge at eave (right)
    xl_right = gable_x_start + half_w;
    h_eave_r = max(0, rafter_top_z(gable_x_start + total_width) - z_bottom);  // eave height (right side)

    echo(str("CUTLIST,Gable OSB,7/16\" OSB,1,", half_w, "\" x ", h_peak, "\" (trapezoid, right half)"));
    translate([xl_right + gap/2, 0, z_bottom + gap/2])
    polyhedron(
        points = [
            // Back face (Y=0)
            [0,            0, 0],                // 0: bottom-left (ridge base)
            [half_w - gap, 0, 0],                // 1: bottom-right (eave)
            [half_w - gap, 0, h_eave_r - gap],   // 2: top-right (eave top)
            [0,            0, h_peak - gap],      // 3: top-left (peak)
            // Front face (Y=t)
            [0,            t, 0],                // 4: bottom-left (ridge base)
            [half_w - gap, t, 0],                // 5: bottom-right (eave)
            [half_w - gap, t, h_eave_r - gap],   // 6: top-right (eave top)
            [0,            t, h_peak - gap],      // 7: top-left (peak)
        ],
        faces = [
            [3, 2, 1, 0],   // back
            [4, 5, 6, 7],   // front
            [0, 1, 5, 4],   // bottom
            [1, 2, 6, 5],   // right (short vertical at eave)
            [2, 3, 7, 6],   // top (roof slope)
            [0, 4, 7, 3],   // left (vertical at ridge)
        ]
    );
}

// ============================================
// HELPER: Bottom-of-wall trim (bug mesh + starter strip)
// ============================================
// Placed in the same local frame as siding_planks (Y=0 at the furring plane,
// dir = exterior direction). Mesh closes the ¾" gap at the furring bottoms;
// the 1¼" ripped starter strip kicks course 0 out to the standard lap angle.
module bottom_trim(length, dir=-1) {
    z0 = -wall_sheathing_below_floor;  // furring / Zip bottom edge
    echo(str("CUTLIST,Bug mesh / vent strip,insect screen,1,", length, "\""));
    color(color_mesh)
    translate([length/2, -dir*furring_thickness/2, z0 + mesh_thickness/2])
        cuboid([length, furring_thickness, mesh_thickness], anchor=CENTER);
    echo(str("CUTLIST,Starter strip,HardiePlank rip 1-1/4\",1,", length, "\""));
    color(color_siding)
    translate([length/2, dir*siding_thickness/2, z0 + starter_strip_height/2])
        cuboid([length - cladding_gap, siding_thickness, starter_strip_height], anchor=CENTER);
}

// ============================================
// HELPER: Metal outside corners (world frame)
// ============================================
// One cap per corner per course (4 × 16 = 64), slipped over the plank ends of
// both adjoining walls. Modeled as vertical L-angles at the max siding kick.
module corner_caps() {
    kick = osb_thickness + furring_thickness + 2 * siding_thickness;  // max plank projection
    // Caps stop where the rake overhang clips the E/W wrap at the corners
    cap_top = gable_clip_z(0.125);
    leg = corner_cap_leg;
    tc = corner_cap_gauge;
    // [corner x, corner y, inward x sign, inward y sign]
    corners = [
        [0,           0,          1,  1],   // SW
        [shed_length, 0,         -1,  1],   // SE
        [shed_length, shed_width, -1, -1],  // NE
        [0,           shed_width,  1, -1],  // NW
    ];
    color(color_corner_metal)
    for (c = corners) {
        cx = c[0]; cy = c[1]; sx = c[2]; sy = c[3];
        for (i = [0 : len(south_siding) - 1]) {
            z0 = siding_start_z + i * siding_exposure;
            z1 = min(z0 + siding_exposure, cap_top);
            h = z1 - z0;
            if (h > 0.5) {
                echo(str("CUTLIST,Outside corner cap,aluminum,1,", h, "\""));
                translate([0, 0, wall_bottom_z + z0 + h/2]) {
                    // Leg over the E/W wall face (runs along Y)
                    translate([cx - sx*(kick + tc/2), cy + sy*((leg + tc)/2 - (kick + tc)), 0])
                        cuboid([tc, leg + tc, h], anchor=CENTER);
                    // Leg over the N/S wall face (runs along X)
                    translate([cx + sx*((leg + tc)/2 - (kick + tc)), cy - sy*(kick + tc/2), 0])
                        cuboid([leg + tc, tc, h], anchor=CENTER);
                }
            }
        }
    }
}

// ============================================
// HELPER: Eave-wall closure blocks under P4 (world frame)
// ============================================
// One 1×6 block per batten bay per eave wall (16 total): back face on ¾"
// spacers off the wall Zip (flush with the furring plane), top edge beveled
// 26.6° tight under the P4 purlin, bottom edge lapped ~1" by the ripped top
// siding course. Seals the rainscreen exhaust into the roof channel.
module closure_blocks() {
    z_bot = wall_bottom_z + siding_top_ns - closure_block_lap;
    // P4 underside plane at the wall face (Y=0 / Y=shed_width), sloping with the roof
    z_plane = wall_bottom_z + wall_height + truss_end_height
            + (roof_sheathing_thickness + polyiso_thickness + batten_height) / cos(truss_rafter_angle);
    y_center_off = osb_thickness + closure_block_standoff + closure_block_thickness/2;
    color(color_pt_wood)
    for (i = [0 : len(truss_xs) - 2]) {
        x0 = truss_xs[i] + batten_width/2;
        x1 = truss_xs[i+1] - batten_width/2;
        bw = x1 - x0;
        for (out = [-1, 1]) {  // -1 = south wall, +1 = north wall
            wall_y = (out < 0) ? 0 : shed_width;
            echo(str("CUTLIST,Eave closure block (", out < 0 ? "south" : "north", "),1x6 PT,1,", bw, "\" (top beveled 26.6°)"));
            difference() {
                translate([x0 + bw/2, wall_y + out * y_center_off, z_bot])
                    cuboid([bw - cladding_gap, closure_block_thickness, z_plane + 2 - z_bot], anchor=BOT);
                // Bevel: cut everything above the P4 underside plane
                translate([x0 + bw/2, wall_y, z_plane])
                    rotate([-out * truss_rafter_angle, 0, 0])
                        cuboid([bw + 2, 40, 20], anchor=BOT);
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
    // E/W wall sheets stop at single top plate top
    // E/W walls have single top plate; its top is at wall_height - plate_thickness
    ew_zip_ht = wall_height - plate_thickness + wall_sheathing_below_floor;  // ~87.1"
    ns_length = shed_length;       // 192"
    ew_length = shed_width - 2 * stud_depth;  // 133" (short walls)

    // North wall stud positions (for furring alignment)
    door_ro_width = door_width + door_rough_opening_extra;  // 33"
    door_left_n = shed_length - 13.5 - door_ro_width;       // 145.5"
    door_right_n = shed_length - 13.5;                       // 178.5"
    door_ro_height = door_height + 0.75;                      // 77.25"

    // Stud positions for each wall (matching walls.scad)
    south_studs = [0, 15.25, 31.25, 47.25, 63.25, 79.25, 95.25, 111.25, 127.25, 143.25, 159.25, 175.25, 190.5];
    north_studs = [0, 15.25, 31.25, 47.25, 63.25, 79.25, 95.25, 111.25, 127.25, 142.5, 144, 178.5, 180, 190.5];
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
            translate([0, -stud_depth/2 - furring_offset, zip_z_offset])
                furring_strips(south_studs, zip_ht);
        if (show_siding)
            color(color_siding)
            translate([0, -stud_depth/2 - siding_offset, 0])
                siding_planks(south_siding, block_top=true);
        if (show_siding_trim)
            translate([0, -stud_depth/2 - siding_offset, 0])
                bottom_trim(ns_length, -1);
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
            translate([0, stud_depth/2 + furring_offset, zip_z_offset])
                furring_strips(north_studs, zip_ht, door_left_n, door_right_n, door_ro_height - zip_z_offset);
        if (show_siding)
            color(color_siding)
            translate([0, stud_depth/2 + siding_offset, 0])
                siding_planks(north_siding, dir=1, block_top=true);
        if (show_siding_trim)
            translate([0, stud_depth/2 + siding_offset, 0])
                bottom_trim(ns_length, 1);
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
            color(color_zip) {
            translate([-stud_depth, stud_depth/2 + osb_offset, zip_z_offset])
                osb_panel(shed_width, ew_zip_ht);
            translate([0, stud_depth/2, 0])
                gable_peak_sheathing(-stud_depth, shed_width);
        }
        if (show_furring)
            color(color_furring)
            translate([0, stud_depth/2 + furring_offset, zip_z_offset])
                gable_furring_strips(ew_studs, ew_zip_ht, -stud_depth, zip_z_offset);
        if (show_siding)
            color(color_siding)
            translate([-(stud_depth + osb_thickness + furring_thickness + siding_thickness), stud_depth/2 + siding_offset, 0])
                gable_siding(west_siding, dir=1);
        if (show_siding_trim)
            translate([-(stud_depth + osb_thickness + furring_thickness + siding_thickness), stud_depth/2 + siding_offset, 0])
                bottom_trim(shed_width + 2 * siding_wrap, 1);
    }

    // --- EAST WALL (x=shed_length, exterior faces +X) ---
    // Same translate+rotate as walls(): [shed_length - stud_depth/2, stud_depth, wall_bottom_z] rotate 90
    // After rotation, local -Y → world +X (exterior direction).
    // Exterior stud face at local Y = -stud_depth/2. Cladding goes further -Y.
    // OSB and siding span full shed_width.
    translate([shed_length - stud_depth/2, stud_depth, wall_bottom_z])
    rotate([0, 0, 90]) {
        if (show_osb)
            color(color_zip) {
            translate([-stud_depth, -stud_depth/2 - osb_offset, zip_z_offset])
                osb_panel(shed_width, ew_zip_ht);
            translate([0, -stud_depth/2 - osb_thickness, 0])
                gable_peak_sheathing(-stud_depth, shed_width);
        }
        if (show_furring)
            color(color_furring)
            translate([0, -stud_depth/2 - furring_offset, zip_z_offset])
                gable_furring_strips(ew_studs, ew_zip_ht, -stud_depth, zip_z_offset);
        if (show_siding)
            color(color_siding)
            translate([-(stud_depth + osb_thickness + furring_thickness + siding_thickness), -stud_depth/2 - siding_offset, 0])
                gable_siding(east_siding);
        if (show_siding_trim)
            translate([-(stud_depth + osb_thickness + furring_thickness + siding_thickness), -stud_depth/2 - siding_offset, 0])
                bottom_trim(shed_width + 2 * siding_wrap, -1);
    }

    // --- SIDING TRIM & CLOSURES (world frame) ---
    if (show_siding_trim)
        corner_caps();
    if (show_closure_blocks)
        closure_blocks();
}
