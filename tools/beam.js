#!/usr/bin/env node
/**
 * Beam sizing calculator for continuous multi-span beams
 *
 * Usage:
 *   node shed/beam.js                       # default values
 *   node shed/beam.js --span=72 --load=800  # 72" spans, 800 plf
 *   node shed/beam.js --help
 */

const { FT, MATERIAL, COMPOSITE_FACTOR, BEAM_OPTIONS, DEFAULTS } = require('./constants');

// =============================================================================
// CALCULATIONS
// =============================================================================

function calculateLoads(config) {
  const { beamLength_in, joistSpacing_in, joistReaction_lbs } = config;

  // Number of joists bearing on beam (fence post: N spaces = N+1 joists)
  const numJoists = Math.floor(beamLength_in / joistSpacing_in) + 1;

  // Convert point loads to equivalent uniform load
  const beamLength_ft = beamLength_in / FT;
  const uniformLoad_plf = numJoists * joistReaction_lbs / beamLength_ft;

  return { numJoists, uniformLoad_plf, joistReaction_lbs };
}

function calculateMoments(config, loads) {
  const { beamSpan_in, beamCantilever_in } = config;
  const { uniformLoad_plf } = loads;

  // Convert to feet for moment calculations
  const span_ft = beamSpan_in / FT;
  const cantilever_ft = beamCantilever_in / FT;

  // Cantilever moment (negative, at support)
  const cantileverMoment_ftlbs = uniformLoad_plf * Math.pow(cantilever_ft, 2) / 2;

  // Simple span moment for interior span
  const simpleSpanMoment_ftlbs = uniformLoad_plf * Math.pow(span_ft, 2) / 8;

  // For continuous 2-span beam, negative moment at center support governs
  const centerSupportMoment_ftlbs = simpleSpanMoment_ftlbs;

  // Positive moment in span (reduced by continuity ~0.85, minus cantilever benefit)
  const positiveSpanMoment_ftlbs = simpleSpanMoment_ftlbs * 0.85 - cantileverMoment_ftlbs;

  const maxMoment_ftlbs = Math.max(cantileverMoment_ftlbs, centerSupportMoment_ftlbs, positiveSpanMoment_ftlbs);

  return {
    cantileverMoment_ftlbs,
    simpleSpanMoment_ftlbs,
    centerSupportMoment_ftlbs,
    positiveSpanMoment_ftlbs,
    maxMoment_ftlbs,
  };
}

function calculateReactions(config, loads) {
  const { beamSpan_in, beamCantilever_in } = config;
  const { uniformLoad_plf } = loads;

  // Total beam length in feet
  const totalLength_ft = (2 * beamCantilever_in + 2 * beamSpan_in) / FT;
  const totalLoad_lbs = uniformLoad_plf * totalLength_ft;

  // For symmetric continuous beam with cantilevers:
  // End posts carry cantilever load + portion of adjacent span
  // Center post carries most of both spans
  const cantilever_ft = beamCantilever_in / FT;
  const span_ft = beamSpan_in / FT;
  const endPostReaction_lbs = uniformLoad_plf * (cantilever_ft + span_ft * 0.375);
  const centerPostReaction_lbs = totalLoad_lbs - 2 * endPostReaction_lbs;

  return { endPostReaction_lbs, centerPostReaction_lbs, totalLoad_lbs };
}

function checkBending(maxMoment_ftlbs, beam) {
  const { Fb_psi } = MATERIAL;
  const { S_in3 } = beam;

  const allowableMoment_ftlbs = S_in3 * Fb_psi / FT;
  const utilization = maxMoment_ftlbs / allowableMoment_ftlbs;

  return {
    providedS_in3: S_in3,
    allowableMoment_ftlbs,
    utilization,
    passes: utilization <= 1.0,
  };
}

function checkDeflection(config, loads, beam) {
  const { beamSpan_in, deflectionLimit } = config;
  const { uniformLoad_plf } = loads;
  const { I_in4 } = beam;
  const { E_psi } = MATERIAL;

  const w_lbpin = uniformLoad_plf / FT;

  // Two-span continuous beam midspan deflection: δ = wL⁴ / (185·EI)
  const deflection_in = (w_lbpin * Math.pow(beamSpan_in, 4)) / (185 * E_psi * I_in4);
  const allowable_in = beamSpan_in / deflectionLimit;
  const utilization = deflection_in / allowable_in;

  return {
    deflection_in,
    allowable_in,
    utilization,
    passes: utilization <= 1.0,
  };
}

function checkShear(config, loads, beam) {
  const { beamSpan_in } = config;
  const { uniformLoad_plf } = loads;
  const { Fv_psi } = MATERIAL;

  // V_max = 5wL/8 for two-span continuous beam (at center support)
  const w_lbpin = uniformLoad_plf / FT;
  const V_max = 5 * w_lbpin * beamSpan_in / 8;

  const A_in2 = beam.A_in2;
  const fv = 3 * V_max / (2 * A_in2);
  const utilization = fv / Fv_psi;

  return {
    V_max,
    fv,
    allowable: Fv_psi,
    utilization,
    passes: utilization <= 1.0,
  };
}

function analyze(config) {
  const loads = calculateLoads(config);
  const moments = calculateMoments(config, loads);
  const reactions = calculateReactions(config, loads);

  const results = {};
  for (const [key, beam] of Object.entries(BEAM_OPTIONS)) {
    const bending = checkBending(moments.maxMoment_ftlbs, beam);
    const deflection = checkDeflection(config, loads, beam);
    const shear = checkShear(config, loads, beam);

    results[key] = {
      name: beam.name,
      S_in3: beam.S_in3,
      bending,
      deflection,
      shear,
      passes: bending.passes && deflection.passes && shear.passes,
    };
  }

  return { config, loads, moments, reactions, results };
}

// =============================================================================
// OUTPUT
// =============================================================================

function printResults(analysis) {
  const { config, loads, moments, reactions, results } = analysis;

  const span_ft = config.beamSpan_in / FT;
  const cant_ft = config.beamCantilever_in / FT;

  console.log('\nBEAM ANALYSIS (continuous 2-span with cantilevers)');
  console.log('='.repeat(65));

  console.log('\nConfiguration:');
  console.log(`  Spans: ${config.beamSpan_in}" + ${config.beamSpan_in}" | Cantilever: ${config.beamCantilever_in}" each`);
  console.log(`  Posts at: ${cant_ft}', ${cant_ft + span_ft}', ${cant_ft + 2*span_ft}' from end`);

  console.log('\nMaterial (Hem-Fir #2 PT Incised):');
  console.log(`  Fb' = ${MATERIAL.Fb_base_psi} × ${MATERIAL.CD}(CD) × ${MATERIAL.CF_Fb}(CF) × ${MATERIAL.Ci_Fb}(Ci) = ${MATERIAL.Fb_psi.toFixed(0)} psi`);
  console.log(`  Fv' = ${MATERIAL.Fv_base_psi} × ${MATERIAL.Ci_Fv}(Ci) = ${MATERIAL.Fv_psi.toFixed(0)} psi`);
  console.log(`  E'  = ${(MATERIAL.E_base_psi/1e6).toFixed(1)}M × ${MATERIAL.Ci_E}(Ci) = ${(MATERIAL.E_psi/1e6).toFixed(3)}M psi`);
  console.log(`  Composite factor: ${(COMPOSITE_FACTOR * 100).toFixed(0)}% (structural screws)`);

  console.log('\nLoads:');
  console.log(`  ${loads.numJoists} joists × ${loads.joistReaction_lbs.toFixed(0)} lbs = ${loads.uniformLoad_plf.toFixed(0)} plf equiv.`);

  console.log('\nMoments:');
  console.log(`  Cantilever: ${moments.cantileverMoment_ftlbs.toFixed(0)} ft-lbs`);
  console.log(`  Center support: ${moments.centerSupportMoment_ftlbs.toFixed(0)} ft-lbs (governs)`);
  console.log(`  Mid-span: ${moments.positiveSpanMoment_ftlbs.toFixed(0)} ft-lbs`);

  console.log('\nPost reactions:');
  console.log(`  End posts: ${reactions.endPostReaction_lbs.toFixed(0)} lbs each`);
  console.log(`  Center post: ${reactions.centerPostReaction_lbs.toFixed(0)} lbs`);

  console.log('\nResults:');
  console.log('Size        S(in³)  Bending     Shear     Deflection      Status');
  console.log('-'.repeat(65));

  for (const [key, r] of Object.entries(results)) {
    const s = r.S_in3.toFixed(1).padStart(5);
    const bend = `${(r.bending.utilization * 100).toFixed(0)}%`.padStart(4);
    const shear = `${(r.shear.utilization * 100).toFixed(0)}%`.padStart(4);
    const defl = `${(r.deflection.utilization * 100).toFixed(0)}%`.padStart(4);
    const deflIn = r.deflection.deflection_in.toFixed(3);
    const status = r.passes ? '✓' : '✗';
    console.log(`${r.name.padEnd(10)} ${s}   ${bend}       ${shear}     ${defl} (${deflIn}")    ${status}`);
  }

  const passing = Object.entries(results).filter(([k, r]) => r.passes);
  if (passing.length > 0) {
    const min = passing.sort((a, b) => a[1].S_in3 - b[1].S_in3)[0];
    console.log(`\n→ Minimum passing: ${min[1].name}`);
  }
  console.log('');
}

// =============================================================================
// CLI
// =============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    beamSpan_in: DEFAULTS.beamSpan_in,
    beamCantilever_in: DEFAULTS.beamCantilever_in,
    beamLength_in: DEFAULTS.beamLength_in,
    joistSpacing_in: DEFAULTS.joistSpacing_in,
    joistReaction_lbs: 875,  // default from joist analysis (60 psf storage)
    deflectionLimit: DEFAULTS.deflectionLimit,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      console.log(`
Beam Sizing Calculator

Usage: node shed/beam.js [options]

Options (dimensions in inches):
  --span=N        Interior span between posts [${DEFAULTS.beamSpan_in}"]
  --cantilever=N  Cantilever past end posts [${DEFAULTS.beamCantilever_in}"]
  --length=N      Total beam length [${DEFAULTS.beamLength_in}"]
  --load=N        Joist reaction load (lbs) [931]
  --spacing=N     Joist spacing o.c. [${DEFAULTS.joistSpacing_in}"]
  --deflection=N  Deflection limit L/N [${DEFAULTS.deflectionLimit}]

Examples:
  node shed/beam.js                      # default 84" (7') spans
  node shed/beam.js --span=72            # 72" (6') spans
  node shed/beam.js --load=1000          # higher joist loads
`);
      process.exit(0);
    }

    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      const num = parseFloat(value);
      const map = {
        span: 'beamSpan_in',
        cantilever: 'beamCantilever_in',
        length: 'beamLength_in',
        load: 'joistReaction_lbs',
        spacing: 'joistSpacing_in',
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

module.exports = { analyze, calculateLoads, calculateMoments, calculateReactions };
