# Tools

Node.js scripts for generating data files and processing output. Run from the project root (`shed/`).

## siding-cuts.js

Generates the HardiePlank lap siding cut list.

```bash
node tools/siding-cuts.js             # print cut list to console
node tools/siding-cuts.js --json      # JSON output
node tools/siding-cuts.js --scad      # also writes model/siding_data.scad
```

## generate-truss-data.js

Generates polyhedron geometry for the queen-post trusses. Output is used by `model/trusses.scad`.

```bash
node tools/generate-truss-data.js     # writes model/truss_data.scad
```

## generate-end-truss-data.js

Generates polyhedron geometry for the end trusses and gable ladder framing. Output is used by `model/trusses.scad`.

```bash
node tools/generate-end-truss-data.js  # writes model/end_truss_data.scad
```

## parse-cutlist.js

Parses OpenSCAD console output (captured to `model/openscad-output.txt`) and aggregates the cut list into `model/cutlist.csv`.

```bash
node tools/parse-cutlist.js
```

To capture OpenSCAD output: run OpenSCAD with the echo statements enabled, copy the console output to `model/openscad-output.txt`, then run this script.
