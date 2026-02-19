#!/usr/bin/env node
/**
 * Queen-Post Truss Structural Analysis
 *
 * Models the truss as pin-connected members and solves for internal forces
 * using the method of joints. Then checks member capacities for the specified
 * lumber sizes.
 *
 * Usage:
 *   node truss.js [options]
 *
 * Options:
 *   --span=<feet>       Truss span (default: 12)
 *   --pitch=<rise/run>  Roof pitch as fraction (default: 0.5 for 6/12)
 *   --spacing=<inches>  Truss spacing o.c. (default: 24)
 *   --snow=<psf>        Snow load on both sides (default: 20)
 *   --snow-south=<psf>  Snow load on south side only (overrides --snow)
 *   --snow-north=<psf>  Snow load on north side only (overrides --snow)
 *   --dead=<psf>        Dead load (default: 10)
 *   --storage=<psf>     Attic storage load on bottom chord (default: 0)
 *   --rafter=<size>     Rafter size: "2x4" or "2x6" (default: "2x4")
 *   --chord=<size>      Bottom chord size (default: "2x4")
 *   --verbose           Show detailed calculations
 *
 * Examples:
 *   node truss.js                           # Symmetric 20 psf snow load
 *   node truss.js --snow-south=50 --snow-north=0   # Asymmetric: 50 psf south, 0 north
 *   node truss.js --snow=30                 # Symmetric 30 psf snow load
 */


// =============================================================================
// MATERIAL PROPERTIES (SPF #2 lumber)
// =============================================================================

const LUMBER = {
  "2x3": { width: 1.5, depth: 2.5, area: 3.75, Sx: 1.56, Ix: 1.95, Fb: 875, Ft: 450, Fc: 1150, E: 1400000 },
  "2x4": { width: 1.5, depth: 3.5, area: 5.25, Sx: 3.06, Ix: 5.36, Fb: 875, Ft: 450, Fc: 1150, E: 1400000 },
  "2x6": { width: 1.5, depth: 5.5, area: 8.25, Sx: 7.56, Ix: 20.80, Fb: 875, Ft: 450, Fc: 1150, E: 1400000 },
  "2x8": { width: 1.5, depth: 7.25, area: 10.88, Sx: 13.14, Ix: 47.63, Fb: 875, Ft: 450, Fc: 1150, E: 1400000 },
  "2x10": { width: 1.5, depth: 9.25, area: 13.88, Sx: 21.39, Ix: 98.93, Fb: 875, Ft: 450, Fc: 1150, E: 1400000 },
  "2x12": { width: 1.5, depth: 11.25, area: 16.88, Sx: 31.64, Ix: 177.98, Fb: 875, Ft: 450, Fc: 1150, E: 1400000 },
};

// =============================================================================
// TRUSS GEOMETRY
// =============================================================================

function defineQueenPostTruss(spanFt, pitch, options = {}) {
  const span = spanFt * 12; // convert to inches
  const rise = (span / 2) * pitch;

  // Queen post depth (board depth visible in side view, e.g. 3.5" for 2x4)
  // All members are coplanar with butt joints sandwiched by plywood gussets,
  // so the SB butts against the QP depth face, not the width face.
  const qpDepth = options.qpDepth || 3.5;

  // Determine queen post inset:
  // - If explicitly specified, use that
  // - If sb-width specified (but not qp-inset), auto-position QPs to fit the SB
  // - Otherwise default to span/3
  let qpInset;
  if (options.qpInset !== undefined) {
    qpInset = options.qpInset;
  } else if (options.sbWidth !== undefined) {
    // SB butts against QP inside depth faces: sbWidth = span - 2*qpInset - qpDepth
    qpInset = (span - options.sbWidth - qpDepth) / 2;
  } else {
    qpInset = span / 3;
  }

  // Straining beam fits between queen post inside depth faces (coplanar butt joints)
  const maxSbWidth = span - 2 * qpInset - qpDepth;
  let sbWidth;
  if (options.sbWidth !== undefined) {
    sbWidth = Math.min(options.sbWidth, maxSbWidth);
    if (options.sbWidth > maxSbWidth) {
      console.log(`  NOTE: Straining beam width clamped from ${options.sbWidth}" to ${maxSbWidth.toFixed(1)}" to fit between queen posts`);
    }
  } else {
    // Default: span between inside faces of queen posts
    sbWidth = maxSbWidth;
  }

  // Height at queen post locations (along the rafter slope)
  const qpHeight = qpInset * pitch;

  // Height at straining beam ends
  const sbInset = (span - sbWidth) / 2;
  const sbHeight = sbInset * pitch;

  // Check if straining beam and queen posts share connection points
  const sbMatchesQP = Math.abs(sbWidth - (span - 2 * qpInset)) < 0.01;

  // Define nodes
  const nodes = {
    A: { x: 0, y: 0, name: 'Left support' },
    B: { x: span, y: 0, name: 'Right support' },
    P: { x: span / 2, y: rise, name: 'Peak' },
  };

  // Queen post bottom nodes (on bottom chord)
  nodes.Q1b = { x: qpInset, y: 0, name: 'QP1 bottom' };
  nodes.Q2b = { x: span - qpInset, y: 0, name: 'QP2 bottom' };

  // Queen post top nodes (on rafter)
  nodes.Q1t = { x: qpInset, y: qpHeight, name: 'QP1 top' };
  nodes.Q2t = { x: span - qpInset, y: qpHeight, name: 'QP2 top' };

  if (!sbMatchesQP) {
    // Straining beam has different connection points
    nodes.S1 = { x: sbInset, y: sbHeight, name: 'SB left' };
    nodes.S2 = { x: span - sbInset, y: sbHeight, name: 'SB right' };
  }

  // Define members
  const members = {};

  // Calculate rafter length (total, from support to peak)
  const rafterLength = Math.sqrt((span/2)**2 + rise**2);
  const rafterAngle = Math.atan(rise / (span/2));

  members.left_rafter = {
    name: 'Left Rafter',
    from: 'A',
    to: 'P',
    length: rafterLength,
    angle: rafterAngle,
    type: 'rafter',
  };

  members.right_rafter = {
    name: 'Right Rafter',
    from: 'P',
    to: 'B',
    length: rafterLength,
    angle: -rafterAngle,
    type: 'rafter',
  };

  members.bottom_chord = {
    name: 'Bottom Chord',
    from: 'A',
    to: 'B',
    length: span,
    angle: 0,
    type: 'bottom_chord',
  };

  members.left_queen_post = {
    name: 'Left Queen Post',
    from: 'Q1b',
    to: 'Q1t',
    length: qpHeight,
    angle: Math.PI / 2,
    type: 'queen_post',
  };

  members.right_queen_post = {
    name: 'Right Queen Post',
    from: 'Q2b',
    to: 'Q2t',
    length: qpHeight,
    angle: Math.PI / 2,
    type: 'queen_post',
  };

  if (sbMatchesQP) {
    members.straining_beam = {
      name: 'Straining Beam',
      from: 'Q1t',
      to: 'Q2t',
      length: sbWidth,
      angle: 0,
      type: 'straining_beam',
    };
  } else {
    members.straining_beam = {
      name: 'Straining Beam',
      from: 'S1',
      to: 'S2',
      length: sbWidth,
      angle: 0,
      type: 'straining_beam',
    };
  }

  return {
    span,
    rise,
    pitch,
    queenPostInset: qpInset,
    queenPostHeight: qpHeight,
    strainingBeamWidth: sbWidth,
    sbMatchesQP,
    rafterLength,
    rafterAngle,
    nodes,
    members,
  };
}

// =============================================================================
// LOAD CALCULATIONS
// =============================================================================

function calculateLoads(truss, spacingInches, snowSouth, snowNorth, deadPsf, storagePsf) {
  const spacingFt = spacingInches / 12;

  // Roof area per side (horizontal projection)
  const roofAreaPerSide = (truss.span / 12 / 2) * spacingFt; // sq ft per side

  // Slope factor (loads are per horizontal sf, but act on sloped surface)
  const slopeFactor = 1 / Math.cos(truss.rafterAngle);

  // Total loads per side
  const loadSouthSide = roofAreaPerSide * (snowSouth + deadPsf);
  const loadNorthSide = roofAreaPerSide * (snowNorth + deadPsf);
  const totalRoofLoad = loadSouthSide + loadNorthSide;

  // Storage load on bottom chord (distributed along span)
  const storageArea = (truss.span / 12) * spacingFt;
  const totalStorageLoad = storageArea * storagePsf;

  const isAsymmetric = Math.abs(snowSouth - snowNorth) > 0.01;

  // Distribute roof loads to nodes
  // For a continuous rafter, loads are distributed based on tributary areas
  // Each half-rafter carries load from support to peak
  // The queen post connection point divides the rafter

  const loads = {};

  // Initialize all nodes with zero loads
  for (const nodeId of Object.keys(truss.nodes)) {
    loads[nodeId] = { Fx: 0, Fy: 0, Fz: 0 };
  }

  // Distribute roof loads to peak and supports (treating rafter as simply supported beam)
  // For south side (left rafter): distributed load from A to P
  // For north side (right rafter): distributed load from P to B

  // Simplified: distribute load to endpoints and intermediate nodes
  const qpInset = truss.queenPostInset;
  const halfSpan = truss.span / 2;

  // Left rafter (south side) - load goes to A, Q1t (if present), and P
  // Tributary lengths along rafter
  const leftTribA = qpInset / Math.cos(truss.rafterAngle); // A to midpoint to Q1t
  const leftTribQ1 = (halfSpan - qpInset) / Math.cos(truss.rafterAngle); // Q1t to midpoint to P
  const leftTotalTrib = leftTribA + leftTribQ1;

  // Load per unit horizontal length (south side)
  const wSouth = loadSouthSide / (halfSpan / 12); // lbs per foot horizontal

  // Distribute south load
  loads.A.Fz -= loadSouthSide * (qpInset / 2) / halfSpan;
  loads.Q1t.Fz -= loadSouthSide * ((qpInset / 2) + (halfSpan - qpInset) / 2) / halfSpan;
  loads.P.Fz -= loadSouthSide * ((halfSpan - qpInset) / 2) / halfSpan;

  // Right rafter (north side) - load goes to P, Q2t (if present), and B
  loads.P.Fz -= loadNorthSide * ((halfSpan - qpInset) / 2) / halfSpan;
  loads.Q2t.Fz -= loadNorthSide * ((qpInset / 2) + (halfSpan - qpInset) / 2) / halfSpan;
  loads.B.Fz -= loadNorthSide * (qpInset / 2) / halfSpan;

  // Distribute storage load to bottom chord nodes
  if (storagePsf > 0) {
    // Bottom chord from A to B, with Q1b and Q2b as intermediate points
    const tribA = qpInset / 2;
    const tribQ1b = qpInset / 2 + (truss.span / 2 - qpInset);
    const tribQ2b = (truss.span / 2 - qpInset) + qpInset / 2;
    const tribB = qpInset / 2;

    const wStorage = totalStorageLoad / truss.span;

    loads.A.Fz -= wStorage * tribA;
    loads.Q1b.Fz -= wStorage * tribQ1b;
    loads.Q2b.Fz -= wStorage * tribQ2b;
    loads.B.Fz -= wStorage * tribB;
  }

  return {
    totalRoofLoad,
    loadSouthSide,
    loadNorthSide,
    totalStorageLoad,
    roofAreaPerSide,
    isAsymmetric,
    snowSouth,
    snowNorth,
    deadPsf,
    storagePsf,
    spacingInches,
    loads,
    wSouthPerFt: wSouth,
    wNorthPerFt: loadNorthSide / (halfSpan / 12),
  };
}

// =============================================================================
// STRUCTURAL ANALYSIS (Method of Joints)
// =============================================================================

function solvetruss(truss, loadData) {
  // For a queen post truss with continuous rafters and bottom chord,
  // we analyze internal member forces using equilibrium

  // First, find support reactions at A and B
  // Sum moments about A to find By
  // Sum moments about B to find Ay

  const span = truss.span;
  let sumMomentA = 0; // Clockwise positive
  let sumFz = 0;

  for (const [nodeId, load] of Object.entries(loadData.loads)) {
    const node = truss.nodes[nodeId];
    sumFz += load.Fz;
    sumMomentA += load.Fz * node.x; // Fz is negative (downward), creates CCW moment
  }

  // Reaction at B (vertical only, assuming A is pinned and B is roller)
  const Rby = -sumMomentA / span;
  const Ray = -(sumFz + Rby);

  console.log("\n--- Support Reactions ---\n");
  console.log(`  Left support (A): ${Ray.toFixed(0)} lbs (up)`);
  console.log(`  Right support (B): ${Rby.toFixed(0)} lbs (up)`);

  // Analyze queen post forces
  // The queen posts carry the load from the rafter connection point down to the bottom chord
  // For vertical equilibrium at Q1t and Q2t

  // At Q1t: Rafter comes in at angle, queen post goes down, (straining beam horizontal if matched)
  // For now, use simplified analysis

  // The queen post force equals the vertical reaction at that point
  // from the rafter analysis

  const forces = {};

  // Rafter as beam analysis
  // Left rafter: supported at A and Q1t (by queen post), loaded uniformly
  // The queen post carries the reaction at Q1t from the rafter

  // For continuous rafters with supports at A, Q1t, P, Q2t, B
  // This is a 3-span continuous beam on each side

  // Simplified: treat each rafter segment as simply supported
  const qpInset = truss.queenPostInset;
  const halfSpan = span / 2;

  // Left rafter segments: A to Q1t, Q1t to P
  const L1 = qpInset / Math.cos(truss.rafterAngle); // length A to Q1t along slope
  const L2 = (halfSpan - qpInset) / Math.cos(truss.rafterAngle); // length Q1t to P

  // Distributed load (vertical) converted to load perpendicular to rafter
  const wSouth = loadData.wSouthPerFt / 12 * Math.cos(truss.rafterAngle); // lbs/in along rafter

  // Reaction at Q1t from left rafter (both segments contribute)
  // For segment A-Q1t: simple beam, reaction at Q1t = wL/2
  // For segment Q1t-P: simple beam, reaction at Q1t = wL/2
  const R_Q1t_fromRafter = (wSouth * L1 / 2) + (wSouth * L2 / 2);

  // Similar for right side
  const wNorth = loadData.wNorthPerFt / 12 * Math.cos(truss.rafterAngle);
  const R_Q2t_fromRafter = (wNorth * L1 / 2) + (wNorth * L2 / 2);

  // Queen post forces (tension, carrying rafter load down)
  // The vertical component of the rafter load at the queen post connection
  forces.left_queen_post = R_Q1t_fromRafter * Math.cos(truss.rafterAngle);
  forces.right_queen_post = R_Q2t_fromRafter * Math.cos(truss.rafterAngle);

  console.log("\n--- Member Forces ---\n");
  console.log(`  Left Queen Post: ${forces.left_queen_post.toFixed(0)} lbs (tension)`);
  console.log(`  Right Queen Post: ${forces.right_queen_post.toFixed(0)} lbs (tension)`);

  // Straining beam force
  // The straining beam prevents the rafters from spreading
  // Horizontal thrust from rafter = vertical load * tan(angle)
  const thrustLeft = (loadData.loadSouthSide / 2) * Math.tan(truss.rafterAngle);
  const thrustRight = (loadData.loadNorthSide / 2) * Math.tan(truss.rafterAngle);

  // The straining beam carries the difference if asymmetric, or the average thrust
  forces.straining_beam = (thrustLeft + thrustRight) / 2;
  console.log(`  Straining Beam: ${forces.straining_beam.toFixed(0)} lbs (compression)`);

  // Bottom chord force
  // The bottom chord carries tension to resist the outward thrust from the rafters
  // At the support, the horizontal reaction must balance the rafter thrust
  forces.bottom_chord = (Ray * Math.tan(truss.rafterAngle) + Rby * Math.tan(truss.rafterAngle)) / 2;
  console.log(`  Bottom Chord: ${forces.bottom_chord.toFixed(0)} lbs (tension)`);

  // Rafter axial force (compression along the slope)
  forces.left_rafter = loadData.loadSouthSide / (2 * Math.sin(truss.rafterAngle + Math.PI/2 - truss.rafterAngle));
  forces.right_rafter = loadData.loadNorthSide / (2 * Math.sin(truss.rafterAngle + Math.PI/2 - truss.rafterAngle));

  // Simplified: axial force = vertical reaction / sin(angle)
  forces.left_rafter = Ray / Math.sin(truss.rafterAngle);
  forces.right_rafter = Rby / Math.sin(truss.rafterAngle);

  console.log(`  Left Rafter (axial): ${Math.abs(forces.left_rafter).toFixed(0)} lbs (compression)`);
  console.log(`  Right Rafter (axial): ${Math.abs(forces.right_rafter).toFixed(0)} lbs (compression)`);

  return {
    reactions: { Ray, Rby, Rax: 0 },
    forces,
  };
}

// =============================================================================
// CAPACITY CHECKS
// =============================================================================

function checkCapacities(truss, forces, memberSizes) {
  console.log("\n--- Member Capacity Checks ---\n");

  const results = {};

  // Calculate max unsupported spans for rafters (for buckling check)
  const qpInset = truss.queenPostInset;
  const halfSpan = truss.span / 2;
  const maxRafterUnsupportedSpan = Math.max(qpInset, halfSpan - qpInset);
  const maxRafterUnsupportedLength = maxRafterUnsupportedSpan / Math.cos(truss.rafterAngle);

  for (const [memberId, member] of Object.entries(truss.members)) {
    const sizeKey = member.type === 'rafter' ? memberSizes.rafter :
                    member.type === 'bottom_chord' ? memberSizes.bottom_chord :
                    member.type === 'queen_post' ? memberSizes.queen_post :
                    memberSizes.straining_beam;

    const lumber = LUMBER[sizeKey];
    if (!lumber) {
      console.log(`  WARNING: Unknown lumber size ${sizeKey} for ${member.name}`);
      continue;
    }

    const force = Math.abs(forces[memberId] || 0);

    // Determine if tension or compression
    let capacity, stressType;
    if (memberId.includes('queen_post')) {
      // Queen posts in tension
      capacity = lumber.Ft * lumber.area;
      stressType = 'tension';
    } else if (memberId.includes('bottom_chord')) {
      // Bottom chord in tension
      capacity = lumber.Ft * lumber.area;
      stressType = 'tension';
    } else if (member.type === 'rafter') {
      // Rafters in compression - braced by roof sheathing, no buckling reduction
      capacity = lumber.Fc * lumber.area;
      stressType = 'compression';
    } else {
      // Straining beam in compression - check for buckling
      const Le = member.length;
      const r = Math.sqrt(lumber.Ix / lumber.area); // radius of gyration
      const slenderness = Le / r;

      // Euler buckling (with safety factor)
      const Fc_buckling = 0.3 * lumber.E / (slenderness ** 2);
      const Fc_eff = Math.min(lumber.Fc, Fc_buckling);

      capacity = Fc_eff * lumber.area;
      stressType = 'compression';
    }

    const utilization = force / capacity;
    const status = utilization <= 1.0 ? 'OK' : 'FAIL';

    results[memberId] = { force, capacity, utilization, status, stressType };

    const utilizationPct = (utilization * 100).toFixed(0);
    console.log(`  ${member.name} (${sizeKey}): ${force.toFixed(0)} / ${capacity.toFixed(0)} lbs = ${utilizationPct}% [${status}]`);
  }

  return results;
}

function checkRafterBending(truss, loadData, rafterSize) {
  console.log("\n--- Rafter Bending Check ---\n");

  const lumber = LUMBER[rafterSize];
  if (!lumber) {
    console.log(`  WARNING: Unknown rafter size ${rafterSize}`);
    return { utilization: 0 };
  }

  // Check the longest unsupported span of the rafter
  // Between A and Q1t, and between Q1t and P
  const qpInset = truss.queenPostInset;
  const halfSpan = truss.span / 2;

  const spanAtoQ1 = qpInset;
  const spanQ1toP = halfSpan - qpInset;
  const maxSpan = Math.max(spanAtoQ1, spanQ1toP);

  // Distributed load (per linear inch of horizontal projection)
  const w = loadData.wSouthPerFt / 12; // lbs per inch

  // Max moment for simply supported beam with uniform load: M = wL^2/8
  const M = w * (maxSpan ** 2) / 8;

  // Allowable bending stress
  const Fb = lumber.Fb;
  const Mr = Fb * lumber.Sx;

  const utilization = M / Mr;
  const status = utilization <= 1.0 ? 'OK' : 'FAIL';

  console.log(`  Max unsupported span: ${maxSpan.toFixed(1)}" (${(maxSpan/12).toFixed(2)} ft)`);
  console.log(`  Distributed load: ${(w * 12).toFixed(1)} lbs/ft`);
  console.log(`  Max bending moment: ${M.toFixed(0)} in-lbs`);
  console.log(`  Allowable moment (${rafterSize}): ${Mr.toFixed(0)} in-lbs`);
  console.log(`  Bending utilization: ${(utilization * 100).toFixed(0)}% [${status}]`);

  return { M, Mr, utilization, status, maxSpan };
}

function checkBottomChordBending(truss, storagePsf, spacingInches, chordSize) {
  if (storagePsf <= 0) {
    return null;
  }

  console.log("\n--- Bottom Chord Bending Check ---\n");

  const lumber = LUMBER[chordSize];
  if (!lumber) {
    console.log(`  WARNING: Unknown chord size ${chordSize}`);
    return { utilization: 0 };
  }

  // Bottom chord spans from A to B with supports at queen post connections
  // Longest span is between Q1b and Q2b (middle section)
  const qpInset = truss.queenPostInset;
  const middleSpan = truss.span - 2 * qpInset;
  const sideSpan = qpInset;
  const maxSpan = Math.max(middleSpan, sideSpan);

  // Distributed load from storage
  const spacingFt = spacingInches / 12;
  const w = storagePsf * spacingFt / 12; // lbs per inch of chord

  // Max moment
  const M = w * (maxSpan ** 2) / 8;

  // Allowable
  const Fb = lumber.Fb;
  const Mr = Fb * lumber.Sx;

  const utilization = M / Mr;
  const status = utilization <= 1.0 ? 'OK' : 'FAIL';

  // Max allowable storage load
  const maxStoragePsf = (Mr * 8 / (maxSpan ** 2)) * 12 / spacingFt;

  console.log(`  Max unsupported span: ${maxSpan.toFixed(1)}" (${(maxSpan/12).toFixed(2)} ft)`);
  console.log(`  Storage load: ${storagePsf} psf`);
  console.log(`  Max bending moment: ${M.toFixed(0)} in-lbs`);
  console.log(`  Allowable moment (${chordSize}): ${Mr.toFixed(0)} in-lbs`);
  console.log(`  Bending utilization: ${(utilization * 100).toFixed(0)}% [${status}]`);

  return { M, Mr, utilization, status, maxSpan, maxStoragePsf };
}

// =============================================================================
// SVG GENERATION
// =============================================================================

function generateTrussSVG(truss, memberSizes) {
  const fs = require('fs');

  const rafterLumber = LUMBER[memberSizes.rafter];
  const chordLumber = LUMBER[memberSizes.bottom_chord];
  const qpLumber = LUMBER[memberSizes.queen_post];
  const sbLumber = LUMBER[memberSizes.straining_beam];

  // Board depths (height when installed on edge)
  const rafterDepth = rafterLumber.depth;
  const chordDepth = chordLumber.depth;
  const qpDepth = qpLumber.depth;
  const sbDepth = sbLumber.depth;

  // Scale and margins (extra space for dimension lines)
  const scale = 4; // pixels per inch
  const marginLeft = 60;
  const marginRight = 120; // extra for rise dimension
  const marginTop = 50;
  const marginBottom = 80; // extra for span dimension

  const svgWidth = truss.span * scale + marginLeft + marginRight;
  const svgHeight = (truss.rise + chordDepth + rafterDepth) * scale + marginTop + marginBottom;

  // Transform: flip Y axis (SVG Y increases down, we want up)
  const tx = (x) => marginLeft + x * scale;
  const ty = (y) => svgHeight - marginBottom - y * scale;

  // Helper to create a board polygon given centerline endpoints and depth
  function boardPolygon(x1, y1, x2, y2, depth, perpOffset = 0) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);

    // Unit perpendicular vector (rotated 90° CCW)
    const px = -dy / len;
    const py = dx / len;

    // Half-depth offset
    const hd = depth / 2;

    // perpOffset shifts the whole board perpendicular to its length
    const ox = px * perpOffset;
    const oy = py * perpOffset;

    return [
      { x: x1 + px * hd + ox, y: y1 + py * hd + oy },  // start, outside edge
      { x: x2 + px * hd + ox, y: y2 + py * hd + oy },  // end, outside edge
      { x: x2 - px * hd + ox, y: y2 - py * hd + oy },  // end, inside edge
      { x: x1 - px * hd + ox, y: y1 - py * hd + oy },  // start, inside edge
    ];
  }

  // Queen post polygon with angled top cut matching rafter slope.
  // Bottom is square, top is cut at the rafter angle so it sits flush.
  // centerX: queen post center x position
  // bottomY: bottom of queen post (top of chord)
  // depth: board depth (e.g. 3.5 for 2x4)
  // rafterHeightAt: function(x) returning rafter bottom-edge height above chord at position x
  function queenPostPolygon(centerX, bottomY, depth, rafterHeightAt) {
    const hd = depth / 2;
    // Bottom corners: square cut
    const blX = centerX - hd;
    const brX = centerX + hd;
    const blY = bottomY;
    const brY = bottomY;
    // Top corners: angled cut following rafter slope
    const tlX = centerX - hd;
    const trX = centerX + hd;
    const tlY = bottomY + rafterHeightAt(tlX);
    const trY = bottomY + rafterHeightAt(trX);
    return [
      { x: trX, y: trY },  // top-right
      { x: tlX, y: tlY },  // top-left
      { x: blX, y: blY },  // bottom-left
      { x: brX, y: brY },  // bottom-right
    ];
  }

  // Rafter polygon with plumb (vertical) end cuts.
  // insideStart/insideEnd define the inside edge (bottom of rafter along the slope).
  // The outside edge is offset perpendicular to the slope by rafterDepth.
  // Ends are cut vertically (plumb cuts) rather than perpendicular to the slope.
  function rafterPolygonPlumbCuts(insideStart, insideEnd, depth) {
    const dx = insideEnd.x - insideStart.x;
    const dy = insideEnd.y - insideStart.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    // Unit perpendicular (points "up" from the rafter - toward outside)
    const px = -dy / len;
    const py = dx / len;
    // Outside edge endpoints (offset perpendicular by full depth)
    const outsideStart = { x: insideStart.x + px * depth, y: insideStart.y + py * depth };
    const outsideEnd = { x: insideEnd.x + px * depth, y: insideEnd.y + py * depth };
    // Now apply plumb cuts: at each end, the cut is vertical.
    // For a plumb cut, both corners at that end share the same x coordinate.
    // The inside point stays fixed; the outside point moves horizontally to match.
    // At start (support end): outside corner moves to x = insideStart.x
    const slopeAngle = Math.atan2(dy, dx);
    // Vertical offset of perpendicular projection
    const vertOffset = depth / Math.cos(slopeAngle);
    const plumbStart = { x: insideStart.x, y: insideStart.y + vertOffset };
    const plumbEnd = { x: insideEnd.x, y: insideEnd.y + vertOffset };
    return [
      { x: plumbStart.x, y: plumbStart.y },  // start, outside (plumb cut)
      { x: plumbEnd.x, y: plumbEnd.y },       // end, outside (plumb cut)
      { x: insideEnd.x, y: insideEnd.y },     // end, inside
      { x: insideStart.x, y: insideStart.y }, // start, inside
    ];
  }

  // Helper to calculate edge length
  function edgeLength(p1, p2) {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  // Helper to get midpoint
  function midpoint(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  }

  // Format dimension as feet-inches
  function formatDim(inches) {
    if (inches >= 12) {
      const ft = Math.floor(inches / 12);
      const inn = inches % 12;
      if (Math.abs(inn) < 0.05) return `${ft}'`;
      return `${ft}'-${inn.toFixed(1)}"`;
    }
    return `${inches.toFixed(1)}"`;
  }

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <style>
    .board { stroke: #8b4513; stroke-width: 1.5; }
    .board-rafter { fill: #deb887; }
    .board-chord { fill: #d2b48c; }
    .board-qp { fill: #c4a574; }
    .board-sb { fill: #b8956e; }
    .dim-line { stroke: #555; stroke-width: 1; marker-end: url(#arrow); marker-start: url(#arrow-start); }
    .dim-tick { stroke: #555; stroke-width: 1; }
    .dim-text { font-family: Arial, sans-serif; font-size: 11px; fill: #333; }
    .dim-text-bg { fill: white; }
    .label { font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; fill: #333; }
    .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #000; }
  </style>
  <defs>
    <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#555"/>
    </marker>
    <marker id="arrow-start" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
      <path d="M6,0 L6,6 L0,3 z" fill="#555"/>
    </marker>
  </defs>

  <!-- Title -->
  <text x="${svgWidth/2}" y="30" class="title" text-anchor="middle">Queen-Post Truss - ${truss.span/12}' Span, ${truss.pitch*12}/12 Pitch</text>
`;

  // Key coordinates (y=0 is bottom of chord)
  const A = { x: 0, y: chordDepth }; // Left support (top of bottom chord)
  const B = { x: truss.span, y: chordDepth }; // Right support
  const P = { x: truss.span / 2, y: truss.rise + chordDepth }; // Peak

  const qpInset = truss.queenPostInset;
  const qpHeight = truss.queenPostHeight;

  // Queen post positions
  const Q1b = { x: qpInset, y: chordDepth };
  const Q2b = { x: truss.span - qpInset, y: chordDepth };
  const Q1t = { x: qpInset, y: qpHeight + chordDepth };
  const Q2t = { x: truss.span - qpInset, y: qpHeight + chordDepth };

  // Straining beam positions
  const sbInset = (truss.span - truss.strainingBeamWidth) / 2;
  const sbHeight = sbInset * truss.pitch + chordDepth;
  const S1 = { x: sbInset, y: sbHeight };
  const S2 = { x: truss.span - sbInset, y: sbHeight };

  // Collect boards with metadata
  const boards = [];

  // Bottom chord
  const chordPoly = boardPolygon(0, chordDepth/2, truss.span, chordDepth/2, chordDepth);
  boards.push({ name: 'Bottom Chord', poly: chordPoly, class: 'board-chord', size: memberSizes.bottom_chord, isAngled: false });

  // Rafters - plumb (vertical) cuts at both ends
  // Inside edge runs along A→P (sits on chord/queen posts), outside edge offset perpendicular
  const leftRafterPoly = rafterPolygonPlumbCuts(A, P, rafterDepth);
  boards.push({ name: 'Left Rafter', poly: leftRafterPoly, class: 'board-rafter', size: memberSizes.rafter, isAngled: true });

  // Right rafter: inside edge from P to B, outside offset points away from building
  const rightRafterPoly = rafterPolygonPlumbCuts(P, B, rafterDepth);
  boards.push({ name: 'Right Rafter', poly: rightRafterPoly, class: 'board-rafter', size: memberSizes.rafter, isAngled: true });

  // Queen posts - angled top cut matching rafter slope
  // Left QP: under left rafter, height = x * pitch
  const qp1Poly = queenPostPolygon(qpInset, chordDepth, qpDepth, (x) => x * truss.pitch);
  boards.push({ name: 'Left QP', poly: qp1Poly, class: 'board-qp', size: memberSizes.queen_post, isAngled: false, isQueenPost: true, side: 'left' });

  // Right QP: under right rafter, height = (span - x) * pitch
  const rightQpX = truss.span - qpInset;
  const qp2Poly = queenPostPolygon(rightQpX, chordDepth, qpDepth, (x) => (truss.span - x) * truss.pitch);
  boards.push({ name: 'Right QP', poly: qp2Poly, class: 'board-qp', size: memberSizes.queen_post, isAngled: false, isQueenPost: true, side: 'right' });

  // Straining beam - top edge flush with rafter inside edge, shifted down by half depth
  const sbPoly = boardPolygon(S1.x, S1.y, S2.x, S2.y, sbDepth, -sbDepth / 2);
  boards.push({ name: 'Straining Beam', poly: sbPoly, class: 'board-sb', size: memberSizes.straining_beam, isAngled: false });

  // Draw all boards
  svg += '\n  <!-- Boards -->\n';
  for (const board of boards) {
    const points = board.poly.map(p => `${tx(p.x).toFixed(1)},${ty(p.y).toFixed(1)}`).join(' ');
    svg += `  <polygon points="${points}" class="board ${board.class}" />\n`;
  }

  // Board labels with dimensions
  svg += '\n  <!-- Board Labels -->\n';
  for (const board of boards) {
    const poly = board.poly;
    const cx = (poly[0].x + poly[1].x + poly[2].x + poly[3].x) / 4;
    const cy = (poly[0].y + poly[1].y + poly[2].y + poly[3].y) / 4;

    if (board.isQueenPost) {
      // Queen post: show longest height and cut angle
      const leftHeight = edgeLength(poly[1], poly[2]);
      const rightHeight = edgeLength(poly[0], poly[3]);
      const longestHeight = Math.max(leftHeight, rightHeight);
      const cutAngleDeg = (truss.rafterAngle * 180 / Math.PI).toFixed(1);

      svg += `  <text x="${tx(cx).toFixed(1)}" y="${ty(cy).toFixed(1)}" class="label" text-anchor="middle" dominant-baseline="middle">${board.size} ${formatDim(longestHeight)}, cut ${cutAngleDeg}\u00B0</text>\n`;

    } else if (board.isAngled) {
      // Rafters: stock length (before plumb cuts) and cut angle
      const edgeLen = edgeLength(poly[0], poly[1]);
      const stockLen = edgeLen + rafterDepth * Math.tan(truss.rafterAngle);
      const cutAngleDeg = (truss.rafterAngle * 180 / Math.PI).toFixed(1);

      // Compute rafter angle for rotated label (use inside edge direction, uphill)
      const dx = poly[3].x - poly[2].x;
      const dy = poly[3].y - poly[2].y;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const textAngle = (angle > 90 || angle < -90) ? angle + 180 : angle;

      svg += `  <text x="${tx(cx).toFixed(1)}" y="${ty(cy).toFixed(1)}" class="label" text-anchor="middle" dominant-baseline="middle" transform="rotate(${-textAngle}, ${tx(cx).toFixed(1)}, ${ty(cy).toFixed(1)})">${board.name} (${board.size}) ${formatDim(stockLen)}, cut ${cutAngleDeg}\u00B0</text>\n`;

    } else {
      // Regular boards (chord, straining beam): center label with edge length
      const len = edgeLength(poly[0], poly[1]);
      svg += `  <text x="${tx(cx).toFixed(1)}" y="${ty(cy).toFixed(1)}" class="label" text-anchor="middle" dominant-baseline="middle">${board.name} (${board.size}) - ${formatDim(len)}</text>\n`;
    }
  }

  // Overall span dimension at bottom
  svg += '\n  <!-- Overall Dimensions -->\n';
  const spanDimY = -15;
  svg += `  <line x1="${tx(0)+10}" y1="${ty(spanDimY)}" x2="${tx(truss.span)-10}" y2="${ty(spanDimY)}" class="dim-line" />\n`;
  svg += `  <line x1="${tx(0)}" y1="${ty(spanDimY-5)}" x2="${tx(0)}" y2="${ty(spanDimY+5)}" class="dim-tick" />\n`;
  svg += `  <line x1="${tx(truss.span)}" y1="${ty(spanDimY-5)}" x2="${tx(truss.span)}" y2="${ty(spanDimY+5)}" class="dim-tick" />\n`;
  svg += `  <text x="${tx(truss.span/2)}" y="${ty(spanDimY)+18}" class="dim-text" text-anchor="middle">Span: ${formatDim(truss.span)}</text>\n`;

  // Rise dimension on right
  const riseDimX = truss.span + 20;
  svg += `  <line x1="${tx(riseDimX)}" y1="${ty(chordDepth)+10}" x2="${tx(riseDimX)}" y2="${ty(truss.rise + chordDepth)-10}" class="dim-line" />\n`;
  svg += `  <line x1="${tx(riseDimX-5)}" y1="${ty(chordDepth)}" x2="${tx(riseDimX+5)}" y2="${ty(chordDepth)}" class="dim-tick" />\n`;
  svg += `  <line x1="${tx(riseDimX-5)}" y1="${ty(truss.rise + chordDepth)}" x2="${tx(riseDimX+5)}" y2="${ty(truss.rise + chordDepth)}" class="dim-tick" />\n`;
  svg += `  <text x="${tx(riseDimX)+15}" y="${ty((truss.rise/2) + chordDepth)}" class="dim-text" dominant-baseline="middle">Rise: ${formatDim(truss.rise)}</text>\n`;

  // Queen post spacing dimension
  const qpDimY = chordDepth + 5;
  svg += `  <text x="${tx(qpInset)}" y="${ty(qpDimY)+15}" class="dim-text" text-anchor="middle">QP @ ${formatDim(qpInset)}</text>\n`;

  svg += '</svg>\n';

  fs.writeFileSync('truss.svg', svg);
  console.log('\n  SVG drawing written to truss.svg');

  return svg;
}

// =============================================================================
// MAIN
// =============================================================================

function parseArgs() {
  const args = {
    span: 12,
    pitch: 0.5,
    spacing: 24,
    snow: 20,
    snowSouth: null,
    snowNorth: null,
    dead: 10,
    storage: 0,
    rafter: "2x4",
    chord: "2x4",
    qpInset: null,  // queen post inset in inches (default: span/3)
    sbWidth: null,  // straining beam width in inches (default: matches qp spacing)
    verbose: false,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--span=')) args.span = parseFloat(arg.split('=')[1]);
    else if (arg.startsWith('--pitch=')) args.pitch = parseFloat(arg.split('=')[1]);
    else if (arg.startsWith('--spacing=')) args.spacing = parseFloat(arg.split('=')[1]);
    else if (arg.startsWith('--snow-south=')) args.snowSouth = parseFloat(arg.split('=')[1]);
    else if (arg.startsWith('--snow-north=')) args.snowNorth = parseFloat(arg.split('=')[1]);
    else if (arg.startsWith('--snow=')) args.snow = parseFloat(arg.split('=')[1]);
    else if (arg.startsWith('--dead=')) args.dead = parseFloat(arg.split('=')[1]);
    else if (arg.startsWith('--storage=')) args.storage = parseFloat(arg.split('=')[1]);
    else if (arg.startsWith('--rafter=')) args.rafter = arg.split('=')[1];
    else if (arg.startsWith('--chord=')) args.chord = arg.split('=')[1];
    else if (arg.startsWith('--qp-inset=')) args.qpInset = parseFloat(arg.split('=')[1]);
    else if (arg.startsWith('--sb-width=')) args.sbWidth = parseFloat(arg.split('=')[1]);
    else if (arg === '--verbose') args.verbose = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`
Queen-Post Truss Structural Analysis

Analyzes a queen-post truss with continuous rafters and bottom chord (solid beams).
Members: two rafters, bottom chord, straining beam, and two queen posts.
All connections are pin joints.

Usage: node truss.js [options]

Options:
  --span=<feet>       Truss span (default: 12)
  --pitch=<rise/run>  Roof pitch as decimal (default: 0.5 for 6/12)
  --spacing=<inches>  Truss spacing o.c. (default: 24)
  --snow=<psf>        Snow load on both sides (default: 20)
  --snow-south=<psf>  Snow load on south slope only (for asymmetric analysis)
  --snow-north=<psf>  Snow load on north slope only (for asymmetric analysis)
  --dead=<psf>        Dead load (default: 10)
  --storage=<psf>     Attic storage load on bottom chord (default: 0)
  --rafter=<size>     Rafter lumber: 2x4, 2x6, 2x8, 2x10, 2x12 (default: 2x4)
  --chord=<size>      Bottom chord lumber (default: 2x4)
  --qp-inset=<inches> Queen post inset from supports (default: span/3)
  --sb-width=<inches> Straining beam width (default: matches queen post spacing)
  --verbose           Show detailed output

Examples:
  node truss.js                                  # Symmetric 20 psf snow
  node truss.js --rafter=2x6 --storage=20        # With storage load
  node truss.js --snow-south=50 --snow-north=0   # Asymmetric: 50 psf south only
  node truss.js --sb-width=48                    # 48" straining beam width
  node truss.js --qp-inset=36 --sb-width=72      # Custom queen post and SB positions
`);
      process.exit(0);
    }
  }

  // If asymmetric snow not specified, use symmetric value
  if (args.snowSouth === null) args.snowSouth = args.snow;
  if (args.snowNorth === null) args.snowNorth = args.snow;

  return args;
}

function main() {
  const args = parseArgs();

  console.log("=".repeat(60));
  console.log("QUEEN-POST TRUSS ANALYSIS");
  console.log("=".repeat(60));

  console.log("\n--- Input Parameters ---\n");
  console.log(`  Span: ${args.span} ft`);
  console.log(`  Pitch: ${args.pitch} (${args.pitch * 12}/12)`);
  console.log(`  Truss spacing: ${args.spacing}" o.c.`);
  if (args.snowSouth === args.snowNorth) {
    console.log(`  Snow load: ${args.snowSouth} psf (symmetric)`);
  } else {
    console.log(`  Snow load (south): ${args.snowSouth} psf`);
    console.log(`  Snow load (north): ${args.snowNorth} psf`);
    console.log(`  *** ASYMMETRIC LOADING ***`);
  }
  console.log(`  Dead load: ${args.dead} psf`);
  console.log(`  Storage load: ${args.storage} psf`);
  console.log(`  Rafter size: ${args.rafter}`);
  console.log(`  Bottom chord size: ${args.chord}`);

  // Define truss geometry with optional queen post inset and straining beam width
  const trussOptions = {};
  if (args.qpInset !== null) trussOptions.qpInset = args.qpInset;
  if (args.sbWidth !== null) trussOptions.sbWidth = args.sbWidth;
  trussOptions.qpDepth = LUMBER[args.chord].depth;

  const truss = defineQueenPostTruss(args.span, args.pitch, trussOptions);

  console.log("\n--- Truss Geometry ---\n");
  console.log(`  Span: ${truss.span}" (${truss.span / 12} ft)`);
  console.log(`  Rise at peak: ${truss.rise.toFixed(1)}"`);
  console.log(`  Queen post inset: ${truss.queenPostInset.toFixed(1)}" from each end`);
  console.log(`  Queen post height: ${truss.queenPostHeight.toFixed(1)}"`);
  console.log(`  Straining beam width: ${truss.strainingBeamWidth.toFixed(1)}"`);
  if (!truss.sbMatchesQP) {
    const sbInset = (truss.span - truss.strainingBeamWidth) / 2;
    console.log(`  Straining beam inset: ${sbInset.toFixed(1)}" from each end`);
    console.log(`  NOTE: Straining beam connects at different points than queen posts`);
  }
  console.log("\n  Members:");
  for (const [id, m] of Object.entries(truss.members)) {
    console.log(`    ${m.name}: ${m.length.toFixed(1)}" (${(m.length / 12).toFixed(2)} ft)`);
  }

  // Calculate loads
  const loadData = calculateLoads(truss, args.spacing, args.snowSouth, args.snowNorth, args.dead, args.storage);

  console.log("\n--- Applied Loads ---\n");
  console.log(`  Total roof load: ${loadData.totalRoofLoad.toFixed(0)} lbs`);
  if (loadData.isAsymmetric) {
    console.log(`    South side: ${loadData.loadSouthSide.toFixed(0)} lbs`);
    console.log(`    North side: ${loadData.loadNorthSide.toFixed(0)} lbs`);
  }
  console.log(`  Roof area per truss: ${(loadData.roofAreaPerSide * 2).toFixed(1)} sf`);
  console.log("\n  Nodal loads:");
  for (const [nodeId, load] of Object.entries(loadData.loads)) {
    if (load.Fz !== 0) {
      console.log(`    ${nodeId}: ${load.Fz.toFixed(0)} lbs (vertical)`);
    }
  }

  // Solve for member forces
  const solution = solvetruss(truss, loadData);

  // Check member capacities
  const memberSizes = {
    rafter: args.rafter,
    bottom_chord: args.chord,
    queen_post: args.chord,
    straining_beam: args.chord,
  };

  const capacityResults = checkCapacities(truss, solution.forces, memberSizes);

  // Check rafter bending
  const rafterBending = checkRafterBending(truss, loadData, args.rafter);

  // Check bottom chord bending (if storage load)
  const chordBending = checkBottomChordBending(truss, args.storage, args.spacing, args.chord);

  // Summary
  console.log("=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));

  let allOk = true;
  for (const [id, result] of Object.entries(capacityResults)) {
    if (result.status !== 'OK') allOk = false;
  }
  if (rafterBending.utilization > 1.0) allOk = false;
  if (chordBending && chordBending.utilization > 1.0) allOk = false;

  console.log(`\n  Overall status: ${allOk ? 'ALL CHECKS PASS' : 'SOME CHECKS FAIL - REVIEW REQUIRED'}\n`);

  if (!allOk) {
    console.log("  Recommendations:");
    if (rafterBending.utilization > 1.0) {
      console.log(`    - Increase rafter size (try --rafter=2x6)`);
    }
    if (chordBending && chordBending.utilization > 1.0) {
      console.log(`    - Reduce storage load or increase bottom chord size`);
    }
  }

  if (chordBending) {
    console.log(`\n  Max storage capacity on bottom chord: ${chordBending.maxStoragePsf.toFixed(0)} psf`);
  }

  // Generate SVG
  generateTrussSVG(truss, memberSizes);
}

main();
