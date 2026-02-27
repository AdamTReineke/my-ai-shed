#!/usr/bin/env node
// Generate truss polyhedron data for OpenSCAD
// Usage: node generate-truss-data.js
// Output: truss_data.scad

const fs = require('fs');
const path = require('path');

// Dimensions (from dimensions.scad)
const W = 1.5;        // truss_member_width (X thickness)
const D = 3.5;        // truss_member_depth (board depth in Y-Z plane)
const span = 144;     // truss_span (shed_width)
const overhang = 12;  // truss_overhang
const pitch = 6/12;   // truss_pitch
const halfSpan = span / 2;           // 72
const rise = halfSpan * pitch;       // 36
const sbWidth = 48;                  // straining_beam_width
const qpInset = (span - sbWidth - D) / 2;  // 46.25
const gap = 0.125;    // board_gap
const gussetThickness = 0.5;  // 1/2" plywood gussets

const rafterAngle = Math.atan(pitch);  // radians
const rafterAngleDeg = rafterAngle * 180 / Math.PI;  // ~26.57°
const cosA = Math.cos(rafterAngle);
const sinA = Math.sin(rafterAngle);

// Helper: format a point array for OpenSCAD
function pt(p) {
  return `[${p.map(v => Number(v.toFixed(4))).join(', ')}]`;
}

// Helper: create a polyhedron from 8 points (rectangular prism)
// Points ordered: bottom face [0-3] CCW from outside, top face [4-7] CCW from outside
// Standard box faces for 8-point prism
const boxFaces = [
  [0, 1, 2, 3],  // bottom (Y-Z face at X=-W/2)
  [7, 6, 5, 4],  // top (Y-Z face at X=+W/2)
  [0, 4, 5, 1],  // front (south)
  [2, 6, 7, 3],  // back (north)
  [1, 5, 6, 2],  // right (top/east in Y-Z)
  [0, 3, 7, 4],  // left (bottom/west in Y-Z)
];

// Build a rectangular prism from 4 Y-Z profile points extruded in X
// profile = [[y0,z0], [y1,z1], [y2,z2], [y3,z3]] - CCW when viewed from -X
function extrudeProfile(profile) {
  const xNeg = -W / 2;
  const xPos = W / 2;
  const points = [];
  // Bottom face (X = -W/2), same winding as profile
  for (const [y, z] of profile) {
    points.push([xNeg, y, z]);
  }
  // Top face (X = +W/2), same winding as profile
  for (const [y, z] of profile) {
    points.push([xPos, y, z]);
  }
  return { points, faces: boxFaces };
}

// ============================================
// BOTTOM CHORD: horizontal, Y=gap to Y=span-gap, Z=0 to Z=D
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
// RAFTERS: plumb cuts at both ends
// A plumb cut is vertical (parallel to Z axis)
// Rafter bottom edge follows roof slope from wall line
// ============================================

// Rafter bottom Z at a given Y position (relative to bottom chord top = D)
function rafterBottomZ(y) {
  // Distance from center
  const distFromCenter = Math.abs(y - halfSpan);
  return D + rise - distFromCenter * pitch;
}

// Rafter top Z at a given Y position
// The top surface is parallel to the bottom, offset perpendicular by D
// In the vertical (Z) direction at the same Y, this becomes D/cosA
// (since the perpendicular offset has a horizontal component too, but
//  at the same Y column the vertical gap is D/cosA only at plumb cuts;
//  along the slope the top edge Y is shifted by -D*sinA for south rafter)
// For clipping purposes we use the top edge line directly:
//   top edge Z(Y) = rafterBottomZ(Y + D*sinA) + D*cosA  (south rafter)
//   top edge Z(Y) = rafterBottomZ(Y - D*sinA) + D*cosA  (north rafter)
function rafterTopZ(y, isSouth) {
  const yShift = isSouth ? D * sinA : -D * sinA;
  return rafterBottomZ(y + yShift) + D * cosA;
}

function southRafter() {
  // From south overhang tip to peak
  // Plumb cut at overhang end (vertical face)
  // Vertical cut at peak so both rafters meet flush
  const yStart = -overhang;
  const yPeak = halfSpan - gap / 2;  // vertical cut face at peak, gap/2 from center

  // Perpendicular offset from bottom edge to top edge of rafter
  const dyPerp = -D * sinA;
  const dzPerp = D * cosA;

  // Bottom edge Z at start and peak
  const zBottomStart = rafterBottomZ(yStart);
  const zBottomPeak = rafterBottomZ(yPeak);

  // Peak end: vertical cut — top point is directly above bottom at same Y
  const zTopPeak = zBottomPeak + D / cosA;  // vertical height of rafter cross-section

  const profile = [
    [yStart, zBottomStart],                          // bottom-south (overhang tip)
    [yPeak, zBottomPeak],                            // bottom-north (peak)
    [yPeak, zTopPeak],                               // top-north (peak, vertical cut)
    [yStart + dyPerp, zBottomStart + dzPerp],        // top-south (overhang tip)
  ];
  return extrudeProfile(profile);
}

function northRafter() {
  const yPeak = halfSpan + gap / 2;  // vertical cut face at peak
  const yEnd = span + overhang;

  // Perpendicular offset (north rafter slopes down toward north)
  const dyPerp = D * sinA;
  const dzPerp = D * cosA;

  const zBottomPeak = rafterBottomZ(yPeak);
  const zBottomEnd = rafterBottomZ(yEnd);

  // Peak end: vertical cut
  const zTopPeak = zBottomPeak + D / cosA;

  const profile = [
    [yPeak, zBottomPeak],                            // bottom-south (peak)
    [yEnd, zBottomEnd],                              // bottom-north (overhang tip)
    [yEnd + dyPerp, zBottomEnd + dzPerp],            // top-north (overhang tip)
    [yPeak, zTopPeak],                               // top-south (peak, vertical cut)
  ];
  return extrudeProfile(profile);
}

// ============================================
// QUEEN POSTS: vertical, sit on bottom chord top (Z=D)
// Top is angled to match rafter slope
// ============================================

function queenPost(yCenter, isSouth) {
  // Queen post is D wide in Y, centered at yCenter
  const yLeft = yCenter - D / 2;
  const yRight = yCenter + D / 2;

  // Bottom: sits on bottom chord + gap
  const zBottom = D + gap;

  // Top: meets rafter bottom, minus gap
  // The rafter bottom Z at each Y edge of the queen post
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

function southQueenPost() {
  return queenPost(qpInset, true);
}

function northQueenPost() {
  return queenPost(span - qpInset, false);
}

// ============================================
// STRAINING BEAM: horizontal between queen post inside faces
// Top edge flush with rafter bottom at SB inset points
// ============================================

function strainingBeam() {
  // SB spans between inside faces of queen posts
  const sbInset = (span - sbWidth) / 2;  // 48
  const yStart = sbInset + gap;
  const yEnd = span - sbInset - gap;

  // Top Z: rafter bottom at SB inset
  const zTop = rafterBottomZ(sbInset);
  const zBottom = zTop - D;

  const profile = [
    [yStart, zBottom],
    [yEnd, zBottom],
    [yEnd, zTop],
    [yStart, zTop],
  ];
  return extrudeProfile(profile);
}

// ============================================
// GUSSET PLATES (1/2" plywood)
// ============================================

// Extrude a polygon profile in X (for gusset plates, which are thinner than lumber)
// Returns TWO polyhedra — one for each side of the truss member
function extrudeGussetProfile(profile) {
  // Gusset pair: one on each side of the 1.5" truss member
  // Centered at X=0 like the truss members (which span -W/2 to +W/2)
  const results = [];
  const sides = [
    { xInner: -W / 2 - gussetThickness, xOuter: -W / 2 },  // near side
    { xInner: W / 2, xOuter: W / 2 + gussetThickness },     // far side
  ];

  for (const { xInner, xOuter } of sides) {
    const points = [];
    const n = profile.length;
    // Inner face (X = xInner)
    for (const [y, z] of profile) {
      points.push([xInner, y, z]);
    }
    // Outer face (X = xOuter)
    for (const [y, z] of profile) {
      points.push([xOuter, y, z]);
    }

    // Build faces for an n-sided prism
    const faces = [];
    // Inner face (CCW when viewed from -X)
    faces.push(Array.from({ length: n }, (_, i) => i));
    // Outer face (reverse winding)
    faces.push(Array.from({ length: n }, (_, i) => 2 * n - 1 - i));
    // Side quads connecting inner and outer
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      faces.push([i, j, n + j, n + i]);
    }

    results.push({ points, faces });
  }
  return results;
}

// Peak gusset: 12" x 12" pentagon centered on peak
// Flat bottom at straining beam bottom, peaked top following roof pitch
function peakGusset() {
  const gussetWidth = 12;
  const halfGusset = gussetWidth / 2;  // 6"

  const yCenter = halfSpan;  // 72"

  // Peak of gusset at rafter top at peak (vertical cut height)
  const zPeak = rafterBottomZ(yCenter) + D / cosA;

  // Bottom at straining beam bottom
  const sbInset = (span - sbWidth) / 2;
  const zSBTop = rafterBottomZ(sbInset);
  const zBottom = zSBTop - D;

  // Sides slope down from peak at roof pitch (6/12)
  // At 6" from center, drop = 6 * pitch = 3"
  const zSide = zPeak - halfGusset * pitch;

  // Pentagon profile (CCW when viewed from -X):
  // bottom-left, bottom-right, right-slope, peak, left-slope
  const profile = [
    [yCenter - halfGusset, zBottom],   // bottom-left
    [yCenter + halfGusset, zBottom],   // bottom-right
    [yCenter + halfGusset, zSide],     // right (north) slope start
    [yCenter, zPeak],                  // peak
    [yCenter - halfGusset, zSide],     // left (south) slope start
  ];
  return extrudeGussetProfile(profile);
}

// Queen post top gusset: 10" x 8" rectangle aligned with roof slope
// Centered on the rafter-queen post joint
// isSouth: true for south queen post (rafter slopes up toward +Y)
function queenPostTopGusset(isSouth) {
  const gussetAlongRafter = 10;  // along the rafter slope
  const gussetPerp = 8;          // perpendicular to rafter slope

  // Queen post center Y
  const yCenter = isSouth ? qpInset : span - qpInset;

  // Joint point: rafter bottom at queen post center
  const zJoint = rafterBottomZ(yCenter);

  // Direction along rafter (unit vector in Y-Z plane)
  // South rafter goes from south toward peak (+Y, +Z)
  // North rafter goes from north toward peak (-Y, +Z)
  const dirY = isSouth ? cosA : -cosA;
  const dirZ = sinA;  // always upward

  // Perpendicular to rafter (pointing away from truss interior = outward from roof)
  const perpY = isSouth ? -sinA : sinA;
  const perpZ = cosA;

  // Center of gusset: offset perpendicular so top edge aligns with rafter top
  // Top edge at perpOffset + hp from rafter bottom = D, so perpOffset = D - hp
  const perpOffset = D - gussetPerp / 2;
  const cy = yCenter + perpOffset * perpY;
  const cz = zJoint + perpOffset * perpZ;

  // Rectangle corners: half-lengths along each axis
  const ha = gussetAlongRafter / 2;
  const hp = gussetPerp / 2;

  // 4 corners: (along, perp) = (-ha,-hp), (+ha,-hp), (+ha,+hp), (-ha,+hp)
  const profile = [
    [cy - ha * dirY - hp * perpY, cz - ha * dirZ - hp * perpZ],
    [cy + ha * dirY - hp * perpY, cz + ha * dirZ - hp * perpZ],
    [cy + ha * dirY + hp * perpY, cz + ha * dirZ + hp * perpZ],
    [cy - ha * dirY + hp * perpY, cz - ha * dirZ + hp * perpZ],
  ];
  return extrudeGussetProfile(profile);
}

function southQueenPostTopGusset() {
  return queenPostTopGusset(true);
}

function northQueenPostTopGusset() {
  return queenPostTopGusset(false);
}

// Queen post bottom gusset: 8" x 10" rectangle (8" horizontal, 10" vertical)
// Bottom aligned with bottom chord bottom, inside edge at queen post inside face
// Extends outward (toward eave) and upward
function queenPostBottomGusset(isSouth) {
  const gussetW = 8;
  const gussetH = 10;

  // Queen post center Y
  const yCenter = isSouth ? qpInset : span - qpInset;

  // Inside face of queen post (toward center of truss)
  const yInside = isSouth ? yCenter + D / 2 : yCenter - D / 2;

  // Gusset extends from inside face toward the eave (outward)
  const yOuter = isSouth ? yInside - gussetW : yInside + gussetW;

  // Bottom at bottom chord bottom (Z=0), top at Z=gussetH
  const zBottom = 0;
  const zTop = gussetH;

  // Profile: rectangle with inside edge at yInside, outer edge at yOuter
  // Order so south gusset goes left-to-right correctly
  const yLeft = Math.min(yInside, yOuter);
  const yRight = Math.max(yInside, yOuter);

  const profile = [
    [yLeft, zBottom],
    [yRight, zBottom],
    [yRight, zTop],
    [yLeft, zTop],
  ];
  return extrudeGussetProfile(profile);
}

function southQueenPostBottomGusset() {
  return queenPostBottomGusset(true);
}

function northQueenPostBottomGusset() {
  return queenPostBottomGusset(false);
}

// Eave gusset: 8" x 10" pentagon at rafter-bottom chord joint
// Bottom aligned with bottom chord bottom, outside edge at bottom chord end
// Extends inward (toward center) and upward, clipped to rafter top surface
function eaveGusset(isSouth) {
  const gussetW = 8;   // horizontal (along bottom chord)
  const gussetH = 10;  // vertical

  // Outside corner of bottom chord
  const yOutside = isSouth ? 0 : span;

  // Gusset extends inward from outside edge
  const yInner = isSouth ? yOutside + gussetW : yOutside - gussetW;

  const yLeft = Math.min(yOutside, yInner);
  const yRight = Math.max(yOutside, yInner);

  const zBottom = 0;

  // Rafter top Z at each edge
  const zRafterLeft = rafterTopZ(yLeft, isSouth);
  const zRafterRight = rafterTopZ(yRight, isSouth);

  // For south eave: yLeft is outside (lower rafter), yRight is inside (higher rafter)
  // For north eave: yRight is outside (lower rafter), yLeft is inside (higher rafter)
  // The outside edge is clipped by the rafter; the inside edge may reach full gussetH

  // Clipped Z at each edge
  const zClipLeft = Math.min(gussetH, zRafterLeft);
  const zClipRight = Math.min(gussetH, zRafterRight);

  // Find Y where rafter top = gussetH (transition from rafter-clipped to flat top)
  // Rafter top is linear between yLeft and yRight
  const slope = (zRafterRight - zRafterLeft) / (yRight - yLeft);
  const yAtGussetH = yLeft + (gussetH - zRafterLeft) / slope;

  if (isSouth && zRafterLeft < gussetH && zRafterRight >= gussetH) {
    // South: left (outside) clipped by rafter, right (inside) at full height
    // Pentagon: bottom-left, bottom-right, flat top at right, transition point, rafter slope to left
    return extrudeGussetProfile([
      [yLeft, zBottom],
      [yRight, zBottom],
      [yRight, gussetH],
      [yAtGussetH, gussetH],
      [yLeft, zClipLeft],
    ]);
  } else if (!isSouth && zRafterRight < gussetH && zRafterLeft >= gussetH) {
    // North: right (outside) clipped by rafter, left (inside) at full height
    return extrudeGussetProfile([
      [yLeft, zBottom],
      [yRight, zBottom],
      [yRight, zClipRight],
      [yAtGussetH, gussetH],
      [yLeft, gussetH],
    ]);
  }

  // Fallback: both clipped — trapezoid
  return extrudeGussetProfile([
    [yLeft, zBottom],
    [yRight, zBottom],
    [yRight, zClipRight],
    [yLeft, zClipLeft],
  ]);
}

function southEaveGusset() {
  return eaveGusset(true);
}

function northEaveGusset() {
  return eaveGusset(false);
}

// ============================================
// CUT LIST
// ============================================

function cutList() {
  const lines = [];
  lines.push('// === CUT LIST (per truss) ===');

  // Bottom chord (physical length, no rendering gap)
  const bcLen = span;
  lines.push(`// Bottom Chord: 2x4 x ${bcLen.toFixed(2)}" (${toFeetInches(bcLen)})`);

  // Rafters (both same length, physical length without rendering gap)
  const rafterRun = halfSpan + overhang;
  const rafterLen = rafterRun / cosA;
  lines.push(`// South Rafter: 2x4 x ${rafterLen.toFixed(1)}" (${toFeetInches(rafterLen)}) - plumb cuts both ends at ${rafterAngleDeg.toFixed(1)}°`);
  lines.push(`// North Rafter: 2x4 x ${rafterLen.toFixed(1)}" (${toFeetInches(rafterLen)}) - plumb cuts both ends at ${rafterAngleDeg.toFixed(1)}°`);

  // Queen posts (measured along longest edge, physical length without rendering gap)
  const qpMaxHeight = rafterBottomZ(qpInset - D/2) - D;
  lines.push(`// South Queen Post: 2x4 x ${qpMaxHeight.toFixed(1)}" (${toFeetInches(qpMaxHeight)}) - angle cut top at ${rafterAngleDeg.toFixed(1)}°`);
  lines.push(`// North Queen Post: 2x4 x ${qpMaxHeight.toFixed(1)}" (${toFeetInches(qpMaxHeight)}) - angle cut top at ${rafterAngleDeg.toFixed(1)}°`);

  // Straining beam (physical length, no rendering gap)
  const sbLen = sbWidth;
  lines.push(`// Straining Beam: 2x4 x ${sbLen.toFixed(2)}" (${toFeetInches(sbLen)})`);

  // Gusset plates
  // Peak gusset dimensions
  const peakGussetWidth = 12;
  const peakGussetZTop = rafterBottomZ(halfSpan) + D / cosA;
  const peakGussetSBInset = (span - sbWidth) / 2;
  const peakGussetZBottom = rafterBottomZ(peakGussetSBInset) - D;
  const peakGussetHeight = peakGussetZTop - peakGussetZBottom;
  lines.push(`// Peak Gusset: 1/2" plywood, ${peakGussetWidth}" x ${peakGussetHeight.toFixed(1)}" pentagon, qty 2 (one each side)`);
  lines.push(`// Queen Post Top Gusset: 1/2" plywood, 10" x 8" rectangle (roof-aligned), qty 4 (2 per joint, 2 joints)`);
  lines.push(`// Queen Post Bottom Gusset: 1/2" plywood, 10" x 8" rectangle, qty 4 (2 per joint, 2 joints)`);
  lines.push(`// Eave Gusset: 1/2" plywood, 10" x 8" rectangle, qty 4 (2 per joint, 2 joints)`);

  return lines.join('\n');
}

function toFeetInches(inches) {
  const ft = Math.floor(inches / 12);
  const rem = inches - ft * 12;
  return `${ft}'-${rem.toFixed(1)}"`;
}

// ============================================
// OUTPUT
// ============================================

function formatPolyhedron(name, data) {
  const { points, faces } = data;
  const lines = [];
  lines.push(`module truss_${name}() {`);
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

function generate() {
  const members = [
    ['bottom_chord', bottomChord()],
    ['south_rafter', southRafter()],
    ['north_rafter', northRafter()],
    ['south_queen_post', southQueenPost()],
    ['north_queen_post', northQueenPost()],
    ['straining_beam', strainingBeam()],
  ];

  // Gusset plates (each returns an array of two polyhedra: near and far side)
  const gussetPairs = [
    ['peak_gusset', peakGusset()],
    ['south_qp_top_gusset', southQueenPostTopGusset()],
    ['north_qp_top_gusset', northQueenPostTopGusset()],
    ['south_qp_bottom_gusset', southQueenPostBottomGusset()],
    ['north_qp_bottom_gusset', northQueenPostBottomGusset()],
    ['south_eave_gusset', southEaveGusset()],
    ['north_eave_gusset', northEaveGusset()],
  ];

  const output = [];
  output.push('// Auto-generated by generate-truss-data.js — do not edit by hand');
  output.push('// Run: node shed/model/generate-truss-data.js');
  output.push('');
  output.push(cutList());
  output.push('');

  for (const [name, data] of members) {
    output.push(formatPolyhedron(name, data));
    output.push('');
  }

  // Gusset modules: each contains two polyhedra (near + far side)
  for (const [name, pair] of gussetPairs) {
    output.push(`module truss_${name}() {`);
    for (let s = 0; s < pair.length; s++) {
      const { points, faces } = pair[s];
      output.push(`    polyhedron(`);
      output.push(`        points = [`);
      for (let i = 0; i < points.length; i++) {
        const comma = i < points.length - 1 ? ',' : '';
        output.push(`            ${pt(points[i])}${comma}`);
      }
      output.push(`        ],`);
      output.push(`        faces = [`);
      for (let i = 0; i < faces.length; i++) {
        const comma = i < faces.length - 1 ? ',' : '';
        output.push(`            ${JSON.stringify(faces[i])}${comma}`);
      }
      output.push(`        ]`);
      output.push(`    );`);
    }
    output.push(`}`);
    output.push('');
  }

  const outPath = path.join(__dirname, '..', 'model', 'truss_data.scad');
  fs.writeFileSync(outPath, output.join('\n'));
  console.log(`Wrote ${outPath}`);
  console.log('');
  console.log(cutList());
}

generate();
