#!/usr/bin/env node
// Wall Framing Cut List Generator
// Mirrors the logic in model/walls.scad to produce a printable cut list

const FT = 12;

// Dimensions from dimensions.scad
const shed_length = 16 * FT;        // 192"
const shed_width = 12 * FT;         // 144"
const wall_height = 87.25;
const stud_thickness = 1.5;
const stud_depth = 5.5;
const plate_thickness = 1.5;

// Door
const door_width = 31.5;
const door_height = 76.5;
const door_rough_opening_extra = 1.5;

// Derived
const stud_height = wall_height - 3 * plate_thickness;  // 82.75"
const door_ro_width = door_width + door_rough_opening_extra;  // 33"
const door_ro_height = door_height + 0.75;  // 77.25"
const header_height = stud_depth;  // 5.5"

// ============================================
// WALL DEFINITIONS
// ============================================

function southWall() {
  const length = shed_length;  // 192"
  // 16" o.c. from west end: stud centers at 0.75, 16, 32, ...
  // Left faces at 0, 15.25, 31.25, ... end stud at 190.5
  const studs = [0];
  for (let c = 16; c < length - stud_thickness; c += 16) {
    studs.push(c - stud_thickness / 2);  // left face = center - 0.75
  }
  studs.push(length - stud_thickness);  // end stud

  return {
    name: 'South Wall (16\' / 192", no door)',
    direction: 'West → East',
    plates: [
      { type: 'Bottom plate', size: '2x6', qty: 1, length: length },
      { type: 'Top plate (double)', size: '2x6', qty: 2, length: length },
    ],
    studs: studs.map(x => ({
      type: 'Stud', size: '2x6', qty: 1, length: stud_height,
      note: `x=${x}"`
    })),
    layout: studs.map(x => ({ left: x, right: x + stud_thickness, label: 'stud', height: stud_height })),
  };
}

function northWall() {
  const length = shed_length;
  const door_left = length - 13.5 - door_ro_width;   // 145.5
  const door_right = length - 13.5;                    // 178.5
  const jack_left_x = door_left - stud_thickness;      // 144
  const jack_right_x = door_right;                     // 178.5
  const king_left_x = jack_left_x - stud_thickness;    // 142.5
  const king_right_x = jack_right_x + stud_thickness;  // 180

  const header_z = plate_thickness + door_ro_height;
  const cripple_height = stud_height - door_ro_height - header_height;

  // 16" o.c. from west end, stop before king stud zone
  const west_studs = [0];
  for (let c = 16; c < king_left_x; c += 16) {
    west_studs.push(c - stud_thickness / 2);
  }
  west_studs.push(king_left_x);  // king stud

  const east_studs = [king_right_x, length - stud_thickness];

  const pieces = [];

  // Plates (build full-length, cut out door opening after wall is stood up)
  pieces.push({ type: 'Bottom plate (cut out door after stand-up)', size: '2x6', qty: 1, length: length });
  pieces.push({ type: 'Top plate (double)', size: '2x6', qty: 2, length: length });

  // Full-height studs (west section)
  for (const x of west_studs) {
    pieces.push({ type: 'Stud', size: '2x6', qty: 1, length: stud_height, note: `x=${x}"` });
  }
  // Full-height studs (east section)
  for (const x of east_studs) {
    pieces.push({ type: 'Stud', size: '2x6', qty: 1, length: stud_height, note: `x=${x}"` });
  }

  // Jack studs
  pieces.push({ type: 'Jack stud', size: '2x6', qty: 1, length: door_ro_height, note: `x=${jack_left_x}" (left)` });
  pieces.push({ type: 'Jack stud', size: '2x6', qty: 1, length: door_ro_height, note: `x=${jack_right_x}" (right)` });

  // Header
  pieces.push({ type: 'Door header', size: '2x6 + ½" ply spacer', qty: 1, length: jack_right_x + stud_thickness - jack_left_x, note: 'built-up (2) 2x6 + ½" ply' });

  // Cripple studs
  if (cripple_height > 1) {
    const cripple_positions = [
      jack_left_x,
      door_left + (door_ro_width - stud_thickness) / 2,
      jack_right_x,
    ];
    for (const cx of cripple_positions) {
      pieces.push({ type: 'Cripple stud', size: '2x6', qty: 1, length: cripple_height, note: `x=${cx}"` });
    }
  }

  // Layout: all studs sorted west to east with labels
  const layout = [
    ...west_studs.map(x => ({ left: x, right: x + stud_thickness, label: x === king_left_x ? 'king' : 'stud', height: stud_height })),
    { left: jack_left_x, right: jack_left_x + stud_thickness, label: 'jack', height: door_ro_height },
    // Door R.O. gap
    { left: door_left, right: door_right, label: 'DOOR R.O.' },
    { left: jack_right_x, right: jack_right_x + stud_thickness, label: 'jack', height: door_ro_height },
    ...east_studs.map(x => ({ left: x, right: x + stud_thickness, label: x === king_right_x ? 'king' : 'stud', height: stud_height })),
  ].sort((a, b) => a.left - b.left);

  return {
    name: 'North Wall (16\' / 192", with door)',
    direction: 'West → East',
    pieces,
    layout,
  };
}

function ewWall(label) {
  const length = shed_width - 2 * stud_depth;  // 133"
  const studs = [0];
  for (let c = 16; c < length - stud_thickness; c += 16) {
    studs.push(c - stud_thickness / 2);
  }
  studs.push(length - stud_thickness);

  // NOTE: The 2nd-to-last stud (north end) should NOT be nailed in during
  // wall assembly on the ground. There's no room for a nailgun between the
  // last two studs to secure the E/W wall to the north wall. Instead, leave
  // this stud out during assembly and toenail it into place after the wall
  // is standing and fastened to the north wall.
  const secondToLastIdx = studs.length - 2;
  const secondToLastX = studs[secondToLastIdx];

  return {
    name: `${label} (11\'1" / 133")`,
    direction: 'South → North',
    plates: [
      { type: 'Bottom plate', size: '2x6', qty: 1, length },
      { type: 'Top plate (double)', size: '2x6', qty: 2, length },
    ],
    studs: studs.map((x, i) => ({
      type: 'Stud', size: '2x6', qty: 1, length: stud_height,
      note: `pos=${x}"` + (i === secondToLastIdx ? ' ⚠ INSTALL AFTER WALL IS UP — toenail in place' : '')
    })),
    layout: studs.map((x, i) => ({
      left: x, right: x + stud_thickness,
      label: i === secondToLastIdx ? 'stud ⚠' : 'stud',
      height: stud_height
    })),
  };
}

// ============================================
// FORMAT & PRINT
// ============================================

function fmtLen(inches) {
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  // Show fractional inches
  const whole = Math.floor(rem);
  const frac = rem - whole;
  let fracStr = '';
  if (Math.abs(frac - 0.75) < 0.01) fracStr = '¾';
  else if (Math.abs(frac - 0.5) < 0.01) fracStr = '½';
  else if (Math.abs(frac - 0.25) < 0.01) fracStr = '¼';
  else if (Math.abs(frac - 0.125) < 0.01) fracStr = '⅛';

  const inchPart = fracStr ? `${whole}${fracStr}` : `${rem}`;
  if (ft > 0) return `${ft}'-${inchPart}"`;
  return `${inchPart}"`;
}

function fmtInch(v) {
  const whole = Math.floor(v);
  const frac = v - whole;
  if (Math.abs(frac - 0.75) < 0.01) return `${whole}¾`;
  if (Math.abs(frac - 0.5) < 0.01) return `${whole}½`;
  if (Math.abs(frac - 0.25) < 0.01) return `${whole}¼`;
  if (Math.abs(frac - 0.125) < 0.01) return `${whole}⅛`;
  if (Math.abs(frac) < 0.01) return `${whole}`;
  return `${v}`;
}

function printLayout(wall) {
  if (!wall.layout) return;
  console.log(`  ${wall.direction}:`);
  console.log('  ' + '-'.repeat(40));
  for (const s of wall.layout) {
    const left = fmtInch(s.left).padStart(6);
    const right = fmtInch(s.right).padEnd(6);
    const height = s.height ? ` (${fmtLen(s.height)})` : '';
    console.log(`  ${left} - ${right}  ${s.label}${height}`);
  }
}

function printWall(wall) {
  console.log('');
  console.log('='.repeat(64));
  console.log(`  ${wall.name}`);
  console.log('='.repeat(64));
  console.log('');
  printLayout(wall);
}

// ============================================
// SUMMARY: aggregate by unique (size, length)
// ============================================

function printSummary(walls) {
  const tally = {};
  for (const wall of walls) {
    const all = [...(wall.plates || []), ...(wall.studs || []), ...(wall.pieces || [])];
    for (const p of all) {
      const key = `${p.size || '2x6'}|${p.length}|${p.type.includes('plate') ? 'plate' : p.type.includes('header') ? 'header' : 'stud'}`;
      if (!tally[key]) tally[key] = { size: p.size || '2x6', length: p.length, qty: 0, category: key.split('|')[2] };
      tally[key].qty += p.qty;
    }
  }

  console.log('');
  console.log('='.repeat(64));
  console.log('  LUMBER SUMMARY (all 4 walls)');
  console.log('='.repeat(64));
  console.log('');

  // Group by category
  const entries = Object.values(tally).sort((a, b) => b.length - a.length);

  // Plates
  console.log('  PLATES:');
  for (const e of entries.filter(e => e.category === 'plate')) {
    console.log(`    ${String(e.qty).padStart(3)}x  ${e.size.padEnd(10)}  @ ${fmtLen(e.length)}`);
  }

  // Studs
  console.log('');
  console.log('  STUDS:');
  for (const e of entries.filter(e => e.category === 'stud')) {
    console.log(`    ${String(e.qty).padStart(3)}x  ${e.size.padEnd(10)}  @ ${fmtLen(e.length)}`);
  }

  // Header
  const headers = entries.filter(e => e.category === 'header');
  if (headers.length) {
    console.log('');
    console.log('  HEADERS:');
    for (const e of headers) {
      console.log(`    ${String(e.qty).padStart(3)}x  ${e.size.padEnd(10)}  @ ${fmtLen(e.length)}`);
    }
  }

  // Total 2x6 board-feet
  let totalBF = 0;
  for (const e of entries) {
    // board feet = qty * (nominal_width * nominal_thickness * length_in) / 144
    // For 2x6: 2*6*L/144 = L/12
    const nom = e.size.startsWith('2x6') ? (2 * 6) : 0;
    if (nom) totalBF += e.qty * nom * e.length / 144;
  }
  console.log('');
  console.log(`  Total 2x6 board-feet: ~${Math.ceil(totalBF)} BF`);

  // How many 8' studs vs how many need 10' or 12' stock
  console.log('');
  console.log('  STOCK LENGTHS NEEDED:');
  const stock = { '8ft': 0, '10ft': 0, '12ft': 0, '16ft': 0 };
  for (const e of entries) {
    for (let i = 0; i < e.qty; i++) {
      if (e.length <= 96) stock['8ft']++;
      else if (e.length <= 120) stock['10ft']++;
      else if (e.length <= 144) stock['12ft']++;
      else stock['16ft']++;
    }
  }
  for (const [len, qty] of Object.entries(stock)) {
    if (qty > 0) console.log(`    ${String(qty).padStart(3)}x  2x6 x ${len}`);
  }
}

// ============================================
// MAIN
// ============================================

const south = southWall();
const north = northWall();
const west = ewWall('West Wall');
const east = ewWall('East Wall');

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║            SHED WALL FRAMING — CUT LIST                        ║');
console.log('║            12\' × 16\' Shed, 2×6 walls, 87.25" wall height      ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');

printWall(south);
printWall(north);
printWall(west);
printWall(east);
printSummary([south, north, west, east]);

console.log('');
console.log('NOTES:');
console.log('  - Stud height: ' + fmtLen(stud_height) + ' (wall height minus 3 plates)');
console.log('  - Jack stud height: ' + fmtLen(door_ro_height) + ' (door R.O. height)');
console.log('  - Cripple stud height: ' + fmtLen(stud_height - door_ro_height - header_height));
console.log('  - Header span: ' + fmtLen(door_ro_width + 2 * stud_thickness) + ' (jack-to-jack outer)');
console.log('  - E/W walls are shortened to fit between N/S walls');
console.log('  - ⚠ E/W walls: leave 2nd-to-last stud (north end) OUT during assembly.');
console.log('    Toenail it in after the wall is up — no room for nailgun otherwise.');
console.log('  - Top plates are doubled (qty shown as 2)');
console.log('  - Plates over 8\' will need to be spliced from shorter stock');
console.log('');
