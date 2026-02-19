// tools/render-views.js
// Renders named views of the shed model using OpenSCAD CLI.
//
// Usage:
//   node tools/render-views.js              # render all views
//   node tools/render-views.js foundation   # render views whose name contains "foundation"

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// On Windows, openscad.com is the console-mode executable (no GUI flash).
// Try 'openscad' first (works if user added it to PATH), then the default install path.
const OPENSCAD_CANDIDATES = [
  'openscad',
  'C:\\Program Files\\OpenSCAD\\openscad.com',
  'C:\\Program Files\\OpenSCAD (Nightly)\\openscad.com',
];

function findOpenSCAD() {
  for (const candidate of OPENSCAD_CANDIDATES) {
    try {
      execSync(`"${candidate}" --version`, { stdio: 'pipe' });
      return candidate;
    } catch {
      // not found or not executable, try next
    }
  }
  return null;
}

const MODEL = path.join(__dirname, '..', 'model', 'shed_model.scad');
const OUT_DIR = path.join(__dirname, '..', 'renders');

// All boolean visibility flags in shed_model.scad
const ALL_FLAGS = [
  'show_ground',
  'show_piers',
  'show_post_bases',
  'show_posts',
  'show_beams',
  'show_joists',
  'show_rim_joists',
  'show_blocking',
  'show_hurricane_ties',
  'show_floor_decking',
  'show_walls',
  'show_trusses',
  'show_ladder_framing',
  'show_roof',
  'show_osb',
  'show_furring',
  'show_siding',
  'show_compass_labels',
];

// Camera format: transx,transy,transz,rotx,roty,rotz,dist
// Shed is ~192" E-W (X), 144" N-S (Y), ~120" tall (Z, floor to ridge).
// OpenSCAD gimbal camera: translate puts the look-at point, rot is euler angles.
// rot 55,0,45 = slightly above horizon, looking from SW corner.
const CAMERAS = {
  frontCorner: '96,72,48,55,0,45,900',
  elevated:    '96,72,48,35,0,45,1000',
  low:         '96,72,0,65,0,45,800',
};

// Each view:
//   name:   output filename (without .png)
//   camera: one of the CAMERAS keys or a raw camera string
//   show:   array of flags to enable; all others are disabled
const VIEWS = [
  {
    name: '01-foundation',
    camera: 'low',
    show: ['show_piers', 'show_post_bases'],
  },
  {
    name: '02-floor-framing',
    camera: 'frontCorner',
    show: [
      'show_piers', 'show_post_bases', 'show_posts', 'show_beams',
      'show_joists', 'show_rim_joists', 'show_blocking', 'show_hurricane_ties',
    ],
  },
  {
    name: '03-floor-deck',
    camera: 'frontCorner',
    show: [
      'show_piers', 'show_post_bases', 'show_posts', 'show_beams',
      'show_joists', 'show_rim_joists', 'show_blocking', 'show_hurricane_ties',
      'show_floor_decking',
    ],
  },
  {
    name: '04-walls',
    camera: 'frontCorner',
    show: [
      'show_piers', 'show_post_bases', 'show_posts', 'show_beams',
      'show_joists', 'show_rim_joists', 'show_blocking', 'show_hurricane_ties',
      'show_floor_decking', 'show_walls',
    ],
  },
  {
    name: '05-full-framing',
    camera: 'frontCorner',
    show: [
      'show_piers', 'show_post_bases', 'show_posts', 'show_beams',
      'show_joists', 'show_rim_joists', 'show_blocking', 'show_hurricane_ties',
      'show_floor_decking', 'show_walls', 'show_trusses', 'show_ladder_framing',
    ],
  },
  {
    name: '06-cladding',
    camera: 'frontCorner',
    show: [
      'show_posts', 'show_beams', 'show_floor_decking', 'show_walls',
      'show_osb', 'show_furring', 'show_siding',
    ],
  },
  {
    name: '07-trusses',
    camera: 'elevated',
    show: [
      'show_piers', 'show_post_bases', 'show_posts', 'show_beams',
      'show_joists', 'show_rim_joists', 'show_blocking', 'show_hurricane_ties',
      'show_floor_decking', 'show_walls',
      'show_trusses', 'show_ladder_framing',
    ],
  },
  {
    name: '08-complete',
    camera: 'frontCorner',
    show: [
      'show_piers', 'show_post_bases', 'show_posts', 'show_beams',
      'show_joists', 'show_rim_joists', 'show_blocking', 'show_hurricane_ties',
      'show_floor_decking', 'show_walls', 'show_trusses', 'show_ladder_framing',
      'show_osb', 'show_furring', 'show_siding', 'show_compass_labels',
    ],
  },
];

function buildArgs(view) {
  const camera = CAMERAS[view.camera] || view.camera;
  const showSet = new Set(view.show);
  const dFlags = ALL_FLAGS.map(f => `-D "${f}=${showSet.has(f) ? 'true' : 'false'}"`).join(' ');
  const outFile = path.join(OUT_DIR, `${view.name}.png`);
  return { camera, dFlags, outFile };
}

function renderView(openscad, view) {
  const { camera, dFlags, outFile } = buildArgs(view);
  const cmd = [
    `"${openscad}"`,
    `-o "${outFile}"`,
    `--imgsize=1920,1080`,
    `--camera=${camera}`,
    `--projection=perspective`,
    dFlags,
    `"${MODEL}"`,
  ].join(' ');

  console.log(`\nRendering ${view.name}.png ...`);
  const start = Date.now();
  try {
    execSync(cmd, { stdio: 'pipe' });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  Done (${elapsed}s) → ${outFile}`);
  } catch (err) {
    console.error(`  FAILED: ${err.stderr ? err.stderr.toString().trim() : err.message}`);
  }
}

// --- main ---

const filter = process.argv[2] || '';

const openscad = findOpenSCAD();
if (!openscad) {
  console.error(
    'Error: OpenSCAD not found.\n' +
    'Install OpenSCAD and either:\n' +
    '  • Add it to your PATH, or\n' +
    '  • Install to: C:\\Program Files\\OpenSCAD\\'
  );
  process.exit(1);
}
console.log(`Using OpenSCAD: ${openscad}`);

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Created output directory: ${OUT_DIR}`);
}

const views = filter
  ? VIEWS.filter(v => v.name.includes(filter))
  : VIEWS;

if (views.length === 0) {
  console.error(`No views match filter: "${filter}"`);
  console.error(`Available: ${VIEWS.map(v => v.name).join(', ')}`);
  process.exit(1);
}

console.log(`Rendering ${views.length} view(s)...`);
const t0 = Date.now();
for (const view of views) {
  renderView(openscad, view);
}
const total = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\nAll done in ${total}s. PNGs in: ${OUT_DIR}`);
