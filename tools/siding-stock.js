#!/usr/bin/env node
// Bin-packs the siding cut list (siding-cuts.tsv) onto stock of a given length,
// accounting for saw kerf, and prints the cutting plan.
//
//   node tools/siding-stock.js 144
//   node tools/siding-stock.js 144 --kerf=0.125 --file=siding-cuts.tsv --json

const fs = require('fs');
const path = require('path');

const KERF_DEFAULT = 0.25;

function parseArgs(argv) {
  const opts = { kerf: KERF_DEFAULT, file: null, json: false, stock: null };
  for (const arg of argv) {
    if (arg === '--json') opts.json = true;
    else if (arg.startsWith('--kerf=')) opts.kerf = parseFraction(arg.slice(7));
    else if (arg.startsWith('--file=')) opts.file = arg.slice(7);
    else if (arg.startsWith('--')) fail(`unknown option: ${arg}`);
    else if (opts.stock === null) opts.stock = parseFraction(arg);
    else fail(`unexpected argument: ${arg}`);
  }
  return opts;
}

// Accepts "144", "144.5", "144 1/2", "1/2"
function parseFraction(str) {
  const s = String(str).trim();
  let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  const n = Number(s);
  if (!Number.isFinite(n)) fail(`cannot parse length: "${str}"`);
  return n;
}

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

// Fields are separated by tabs or spaces: [label] whole [numerator denominator].
// The label is optional (any non-numeric first field); without it the line
// number is the piece number. The fraction is optional; "0 0" means none.
function readCuts(file) {
  const text = fs.readFileSync(file, 'utf8');
  const cuts = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const f = line.trim().split(/[\t ]+/);
    let id;
    if (!/^-?\d+(\.\d+)?$/.test(f[0])) id = f.shift();
    else id = String(i + 1);
    const [whole, num, den] = f;
    if (whole === undefined) fail(`${file}:${i + 1}: missing length`);
    if (f.length > 3) fail(`${file}:${i + 1}: too many fields`);
    // -1 marks a piece that still has to be measured on site; resolveUnknowns
    // fills it in from the rest of its row.
    if (Number(whole) < 0) {
      cuts.push({ id, length: null, unknown: true });
      return;
    }
    const denom = Number(den);
    const length = Number(whole) + (denom ? Number(num) / denom : 0);
    if (!Number.isFinite(length)) fail(`${file}:${i + 1}: bad length`);
    cuts.push({ id, length });
  });
  return cuts;
}

// IDs are <wall letter><row number><piece letter>, e.g. N3A = north wall, row 3.
function parseId(id) {
  const m = /^([A-Za-z]+)(\d+)/.exec(id);
  return m ? { wall: m[1].toUpperCase(), row: Number(m[2]) } : null;
}

// Walls are roughly vertical, so every row on a wall spans the same width. For
// a row holding an unknown piece, the width comes from the widest fully-known
// row on that wall -- widest because a row interrupted by a door or window
// (e.g. north row 1) only covers part of the wall and would under-estimate.
function resolveUnknowns(cuts) {
  const rows = new Map();
  for (const cut of cuts) {
    const p = parseId(cut.id);
    if (!p) continue;
    const key = `${p.wall}${p.row}`;
    if (!rows.has(key)) rows.set(key, { wall: p.wall, cuts: [] });
    rows.get(key).cuts.push(cut);
  }

  // Widest complete row per wall becomes that wall's reference width.
  const widths = new Map();
  for (const row of rows.values()) {
    if (row.cuts.some((c) => c.unknown)) continue;
    const total = row.cuts.reduce((s, c) => s + c.length, 0);
    if (total > (widths.get(row.wall) || 0)) widths.set(row.wall, total);
  }

  const unresolved = [];
  for (const [key, row] of rows) {
    const unknowns = row.cuts.filter((c) => c.unknown);
    if (!unknowns.length) continue;
    const width = widths.get(row.wall);
    const known = row.cuts.filter((c) => !c.unknown).reduce((s, c) => s + c.length, 0);
    if (unknowns.length > 1 || width === undefined || width - known <= 0) {
      unresolved.push(...unknowns);
      continue;
    }
    unknowns[0].length = width - known;
    unknowns[0].estimated = { width, known, row: key };
  }
  return unresolved;
}

// Format inches as whole + 16ths, e.g. 112.5 -> 112-1/2"
function fmt(inches) {
  const sixteenths = Math.round(inches * 16);
  const whole = Math.floor(sixteenths / 16);
  let n = sixteenths % 16;
  if (n === 0) return `${whole}"`;
  let d = 16;
  while (n % 2 === 0) { n /= 2; d /= 2; }
  return `${whole}-${n}/${d}"`;
}

// First-Fit Decreasing: sort longest-first, drop each piece in the first stick
// it fits. Each cut after the first on a stick consumes an extra kerf.
function pack(cuts, stock, kerf) {
  const sorted = [...cuts].sort((a, b) => b.length - a.length);
  const sticks = [];
  const EPS = 1e-9;

  for (const cut of sorted) {
    if (cut.length > stock + EPS) {
      fail(`piece ${cut.id} (${fmt(cut.length)}) is longer than stock (${fmt(stock)})`);
    }
    let placed = false;
    for (const stick of sticks) {
      const need = cut.length + kerf; // kerf for the cut separating it from prior piece
      if (need <= stick.remaining + EPS) {
        stick.pieces.push(cut);
        stick.remaining -= need;
        placed = true;
        break;
      }
    }
    if (!placed) {
      sticks.push({ pieces: [cut], remaining: stock - cut.length });
    }
  }
  return sticks;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.stock === null) {
    console.error('Usage: node tools/siding-stock.js <stock-length-inches> [--kerf=0.25] [--file=siding-cuts.tsv] [--json]');
    process.exit(1);
  }

  const file = opts.file || path.join(__dirname, '..', 'siding-cuts.tsv');
  const allCuts = readCuts(file);
  const unresolved = resolveUnknowns(allCuts);
  const cuts = allCuts.filter((c) => c.length !== null);
  const sticks = pack(cuts, opts.stock, opts.kerf);

  const totalCut = cuts.reduce((s, c) => s + c.length, 0);
  const totalStock = sticks.length * opts.stock;
  const totalWaste = totalStock - totalCut;

  if (opts.json) {
    console.log(JSON.stringify({
      stockLength: opts.stock,
      kerf: opts.kerf,
      pieceCount: cuts.length,
      stickCount: sticks.length,
      totalCutLength: totalCut,
      totalStockLength: totalStock,
      totalWaste,
      yieldPct: (totalCut / totalStock) * 100,
      sticks: sticks.map((s, i) => ({
        stick: i + 1,
        pieces: s.pieces.map((p) => ({
          id: p.id,
          length: p.length,
          ...(p.estimated ? { estimated: p.estimated } : {}),
        })),
        dropoff: s.remaining,
      })),
      unresolved: unresolved.map((c) => c.id),
    }, null, 2));
    return;
  }

  console.log(`Stock length : ${fmt(opts.stock)}`);
  console.log(`Kerf         : ${fmt(opts.kerf)}`);
  console.log(`Pieces       : ${cuts.length}`);
  console.log(`Sticks needed: ${sticks.length}`);
  console.log('');

  sticks.forEach((stick, i) => {
    const parts = stick.pieces
      .map((p) => `(${p.id})  ${fmt(p.length)}${p.estimated ? ' ~est' : ''}`)
      .join('        +   ');
    console.log(`${parts}`);
    // console.log(`          drop-off ${fmt(stick.remaining)}`);
  });

  const estimates = cuts.filter((c) => c.estimated);
  if (estimates.length) {
    console.log('');
    console.log('Estimated (~est) -- verify before cutting:');
    for (const c of estimates) {
      const e = c.estimated;
      console.log(`  ${c.id}  ${fmt(c.length)}   = ${fmt(e.width)} wall - ${fmt(e.known)} known (row ${e.row})`);
    }
  }

  if (unresolved.length) {
    console.log('');
    console.log(`To measure on site (not packed): ${unresolved.map((c) => c.id).join(', ')}`);
  }

  console.log('');
  console.log(`Total cut length : ${fmt(totalCut)}`);
  console.log(`Total stock used : ${fmt(totalStock)}`);
  console.log(`Waste            : ${fmt(totalWaste)} (${(100 - (totalCut / totalStock) * 100).toFixed(1)}%)`);
}

main();
