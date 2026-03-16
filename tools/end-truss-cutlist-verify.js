#!/usr/bin/env node
/**
 * Verify that end truss cut list pieces fit into the planned stock lumber.
 *
 * Imports cut dimensions from generate-end-truss-data.js (the same code that
 * produces the 3D geometry), so there is a single source of truth.
 *
 * Uses a first-fit-decreasing bin-packing algorithm to check whether all
 * cuts for 2 end trusses can be obtained from the specified 2x6 stock.
 */

const { getEndTrussCuts } = require('./generate-end-truss-data');

const KERF = 0.125; // 1/8" blade kerf between cuts on the same board
const NUM_TRUSSES = 2;

// ---------------------------------------------------------------------------
// Stock plan (what we intend to buy)
// ---------------------------------------------------------------------------
const STOCK_PLAN = {
  chords:  { count: 2,  stockLength: 144, label: '2x6×12\'' },
  rafters: { count: 4,  stockLength: 96,  label: '2x6×8\'' },
  studs:   { count: 6,  stockLength: 96,  label: '2x6×8\'' },
};

// ---------------------------------------------------------------------------
// First-fit-decreasing bin packing
// ---------------------------------------------------------------------------
function packCuts(cuts, stockLength, kerf) {
  const sorted = [...cuts].sort((a, b) => b.length - a.length);
  const bins = [];

  for (const cut of sorted) {
    let placed = false;
    for (const bin of bins) {
      const needed = cut.length + (bin.cuts.length > 0 ? kerf : 0);
      if (bin.remaining >= needed) {
        bin.remaining -= needed;
        bin.cuts.push(cut);
        placed = true;
        break;
      }
    }
    if (!placed) {
      bins.push({
        remaining: stockLength - cut.length,
        cuts: [cut],
      });
    }
  }
  return bins;
}

// ---------------------------------------------------------------------------
// Categorize cuts into stock groups
// ---------------------------------------------------------------------------
function categorize(cuts) {
  const groups = { chords: [], rafters: [], studs: [] };
  for (const c of cuts) {
    if (c.name.includes('Chord')) groups.chords.push(c);
    else if (c.name.includes('Rafter')) groups.rafters.push(c);
    else groups.studs.push(c);
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Run verification
// ---------------------------------------------------------------------------
const perTrussCuts = getEndTrussCuts();
const groups = categorize(perTrussCuts);

let allOk = true;

for (const [category, stock] of Object.entries(STOCK_PLAN)) {
  // Duplicate cuts for each truss
  const cuts = [];
  for (let t = 0; t < NUM_TRUSSES; t++) {
    for (const c of groups[category]) {
      cuts.push({ ...c, truss: t + 1 });
    }
  }

  const bins = packCuts(cuts, stock.stockLength, KERF);
  const needed = bins.length;
  const planned = stock.count;
  const ok = needed <= planned;
  if (!ok) allOk = false;

  console.log(`\n=== ${category.toUpperCase()} (${stock.label}) ===`);
  console.log(`  Planned: ${planned} boards   Needed: ${needed} boards   ${ok ? '✓ OK' : '✗ NEED MORE'}`);

  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i];
    const used = stock.stockLength - bin.remaining;
    const pct = ((used / stock.stockLength) * 100).toFixed(1);
    const cutNames = bin.cuts.map(c => `${c.name} (${c.length.toFixed(1)}")`).join(' + ');
    console.log(`  Board ${i + 1}: ${cutNames}`);
    console.log(`          used ${used.toFixed(1)}" / ${stock.stockLength}"  (${pct}%)  waste ${bin.remaining.toFixed(1)}"`);
  }
}

console.log(`\n${allOk ? '✓ All cuts fit within planned stock.' : '✗ Some categories need more lumber — see above.'}\n`);
process.exit(allOk ? 0 : 1);
