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
const W = 1.5;        // member thickness (X for studs, vertical for rafters/chord)
const D = 5.5;        // member depth (2x6 for all end truss members)
const span = 144;     // truss_span (shed_width)
const overhang = 0;   // truss_overhang (no N/S eave overhang)
const pitch = 6/12;
const halfSpan = span / 2;
const rise = halfSpan * pitch;       // 36
const gap = 0.125;    // board_gap
const gableOverhang = 12;  // gable_overhang
const ewWallStudDepth = 5.5;  // N/S wall stud depth (E/W wall inset)

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
// PEAK STUD Y POSITIONS (16" o.c., aligned with E/W wall studs below)
// ============================================
// E/W wall studs are at Y = ewWallStudDepth + [0, 16, 32, 48, 64, 80, 96, 112, 128, 131.5]
// in shed coordinates. Only include positions where the stud has positive height
// (i.e., the rafter bottom is above the bottom chord top).
function peakStudYPositions() {
  const ewWallLength = span - 2 * ewWallStudDepth;  // 133"
  // E/W wall stud left-face positions in local wall coords
  const wallStudLocalYs = [0];
  for (let y = 16; y < ewWallLength - W; y += 16) {
    wallStudLocalYs.push(y);
  }
  wallStudLocalYs.push(ewWallLength - W);  // end stud

  // Convert to shed Y coords (offset by N/S wall stud depth)
  // Stud center aligns with wall stud center (wall stud left face + stud_depth/2)
  // But peak studs are 1.5" in Y (turned), so center = wall_left_face + W/2
  // For alignment: match the wall stud's left face position
  const shedYLefts = wallStudLocalYs.map(y => ewWallStudDepth + y);

  // Filter to only studs that fit above bottom chord and below rafter
  const positions = [];
  for (const yLeft of shedYLefts) {
    const yCenter = yLeft + D / 2;  // 5.5" wide in Y (flat like wall studs)
    const yRight = yLeft + D;
    const zBottom = D + gap;  // sits on bottom chord top
    // Check height at the shorter edge (farther from peak)
    const shortEdge = Math.abs(yLeft - halfSpan) > Math.abs(yRight - halfSpan) ? yLeft : yRight;
    const zTop = rafterBottomZ(shortEdge) - gap;
    if (zTop - zBottom > 3.5) {  // at least 3.5" of height (worth framing)
      positions.push(yCenter);
    }
  }
  return positions;
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

function extrudeProfile(profile, xWidth = W) {
  const xNeg = -xWidth / 2;
  const xPos = xWidth / 2;
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
// Peak stud: 2x6 laid flat like wall studs — 5.5" in Y, 1.5" in X
function verticalStud(yCenter) {
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
// CUT LIST
// ============================================
function cutList(studYs, southOutriggerYs, northOutriggerYs) {
  const lines = [];
  lines.push('// === CUT LIST (per end truss) ===');

  // Bottom chord (physical length, no rendering gap)
  const bcLen = span;
  lines.push(`// Bottom Chord: 2x6 x ${bcLen.toFixed(2)}" (${toFeetInches(bcLen)})`);

  // Rafters
  const rafterRun = halfSpan + overhang;
  const rafterLen = rafterRun / cosA;
  lines.push(`// South Rafter: 2x6 x ${rafterLen.toFixed(1)}" (${toFeetInches(rafterLen)}) - plumb cuts both ends`);
  lines.push(`// North Rafter: 2x6 x ${rafterLen.toFixed(1)}" (${toFeetInches(rafterLen)}) - plumb cuts both ends`);

  // Fly rafters
  lines.push(`// South Fly Rafter: 2x6 x ${rafterLen.toFixed(1)}" (${toFeetInches(rafterLen)}) - plumb cuts both ends`);
  lines.push(`// North Fly Rafter: 2x6 x ${rafterLen.toFixed(1)}" (${toFeetInches(rafterLen)}) - plumb cuts both ends`);

  // Vertical studs (2x6)
  const studCount = studYs.length;
  const heights = studYs.map(yCenter => {
    const yLeft = yCenter - D / 2;
    return rafterBottomZ(yLeft) - D;
  });
  const minH = Math.min(...heights);
  const maxH = Math.max(...heights);
  lines.push(`// Vertical Studs: ${studCount}x 2x6, heights ${minH.toFixed(1)}" to ${maxH.toFixed(1)}" - angle cut top at ${rafterAngleDeg.toFixed(1)}°`);

  // Individual stud heights
  studYs.forEach((yCenter, i) => {
    const yLeft = yCenter - D / 2;
    const h = rafterBottomZ(yLeft) - D;
    const distFromSouth = yCenter;
    lines.push(`//   Stud ${i}: Y=${distFromSouth.toFixed(1)}" h=${h.toFixed(1)}" (${toFeetInches(h)})`);
  });

  // Outriggers
  const outriggerLen = gableOverhang + 24;
  const totalOutriggers = southOutriggerYs.length + northOutriggerYs.length;
  lines.push(`// Outriggers: ${totalOutriggers}x 2x6 x ${outriggerLen}" (${toFeetInches(outriggerLen)}) - flat in roof plane`);

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
  const studYs = peakStudYPositions();

  console.log(`Peak stud Y centers (shed coords): ${studYs.map(y => y.toFixed(2)).join(', ')}`);
  console.log(`Total peak studs: ${studYs.length}`);

  const members = [];

  // Bottom chord
  members.push(['bottom_chord', bottomChord()]);

  // Rafters
  members.push(['south_rafter', endTrussRafter('south')]);
  members.push(['north_rafter', endTrussRafter('north')]);

  // Fly rafters
  members.push(['south_fly_rafter', flyRafter('south')]);
  members.push(['north_fly_rafter', flyRafter('north')]);

  // Vertical studs (2x6, 16" o.c. aligned with E/W wall studs)
  studYs.forEach((y, i) => {
    members.push([`stud_${i}`, verticalStud(y)]);
  });

  // Build output
  const output = [];
  output.push('// Auto-generated by generate-end-truss-data.js — do not edit by hand');
  output.push('// Run: node tools/generate-end-truss-data.js');
  output.push('');
  output.push(cutList(studYs, [], []));
  output.push('');

  // Stud Y position constants for OpenSCAD
  output.push('// Peak stud Y centers (shed coords, 16" o.c. aligned with E/W wall studs)');
  output.push(`end_truss_stud_ys = [${studYs.map(y => y.toFixed(4)).join(', ')}];`);
  output.push(`end_truss_gable_overhang = ${gableOverhang};`);
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
  for (let i = 0; i < studYs.length; i++) {
    output.push(`    end_truss_stud_${i}();`);
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

  const outPath = path.join(__dirname, '..', 'model', 'end_truss_data.scad');
  fs.writeFileSync(outPath, output.join('\n'));
  console.log(`Wrote ${outPath}`);
  console.log('');
  console.log(cutList(studYs, [], []));
}

generate();
