// tools/render-views.js
// Renders named views of the shed model using OpenSCAD CLI.
//
// Usage:
//   node tools/render-views.js              # render all views (parallel batches of 4)
//   node tools/render-views.js foundation   # render views whose name contains "foundation"

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// On Windows, openscad.com is the console-mode executable (no GUI flash).
// Try 'openscad' first (works if user added it to PATH), then the default install path.
const OPENSCAD_CANDIDATES = [
  'openscad',
  'C:\\Program Files\\OpenSCAD\\openscad.com',
  'C:\\Program Files\\OpenSCAD (Nightly)\\openscad.com',
];

const { execSync } = require('child_process');

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

const os = require('os');

const MODEL = path.join(__dirname, '..', 'model', 'shed_model.scad');
const OUT_DIR = path.join(__dirname, '..', 'renders');
const CONCURRENCY = os.cpus().length;

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
  'show_roof',
  'show_polyiso',
  'show_purlins',
  'show_eaves',
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
  frontCorner:     '96,72,48,55,0,45,900',
  elevated:        '96,72,48,35,0,45,1000',
  low:             '96,72,0,65,0,45,800',
  frontCornerMid:  '96,72,90,55,0,45,900',
  postBaseClose:   '12,18,35,55,0,315,120',
  hurricaneTieClose: '16,126,65,55,0,315,80',
  sideEast:        '192,72,60,90,0,270,500',
  underfloor:      '96,0,55,75,0,0,400',
  roofCorner:      '96,72,150,45,0,45,1000',
};

// Each view:
//   name:   output filename (without .png)
//   camera: one of the CAMERAS keys or a raw camera string
//   show:   array of flags to enable; all others are disabled
const VIEWS = [
  // --- Progressive assembly views ---
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
      'show_floor_decking', 'show_walls', 'show_trusses', 'show_eaves',
    ],
  },
  {
    name: '06-cladding',
    camera: 'frontCorner',
    show: [
      'show_posts', 'show_beams', 'show_floor_decking', 'show_walls',
      'show_trusses', 'show_osb', 'show_furring', 'show_siding',
    ],
  },
  {
    name: '07-trusses',
    camera: 'elevated',
    show: [
      'show_piers', 'show_post_bases', 'show_posts', 'show_beams',
      'show_joists', 'show_rim_joists', 'show_blocking', 'show_hurricane_ties',
      'show_floor_decking', 'show_walls',
      'show_trusses', 'show_eaves',
    ],
  },
  {
    name: '08-complete',
    camera: 'frontCorner',
    show: [
      'show_piers', 'show_post_bases', 'show_posts', 'show_beams',
      'show_joists', 'show_rim_joists', 'show_blocking', 'show_hurricane_ties',
      'show_floor_decking', 'show_walls', 'show_trusses', 'show_eaves',
      'show_roof', 'show_polyiso', 'show_purlins',
      'show_osb', 'show_furring', 'show_siding', 'show_compass_labels',
    ],
  },

  // --- Isolation views: Foundation ---
  {
    name: 'iso-pier',
    camera: 'low',
    show: ['show_piers', 'show_compass_labels'],
  },
  {
    name: 'iso-post-base',
    camera: 'postBaseClose',
    show: ['show_piers', 'show_post_bases', 'show_posts', 'show_compass_labels'],
  },
  {
    name: 'iso-foundation',
    camera: '96,72,0,65,0,45,500',
    show: ['show_piers', 'show_post_bases', 'show_compass_labels'],
  },

  // --- Isolation views: Posts & Beams ---
  {
    name: 'iso-post',
    camera: '96,72,48,55,0,45,550',
    show: ['show_piers', 'show_post_bases', 'show_posts', 'show_compass_labels'],
  },
  {
    name: 'iso-beam',
    camera: 'sideEast',
    show: ['show_piers', 'show_post_bases', 'show_posts', 'show_beams', 'show_compass_labels'],
  },
  {
    name: 'iso-posts-and-beams',
    camera: '96,72,48,55,0,45,550',
    show: ['show_piers', 'show_post_bases', 'show_posts', 'show_beams', 'show_compass_labels'],
  },

  // --- Isolation views: Floor System ---
  {
    name: 'iso-rim-joist',
    camera: 'frontCorner',
    show: ['show_beams', 'show_joists', 'show_rim_joists', 'show_compass_labels'],
  },
  {
    name: 'iso-blocking',
    camera: '96,72,80,20,0,45,500',
    show: ['show_joists', 'show_blocking', 'show_compass_labels'],
  },
  {
    name: 'iso-hurricane-tie',
    camera: 'hurricaneTieClose',
    show: ['show_beams', 'show_joists', 'show_hurricane_ties', 'show_compass_labels'],
  },
  {
    name: 'iso-floor-framing',
    camera: '96,72,48,55,0,45,600',
    show: [
      'show_piers', 'show_post_bases', 'show_posts', 'show_beams',
      'show_joists', 'show_rim_joists', 'show_blocking', 'show_hurricane_ties',
      'show_compass_labels',
    ],
  },

  // --- Isolation views: Walls ---
  {
    name: 'iso-wall-framing',
    camera: 'frontCornerMid',
    show: ['show_floor_decking', 'show_walls', 'show_compass_labels'],
  },
  {
    name: 'iso-osb',
    camera: 'frontCornerMid',
    show: ['show_walls', 'show_trusses', 'show_osb', 'show_compass_labels'],
  },
  {
    name: 'iso-furring',
    camera: 'frontCornerMid',
    show: ['show_walls', 'show_trusses', 'show_osb', 'show_furring', 'show_compass_labels'],
  },
  {
    name: 'iso-siding',
    camera: 'frontCornerMid',
    show: ['show_walls', 'show_trusses', 'show_osb', 'show_furring', 'show_siding', 'show_compass_labels'],
  },
  {
    name: 'iso-cladding',
    camera: 'frontCornerMid',
    show: ['show_walls', 'show_trusses', 'show_osb', 'show_furring', 'show_siding', 'show_compass_labels'],
  },

  // --- Isolation views: Roof ---
  {
    name: 'iso-truss',
    camera: 'roofCorner',
    show: ['show_walls', 'show_trusses', 'show_compass_labels'],
  },
  {
    name: 'iso-roof-framing',
    camera: 'elevated',
    show: ['show_walls', 'show_trusses', 'show_eaves', 'show_compass_labels'],
  },
  {
    name: 'iso-roof-sheathing',
    camera: 'roofCorner',
    show: ['show_walls', 'show_trusses', 'show_eaves', 'show_roof', 'show_polyiso', 'show_purlins', 'show_osb', 'show_furring', 'show_siding', 'show_compass_labels'],
  },
  {
    name: 'iso-polyiso',
    camera: 'roofCorner',
    show: ['show_walls', 'show_trusses', 'show_roof', 'show_polyiso', 'show_compass_labels'],
  },
  {
    name: 'iso-purlins',
    camera: 'roofCorner',
    show: ['show_walls', 'show_trusses', 'show_roof', 'show_polyiso', 'show_purlins', 'show_compass_labels'],
  },
  {
    name: 'iso-eave-framing',
    camera: 'roofCorner',
    show: ['show_walls', 'show_trusses', 'show_roof', 'show_polyiso', 'show_purlins', 'show_eaves', 'show_compass_labels'],
  },
];

function buildCmd(openscad, view) {
  const camera = CAMERAS[view.camera] || view.camera;
  const showSet = new Set(view.show);
  const dFlags = ALL_FLAGS.map(f => `-D "${f}=${showSet.has(f) ? 'true' : 'false'}"`).join(' ');
  const outFile = path.join(OUT_DIR, `${view.name}.png`);
  return {
    cmd: [
      `"${openscad}"`,
      `-o "${outFile}"`,
      `--imgsize=3840,2160`,
      `--camera=${camera}`,
      `--projection=perspective`,
      dFlags,
      `"${MODEL}"`,
    ].join(' '),
    outFile,
  };
}

function renderView(openscad, view) {
  return new Promise(resolve => {
    const { cmd, outFile } = buildCmd(openscad, view);
    console.log(`  Starting ${view.name}.png ...`);
    const start = Date.now();
    exec(cmd, { stdio: 'pipe' }, (err, stdout, stderr) => {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      if (err) {
        const msg = stderr ? stderr.toString().trim() : err.message;
        console.error(`  FAILED ${view.name} (${elapsed}s): ${msg}`);
      } else {
        console.log(`  Done    ${view.name}.png (${elapsed}s)`);
      }
      resolve();
    });
  });
}

async function renderAll(openscad, views) {
  const t0 = Date.now();
  let i = 0;
  while (i < views.length) {
    const batch = views.slice(i, i + CONCURRENCY);
    console.log(`\nBatch ${Math.floor(i / CONCURRENCY) + 1}: ${batch.map(v => v.name).join(', ')}`);
    await Promise.all(batch.map(v => renderView(openscad, v)));
    i += CONCURRENCY;
  }
  const total = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\nAll done in ${total}s. PNGs in: ${OUT_DIR}`);
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

console.log(`Rendering ${views.length} view(s) with up to ${CONCURRENCY} concurrent...`);
renderAll(openscad, views);
