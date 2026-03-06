#!/usr/bin/env node
// siding-cuts.js — Compute individual HardiePlank siding pieces for all four walls.
// Outputs a human-readable cut list and an OpenSCAD data file (siding_data.scad).
//
// Usage:
//   node tools/siding-cuts.js            # print cut list
//   node tools/siding-cuts.js --json     # JSON output
//   node tools/siding-cuts.js --scad     # write siding_data.scad (default: also writes)

const fs = require("fs");
const path = require("path");

// ============================================
// DIMENSIONS (from 5-wall-layers.md)
// ============================================
const PLANK_STOCK = 144;        // 12' HardiePlank
const EXPOSURE = 6.25;          // course exposure
const PLANK_HEIGHT = 8.25;      // full plank height
const WALL_HT = 96;             // 8' walls
const CORNER_GAP = 0.125;       // 1/8" inset from corner for aluminum trim
const BUTT_GAP = 0.125;         // 1/8" gap at butt joints
const SIDING_THICK = 5 / 16;
const OSB_THICK = 7 / 16;
const FURRING_THICK = 0.75;
const STUD_DEPTH = 5.5;

const SHED_LENGTH = 192;
const SHED_WIDTH = 144;

// Door rough opening on north wall
const DOOR_RO_WIDTH = 31.5 + 1.5;   // 33"
const DOOR_RO_LEFT = SHED_LENGTH - 13.5 - DOOR_RO_WIDTH;  // 145.5"
const DOOR_RO_RIGHT = SHED_LENGTH - 13.5;                  // 178.5"
const DOOR_RO_TOP = 76.5 + 1.5;     // 78"

// Siding plane lengths
// E/W wraps from S furring outer face to N furring outer face,
// covering N/S wall buildup (osb + furring + siding on each side)
const NS_SIDING_LENGTH = SHED_LENGTH;  // 192"
const EW_SIDING_LENGTH = SHED_WIDTH + 2 * (OSB_THICK + FURRING_THICK + SIDING_THICK);  // 147"

// Stud positions (furring strip locations) — X from wall left edge
const SOUTH_STUDS = [0, 15.25, 31.25, 47.25, 63.25, 79.25, 95.25, 111.25, 127.25, 143.25, 159.25, 175.25, 190.5];
const NORTH_STUDS = [0, 15.25, 31.25, 47.25, 63.25, 79.25, 95.25, 111.25, 127.25, 142.5, 144, 178.5, 180, 190.5];

// E/W walls: stud positions in cladding local coords
// Local 0 = south siding outer face. Studs start after osb+furring+siding+stud buildup.
const EW_CLADDING_OFFSET = OSB_THICK + FURRING_THICK + SIDING_THICK + STUD_DEPTH;
const EW_STUDS_LOCAL = [];
{
  const ew_framing_length = SHED_WIDTH - 2 * STUD_DEPTH;  // 133"
  // Stud positions within the framing (from walls.scad)
  const framing_studs = [0, 16, 32, 48, 64, 80, 96, 112, 128, ew_framing_length - 1.5];
  for (const s of framing_studs) {
    EW_STUDS_LOCAL.push(s + EW_CLADDING_OFFSET);
  }
}

const NUM_COURSES = Math.ceil(WALL_HT / EXPOSURE);  // 16

// ============================================
// PLANK COMPUTATION
// ============================================

function nearestStud(studs, targetX) {
  // Find the stud whose center is closest to targetX.
  // Return the stud left-edge X (butt joint lands centered on stud).
  let best = studs[0];
  let bestDist = Infinity;
  for (const s of studs) {
    const center = s + 1.5 / 2;  // stud center
    const d = Math.abs(center - targetX);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best;
}

function computeCourses(wallId, wallLength, studs, doorLeft, doorRight, doorTop) {
  const hasDoor = doorLeft >= 0;
  const pieces = [];

  // Usable siding span (after corner gaps)
  const leftEdge = CORNER_GAP;
  const rightEdge = wallLength - CORNER_GAP;
  const span = rightEdge - leftEdge;

  // Find all valid joint positions (must be on a stud center, both pieces <= PLANK_STOCK)
  const candidates = [];
  for (const s of studs) {
    const jointX = s + 1.5 / 2;  // stud center
    const leftPiece = jointX - BUTT_GAP / 2 - leftEdge;
    const rightPiece = rightEdge - (jointX + BUTT_GAP / 2);
    if (leftPiece > 0 && leftPiece <= PLANK_STOCK && rightPiece > 0 && rightPiece <= PLANK_STOCK) {
      candidates.push({ studX: s, jointCenter: jointX });
    }
  }

  // Build a stagger sequence: greedily pick joints that are >= 24" from the
  // previous course's joint, cycling through all candidates for visual variety.
  // Sort candidates by position for deterministic ordering.
  candidates.sort((a, b) => a.jointCenter - b.jointCenter);

  // Assign a joint to each course, ensuring 24" min stagger from the previous course
  const courseJoints = [];  // index into candidates per course
  let prevJointX = -Infinity;
  let candidateIdx = 0;
  for (let course = 0; course < NUM_COURSES; course++) {
    if (candidates.length === 0) {
      courseJoints.push(null);
      continue;
    }
    // Find next candidate that's >= 24" away from previous joint
    let found = false;
    for (let tries = 0; tries < candidates.length; tries++) {
      const idx = (candidateIdx + tries) % candidates.length;
      if (Math.abs(candidates[idx].jointCenter - prevJointX) >= 24) {
        courseJoints.push(candidates[idx]);
        prevJointX = candidates[idx].jointCenter;
        candidateIdx = (idx + 1) % candidates.length;  // advance past this one
        found = true;
        break;
      }
    }
    if (!found) {
      // All candidates are within 24" of prev — just advance to next one
      courseJoints.push(candidates[candidateIdx]);
      prevJointX = candidates[candidateIdx].jointCenter;
      candidateIdx = (candidateIdx + 1) % candidates.length;
    }
  }

  for (let course = 0; course < NUM_COURSES; course++) {
    const courseBottom = course * EXPOSURE;
    if (courseBottom >= WALL_HT) break;

    const inDoorZone = hasDoor && courseBottom < doorTop;
    const wallPattern = courseJoints[course];

    if (inDoorZone) {
      const segLeftEnd = doorLeft;
      const segRightStart = doorRight;

      if (segLeftEnd > leftEdge + 1) {
        generateSegmentPlanks(pieces, wallId, course, leftEdge, segLeftEnd, studs, wallPattern);
      }
      if (rightEdge > segRightStart + 1) {
        generateSegmentPlanks(pieces, wallId, course, segRightStart, rightEdge, studs, wallPattern);
      }
    } else {
      generateSegmentPlanks(pieces, wallId, course, leftEdge, rightEdge, studs, wallPattern);
    }
  }

  return pieces;
}

function findSegmentJoints(segLeft, segRight, studs) {
  // Find all valid butt joint positions within this segment.
  // Joint must be on a stud center, and both resulting pieces must be <= PLANK_STOCK.
  const MIN_PIECE = 3;  // minimum piece length (inches)
  const results = [];
  for (const s of studs) {
    const jointCenter = s + 1.5 / 2;
    const leftPiece = jointCenter - BUTT_GAP / 2 - segLeft;
    const rightPiece = segRight - (jointCenter + BUTT_GAP / 2);
    if (leftPiece >= MIN_PIECE && leftPiece <= PLANK_STOCK &&
        rightPiece >= MIN_PIECE && rightPiece <= PLANK_STOCK) {
      results.push({ jointCenter, leftPiece, rightPiece });
    }
  }
  return results;
}

function generateSegmentPlanks(pieces, wallId, course, segLeft, segRight, studs, wallPattern) {
  const segLength = segRight - segLeft;

  if (segLength <= PLANK_STOCK) {
    // Single plank — no butt joint needed
    pieces.push({
      wall: wallId,
      course,
      piece: 0,
      x_start: round4(segLeft),
      x_end: round4(segRight),
      length: round4(segLength),
    });
    return;
  }

  // Need a butt joint — find valid positions for this specific segment
  const joints = findSegmentJoints(segLeft, segRight, studs);

  if (joints.length === 0) {
    console.error(`WARNING: No valid butt joint for ${wallId} course ${course} segment ${segLeft.toFixed(1)}-${segRight.toFixed(1)} (${segLength.toFixed(1)}")`);
    pieces.push({
      wall: wallId, course, piece: 0,
      x_start: round4(segLeft), x_end: round4(segRight), length: round4(segLength),
    });
    return;
  }

  // Use the wall-level pattern if it's valid for this segment, otherwise pick closest
  let chosen;
  if (wallPattern) {
    chosen = joints.find(j => Math.abs(j.jointCenter - wallPattern.jointCenter) < 0.5);
  }
  if (!chosen) {
    // Fallback: pick the joint closest to the wall pattern, or rightmost
    if (wallPattern) {
      joints.sort((a, b) => Math.abs(a.jointCenter - wallPattern.jointCenter) - Math.abs(b.jointCenter - wallPattern.jointCenter));
    } else {
      joints.sort((a, b) => b.jointCenter - a.jointCenter);
    }
    chosen = joints[0];
  }

  const jointLeft = chosen.jointCenter - BUTT_GAP / 2;
  const jointRight = chosen.jointCenter + BUTT_GAP / 2;

  pieces.push({
    wall: wallId, course, piece: 0,
    x_start: round4(segLeft), x_end: round4(jointLeft), length: round4(jointLeft - segLeft),
  });
  pieces.push({
    wall: wallId, course, piece: 1,
    x_start: round4(jointRight), x_end: round4(segRight), length: round4(segRight - jointRight),
  });
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

// ============================================
// COMPUTE ALL WALLS
// ============================================
const south = computeCourses("south", NS_SIDING_LENGTH, SOUTH_STUDS, -1, 0, 0);
const north = computeCourses("north", NS_SIDING_LENGTH, NORTH_STUDS, DOOR_RO_LEFT, DOOR_RO_RIGHT, DOOR_RO_TOP);
const east = computeCourses("east", EW_SIDING_LENGTH, EW_STUDS_LOCAL, -1, 0, 0);
const west = computeCourses("west", EW_SIDING_LENGTH, EW_STUDS_LOCAL, -1, 0, 0);

const allPieces = [...south, ...north, ...east, ...west];

// ============================================
// STOCK USAGE
// ============================================
// Count how many 12' planks are needed
let totalPlanks = 0;
const cutLengths = {};
for (const p of allPieces) {
  const len = p.length;
  const key = len.toFixed(4);
  cutLengths[key] = (cutLengths[key] || 0) + 1;
  // Each piece up to 144" uses one plank (offcuts may be reusable)
  if (len > PLANK_STOCK) {
    console.error(`ERROR: piece ${p.wall} course ${p.course} piece ${p.piece} is ${len}" > ${PLANK_STOCK}" stock!`);
  }
}

// Estimate stock planks: pair short offcuts with long pieces
// Simple approach: each piece consumes one stock plank unless it can use an offcut
const sortedPieces = [...allPieces].sort((a, b) => b.length - a.length);
const offcuts = [];
let stockUsed = 0;

for (const p of sortedPieces) {
  // Try to use an offcut
  let used = false;
  for (let i = 0; i < offcuts.length; i++) {
    if (offcuts[i] >= p.length) {
      offcuts[i] -= (p.length + 0.25);  // kerf allowance
      if (offcuts[i] < 3) offcuts.splice(i, 1);  // discard tiny scraps
      used = true;
      break;
    }
  }
  if (!used) {
    stockUsed++;
    const remainder = PLANK_STOCK - p.length - 0.25;
    if (remainder >= 3) {
      offcuts.push(remainder);
      offcuts.sort((a, b) => a - b);  // keep sorted for best-fit
    }
  }
}

// ============================================
// OUTPUT
// ============================================

const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const scadOnly = args.includes("--scad-only");

if (jsonMode) {
  console.log(JSON.stringify({ pieces: allPieces, stockPlanks: stockUsed, offcuts }, null, 2));
} else if (!scadOnly) {
  // Human-readable cut list
  console.log("=== SIDING CUT LIST ===\n");

  for (const wallId of ["south", "north", "east", "west"]) {
    const wallPieces = allPieces.filter(p => p.wall === wallId);
    console.log(`--- ${wallId.toUpperCase()} WALL (${wallPieces.length} pieces) ---`);
    let prevCourse = -1;
    for (const p of wallPieces) {
      if (p.course !== prevCourse) {
        if (prevCourse >= 0) console.log();
        prevCourse = p.course;
      }
      console.log(`  Course ${p.course}, piece ${p.piece}: ${p.length.toFixed(2)}" [${p.x_start.toFixed(2)} → ${p.x_end.toFixed(2)}]`);
    }
    console.log("\n");
  }

  console.log(`Total pieces: ${allPieces.length}`);
  console.log(`Stock planks needed: ${stockUsed}`);
  console.log(`Usable offcuts remaining: ${offcuts.length} (${offcuts.map(o => o.toFixed(1) + '"').join(", ")})`);
  console.log();

  // Unique cut lengths
  const sorted = Object.entries(cutLengths).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
  console.log("Unique cut lengths:");
  for (const [len, count] of sorted) {
    console.log(`  ${parseFloat(len).toFixed(2)}": ×${count}`);
  }
}

// ============================================
// WRITE SCAD DATA FILE
// ============================================
function generateScad() {
  const lines = [
    "// Generated by tools/siding-cuts.js — do not edit",
    `// ${allPieces.length} pieces, ${stockUsed} stock planks`,
    "",
  ];

  for (const wallId of ["south", "north", "east", "west"]) {
    const wallPieces = allPieces.filter(p => p.wall === wallId);
    // Group by course
    const byCourse = {};
    for (const p of wallPieces) {
      if (!byCourse[p.course]) byCourse[p.course] = [];
      byCourse[p.course].push(p);
    }

    lines.push(`${wallId}_siding = [`);
    for (let c = 0; c < NUM_COURSES; c++) {
      const coursePieces = byCourse[c] || [];
      const pairs = coursePieces.map(p => `[${p.x_start}, ${p.x_end}]`);
      const comma = c < NUM_COURSES - 1 ? "," : "";
      lines.push(`    [${pairs.join(", ")}]${comma}  // course ${c}`);
    }
    lines.push("];\n");
  }

  return lines.join("\n");
}

const scadContent = generateScad();
const scadPath = path.join(__dirname, "..", "model", "siding_data.scad");
fs.writeFileSync(scadPath, scadContent);
if (!jsonMode) {
  console.log(`\nWrote ${scadPath}`);
}
