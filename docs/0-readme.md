# Shed Design

## Design Notes (Hem-Fir #2)
- **Lumber**: Hem-Fir #2 PT (Fb=850 psi, E=1,300,000 psi)
- **Storage load**: 60 psf (70 psf total with 10 psf dead load)

## Fundamental Goals

16 x 12 shed built with a joist-over-beam floor resting on six concrete piers.
East and center piers rise to beam level (beam sits directly on concrete via saddle hardware); only the two west piers are short and use 6×6 posts to reach the beam.
Posts are inset ~1' from the shed edges to protect the underfloor structure from rain.
The shed should have a steeper roof (possibly metal) to help shed pine needles.
The floor should support 60psf storage loads.

Model in C:\Users\adamt\OneDrive\Documents\OpenSCAD\shed_model.scad 

## City of Redmond Design Requirements 
Design Wind Speed: 110 mph - PER IRC 301.2 (see  Table IBC 1609.3 for commercial) 
Ground Snow Load: 15 psf (snow drift per ASCE 7-10) 
Rain on Snow Surcharge: 5 psf added to flat roofs per (ASCE 7-10;7.10) 
Seismic Design Category: D (D2 Residential) 
Rainfall : 1”/hr (UPC Table D101.1) 
Frost Line Depth: 12” 
Soil Bearing Capacity: 1500 psf unless a Geotechnical report is provided (IBC Table 1806.2) 

## Structural Design

### Site Orientation and Ground Slope

**Orientation:** The 16' dimension runs East-West. The 12' dimension runs North-South.

**Ground Slope:** The site slopes 28" over the 16' E-W length:
- **East end:** High ground (reference elevation 0")
- **West end:** Low ground (28" below east)

This slope affects post heights - see Vertical Posts section.

---

### Footing Layout (Inset Design)

To protect the underfloor structure from rain, footings are inset ~1.5' from N/S edges:

```
                    16' (shed footprint)
    EAST          ←─────────────────────────→          WEST
  (high ground)                                    (low ground)
                  ┌─────────────────────────┐ ─┬
                  │  1'      7'        7' 1'│  │
     Beam 1 (N):  │  ●───────●─────────●    │  │ 12'
                  │          FLOOR          │  │
     Beam 2 (S):  │  ●───────●─────────●    │  │
                  │  ↑       ↑         ↑    │ ─┴
                  └─────────────────────────┘
                    1'      8'        15'  (from east edge)

      Beams @ 1.5' and 10.5' from north edge (front)
```

**Key Dimensions:**
- **Joist main span:** 9' (between beams)
- **Joist cantilever:** 1.5' on each end (supports walls)
- **Beam spans:** 7' + 7' (between posts)
- **Beam cantilever:** 1' on each end

---

### Load Summary

**Floor Design Load:**
- Dead Load (structure): 10 psf
- Live Load (storage): 60 psf
- **Total: 70 psf**

**Wall Line Load (at joist cantilever tips):**
- Wall dead load: 8' × 7 psf = 56 plf
- Roof load (tributary): ~6' × 30 psf = 180 plf
- **Total: 236 plf → 315 lbs per joist at 16" o.c.**

**Total Building Weight (estimated):**
| Component | Calculation | Weight |
|-----------|-------------|--------|
| Floor DL | 192 sf × 10 psf | 1,920 lbs |
| Storage LL | 192 sf × 60 psf | 11,520 lbs |
| Walls | 56 lf × 8' × 7 psf | 3,136 lbs |
| Roof DL | 200 sf × 10 psf | 2,000 lbs |
| Snow LL | 192 sf × 20 psf | 3,840 lbs |
| **Total** | | **22,416 lbs** |

---

### Concrete Piers (Poured)

Six piers on BigFoot form feet — **poured and cured.** See [`1-piers.md`](1-piers.md) for full design, sizing, and as-built measurements.

```
Post positions: 1', 8', 15' on each beam

Beam 1:  [P1]────────[P2]────────[P3]    P1, P3 = corner (BF24 + 10" tube)
          │           │           │       P2 = center (BF28 + 12" tube)
         ═══════════════════════════     (both beams identical)
          │           │           │
Beam 2:  [P4]────────[P5]────────[P6]
```

| Position | Load | BigFoot | Bearing | Status |
|----------|------|---------|---------|--------|
| Corner (×4) | ~2,580 lbs | BF24 (25.5" base) | 914 psf / 1,500 | **Pass (61%)** |
| Center (×2) | ~6,220 lbs | BF28 (29.5" base) | 1,478 psf / 1,500 | **Pass (99%)** |

East and center piers rise to beam level (beam on concrete via saddle hardware). Only the two west piers are short and use 6×6 posts. Total concrete: 26.1 cf (58 × 60-lb bags). Each pier has one #4 GFRP rebar. See [`1-piers.md`](1-piers.md) for as-built measurements.

---

### Vertical Posts and Beam Supports

**As-Built Configuration:**

The east and center piers rise to beam level — the beam sits directly on concrete via saddle hardware at these 4 positions (no wood posts). Only the 2 west piers are short and require 6×6 posts to bridge the gap to the beam.

| Position | Location | Connection Type | Notes |
|----------|----------|-----------------|-------|
| 1' from east | **East end** | **Beam direct to concrete** | Tall pier; ABU66SS as beam saddle |
| 8' from east | **Center** | **Beam direct to concrete** | Tall pier; ABU66SS as beam saddle |
| 15' from east | **West end** | **6×6 post on short pier** | ABU66SS base + CC66 post cap |

**Post Material (west positions only):** 6×6 pressure-treated Hem-Fir #2 (or better). As-built post heights (wood only, excluding metal brackets): south 16.5", north 17.25".

**Column Capacity Check:**
- 6×6 actual dimensions: 5.5" × 5.5"
- Allowable load for 6×6 Hem-Fir #2 at short heights: **>10,000 lbs** (far exceeds ~2,580 lbs required)

**Hardware Connections:**

All hardware uses post-install anchors (wedge anchors or similar), allowing concrete piers to be poured first.

| Position | Base Hardware | Top Hardware | Notes |
|----------|---------------|--------------|-------|
| **East (1')** | Simpson ABU66SS | — | Beam sits in ABU66SS used as saddle |
| **Center (8')** | Simpson ABU66SS | — | Beam sits in ABU66SS used as saddle |
| **West (15')** | Simpson ABU66SS | Simpson CC66 | 6×6 post in base; beam on post cap |

*All 6 positions use ABU66SS (stainless, 5.5" pocket fits the built-up beam width). West positions add CC66 post caps (1 per post). See [`2-beam.md`](2-beam.md) for hardware links and pricing.*

**Anchor Requirements:**
- **½" diameter post-install wedge anchor** (Simpson Titen HD, Red Head, or equivalent)
- Minimum 7" embedment in concrete
- All bases provide 1" standoff above concrete for drainage/moisture protection

---

### Horizontal Beams (2 beams × 16 ft each)

**Configuration (with inset posts):**
- Posts at: 1', 8', 15' along each 16' beam
- Interior spans: 7' + 7'
- End cantilevers: 1' on each end

```
    ←1'→←───── 7' ─────→←───── 7' ─────→←1'→
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← beam with joist loads
        △              △              △
      Post 1         Post 2         Post 3
```

**Beam:** 2×10 + 3×10 + 2×10 built-up (5.5" × 9.25"), Hem-Fir #2 PT Incised. Connected with 1/2" × 6-1/2" HDG hex bolts + nuts + washers, staggered top/bottom at 24" o.c., 8 per beam.

**Utilization:** 89% bending, 77% shear, 15% deflection — all pass. Run `node shed/beam.js` for full analysis. See [`2-beam.md`](2-beam.md) for design notes, NDS adjustment factors, and solid 6×10 comparison.

---

### Floor Joists, Blocking, and Decking

**2×8 PT Hem-Fir #2 Incised** at 16" o.c. — 13 joists running N-S (12' total: 1.5' cantilever + 9' span + 1.5' cantilever). Cantilevers support exterior wall loads. Includes 24 blocks at beam lines for lateral load transfer and 3/4" plywood decking.

**Structural:** 56% bending, 57% deflection — passes with comfortable margin. Run `node shed/joist.js` for full analysis. See [`3-joists.md`](3-joists.md) for complete design, NDS factors (including incising and repetitive member derating), cut list, and nailing schedule.

**Lateral Load Path:** Plywood diaphragm → blocking → beams → posts/saddles → piers → anchors. With pinned post bases (ABU hardware), the floor diaphragm is the primary lateral system.

**Hurricane Ties:** Simpson H2.5ASS (26 total — joist-over-beam uplift restraint) | **Decking:** 3/4" T&G Advantech or CDX plywood (6 sheets)

---

### Wall Framing

2×6 studs at 16" o.c. with PT bottom plate and double top plate. One door opening (~33" R.O.) with (2) 2×6 header on north wall. See [`4-walls.md`](4-walls.md) for stud layout and door framing, [`5-wall-layers.md`](5-wall-layers.md) for the full exterior assembly: R-23 Rockwool → 7/16" OSB → Tyvek → ¾" rainscreen → HardiePlank siding (6.25" exposure).

---

### Materials Summary (6-Position Inset Design)

**Concrete & Foundation:**
| Component | Size | Quantity | Material |
|-----------|------|----------|----------|
| BigFoot form feet (corner) | 25.5" base | 4 | Polypropylene |
| BigFoot form feet (center) | 29.5" base | 2 | Polypropylene |
| Sonotubes (corner) | 10" dia × 48" | 4 | Cardboard form (cut to length) |
| Sonotubes (center) | 12" dia × 48" | 2 | Cardboard form (cut to length) |
| GFRP rebar | #4 × ~2' | 6 | Fiberglass |
| Concrete | 4000 psi | 26.1 cf (58 bags used @ 60-lb) | Ready-mix or bags |

**Hardware (post-install anchor compatible):**
| Component | Part Number | Quantity | Notes |
|-----------|-------------|----------|-------|
| Base brackets (all positions) | Simpson ABU66SS | 6 | Stainless, 5.5" pocket; beam saddle at E/C, post base at W |
| Post caps (west only) | Simpson CC66 | 2 | Painted, 1 per post (beam-to-post) |
| Wedge anchors | ½" × 7" | 6 | Post-install, for all bases |
| Hurricane ties | Simpson H2.5ASS | 26 | Joist-to-beam uplift restraint (stainless) |
| Framing angles (optional) | Simpson A35 | 48 | For blocking (2 per block) |

**Lumber:**
| Component | Size | Quantity | Material |
|-----------|------|----------|----------|
| Posts (west only) | 6×6 × TBD | 2 | PT Hem-Fir #2 (measure on-site after pier cure) |
| Beams | 2×10 × 16' | 4 | PT Hem-Fir #2 (outer plies: 2 per beam × 2 beams) |
| Beams | 3×10 × 16' | 2 | PT Hem-Fir #2 (center ply: 1 per beam × 2 beams) |
| Joists | 2×8 × 12' | 13 | PT Hem-Fir #2 |
| Rim joists | 2×8 × 16' | 2 | PT Hem-Fir #2 |
| Blocking | 2×8 × 14.5" | 24 | PT Hem-Fir #2 (cut from 2×8 stock) |

**Sheathing:**
| Component | Size | Quantity | Material |
|-----------|------|----------|----------|
| Subfloor | 3/4" × 4×8 | 6 sheets | Advantech or CDX |

**Notes:**
- Joists run N-S (parallel to 12' dimension), cantilever 1.5' past each beam
- Beams run E-W (parallel to 16' dimension), cantilever 1' past corner posts
- All cantilevers support exterior wall loads
- East and center positions have no wood posts — beam sits directly in ABU66SS on concrete
- As-built post heights: south 16.5", north 17.25" (wood only, excluding brackets)

---

### Roof Structure

**Design Goals:**
- Steep pitch to shed pine needles
- Metal roofing for durability and low maintenance
- Usable attic storage space (queen-post truss design creates voids)

Queen-post trusses with 6/12 pitch, 2×4 lumber, 24" o.c. spacing (9 total). Eave overhang 1' past N/S walls; gable overhang 1' past E/W walls via ladder framing (lookouts + fly rafters). Rafter utilization 54%, attic storage capacity 55 psf per bay. See [`6-trusses.md`](6-trusses.md) for full truss design, load analysis, attic storage capacity, construction method (plywood gussets), and materials list.

---

## Dunn Lumber Price Reference

Source: dunnlumber.com, Framing Lumber > Dimensional Lumber. Fetched February 2026.

**Important:** These are standard **Kiln Dried (non-PT)** prices. Pressure-treated lumber (needed for posts, beams, and joists in ground-contact/outdoor applications) costs significantly more. The PT prices in the Design Notes section above remain the best estimates for underfloor components.

### Dimensional Lumber (per linear foot)

| Size | Hem-Fir | Douglas Fir | SPF |
|------|---------|-------------|-----|
| 2×4 | **$0.58** | $0.63–0.65 | $0.78 |
| 2×6 | **$0.88** | $0.96–1.00 | $1.18 |
| 2×8 | **$1.18** | $1.19 (16' only) | $1.78 |
| 2×10 | **$1.48** | — | $1.98 |
| 2×12 | **$1.78–1.88** | $2.68 (16' only) | $3.08 |

### Pre-Cut Studs — 2×4 (per each)

| Length | Hem-Fir | Douglas Fir | SPF |
|--------|---------|-------------|-----|
| 92⅝" (8' wall) | **$4.58** | $4.70 | $5.08 |
| 96" | **$4.88** | — | $5.18 |
| 103½" (9' wall) | $5.68 | **$5.38** | — |
| 104⅝" | $5.68 | $5.77 | — |
| 120" (10' wall) | **$6.18** | — | — |

### Pre-Cut Studs — 2×6 (per each)

| Length | Hem-Fir | Douglas Fir | SPF |
|--------|---------|-------------|-----|
| 88⅝" | — | — | **$4.08** |
| 92⅝" (8' wall) | **$6.28** | $6.40 | $7.78 |
| 96" | **$6.38** | $7.48 | $7.08 |
| 103½" (9' wall) | $8.78 | **$7.98** | — |
| 104⅝" | $8.98 | **$8.88** | — |
| 120" (10' wall) | **$9.38** | $10.28 | — |

### Takeaways

- **Hem-Fir is cheapest** for most sizes — 8–34% less than Douglas Fir, 25–50% less than SPF
- **Douglas Fir** is a close second for 2×4 and 2×8, with only limited 2×12 availability (16' lengths)
- **SPF is the most expensive** across the board despite being labeled "Premium"
- For **wall studs (2×4-92⅝")**, the species spread is small: $4.58–$5.08 (only $0.50/stud)
- For **joists/beams (2×8, 2×12)**, Hem-Fir saves substantially vs. SPF ($1.18 vs $1.78 for 2×8)
- The shed design's choice of **Hem-Fir #2** is well-supported by pricing