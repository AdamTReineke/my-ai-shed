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

// TSV columns: whole inches, numerator, denominator. A leading piece-number
// column is optional; without it the line number is the piece number.
function readCuts(file) {
  const text = fs.readFileSync(file, 'utf8');
  const cuts = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const f = line.split('\t').map((s) => s.trim());
    let id, whole, num, den;
    if (f.length >= 4) [id, whole, num, den] = f;
    else if (f.length === 3) { [whole, num, den] = f; id = String(i + 1); }
    else fail(`${file}:${i + 1}: expected 3 or 4 tab-separated fields`);
    const denom = Number(den);
    const length = Number(whole) + (denom ? Number(num) / denom : 0);
    if (!Number.isFinite(length)) fail(`${file}:${i + 1}: bad length`);
    cuts.push({ id, length });
  });
  return cuts;
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
  const cuts = readCuts(file);
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
        pieces: s.pieces.map((p) => ({ id: p.id, length: p.length })),
        dropoff: s.remaining,
      })),
    }, null, 2));
    return;
  }

  console.log(`Stock length : ${fmt(opts.stock)}`);
  console.log(`Kerf         : ${fmt(opts.kerf)}`);
  console.log(`Pieces       : ${cuts.length}`);
  console.log(`Sticks needed: ${sticks.length}`);
  console.log('');

  sticks.forEach((stick, i) => {
    const parts = stick.pieces.map((p) => `#${p.id} ${fmt(p.length)}`).join(' + ');
    console.log(`Stick ${String(i + 1).padStart(2)}: ${parts}`);
    console.log(`          drop-off ${fmt(stick.remaining)}`);
  });

  console.log('');
  console.log(`Total cut length : ${fmt(totalCut)}`);
  console.log(`Total stock used : ${fmt(totalStock)}`);
  console.log(`Waste            : ${fmt(totalWaste)} (${(100 - (totalCut / totalStock) * 100).toFixed(1)}%)`);
}

main();
