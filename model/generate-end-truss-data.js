#!/usr/bin/env node
// Generate end truss + ladder framing polyhedron data for OpenSCAD
// End truss replaces queen posts/straining beam with vertical studs under outriggers.
// Outriggers extend 36" in X (24" inside to 12" outside) through the end rafter.
// Usage: node shed/model/generate-end-truss-data.js
// Output: shed/model/end_truss_data.scad

const fs = require('fs');
const path = require('path');

// ============================================
// CONSTANTS (matching generate-truss-data.js)
// ============================================
const W = 1.5;        // truss_member_width (X thickness)
const D = 3.5;        // truss_member_depth (board depth)
const span = 144;     // truss_span (shed_width)
const overhang = 12;  // truss_overhang
const pitch = 6/12;
const halfSpan = span / 2;
const rise = halfSpan * pitch;       // 36
const gap = 0.125;    // board_gap
const gableOverhang = 12;  // gable_overhang

const rafterAngle = Math.atan(pitch);
const rafterAngleDeg = rafterAngle * 180 / Math.PI;
const cosA = Math.cos(rafterAngle);
const sinA = Math.sin(rafterAngle);

// ============================================
// HELPERS
// ============================================
function pt(p) {
  return `[${p.map(v => Number(v.toFixed(4))).join(', ')}]`;
}

function toFeetInches(inches) {
  const ft = Math.floor(inches / 12);
  const rem = inches - ft * 12;
  return `${ft}'-${rem.toFixed(1)}"`;
}

// Rafter bottom Z at a given Y position
function rafterBottomZ(y) {
  const distFromCenter = Math.abs(y - halfSpan);
  return D + rise - distFromCenter * pitch;
}


// ============================================
// OUTRIGGER Y POSITIONS
// ============================================
// Spaced ≤24" OC along the rafter, starting from overhang tip toward peak
function outriggerYPositions(side) {
  // Along-rafter distance from overhang tip to peak
  const alongRafterDist = (halfSpan + overhang) / cosA;
  const numSpaces = Math.ceil(alongRafterDist / 24);
  const actualSpacing = alongRafterDist / numSpaces;

  const positions = [];
  if (side === 'south') {
    // Start from south overhang tip (Y = -overhang), step toward peak
    for (let i = 1; i < numSpaces; i++) {  // skip i=0 (at tip) and i=numSpaces (at peak)
      const yPos = -overhang + i * actualSpacing * cosA;
      positions.push(yPos);
    }
  } else {
    // North: mirror - start from north overhang tip (Y = span + overhang), step toward peak
    for (let i = 1; i < numSpaces; i++) {
      const yPos = span + overhang - i * actualSpacing * cosA;
      positions.push(yPos);
    }
  }
  return positions;
}

// ============================================
// EXTRUDE COMPLEX PROFILE
// ============================================
// Takes a Y-Z profile (array of [y,z] points, CCW viewed from -X) and extrudes in X
// Returns { points, faces } for a polyhedron
function extrudeComplexProfile(profile, xWidth = W) {
  const n = profile.length;
  const xNeg = -xWidth / 2;
  const xPos = xWidth / 2;
  const points = [];

  // Front face (X = -xWidth/2), same winding as profile
  for (const [y, z] of profile) {
    points.push([xNeg, y, z]);
  }
  // Back face (X = +xWidth/2), same winding as profile
  for (const [y, z] of profile) {
    points.push([xPos, y, z]);
  }

  const faces = [];
  // Front face (X=-): vertices 0..n-1, reversed for outward normal toward -X
  faces.push([...Array(n).keys()].reverse());
  // Back face (X=+): vertices n..2n-1, normal toward +X
  faces.push([...Array(n).keys()].map(i => i + n));
  // Side quads connecting front and back
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    // Quad: front[i], front[j], back[j], back[i]
    // For outward normal, winding should be CCW viewed from outside
    faces.push([i, j, j + n, i + n]);
  }

  return { points, faces };
}

// Simple 4-point extrude (same as generate-truss-data.js)
const boxFaces = [
  [0, 1, 2, 3],
  [7, 6, 5, 4],
  [0, 4, 5, 1],
  [2, 6, 7, 3],
  [1, 5, 6, 2],
  [0, 3, 7, 4],
];

function extrudeProfile(profile) {
  const xNeg = -W / 2;
  const xPos = W / 2;
  const points = [];
  for (const [y, z] of profile) {
    points.push([xNeg, y, z]);
  }
  for (const [y, z] of profile) {
    points.push([xPos, y, z]);
  }
  return { points, faces: boxFaces };
}

// ============================================
// BOTTOM CHORD (same as queen-post truss)
// ============================================
function bottomChord() {
  const y0 = gap;
  const y1 = span - gap;
  const profile = [
    [y0, 0],
    [y1, 0],
    [y1, D],
    [y0, D],
  ];
  return extrudeProfile(profile);
}

// ============================================
// END TRUSS RAFTER (simple, un-notched)
// ============================================
function endTrussRafter(side) {
  const isSouth = (side === 'south');
  const yStart = isSouth ? -overhang : halfSpan + gap / 2;
  const yEnd = isSouth ? halfSpan - gap / 2 : span + overhang;

  const plumbTopOffset = D / cosA;

  const profile = [
    [yStart, rafterBottomZ(yStart)],
    [yEnd, rafterBottomZ(yEnd)],
    [yEnd, rafterBottomZ(yEnd) + plumbTopOffset],
    [yStart, rafterBottomZ(yStart) + plumbTopOffset],
  ];
  return extrudeProfile(profile);
}

// ============================================
// FLY RAFTER (at gable overhang edge)
// ============================================
function flyRafter(side) {
  const isSouth = (side === 'south');
  const yStart = isSouth ? -overhang : halfSpan + gap / 2;
  const yEnd = isSouth ? halfSpan - gap / 2 : span + overhang;

  const plumbTopOffset = D / cosA;

  const profile = [
    [yStart, rafterBottomZ(yStart)],
    [yEnd, rafterBottomZ(yEnd)],
    [yEnd, rafterBottomZ(yEnd) + plumbTopOffset],
    [yStart, rafterBottomZ(yStart) + plumbTopOffset],
  ];
  // Fly rafter is at the outer edge of the gable overhang (X = -gableOverhang).
  // ladder_framing() translates to end truss x_pos; mirror handles east end.
  const xCenter = -gableOverhang;
  const xNeg = xCenter - W / 2;
  const xPos = xCenter + W / 2;
  const points = [];
  for (const [y, z] of profile) {
    points.push([xNeg, y, z]);
  }
  for (const [y, z] of profile) {
    points.push([xPos, y, z]);
  }
  return { points, faces: boxFaces };
}

// ============================================
// VERTICAL STUDS (under outriggers)
// ============================================
function verticalStud(yCenter, side) {
  const isSouth = (side === 'south');
  const yLeft = yCenter - D / 2;
  const yRight = yCenter + D / 2;
  const zBottom = D + gap;  // sits on bottom chord top

  // Top meets rafter bottom minus gap
  const zTopLeft = rafterBottomZ(yLeft) - gap;
  const zTopRight = rafterBottomZ(yRight) - gap;

  const profile = [
    [yLeft, zBottom],
    [yRight, zBottom],
    [yRight, zTopRight],
    [yLeft, zTopLeft],
  ];
  return extrudeProfile(profile);
}

// ============================================
// OUTRIGGER (flat 2x4 in roof plane, 36" long in X)
// ============================================
// Outrigger lies in the roof plane: 1.5" thick perpendicular to roof, 3.5" along rafter.
// 36" long in X direction. Top flush with rafter top.
// For end truss at X=0, outrigger extends from X=-gableOverhang to X=+24.
// We generate the outrigger centered at X=0; it will be translated in OpenSCAD.
function outrigger(yPos, side) {
  const xMin = -gableOverhang;
  const xMax = 24;

  const isSouth = (side === 'south');
  const plumbTopOffset = D / cosA;

  // Width in Y: outrigger is 3.5" along rafter slope = 3.5*cosA in Y
  // Shrink by gap on each side for visual clearance
  const yHalf = (D - gap) * cosA / 2;
  const yA = yPos - yHalf;  // south edge of outrigger
  const yB = yPos + yHalf;  // north edge of outrigger

  // Top surface: offset gap below rafter top (perpendicular to roof) for visual clearance
  const gapDy = gap * sinA * (isSouth ? 1 : -1);
  const gapDz = -gap * cosA;
  const zTopA = rafterBottomZ(yA) + plumbTopOffset + gapDz;
  const yTopA = yA + gapDy;
  const zTopB = rafterBottomZ(yB) + plumbTopOffset + gapDz;
  const yTopB = yB + gapDy;

  // Bottom surface is (W - gap) perpendicular to roof below the (gapped) top.
  // This leaves gap at the bottom too.
  const dyThickness = (W - gap) * sinA * (isSouth ? 1 : -1);
  const dzThickness = -(W - gap) * cosA;

  const zBotA = zTopA + dzThickness;
  const yBotA = yTopA + dyThickness;
  const zBotB = zTopB + dzThickness;
  const yBotB = yTopB + dyThickness;

  // 8-point box: 4 points at xMin face, 4 at xMax face
  // Profile at each X face: [yBotA,zBotA], [yBotB,zBotB], [yTopB,zTopB], [yTopA,zTopA] — CCW from -X
  const points = [
    [xMin, yBotA, zBotA], [xMin, yBotB, zBotB], [xMin, yTopB, zTopB], [xMin, yTopA, zTopA],
    [xMax, yBotA, zBotA], [xMax, yBotB, zBotB], [xMax, yTopB, zTopB], [xMax, yTopA, zTopA],
  ];
  return { points, faces: boxFaces };
}

// ============================================
// CUT LIST
// ============================================
function cutList(southOutriggerYs, northOutriggerYs) {
  const lines = [];
  lines.push('// === CUT LIST (per end truss) ===');

  // Bottom chord
  const bcLen = span - 2 * gap;
  lines.push(`// Bottom Chord: 2x4 x ${bcLen.toFixed(2)}" (${toFeetInches(bcLen)})`);

  // Rafters
  const rafterRun = halfSpan + overhang;
  const rafterLen = rafterRun / cosA;
  lines.push(`// South Rafter: 2x4 x ${rafterLen.toFixed(1)}" (${toFeetInches(rafterLen)}) - plumb cuts both ends`);
  lines.push(`// North Rafter: 2x4 x ${rafterLen.toFixed(1)}" (${toFeetInches(rafterLen)}) - plumb cuts both ends`);

  // Fly rafters
  lines.push(`// South Fly Rafter: 2x4 x ${rafterLen.toFixed(1)}" (${toFeetInches(rafterLen)}) - plumb cuts both ends`);
  lines.push(`// North Fly Rafter: 2x4 x ${rafterLen.toFixed(1)}" (${toFeetInches(rafterLen)}) - plumb cuts both ends`);

  // Vertical studs
  const allYs = [...southOutriggerYs, ...northOutriggerYs];
  const studCount = allYs.length;
  // Heights vary; show range
  const heights = allYs.map(y => {
    const yLeft = y - D / 2;
    return rafterBottomZ(yLeft) - gap - (D + gap);
  });
  const minH = Math.min(...heights);
  const maxH = Math.max(...heights);
  lines.push(`// Vertical Studs: ${studCount}x 2x4, heights ${minH.toFixed(1)}" to ${maxH.toFixed(1)}" - angle cut top at ${rafterAngleDeg.toFixed(1)}°`);

  // Outriggers
  const outriggerLen = gableOverhang + 24;
  const totalOutriggers = southOutriggerYs.length + northOutriggerYs.length;
  lines.push(`// Outriggers: ${totalOutriggers}x 2x4 x ${outriggerLen}" (${toFeetInches(outriggerLen)}) - flat in roof plane`);

  return lines.join('\n');
}

// ============================================
// OUTPUT FORMATTING
// ============================================
function formatPolyhedron(name, data) {
  const { points, faces } = data;
  const lines = [];
  lines.push(`module end_truss_${name}() {`);
  lines.push(`    polyhedron(`);
  lines.push(`        points = [`);
  for (let i = 0; i < points.length; i++) {
    const comma = i < points.length - 1 ? ',' : '';
    lines.push(`            ${pt(points[i])}${comma}`);
  }
  lines.push(`        ],`);
  lines.push(`        faces = [`);
  for (let i = 0; i < faces.length; i++) {
    const comma = i < faces.length - 1 ? ',' : '';
    lines.push(`            ${JSON.stringify(faces[i])}${comma}`);
  }
  lines.push(`        ]`);
  lines.push(`    );`);
  lines.push(`}`);
  return lines.join('\n');
}

// ============================================
// MAIN GENERATION
// ============================================
function generate() {
  const southYs = outriggerYPositions('south');
  const northYs = outriggerYPositions('north');

  console.log(`South outrigger Y positions: ${southYs.map(y => y.toFixed(2)).join(', ')}`);
  console.log(`North outrigger Y positions: ${northYs.map(y => y.toFixed(2)).join(', ')}`);

  const members = [];

  // Bottom chord
  members.push(['bottom_chord', bottomChord()]);

  // Rafters
  members.push(['south_rafter', endTrussRafter('south')]);
  members.push(['north_rafter', endTrussRafter('north')]);

  // Fly rafters
  members.push(['south_fly_rafter', flyRafter('south')]);
  members.push(['north_fly_rafter', flyRafter('north')]);

  // Vertical studs - one per outrigger position
  southYs.forEach((y, i) => {
    members.push([`south_stud_${i}`, verticalStud(y, 'south')]);
  });
  northYs.forEach((y, i) => {
    members.push([`north_stud_${i}`, verticalStud(y, 'north')]);
  });

  // Outriggers
  southYs.forEach((y, i) => {
    members.push([`south_outrigger_${i}`, outrigger(y, 'south')]);
  });
  northYs.forEach((y, i) => {
    members.push([`north_outrigger_${i}`, outrigger(y, 'north')]);
  });

  // Build output
  const output = [];
  output.push('// Auto-generated by generate-end-truss-data.js — do not edit by hand');
  output.push('// Run: node shed/model/generate-end-truss-data.js');
  output.push('');
  output.push(cutList(southYs, northYs));
  output.push('');

  // Outrigger Y position constants for OpenSCAD
  output.push('// Outrigger Y positions (for reference)');
  output.push(`end_truss_south_outrigger_ys = [${southYs.map(y => y.toFixed(4)).join(', ')}];`);
  output.push(`end_truss_north_outrigger_ys = [${northYs.map(y => y.toFixed(4)).join(', ')}];`);
  output.push(`end_truss_gable_overhang = ${gableOverhang};`);
  output.push(`end_truss_outrigger_inboard = 24;`);
  output.push('');

  for (const [name, data] of members) {
    output.push(formatPolyhedron(name, data));
    output.push('');
  }

  // Composite module: end_truss_assembly()
  output.push('// Composite end truss assembly (all members)');
  output.push('module end_truss_assembly() {');
  output.push('    end_truss_bottom_chord();');
  output.push('    end_truss_south_rafter();');
  output.push('    end_truss_north_rafter();');
  for (let i = 0; i < southYs.length; i++) {
    output.push(`    end_truss_south_stud_${i}();`);
  }
  for (let i = 0; i < northYs.length; i++) {
    output.push(`    end_truss_north_stud_${i}();`);
  }
  output.push('}');
  output.push('');

  // Composite module: end_truss_outriggers()
  output.push('// All outriggers for one end');
  output.push('module end_truss_outriggers() {');
  for (let i = 0; i < southYs.length; i++) {
    output.push(`    end_truss_south_outrigger_${i}();`);
  }
  for (let i = 0; i < northYs.length; i++) {
    output.push(`    end_truss_north_outrigger_${i}();`);
  }
  output.push('}');
  output.push('');

  // Composite module: fly rafters
  output.push('// Both fly rafters');
  output.push('module end_truss_fly_rafters() {');
  output.push('    end_truss_south_fly_rafter();');
  output.push('    end_truss_north_fly_rafter();');
  output.push('}');
  output.push('');

  const outPath = path.join(__dirname, 'end_truss_data.scad');
  fs.writeFileSync(outPath, output.join('\n'));
  console.log(`Wrote ${outPath}`);
  console.log('');
  console.log(cutList(southYs, northYs));
}

generate();
