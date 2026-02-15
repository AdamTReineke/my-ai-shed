/**
 * Structural constants for shed calculations
 *
 * Unit conventions:
 *   _in = inches
 *   _ft = feet (use sparingly, prefer inches)
 *   _psi = pounds per square inch
 *   _psf = pounds per square foot
 *   _plf = pounds per linear foot
 *   _lbs = pounds
 */

// =============================================================================
// UNIT CONVERSIONS
// =============================================================================

const FT = 12;  // inches per foot - use as multiplier: 16 * FT = 192 inches

// =============================================================================
// COMMON DIMENSIONS (stored in inches)
// =============================================================================

const DIM = {
  SHED_LENGTH: 16 * FT,     // 192" (E-W dimension)
  SHED_WIDTH: 12 * FT,      // 144" (N-S dimension)
  JOIST_SPAN: 9 * FT,       // 108" main span between beams
  JOIST_CANTILEVER: 1.5 * FT, // 18" cantilever each end
  BEAM_SPAN: 7 * FT,        // 84" between posts
  BEAM_CANTILEVER: 1 * FT,  // 12" past end posts
  WALL_HEIGHT: 8 * FT,      // 96"
};

// =============================================================================
// MATERIAL PROPERTIES (Hem-Fir #2, Pressure Treated)
// =============================================================================

const MATERIAL = {
  // Base design values (Hem-Fir #2, NDS Table 4A)
  Fb_base_psi: 850,
  E_base_psi: 1_300_000,
  Fc_base_psi: 1150,
  Fv_base_psi: 150,

  // NDS adjustment factors for PT incised dimension lumber
  CD: 1.0,                  // Load duration (normal)
  CF_Fb: 1.1,              // Size factor for Fb (2x10 beams)
  Ci_Fb: 0.80,             // Incising factor for Fb
  Ci_Fv: 0.80,             // Incising factor for Fv
  Ci_Fc: 0.80,             // Incising factor for Fc
  Ci_E: 0.95,              // Incising factor for E

  // Adjusted values (Fb' = Fb × CD × CF × Ci)
  get Fb_psi() { return this.Fb_base_psi * this.CD * this.CF_Fb * this.Ci_Fb; },  // 748 psi
  get E_psi()  { return this.E_base_psi * this.Ci_E; },                            // 1,235,000 psi
  get Fc_psi() { return this.Fc_base_psi * this.Ci_Fc; },                          // 920 psi
  get Fv_psi() { return this.Fv_base_psi * this.Ci_Fv; },                          // 120 psi
};

// =============================================================================
// LUMBER SECTION PROPERTIES
// Actual dimensions in inches, S in in³, I in in⁴
// S = bd²/6, I = bd³/12 where b=1.5" for 2x, 2.5" for 3x
// =============================================================================

// NDS Table 4A size factors (CF) for Fb, by nominal depth — Hem-Fir #2
const CF_BY_DEPTH = {
  5.5:  1.3,   // 2x6 / 3x6
  7.25: 1.2,   // 2x8 / 3x8 / 4x8
  9.25: 1.1,   // 2x10
  11.25: 1.0,  // 2x12
};

// Repetitive member factor (NDS 4.3.9): applies to joists/rafters/studs
// spaced ≤24" o.c. and connected by sheathing. Does NOT apply to beams.
const Cr = 1.15;

const LUMBER = {
  '2x6':  { width_in: 1.5, depth_in: 5.5,  S_in3: 7.56,   I_in4: 20.80,  CF: 1.3, name: '2×6'  },
  '3x6':  { width_in: 2.5, depth_in: 5.5,  S_in3: 12.60,  I_in4: 34.66,  CF: 1.3, name: '3×6'  },
  '2x8':  { width_in: 1.5, depth_in: 7.25, S_in3: 13.14,  I_in4: 47.63,  CF: 1.2, name: '2×8'  },
  '3x8':  { width_in: 2.5, depth_in: 7.25, S_in3: 21.90,  I_in4: 79.39,  CF: 1.2, name: '3×8'  },
  '2x10': { width_in: 1.5, depth_in: 9.25, S_in3: 21.39,  I_in4: 98.93,  CF: 1.1, name: '2×10' },
  '2x12': { width_in: 1.5, depth_in: 11.25, S_in3: 31.64, I_in4: 177.98, CF: 1.0, name: '2×12' },
  '4x8':  { width_in: 3.5, depth_in: 7.25, S_in3: 30.66,  I_in4: 111.15, CF: 1.2, name: '4×8'  },
};

// =============================================================================
// COMPOSITE ACTION
//
// For built-up beams of same-depth plies connected with structural screws:
// - Bending (S): Full geometric S applies. Same-depth plies share load
//   proportionally to width whether connected or not. Screws prevent slip.
// - Deflection (EI): Connection slip reduces effective stiffness. Apply
//   composite factor to I to account for this.
//
// 0.75 = structural screws (conservative per APA/FPL research)
// Deflection is not close to governing, so this is academic for this design.
// =============================================================================

const COMPOSITE_FACTOR = 0.75;

// =============================================================================
// BEAM OPTIONS (built-up and solid timber)
// S in in³, I in in⁴, A in in²
//
// For same-depth built-up beams: S = b_total × d² / 6 (full geometry).
// I uses composite factor: I_eff = I_indep + CF × (I_full - I_indep).
// (For same-depth plies I_full = I_indep, so CF has no effect — noted for
// mixed-depth layups if ever used.)
// =============================================================================

function builtUpBeam(widths_in, depth_in, name) {
  // widths_in: array of actual ply widths, e.g. [1.5, 2.5, 1.5] for 2x10+3x10+2x10
  const b_total = widths_in.reduce((a, b) => a + b, 0);
  const d = depth_in;
  const S = b_total * d * d / 6;
  const I_full = b_total * d * d * d / 12;
  // For independent plies (sum of individual I values — same as I_full for same-depth)
  const I_indep = widths_in.reduce((sum, w) => sum + w * d * d * d / 12, 0);
  const cf = COMPOSITE_FACTOR;
  const I_eff = I_indep + cf * (I_full - I_indep);
  const A = b_total * d;
  return { name, S_in3: S, I_in4: I_eff, A_in2: A, b_in: b_total, d_in: d };
}

const BEAM_OPTIONS = {
  // Built-up beams from uniform plies (all 2x = 1.5" wide)
  '2-2x8':  builtUpBeam([1.5, 1.5],           7.25,  '(2) 2×8'),
  '2-2x10': builtUpBeam([1.5, 1.5],           9.25,  '(2) 2×10'),
  '2-2x12': builtUpBeam([1.5, 1.5],           11.25, '(2) 2×12'),
  '3-2x8':  builtUpBeam([1.5, 1.5, 1.5],      7.25,  '(3) 2×8'),
  '3-2x10': builtUpBeam([1.5, 1.5, 1.5],      9.25,  '(3) 2×10'),
  '3-2x12': builtUpBeam([1.5, 1.5, 1.5],      11.25, '(3) 2×12'),
  '4-2x8':  builtUpBeam([1.5, 1.5, 1.5, 1.5], 7.25,  '(4) 2×8'),

  // Mixed-width layup: 2x10 + 3x10 + 2x10 (the beam2.md design)
  '2-3-2x10': builtUpBeam([1.5, 2.5, 1.5],    9.25,  '2+3+2 ×10'),

  // Other built-up
  '2-4x8':  builtUpBeam([3.5, 3.5],           7.25,  '(2) 4×8'),

  // Solid timber (actual dimensions: 6x = 5.5", 8x = 7.5")
  '6x8':    { name: '6×8',  S_in3: 51.56,  I_in4: 193.36, A_in2: 41.25, b_in: 5.5, d_in: 7.5  },
  '6x10':   { name: '6×10', S_in3: 82.73,  I_in4: 393.0,  A_in2: 52.25, b_in: 5.5, d_in: 9.5  },
  '8x8':    { name: '8×8',  S_in3: 70.31,  I_in4: 263.67, A_in2: 56.25, b_in: 7.5, d_in: 7.5  },
};

// =============================================================================
// POST/COLUMN PROPERTIES
// =============================================================================

const POSTS = {
  '4x4': { actual_in: 3.5, area_in2: 12.25, name: '4×4' },
  '6x6': { actual_in: 5.5, area_in2: 30.25, name: '6×6' },
  '8x8': { actual_in: 7.5, area_in2: 56.25, name: '8×8' },
};

// =============================================================================
// SITE-SPECIFIC CONSTANTS (City of Redmond requirements)
// =============================================================================

const SITE = {
  soilBearing_psf: 1500,    // Default without geotech report (IBC Table 1806.2)
  frostDepth_in: 12,        // Redmond frost line
  minPierDepth_in: 24,      // 12" below frost line

  windSpeed_mph: 110,       // Design wind speed (IRC 301.2)
  groundSnow_psf: 15,       // Ground snow load
  rainOnSnow_psf: 5,        // Surcharge for flat roofs (ASCE 7-10)
  rainfall_inhr: 1,         // Design rainfall (UPC Table D101.1)

  seismicCategory: 'D',
};

// =============================================================================
// DEFAULT CONFIGURATION (all lengths in inches)
// =============================================================================

const DEFAULTS = {
  // Joist configuration
  joistSpan_in: DIM.JOIST_SPAN,
  joistCantilever_in: DIM.JOIST_CANTILEVER,
  joistSpacing_in: 16,

  // Beam configuration
  beamSpan_in: DIM.BEAM_SPAN,
  beamCantilever_in: DIM.BEAM_CANTILEVER,
  beamLength_in: DIM.SHED_LENGTH,

  // Load assumptions
  deadLoad_psf: 10,
  liveLoad_psf: 60,
  wallHeight_in: DIM.WALL_HEIGHT,
  wallWeight_psf: 7,
  roofTributary_in: 6 * FT,
  roofLoad_psf: 30,

  // Design criteria
  deflectionLimit: 360,     // L/360 for live load deflection

  // Ground slope (E-W)
  groundSlope_in: 28,       // Drop over shed length (east=high, west=low)
};

module.exports = {
  FT,
  DIM,
  MATERIAL,
  LUMBER,
  CF_BY_DEPTH,
  Cr,
  COMPOSITE_FACTOR,
  BEAM_OPTIONS,
  POSTS,
  SITE,
  DEFAULTS,
};
