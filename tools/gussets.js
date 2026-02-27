#!/usr/bin/env node
// Gusset plate cutting optimizer - packs rectangular pieces onto 4x8' plywood sheets
// Uses a shelf-packing algorithm (Next Fit Decreasing Height)

const SHEET_W = 48; // 4' in inches
const SHEET_H = 96; // 8' in inches

const pieces = [
  { name: '12x20', w: 12, h: 20, qty: 14 },
  { name: '10x8',  w: 10, h:  8, qty: 84 },
];

// Expand into individual pieces, orient so h >= w
const allPieces = [];
for (const p of pieces) {
  for (let i = 0; i < p.qty; i++) {
    const w = Math.min(p.w, p.h);
    const h = Math.max(p.w, p.h);
    allPieces.push({ name: p.name, w, h });
  }
}

// Sort by height descending (NFDH heuristic)
allPieces.sort((a, b) => b.h - a.h || b.w - a.w);

// Pack using shelf algorithm
function packSheets(pieces, sheetW, sheetH) {
  const sheets = [];

  // Each sheet tracks shelves: { y, shelfH, xUsed }
  function newSheet() {
    return { shelves: [], pieces: [] };
  }

  function tryPlace(sheet, piece) {
    // Try to fit on an existing shelf
    for (const shelf of sheet.shelves) {
      if (piece.h <= shelf.shelfH && shelf.xUsed + piece.w <= sheetW) {
        const placed = { name: piece.name, x: shelf.xUsed, y: shelf.y, w: piece.w, h: piece.h };
        shelf.xUsed += piece.w;
        sheet.pieces.push(placed);
        return true;
      }
    }
    // Try rotating on an existing shelf
    if (piece.w !== piece.h) {
      for (const shelf of sheet.shelves) {
        if (piece.w <= shelf.shelfH && shelf.xUsed + piece.h <= sheetW) {
          const placed = { name: piece.name, x: shelf.xUsed, y: shelf.y, w: piece.h, h: piece.w };
          shelf.xUsed += piece.h;
          sheet.pieces.push(placed);
          return true;
        }
      }
    }
    // Open a new shelf
    const usedY = sheet.shelves.reduce((sum, s) => sum + s.shelfH, 0);
    if (usedY + piece.h <= sheetH) {
      const shelf = { y: usedY, shelfH: piece.h, xUsed: piece.w };
      sheet.shelves.push(shelf);
      sheet.pieces.push({ name: piece.name, x: 0, y: usedY, w: piece.w, h: piece.h });
      return true;
    }
    // Try rotated new shelf
    if (piece.w !== piece.h && usedY + piece.w <= sheetH && piece.h <= sheetW) {
      const shelf = { y: usedY, shelfH: piece.w, xUsed: piece.h };
      sheet.shelves.push(shelf);
      sheet.pieces.push({ name: piece.name, x: 0, y: usedY, w: piece.h, h: piece.w });
      return true;
    }
    return false;
  }

  for (const piece of pieces) {
    let placed = false;
    for (const sheet of sheets) {
      if (tryPlace(sheet, piece)) { placed = true; break; }
    }
    if (!placed) {
      const sheet = newSheet();
      if (!tryPlace(sheet, piece)) {
        console.error(`ERROR: piece ${piece.name} (${piece.w}x${piece.h}) doesn't fit on a sheet!`);
        process.exit(1);
      }
      sheets.push(sheet);
    }
  }
  return sheets;
}

const sheets = packSheets(allPieces, SHEET_W, SHEET_H);

// Output
console.log(`Gusset Plate Cut List - 1/2" Plywood (${SHEET_W}"x${SHEET_H}" sheets)`);
console.log(`${'='.repeat(60)}`);
console.log(`Total pieces: ${allPieces.length} (${pieces.map(p => `${p.qty}x ${p.name}`).join(', ')})`);
console.log(`Sheets required: ${sheets.length}`);
console.log();

for (let i = 0; i < sheets.length; i++) {
  const sheet = sheets[i];
  const counts = {};
  for (const p of sheet.pieces) {
    counts[p.name] = (counts[p.name] || 0) + 1;
  }
  const usedArea = sheet.pieces.reduce((sum, p) => sum + p.w * p.h, 0);
  const util = ((usedArea / (SHEET_W * SHEET_H)) * 100).toFixed(1);

  console.log(`Sheet ${i + 1}  (${util}% utilization)`);
  console.log(`  Summary: ${Object.entries(counts).map(([n, c]) => `${c}x ${n}`).join(', ')}`);
  console.log(`  Layout:`);
  for (const p of sheet.pieces) {
    console.log(`    ${p.name.padEnd(6)} at (${String(p.x).padStart(2)}, ${String(p.y).padStart(2)})  cut ${p.w}"x${p.h}"`);
  }
  console.log();
}

// Waste summary
const totalArea = sheets.length * SHEET_W * SHEET_H;
const usedArea = allPieces.reduce((sum, p) => sum + p.w * p.h, 0);
const wasteArea = totalArea - usedArea;
console.log(`${'='.repeat(60)}`);
console.log(`Total sheet area: ${(totalArea / 144).toFixed(1)} sq ft`);
console.log(`Used area:        ${(usedArea / 144).toFixed(1)} sq ft`);
console.log(`Waste:            ${(wasteArea / 144).toFixed(1)} sq ft (${((wasteArea / totalArea) * 100).toFixed(1)}%)`);
