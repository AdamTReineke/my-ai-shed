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
//   trusses.scad        - Queen-post trusses and ladder framing
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
show_ladder_framing = false;     // Gable end ladder framing (lookouts + fly rafters)
show_roof = false;               // Future: roof sheathing
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
    for (i = [0 : len(pier_specs) - 1])
        pier(pier_specs[i]);
}

// Post bases (2 total) - only at west positions; beam saddles at center and east
if (show_post_bases) {
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
    for (px = post_positions)
        for (py = beam_y)
            post(px, py);
}

// Beams (2) - run East-West
if (show_beams) {
    for (py = beam_y)
        beam(py);
}

// Joists - run North-South
if (show_joists) {
    for (i = [0 : num_joists - 1])
        joist(joist_x(i));
}

// Rim joists at South and North edges
if (show_rim_joists) {
    rim_joist(rim_thickness / 2);                    // South rim
    rim_joist(shed_width - rim_thickness / 2);       // North rim
}

// Blocking at beam lines (24 blocks total, per 3-joists.md)
if (show_blocking) {
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
    floor_decking();
}

// Walls
if (show_walls) {
    walls();
}

// Wall cladding (OSB, furring, siding — each toggled independently)
if (show_osb || show_furring || show_siding) {
    wall_cladding();
}

// Trusses
if (show_trusses) {
    trusses();
}

// Ladder framing (gable end overhangs)
if (show_ladder_framing) {
    ladder_framing();
}

// Compass labels
if (show_compass_labels) {
    compass_labels();
}

// ============================================
// INFO ECHO
// ============================================
echo("=== SHED MODEL INFO ===");
echo(str("Shed footprint: ", shed_length/12, "' x ", shed_width/12, "'"));
echo(str("Ground elevation range: ", ground_height(shed_length, 0), "\" (SE) to ", ground_height(0, shed_width), "\" (NW)"));
echo(str("Beam: 3-ply built-up (2x10 + 3x10 + 2x10) = ", beam_total_thickness, "\" x ", beam_height, "\""));
echo(str("Beam bottom elevation: ", beam_bottom_z, "\""));
echo("Post positions (6x6 posts - WEST ONLY):");
for (px = post_positions)
    for (py = beam_y)
        echo(str("  x=", px, "\" y=", py, "\": post height ", post_height_at(px, py), "\""));
echo("Saddle positions (beam direct to pier - CENTER + EAST):");
for (px = saddle_positions)
    for (py = beam_y)
        echo(str("  x=", px, "\" y=", py, "\": pier to beam level"));
echo(str("Joists: ", num_joists, " × 2×8 at ", joist_spacing, "\" o.c., ", joist_length, "\" (", joist_length/12, "') long N-S"));
echo(str("  Cantilever: ", beam_y[0], "\" S + ", shed_width - beam_y[1], "\" N, Main span: ", beam_y[1] - beam_y[0], "\""));
echo(str("  Hurricane ties: Simpson H2.5ASS × ", num_joists * len(beam_y), " (", num_joists, " joists × ", len(beam_y), " beams)"));
echo(str("  Blocking: 24 pieces (12 per beam line) × 2×8 × ", blocking_length, "\""));
echo(str("Joist bottom: ", joist_bottom_z, "\" | Floor top: ", floor_top_z, "\""));
echo(str("Wall height: ", wall_height, "\" (", wall_height/12, "')"));
echo(str("Wall bottom: ", wall_bottom_z, "\" | Wall top: ", wall_top_z, "\""));
echo(str("Door frame: ", door_width, "\" x ", door_height, "\" (interior ", door_interior_width, "\", jamb ", door_frame_side, "\")"));
echo(str("Door R.O.: ", door_width + door_rough_opening_extra, "\" x ", door_height + 1.5, "\" on north wall"));
echo("Orientation: X=East-West (0=west, 192=east), Y=North-South (0=south, 144=north)");
echo("Ground slope: East is HIGH (uphill), West is LOW (downhill)");
echo("Wall stud layout (16\" o.c. from east end, aligned with joists):");
echo("  N/S walls: studs at 0, 14.5, 30.5, 46.5, 62.5, 78.5, 94.5, 110.5, 126.5, 142.5, 158.5, 174.5, 190.5");
echo("  E/W walls: studs at 0, 16, 32, 48, 64, 80, 96, 112, 128, 131.5 (relative)");
echo("Truss info:");
echo(str("  Type: Queen-post, pitch ", truss_pitch*12, "/12"));
echo(str("  Span: ", truss_span, "\" (", truss_span/12, "') between walls"));
echo(str("  Overhang: ", truss_overhang, "\" (", truss_overhang/12, "') each side"));
echo(str("  Total length: ", truss_total_length, "\" (", truss_total_length/12, "')"));
echo(str("  Rise at peak: ", truss_rise, "\" above bottom chord"));
echo(str("  Queen posts at y=", queen_post_y[0], "\" and y=", queen_post_y[1], "\" (height=", queen_post_height, "\")"));
echo(str("  Straining beam: ", straining_beam_width, "\" wide, inset ", straining_beam_inset, "\" from each end, ", straining_beam_z_above_chord, "\" above chord"));
echo(str("  Truss spacing: 24\" o.c. (9 trusses total)"));
echo("  End trusses: opaque (1.0), middle trusses: transparent (0.25)");
echo("Ladder framing (gable overhangs):");
echo(str("  Gable overhang: ", gable_overhang, "\" (", gable_overhang/12, "')"));
echo(str("  Lookout spacing: ", lookout_spacing, "\" o.c."));
echo(str("  Fly rafters at x=", -gable_overhang, "\" (west) and x=", shed_length + gable_overhang, "\" (east)"));
