#!/usr/bin/env node
/**
 * Joist sizing calculator for floor joists with cantilevers
 *
 * Usage:
 *   node shed/joist.js                      # default values
 *   node shed/joist.js --span=108 --live=50 # 108" span, 50 psf storage
 *   node shed/joist.js --help
 */

const { FT, MATERIAL, LUMBER, Cr, DEFAULTS } = require('./constants');

// =============================================================================
// CALCULATIONS
// =============================================================================

function calculateLoads(config) {
  const {
    joistSpan_in, joistCantilever_in, joistSpacing_in,
    deadLoad_psf, liveLoad_psf,
    wallHeight_in, wallWeight_psf, roofTributary_in, roofLoad_psf
  } = config;

  const totalLength_in = joistSpan_in + 2 * joistCantilever_in;
  const tributaryWidth_ft = joistSpacing_in / FT;

  // Uniform load along entire joist
  const totalFloorLoad_psf = deadLoad_psf + liveLoad_psf;
  const uniformLoad_plf = totalFloorLoad_psf * tributaryWidth_ft;
  const liveUniformLoad_plf = liveLoad_psf * tributaryWidth_ft;

  // Point load at each cantilever tip (wall + roof)
  const wallLineLoad_plf = (wallHeight_in / FT) * wallWeight_psf;
  const roofLineLoad_plf = (roofTributary_in / FT) * roofLoad_psf;
  const totalLineLoad_plf = wallLineLoad_plf + roofLineLoad_plf;
  const pointLoad_lbs = totalLineLoad_plf * tributaryWidth_ft;

  return {
    totalLength_in,
    tributaryWidth_ft,
    uniformLoad_plf,
    liveUniformLoad_plf,
    pointLoad_lbs,
    totalFloorLoad_psf,
  };
}

function calculateMoments(config, loads) {
  const { joistSpan_in, joistCantilever_in } = config;
  const { uniformLoad_plf, pointLoad_lbs } = loads;

  // Convert to feet for moment calculations (moment in ft-lbs)
  const span_ft = joistSpan_in / FT;
  const cantilever_ft = joistCantilever_in / FT;

  // Cantilever moment at support (negative): M = P*a + w*a²/2
  const cantileverMoment_ftlbs = pointLoad_lbs * cantilever_ft +
                                  uniformLoad_plf * Math.pow(cantilever_ft, 2) / 2;

  // Simple span moment (without cantilever benefit)
  const simpleSpanMoment_ftlbs = uniformLoad_plf * Math.pow(span_ft, 2) / 8;

  // Adjusted mid-span moment (cantilever reduces positive moment)
  const midSpanMoment_ftlbs = Math.max(0, simpleSpanMoment_ftlbs - cantileverMoment_ftlbs);

  // Maximum moment for design
  const maxMoment_ftlbs = Math.max(cantileverMoment_ftlbs, midSpanMoment_ftlbs);

  // Beam reactions (total load / 2)
  const totalLength_ft = span_ft + 2 * cantilever_ft;
  const totalLoad_lbs = uniformLoad_plf * totalLength_ft + 2 * pointLoad_lbs;
  const reaction_lbs = totalLoad_lbs / 2;

  return {
    cantileverMoment_ftlbs,
    simpleSpanMoment_ftlbs,
    midSpanMoment_ftlbs,
    maxMoment_ftlbs,
    reaction_lbs,
  };
}

function checkBending(maxMoment_ftlbs, lumber) {
  const { S_in3, CF } = lumber;

  // Per-size Fb': base × CD × CF(size) × Ci(incising) × Cr(repetitive member)
  const Fb_psi = MATERIAL.Fb_base_psi * MATERIAL.CD * CF * MATERIAL.Ci_Fb * Cr;

  const requiredS_in3 = maxMoment_ftlbs * FT / Fb_psi;
  const allowableMoment_ftlbs = S_in3 * Fb_psi / FT;
  const utilization = maxMoment_ftlbs / allowableMoment_ftlbs;

  return {
    Fb_psi,
    requiredS_in3,
    providedS_in3: S_in3,
    allowableMoment_ftlbs,
    utilization,
    passes: utilization <= 1.0,
  };
}

function checkDeflection(config, loads, lumber) {
  const { joistSpan_in, deflectionLimit } = config;
  const { liveUniformLoad_plf } = loads;
  const { I_in4 } = lumber;
  const { E_psi } = MATERIAL;

  const w_lbpin = liveUniformLoad_plf / FT;

  // Simple span deflection with 0.85 reduction for cantilever counterbalance
  const deflection_in = (5 * w_lbpin * Math.pow(joistSpan_in, 4)) / (384 * E_psi * I_in4) * 0.85;
  const allowable_in = joistSpan_in / deflectionLimit;
  const utilization = deflection_in / allowable_in;

  return {
    deflection_in,
    allowable_in,
    utilization,
    passes: utilization <= 1.0,
  };
}

function analyze(config) {
  const loads = calculateLoads(config);
  const moments = calculateMoments(config, loads);

  const results = {};
  for (const [key, lumber] of Object.entries(LUMBER)) {
    // Skip non-joist sizes
    if (!key.startsWith('2x') && !key.startsWith('3x')) continue;

    const bending = checkBending(moments.maxMoment_ftlbs, lumber);
    const deflection = checkDeflection(config, loads, lumber);

    results[key] = {
      name: lumber.name,
      depth_in: lumber.depth_in,
      bending,
      deflection,
      passes: bending.passes && deflection.passes,
    };
  }

  return { config, loads, moments, results };
}

// =============================================================================
// OUTPUT
// =============================================================================

function printResults(analysis) {
  const { config, loads, moments, results } = analysis;

  console.log('\nJOIST ANALYSIS');
  console.log('='.repeat(60));

  console.log('\nConfiguration:');
  console.log(`  Span: ${config.joistSpan_in}" | Cantilever: ${config.joistCantilever_in}" each`);
  console.log(`  Spacing: ${config.joistSpacing_in}" o.c. | Total length: ${loads.totalLength_in}"`);
  console.log(`  Load: ${config.deadLoad_psf} DL + ${config.liveLoad_psf} LL = ${loads.totalFloorLoad_psf} psf`);

  console.log('\nLoads:');
  console.log(`  Uniform: ${loads.uniformLoad_plf.toFixed(1)} plf | Tip load: ${loads.pointLoad_lbs.toFixed(0)} lbs`);
  console.log(`  Beam reaction: ${moments.reaction_lbs.toFixed(0)} lbs`);

  console.log('\nMoments:');
  console.log(`  Cantilever: ${moments.cantileverMoment_ftlbs.toFixed(0)} ft-lbs`);
  console.log(`  Mid-span: ${moments.midSpanMoment_ftlbs.toFixed(0)} ft-lbs`);
  console.log(`  Design: ${moments.maxMoment_ftlbs.toFixed(0)} ft-lbs`);

  console.log('\nResults:');
  console.log('Size    Bending        Deflection     Status');
  console.log('-'.repeat(50));

  for (const [key, r] of Object.entries(results)) {
    const bend = `${(r.bending.utilization * 100).toFixed(0)}%`.padStart(4);
    const defl = `${(r.deflection.utilization * 100).toFixed(0)}%`.padStart(4);
    const deflIn = r.deflection.deflection_in.toFixed(3);
    const status = r.passes ? '✓' : '✗';
    console.log(`${r.name.padEnd(7)} ${bend} of capacity  ${defl} (${deflIn}")  ${status}`);
  }

  const passing = Object.values(results).filter(r => r.passes);
  if (passing.length > 0) {
    const min = passing.reduce((a, b) => a.depth_in < b.depth_in ? a : b);
    console.log(`\n→ Minimum: ${min.name}`);
  }
  console.log('');
}

// =============================================================================
// CLI
// =============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    joistSpan_in: DEFAULTS.joistSpan_in,
    joistCantilever_in: DEFAULTS.joistCantilever_in,
    joistSpacing_in: DEFAULTS.joistSpacing_in,
    deadLoad_psf: DEFAULTS.deadLoad_psf,
    liveLoad_psf: DEFAULTS.liveLoad_psf,
    wallHeight_in: DEFAULTS.wallHeight_in,
    wallWeight_psf: DEFAULTS.wallWeight_psf,
    roofTributary_in: DEFAULTS.roofTributary_in,
    roofLoad_psf: DEFAULTS.roofLoad_psf,
    deflectionLimit: DEFAULTS.deflectionLimit,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      console.log(`
Joist Sizing Calculator

Usage: node shed/joist.js [options]

Options (dimensions in inches):
  --span=N        Main span between beams [${DEFAULTS.joistSpan_in}"]
  --cantilever=N  Cantilever each end [${DEFAULTS.joistCantilever_in}"]
  --spacing=N     Joist spacing o.c. [${DEFAULTS.joistSpacing_in}"]
  --live=N        Live load (psf) [${DEFAULTS.liveLoad_psf}]
  --dead=N        Dead load (psf) [${DEFAULTS.deadLoad_psf}]
  --deflection=N  Deflection limit L/N [${DEFAULTS.deflectionLimit}]

Examples:
  node shed/joist.js                     # default 108" (9') span
  node shed/joist.js --span=120          # 120" (10') span
  node shed/joist.js --live=40           # lighter storage load
`);
      process.exit(0);
    }

    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      const num = parseFloat(value);
      const map = {
        span: 'joistSpan_in',
        cantilever: 'joistCantilever_in',
        spacing: 'joistSpacing_in',
        live: 'liveLoad_psf',
        dead: 'deadLoad_psf',
        deflection: 'deflectionLimit',
      };
      if (map[key]) config[map[key]] = num;
    }
  }

  return config;
}

// =============================================================================
// MAIN
// =============================================================================

if (require.main === module) {
  const config = parseArgs();
  const analysis = analyze(config);
  printResults(analysis);
}

module.exports = { analyze, calculateLoads, calculateMoments };
