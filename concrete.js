#!/usr/bin/env node

// Concrete Volume Calculator for Shed Piers
// 6 piers: 4 corner (BF24 + 10" sonotube) + 2 center (BF28 + 12" sonotube)

/*
Measurements - AS POURED!:
  Middle North pillar 27 in above cone
  Northeast pillar 9 in above cone
  Southeast pillar 13 in above cone
  South pillar 25 in above cone
  Southwest 16 in above cone
  Northwest 10 in above cone
  Northwest 31 in total height
  North 41 in total height
  Northeast 28 and 1/2 in total height
  Southeast 30 and 1/2 in total height
  39 and 1/2 in total height South
  33 and 1/2 in total height Southwest

BF24 dimensions
  12.25" from base to top
  10" dia at top
  24.5" dia at base

BF28 dimensions
  12.25" from base to top
  12.42 dia at top
  28.25 dia at base

*/

// ─── CONFIG ──────────────────────────────────────────────────────────
// Per-pier measurements (all in inches)
// aboveCone = tube height above BigFoot cone
// totalHeight = overall height from ground to top of tube

const piers = [
  // Corner piers (BF24 + 10" sonotube)
  { name: "P1 - NE corner (1' from east)",  bigfoot: "BF24", tubeDia: 10, aboveCone:  9, totalHeight: 28.5 },
  { name: "P3 - NW corner (15' from east)", bigfoot: "BF24", tubeDia: 10, aboveCone: 10, totalHeight: 31   },
  { name: "P4 - SE corner (1' from east)",  bigfoot: "BF24", tubeDia: 10, aboveCone: 13, totalHeight: 30.5 },
  { name: "P6 - SW corner (15' from east)", bigfoot: "BF24", tubeDia: 10, aboveCone: 16, totalHeight: 33.5 },

  // Center piers (BF28 + 12" sonotube)
  { name: "P2 - N center (8' from east)",   bigfoot: "BF28", tubeDia: 12, aboveCone: 27, totalHeight: 41   },
  { name: "P5 - S center (8' from east)",   bigfoot: "BF28", tubeDia: 12, aboveCone: 25, totalHeight: 39.5 },
];

// ─── BIGFOOT FORM SPECS (from CAD drawings) ─────────────────────────
const bigfootSpecs = {
  BF24: { height: 12.25, topDia: 10,    baseDia: 24.5  },
  BF28: { height: 12.25, topDia: 12.42, baseDia: 28.25 },
};

// ─── CALCULATIONS ────────────────────────────────────────────────────
function cylinderVolumeCuFt(diameterIn, heightIn) {
  const radiusIn = diameterIn / 2;
  const volumeIn3 = Math.PI * radiusIn * radiusIn * heightIn;
  return volumeIn3 / 1728; // 1728 in³ per ft³
}

function frustumVolumeCuFt(baseDiaIn, topDiaIn, heightIn) {
  const R = baseDiaIn / 2;
  const r = topDiaIn / 2;
  const volumeIn3 = (Math.PI * heightIn / 3) * (R * R + R * r + r * r);
  return volumeIn3 / 1728;
}

console.log("=== Shed Concrete Volume Calculator ===\n");

let totalCf = 0;

for (const p of piers) {
  const spec = bigfootSpecs[p.bigfoot];
  const belowDepth = p.totalHeight - spec.height - p.aboveCone;
  const bfVol = frustumVolumeCuFt(spec.baseDia, spec.topDia, spec.height);
  const tubeVol = cylinderVolumeCuFt(p.tubeDia, p.aboveCone);
  const belowVol = cylinderVolumeCuFt(spec.baseDia, belowDepth);
  const pierTotal = bfVol + tubeVol + belowVol;
  totalCf += pierTotal;

  console.log(`${p.name}`);
  console.log(`  BigFoot ${p.bigfoot} (frustum):  ${bfVol.toFixed(2)} cf`);
  console.log(`  ${p.tubeDia}" tube × ${p.aboveCone}" tall:   ${tubeVol.toFixed(2)} cf`);
  if (belowDepth > 0) {
    console.log(`  ${spec.baseDia}" cyl × ${belowDepth}" below: ${belowVol.toFixed(2)} cf`);
  }
  console.log(`  Pier total:              ${pierTotal.toFixed(2)} cf`);
  console.log();
}

// Summary
const bags60lb = totalCf / 0.45;  // 60-lb bag ≈ 0.45 cf

console.log("=== TOTALS ===");
console.log(`Total concrete: ${totalCf.toFixed(1)} cubic feet (${(totalCf / 27).toFixed(2)} cubic yards)`);
console.log(`60-lb bags (0.45 cf each): ${Math.ceil(bags60lb)} bags`);
console.log(`\nAdd 10% waste: ${(totalCf * 1.1).toFixed(1)} cf → ${Math.ceil(bags60lb * 1.1)} × 60-lb`);
