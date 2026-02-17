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

  const outPath = path.join(__dirname, 'truss_data.scad');
  fs.writeFileSync(outPath, output.join('\n'));
  console.log(`Wrote ${outPath}`);
  console.log('');
  console.log(cutList());
}

generate();
