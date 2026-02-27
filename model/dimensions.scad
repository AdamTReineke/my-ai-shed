// Shed Model - Shared Dimensions and Constants
// All dimensions in inches unless noted

include <BOSL2/std.scad>

// ============================================
// DEFAULT TRANSPARENCY (overridden in shed_model.scad)
// ============================================
// These defaults let sub-files render standalone for previewing
//ground_alpha = 0.3;
//pier_alpha = 1.0;
//wood_alpha = 0.5;
//floor_alpha = 0.1;
//wall_alpha = 0.1;

// ============================================
// SHED DIMENSIONS (from README)
// ============================================
shed_length = 16 * 12;       // 16' = 192" (X direction, East-West)
shed_width = 12 * 12;        // 12' = 144" (N-S direction)

// Wall height - ADJUST THIS to control sheathing coverage
// Standard 8' walls = 96", but you may want taller so 4x8 sheathing
// covers the floor framing (add ~12-15" for joist + beam depth)
wall_height = 96;            // 8' standard - adjust as needed

// Door dimensions (east end of north wall)
// Measured frame: 31.5" wide × 76.5" tall, 6.75" thick, 29⅛" interior
// In-swing, hinge on right (viewed from exterior)
door_width = 31.5;           // Door frame outer width
door_height = 76.5;          // Door frame height (floor to top of frame)
door_rough_opening_extra = 1.5; // ¾" shim space each side
door_frame_thickness = 6.75; // Frame depth (into wall)
door_frame_side = (door_width - 29.125) / 2;  // 1.1875" side jamb thickness
door_interior_width = 29.125; // Interior clear width (29⅛")
door_slab_thickness = 1.75;  // Door slab thickness

// Post inset from edges
post_inset = 12;             // 1' inset from E/W edges

// Support positions along beam (from west edge, x=0)
// README: supports at 1', 8', 15' from EAST edge
// x=0 is west, x=192 is east
// - 15' from east = 1' from west = 12"   (west end - SHORT PIER, has post)
// - 8' from east = 8' from west = 96"    (center - TALL PIER, beam direct to concrete)
// - 1' from east = 15' from west = 180"  (east end - TALL PIER, beam direct to concrete)
support_x = [12, 96, 180];   // All support positions

// Which positions have vertical posts vs beam saddles
// As-built: East and center piers rise to beam level (no posts)
// Only west piers are short and need posts to reach the beam
post_positions = [12];               // West only - short pier, needs 6x6 post
saddle_positions = [96, 180];        // Center and East - tall pier, beam direct to concrete

// Beam positions (from south edge)
// README: Joists have 1.5' cantilever on each end, 9' main span
// Beams @ 1.5' and 10.5' from south edge (or 10.5' and 1.5' from north)
beam_y = [18, 126];          // 1.5', 10.5' = 18", 126"

// ============================================
// GROUND ELEVATION MAP
// ============================================
// Ground slopes per README: East=HIGH, West=LOW (28" drop over 16')
// Using arbitrary Z reference: East=52", West=24"
// X positions: 0, 64, 128, 192 (0', 5.33', 10.67', 16')
// Y positions: 0, 48, 96, 144 (0', 4', 8', 12')

// Calculate ground height at any point
// East side (x=192) = 52" (HIGH - uphill)
// West side (x=0) = 24" (LOW - downhill)
// North side is 2" lower than south (minor cross-slope)
function ground_height(x, y) =
    let(
        // Linear interpolation East-West: 24" at x=0 (west), 52" at x=192 (east)
        ew_height = 24 + (x / shed_length) * (52 - 24),
        // North-South adjustment (0 at y=0, -2 at y=144)
        ns_adjust = -(y / shed_width) * 2
    )
    ew_height + ns_adjust;

// Ground grid points (4x4)
ground_x = [0, 64, 128, 192];
ground_y = [0, 48, 96, 144];

// ============================================
// STRUCTURAL MEMBER SIZES
// ============================================
// 6x6 posts (actual 5.5" x 5.5")
post_width = 5.5;
post_depth = 5.5;

// Beams: 3-ply built-up 2x10 + 3x10 + 2x10 (per 2-beam.md)
// Creates 5.5" x 9.25" section (Hem-Fir #2 PT Incised)
// Connected with 1/2" x 6-1/2" HDG hex bolts, staggered top/bottom at 24" o.c., 8 per beam
// Utilization: 89% bending, 77% shear, 15% deflection
beam_height = 9.25;                // 2x10 actual depth
beam_outer_ply = 1.5;             // 2x10 outer plies (actual thickness)
beam_center_ply = 2.5;            // 3x10 center ply (actual thickness)
beam_total_thickness = 2 * beam_outer_ply + beam_center_ply;  // 5.5"

// Rim joists: 2x8 (match joists)
rim_thickness = 1.5;
rim_height = 7.25;

// Joists: 2x8 at 16" o.c. (per README structural analysis)
joist_thickness = 1.5;
joist_height = 7.25;         // 2x8 actual height
joist_spacing = 16;          // 16" on center
joist_length = shed_width - 2 * rim_thickness;  // 141" (12' minus two 1.5" rims)

// Joist layout: 16" o.c. from east end, short last bay at west
// East-most joist center at shed_length - joist_thickness/2, stepping west
joist_x_east = shed_length - joist_thickness/2;          // 191.25"
joist_x_west = joist_thickness/2;                         // 0.75"
num_regular_joists = floor((shed_length - joist_thickness) / joist_spacing) + 1;  // 12 joists at 16" o.c.
num_joists = num_regular_joists + 1;                      // +1 for west-end short bay joist (13 total)

// Joist X positions: 12 at 16" o.c. from east, plus west-end closer
function joist_x(i) =
    (i < num_regular_joists)
        ? joist_x_east - i * joist_spacing
        : joist_x_west;

// Floor decking: 3/4" plywood
floor_thickness = 0.75;

// Wall framing: 2x6 at 16" o.c.
stud_thickness = 1.5;        // 2x6 actual thickness
stud_depth = 5.5;            // 2x6 actual depth
stud_spacing = 16;           // 16" on center
plate_thickness = 1.5;       // Top/bottom plate thickness
plate_depth = 5.5;           // Top/bottom plate depth

// Truss parameters
truss_member_width = 1.5;    // 2x4 actual thickness
truss_member_depth = 3.5;    // 2x4 actual depth
truss_overhang = 12;         // 1' overhang past each wall
truss_pitch = 6/12;          // 6/12 pitch (rise per run)
truss_span = shed_width;     // 144" span between walls
truss_total_length = truss_span + 2 * truss_overhang;  // 168" total

// Derived truss dimensions
truss_half_span = truss_span / 2;                      // 72" from center to wall
truss_rise = truss_half_span * truss_pitch;           // 36" rise at peak
truss_rafter_angle = atan(truss_pitch);               // ~26.57 degrees

// Straining beam width (matches truss.js --sb-width=48)
straining_beam_width = 48;                            // 48" straining beam

// Queen post positions - SB butts against QP inside depth faces
// Formula from truss.js: qpInset = (span - sbWidth - qpDepth) / 2
queen_post_inset = (truss_span - straining_beam_width - truss_member_depth) / 2;  // 46.25"
queen_post_y = [queen_post_inset, truss_span - queen_post_inset];  // [46.25, 97.75]
queen_post_height = queen_post_inset * truss_pitch;  // 23.125" at queen post center

// Straining beam connects to rafter at different points than queen post tops
straining_beam_inset = (truss_span - straining_beam_width) / 2;  // 48"
straining_beam_z_above_chord = straining_beam_inset * truss_pitch;  // 24" above chord top

// Ladder framing parameters (gable end overhangs)
gable_overhang = 12;                    // 1' overhang past gable walls
lookout_spacing = 24;                   // Lookouts at 24" o.c. along rafter
lookout_width = 1.5;                    // 2x4 lookout thickness
lookout_depth = 3.5;                    // 2x4 lookout depth

// ============================================
// PIER DIMENSIONS (from concrete.js as-built measurements)
// ============================================
// BigFoot form specs: [height, top_dia, base_dia, tube_dia]
bf_specs = [
    [12.25, 10,    24.5,  10],  // BF24 (corner piers)
    [12.25, 12.42, 28.25, 12],  // BF28 (center piers)
];

// Per-pier as-built data: [x_pos, y_pos, bf_index, above_cone, total_height]
// Positions mapped from concrete.js to model coordinates (x=0 west, x=192 east)
pier_specs = [
    [180, 126, 0,  9, 28.5],  // P1 - NE corner (1' from east, north beam)
    [180,  18, 0, 13, 30.5],  // P4 - SE corner (1' from east, south beam)
    [ 12, 126, 0, 10, 31.0],  // P3 - NW corner (15' from east, north beam)
    [ 12,  18, 0, 16, 33.5],  // P6 - SW corner (15' from east, south beam)
    [ 96, 126, 1, 27, 41.0],  // P2 - N center (8' from east, north beam)
    [ 96,  18, 1, 25, 39.5],  // P5 - S center (8' from east, south beam)
];

pier_above_ground = 2;       // Pier visibility above ground (post positions only)

// Post base height (Simpson ABU66 style)
post_base_height = 1;        // 1" above concrete for drainage

// ABU66SS post base / beam saddle
abu66ss_length = 5;          // 5" long (E-W, along beam)
abu66ss_width = 5.5;         // 5.5" wide (N-S, across beam)
abu66ss_height = 6.0625;     // 6-1/16" tall
abu66ss_base_h = 1;          // base portion height (~1")
abu66ss_gauge = 0.0897;      // 11-gauge steel ~0.090"

// CC66 post cap
cc66_saddle_depth = 5.5;     // N-S (across beam)
cc66_saddle_width = 5.5;     // E-W (along beam)
cc66_saddle_height = 11;     // tall dimension of saddle
cc66_arm_drop = 6.5;         // how far arms extend below beam bottom, down post
cc66_gauge = 0.1793;         // 7-gauge steel ~0.179"

// ============================================
// COLORS
// ============================================
color_ground = [0.4, 0.3, 0.2];      // Brown earth
color_concrete = [0.7, 0.7, 0.7];    // Gray concrete
color_steel = [0.3, 0.3, 0.35];      // Dark steel
color_pt_wood = [0.6, 0.5, 0.3];     // Pressure treated (greenish brown)
color_plywood = [0.8, 0.7, 0.5];     // Plywood tan
color_stud = [0.85, 0.75, 0.55];     // Lighter wood for studs
color_wall_ns = [0.9, 0.85, 0.2];    // Yellow for North/South walls
color_wall_ew = [0.3, 0.5, 0.9];     // Blue for East/West walls
color_truss = color_stud;              // Wood tone (same as studs)
color_ladder = [0.75, 0.65, 0.45];    // Slightly darker wood for ladder framing
color_gusset = [0.45, 0.35, 0.2];     // Dark brown plywood gussets

// ============================================
// REFERENCE HEIGHT CALCULATIONS
// ============================================
// Pier tops are now just 2" above ground at each location
// Posts extend from pier top to beam bottom
// Beam bottom elevation is set to clear the highest ground + post + clearance

// Beam bottom elevation derived from as-built south post:
// ground(12,18) + pier_above_ground + post_base_height + post_height_south
// = 25.5 + 2 + 1 + 16.5 = 45.0
beam_bottom_z = 45;          // Fixed beam bottom elevation (as-built)

// Calculate pier top Z (for post base positions, 2" above ground)
function pier_top_z(x, y) = ground_height(x, y) + pier_above_ground;

// As-built post heights (wood only, excluding metal brackets)
// South post (x=12, y=18, pier P6): 16.5"
// North post (x=12, y=126, pier P3): 17.25"
post_height_south = 16.5;
post_height_north = 17.25;
function post_height_at(x, y) = (y < shed_width / 2) ? post_height_south : post_height_north;

// Derived elevations
joist_bottom_z = beam_bottom_z + beam_height;
floor_top_z = joist_bottom_z + joist_height + floor_thickness;

// Wall starts at floor level (or adjust lower for sheathing overlap)
wall_bottom_z = floor_top_z;
wall_top_z = wall_bottom_z + wall_height;

// Check if position is a saddle position (no post)
function is_saddle_position(x) = len([for (sx = saddle_positions) if (sx == x) sx]) > 0;

// Floor decking constants
sheet_gap = 0.25;  // Gap between sheets for visibility
board_gap = 0.125; // 1/8" gap between lumber pieces for visibility
sheet_8ft = 96;    // 8' = 96"
sheet_4ft = 48;    // 4' = 48"

// Compass label constants
label_height = 1.5;      // Extrusion height
label_size = 12;         // Font size
label_color = [0.2, 0.2, 0.8];  // Blue

// Hurricane tie constants (Simpson H2.5ASS)
h25a_width = 1.375;         // 1-3/8" strap width
h25a_gauge = 0.048;         // 18 gauge steel (~0.048")
h25a_beam_flange = 3.0;     // Rectangular portion against beam side (below beam top)
h25a_joist_flange = 4.5;    // Rectangular portion against joist side (above beam top)
h25a_gusset_height = 1.5;   // Height of each triangular gusset

// Calculate rafter bottom height at any Y position
function rafter_bottom_z_at_y(y) =
    let(
        bottom_chord_top = wall_top_z + truss_member_depth,
        dist_from_wall = (y >= shed_width/2) ? shed_width - y : y,
        dist_from_center = abs(y - shed_width/2)
    )
    bottom_chord_top + (shed_width/2 - dist_from_center) * truss_pitch;

// Calculate height at any Y position along the truss (relative to bottom chord)
function truss_height_at_y(y) =
    let(
        dist_from_center = abs(y - truss_half_span),
        height = truss_rise - dist_from_center * truss_pitch
    )
    max(0, height);

// Stud position calculator
function stud_positions(start_x, end_x, spacing = 16) =
    let(
        length = end_x - start_x - stud_thickness,
        num_spaces = floor(length / spacing),
        actual_spacing = length / max(num_spaces, 1),
        positions = [for (i = [0 : num_spaces]) start_x + i * actual_spacing]
    )
    positions;
