// Shed Design Model - 16' x 12' with Joist-over-Beam Floor
// Based on structural design from shed/README.md
// All dimensions in inches unless noted
//
// Refactored into separate files:
//   dimensions.scad     - All shared constants, colors, derived values
//   ground.scad         - Ground surface mesh
//   foundation.scad     - Piers, post bases, beam saddles
//   posts_and_beams.scad - 6x6 posts and 3-ply built-up beams
//   joists.scad         - Field joists, rim joists, blocking, hurricane ties
//   floor.scad          - Plywood floor decking
//   walls.scad          - Wall framing (N/S/E/W with door)
//   wall_cladding.scad  - OSB sheathing, furring strips, lap siding
//   trusses.scad        - Queen-post trusses
//   labels.scad         - Compass direction labels

$vpf=34;
$fn = 60;

// ============================================
// DISPLAY TOGGLES - Set true/false to show/hide
// ============================================
show_ground = false;
show_piers = true;
show_post_bases = true;
show_posts = true;
show_beams = true;
show_joists = true;
show_rim_joists = true;
show_blocking = true;            // 2x8 blocking at beam lines (per 3-joists.md)
show_hurricane_ties = true;      // Simpson H2.5ASS hurricane ties (joist-to-beam)
show_floor_decking = true;
show_walls = true;
show_trusses = true;            // Queen-post roof trusses
show_roof = true;               // Zip System roof sheathing
show_osb = true;                 // 7/16" OSB sheathing (wall exterior)
show_furring = true;             // 1×3 furring strips (rainscreen gap)
show_siding = true;              // HardiePlank lap siding
show_compass_labels = true;      // Direction labels (N/S/E/W)

// Transparency settings (0-1, where 1 is opaque)
ground_alpha = 1;
pier_alpha = 1;
wood_alpha = 1;
floor_alpha = 1;
wall_alpha = 1;

// ============================================
// INCLUDE ALL MODULES
// ============================================
include <dimensions.scad>
include <ground.scad>
include <foundation.scad>
include <posts_and_beams.scad>
include <joists.scad>
include <floor.scad>
include <walls.scad>
include <wall_cladding.scad>
include <trusses.scad>
include <roof_sheathing.scad>
include <labels.scad>

// ============================================
// ASSEMBLY
// ============================================

// Ground
if (show_ground) {
    ground_surface();
}

// Piers (6 total)
// - West: short pier (2" above ground) with 6x6 posts on top
// - Center & East: tall piers rising to beam level (no post, beam direct to concrete)
if (show_piers) {
    echo("CUTLIST,=== FOUNDATION (PIERS) ===,,,");
    for (i = [0 : len(pier_specs) - 1])
        pier(pier_specs[i]);
}

// Post bases (2 total) - only at west positions; beam saddles at center and east
if (show_post_bases) {
    echo("CUTLIST,=== HARDWARE (POST BASES + SADDLES) ===,,,");
    for (px = post_positions)
        for (py = beam_y)
            post_base(px, py);

    // Beam saddles at center and east positions (4 total)
    for (px = saddle_positions)
        for (py = beam_y)
            beam_saddle(px, py);
}

// Posts (2 total) - only at west positions
if (show_posts) {
    echo("CUTLIST,=== POSTS ===,,,");
    for (px = post_positions)
        for (py = beam_y)
            post(px, py);
}

// Beams (2) - run East-West
if (show_beams) {
    echo("CUTLIST,=== BEAMS (3-ply built-up) ===,,,");
    for (py = beam_y)
        beam(py);
}

// Joists - run North-South
if (show_joists) {
    echo("CUTLIST,=== FLOOR JOISTS ===,,,");
    for (i = [0 : num_joists - 1])
        joist(joist_x(i));
}

// Rim joists at South and North edges
if (show_rim_joists) {
    echo("CUTLIST,=== RIM JOISTS ===,,,");
    rim_joist(rim_thickness / 2);                    // South rim
    rim_joist(shed_width - rim_thickness / 2);       // North rim
}

// Blocking at beam lines (24 blocks total, per 3-joists.md)
if (show_blocking) {
    echo("CUTLIST,=== BLOCKING ===,,,");
    blocking();
}

// Hurricane ties (Simpson H2.5ASS) at each joist / beam intersection
// 13 joists × 2 beams = 26 ties (per 3-joists.md)
// Each tie has independent joist-side (js) and beam-side (bs) parameters:
//   js:  1 = east face of joist, -1 = west face
//   bs: -1 = north face of beam,  1 = south face
// All ties go on the interior face of the beam:
//   South beam (Y=18):  bs=-1 (north/interior)
//   North beam (Y=126): bs= 1 (south/interior)
// Most joists use js=-1 (west face), except:
//   - Two westernmost (X=0, X=16): js=1 (east face, away from shed edge)
//   - Easternmost (X=192) on south beam: js=-1 already correct
if (show_hurricane_ties) {
    echo("CUTLIST,=== HURRICANE TIES ===,,,");
    for (i = [0 : num_joists - 1]) {
        x_pos = joist_x(i);
        // Joist side: east for the two westernmost, west for the rest
        js = (x_pos <= joist_x_east - (num_regular_joists - 2) * joist_spacing) ? 1 : -1;
        // South beam: ties on north (interior) side
        h25a_tie(x_pos, beam_y[0], js, -1);
        // North beam: ties on south (interior) side
        h25a_tie(x_pos, beam_y[1], js, 1);
    }
}

// Floor decking
if (show_floor_decking) {
    echo("CUTLIST,=== FLOOR DECKING ===,,,");
    floor_decking();
}

// Walls
if (show_walls) {
    echo("CUTLIST,=== WALL FRAMING ===,,,");
    walls();
}

// Wall cladding (OSB, furring, siding — each toggled independently)
if (show_osb || show_furring || show_siding) {
    echo("CUTLIST,=== WALL CLADDING (OSB / FURRING / SIDING) ===,,,");
    wall_cladding();
}

// Trusses
if (show_trusses) {
    echo("CUTLIST,=== TRUSSES ===,,,");
    trusses();
}


// Roof sheathing (Zip System)
if (show_roof) {
    echo("CUTLIST,=== ROOF SHEATHING ===,,,");
    roof_sheathing();
}

// Compass labels
if (show_compass_labels) {
    compass_labels();
}

// ============================================
// CUTLIST OUTPUT
// ============================================
// All individual boards logged above with CUTLIST, prefix.
// Grep output for "CUTLIST," to extract the full cut list.
// CSV format: CUTLIST,purpose,material,qty,length/dimensions
// Dimensional lumber: length only (e.g. 141"). Sheet goods: W x H.
echo("=== CUTLIST SUMMARY ===");
echo(str("Shed: ", shed_length/12, "' x ", shed_width/12, "' (", shed_length, "\" x ", shed_width, "\")"));
echo(str("Orientation: X=E-W (0=west), Y=N-S (0=south), ground slopes east=high, west=low"));
echo("---");
echo("To extract CSV: grep 'CUTLIST,' from OpenSCAD console output");
echo("=== END CUTLIST ===");
