#!/usr/bin/env node
/**
 * Footing/pier sizing calculator
 *
 * Calculates required pier diameter based on post loads and soil bearing capacity.
 * Accounts for ground slope and post height variations.
 *
 * Usage:
 *   node shed/footing.js                    # default values
 *   node shed/footing.js --load=5000        # specific post load
 *   node shed/footing.js --help
 */

const { FT, DIM, SITE, POSTS, DEFAULTS } = require('./constants');

// =============================================================================
// CALCULATIONS
// =============================================================================

function calculatePierSize(load_lbs, soilBearing_psf) {
  // Required bearing area: A = P / q
  const requiredArea_sqft = load_lbs / soilBearing_psf;

  // For circular pier: A = π r², so d = 2√(A/π)
  const requiredDiameter_in = 2 * Math.sqrt(requiredArea_sqft / Math.PI) * FT;

  // Round up to nearest 2" for practical sizing
  const practicalDiameter_in = Math.ceil(requiredDiameter_in / 2) * 2;

  // Actual capacity with practical diameter
  const actualArea_sqft = Math.PI * Math.pow(practicalDiameter_in / (2 * FT), 2);
  const actualCapacity_lbs = actualArea_sqft * soilBearing_psf;

  return {
    requiredArea_sqft,
    requiredDiameter_in,
    practicalDiameter_in,
    actualArea_sqft,
    actualCapacity_lbs,
    utilization: load_lbs / actualCapacity_lbs,
  };
}

function calculatePostHeight(position_in, groundSlope_in, shedLength_in, baseElevation_in = 0) {
  // Ground drops linearly from east (high) to west (low)
  const dropPerInch = groundSlope_in / shedLength_in;
  const groundLevel_in = -position_in * dropPerInch;

  // Post height = how much to raise beam above ground at this position
  const postHeight_in = -groundLevel_in - baseElevation_in;

  return {
    position_in,
    groundLevel_in,
    postHeight_in: Math.max(0, postHeight_in),
  };
}

function selectPostSize(height_in, load_lbs) {
  const { MATERIAL } = require('./constants');
  const { Fc_psi } = MATERIAL;

  for (const [key, post] of Object.entries(POSTS)) {
    const bearingCapacity_lbs = post.area_in2 * Fc_psi;
    if (bearingCapacity_lbs >= load_lbs) {
      const slenderness = height_in / post.actual_in;
      const isShort = slenderness < 11;

      return {
        size: post.name,
        area_in2: post.area_in2,
        capacity_lbs: bearingCapacity_lbs,
        slenderness,
        isShort,
        adequate: true,
      };
    }
  }

  return { adequate: false };
}

function analyzeAllFootings(config) {
  const {
    cornerLoad_lbs, centerLoad_lbs, soilBearing_psf,
    groundSlope_in, shedLength_in, postPositions
  } = config;

  const footings = [];

  for (const pos of postPositions) {
    const isCenter = pos.isCenter;
    const load_lbs = isCenter ? centerLoad_lbs : cornerLoad_lbs;

    const pier = calculatePierSize(load_lbs, soilBearing_psf);
    const height = calculatePostHeight(pos.x_in, groundSlope_in, shedLength_in);
    const post = height.postHeight_in > 2 ? selectPostSize(height.postHeight_in, load_lbs) : null;

    footings.push({
      position: pos,
      load_lbs,
      pier,
      height,
      post,
      needsPost: height.postHeight_in > 2,
    });
  }

  return footings;
}

// =============================================================================
// OUTPUT
// =============================================================================

function printResults(config, footings) {
  console.log('\nFOOTING ANALYSIS');
  console.log('='.repeat(60));

  console.log('\nDesign Parameters:');
  console.log(`  Soil bearing: ${config.soilBearing_psf} psf`);
  console.log(`  Frost depth: ${SITE.frostDepth_in}" | Min pier depth: ${SITE.minPierDepth_in}"`);
  console.log(`  Ground slope: ${config.groundSlope_in}" over ${config.shedLength_in}" (E→W)`);

  console.log('\nPost Loads:');
  console.log(`  Corner posts: ${config.cornerLoad_lbs.toFixed(0)} lbs`);
  console.log(`  Center posts: ${config.centerLoad_lbs.toFixed(0)} lbs`);

  console.log('\nPier Sizing:');
  console.log('Position     Load    Required   Practical   Capacity');
  console.log('-'.repeat(55));

  for (const f of footings) {
    const label = f.position.label.padEnd(12);
    const load = `${f.load_lbs.toFixed(0)} lbs`.padStart(8);
    const req = `${f.pier.requiredDiameter_in.toFixed(1)}"`.padStart(8);
    const prac = `${f.pier.practicalDiameter_in}"`.padStart(8);
    const cap = `${f.pier.actualCapacity_lbs.toFixed(0)} lbs`.padStart(10);
    console.log(`${label} ${load}  ${req}    ${prac}     ${cap}`);
  }

  console.log('\nPost Heights (due to ground slope):');
  console.log('Position     Ground Level   Post Height   Post Size');
  console.log('-'.repeat(55));

  for (const f of footings) {
    const label = f.position.label.padEnd(12);
    const ground = `${f.height.groundLevel_in.toFixed(1)}"`.padStart(8);
    const height = f.needsPost ? `${f.height.postHeight_in.toFixed(1)}"`.padStart(10) : '   (none)  ';
    const post = f.post ? f.post.size : 'direct to concrete';
    console.log(`${label} ${ground}      ${height}     ${post}`);
  }

  const maxCornerPier_in = Math.max(...footings.filter(f => !f.position.isCenter).map(f => f.pier.practicalDiameter_in));
  const maxCenterPier_in = Math.max(...footings.filter(f => f.position.isCenter).map(f => f.pier.practicalDiameter_in));

  console.log('\nRecommendations:');
  console.log(`  Corner piers: ${maxCornerPier_in}" diameter × ${SITE.minPierDepth_in}" deep`);
  console.log(`  Center piers: ${maxCenterPier_in}" diameter × ${SITE.minPierDepth_in}" deep`);
  console.log('');
}

// =============================================================================
// CLI
// =============================================================================

function parseArgs() {
  const args = process.argv.slice(2);

  // Default post positions (from README: 1', 8', 15' from east edge)
  const defaultPositions = [
    { x_in: 1 * FT,  label: 'East (1\')',   isCenter: false },
    { x_in: 8 * FT,  label: 'Middle (8\')', isCenter: true  },
    { x_in: 15 * FT, label: 'West (15\')',  isCenter: false },
  ];

  const config = {
    cornerLoad_lbs: 3100,
    centerLoad_lbs: 5700,
    soilBearing_psf: SITE.soilBearing_psf,
    groundSlope_in: DEFAULTS.groundSlope_in,
    shedLength_in: DIM.SHED_LENGTH,
    postPositions: defaultPositions,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      console.log(`
Footing/Pier Sizing Calculator

Usage: node shed/footing.js [options]

Options:
  --corner=N     Corner post load (lbs) [3100]
  --center=N     Center post load (lbs) [5700]
  --soil=N       Soil bearing capacity (psf) [${SITE.soilBearing_psf}]
  --slope=N      Ground slope E→W (inches) [${DEFAULTS.groundSlope_in}]

Examples:
  node shed/footing.js                     # default loads
  node shed/footing.js --center=6000       # higher center load
  node shed/footing.js --soil=2000         # better soil
`);
      process.exit(0);
    }

    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      const num = parseFloat(value);
      const map = {
        corner: 'cornerLoad_lbs',
        center: 'centerLoad_lbs',
        soil: 'soilBearing_psf',
        slope: 'groundSlope_in',
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
  const footings = analyzeAllFootings(config);
  printResults(config, footings);
}

module.exports = { calculatePierSize, calculatePostHeight, analyzeAllFootings };
