# Pier Design & As-Built Details

Status: **Poured and cured.** 58 bags of 60-lb concrete used.

Run `node shed/concrete.js` for detailed volume breakdown per pier.
Run `node shed/footing.js` for the original sizing calculations.

---

## Design Approach

Size piers for soil bearing capacity of 1,500 psf (IBC Table 1806.2 default).

**Load per post (from beam analysis — `node shed/beam.js`):**
- Corner posts (P1, P3, P4, P6): ~2,580 lbs each
- Center posts (P2, P5): ~6,220 lbs each
- Total: 4 × 2,580 + 2 × 6,220 = 22,760 lbs

**Pier Sizing (design for center posts — worst case):**
```
Load per center pier = 6,220 lbs
Required area = 6,220 lbs ÷ 1,500 psf = 4.15 sf
Diameter = 2 × √(4.15 ÷ π) = 2.30 ft = 27.6" → use 28" BigFoot (29.5" base)
```

---

## BigFoot Form Feet + Sonotubes

Rather than sourcing large-diameter sonotubes (28" is not a standard retail size), we used BigFoot brand form feet with sonotubes. The 24" BigFoot (25.5" base) accepts a 10" sonotube; the 28" BigFoot (29.5" base) accepts a 12" sonotube.

| Pier Location | Load (incl. pier) | BigFoot Base | Column | Bearing Area | Pressure | Status |
|---------------|-------------------|-------------|--------|-------------|----------|--------|
| Corner (×4) | 3,200 lbs | 25.5" | 10" sonotube | 3.5 sf | 914 psf | **Pass (61%)** |
| Center (×2) | 6,950 lbs | 29.5" | 12" sonotube | 4.7 sf | 1,478 psf | **Pass (99%)** |

*Loads include as-built pier self-weight (~620 lbs corner avg, ~725 lbs center avg) based on concrete at 150 pcf.*

### BigFoot Form Specs (from CAD drawings)

| Model | Height | Top Dia | Base Dia |
|-------|--------|---------|----------|
| BF24 | 12.25" | 10" | 24.5" |
| BF28 | 12.25" | 12.42" | 28.25" |

---

## As-Built Pier Measurements

East and center piers are tall — they rise to beam level so the beam sits directly on concrete via saddle hardware (no wood posts). Only the two west piers are short and require 6×6 posts to bridge the gap to the beam.

| Pier | Position | BigFoot | Tube Dia | Above Cone | Total Height | Concrete (cf) | Weight (lbs) |
|------|----------|---------|----------|------------|--------------|---------------|--------------|
| P1 | NE corner (1' from east) | BF24 | 10" | 9" | 28.5" | 4.14 | 621 |
| P4 | SE corner (1' from east) | BF24 | 10" | 13" | 30.5" | 3.78 | 567 |
| P2 | N center (8' from east) | BF28 | 12" | 27" | 41" | 4.82 | 723 |
| P5 | S center (8' from east) | BF28 | 12" | 25" | 39.5" | 4.87 | 731 |
| P3 | NW corner (15' from east) | BF24 | 10" | 10" | 31" | 4.60 | 690 |
| P6 | SW corner (15' from east) | BF24 | 10" | 16" | 33.5" | 3.91 | 587 |
| | | | | | **Total** | **26.1 cf** | **3,919 lbs** |

*"Above Cone" = sonotube height above BigFoot bell. "Total Height" = bottom of bore to top of sonotube. Weight = cured weight at 150 pcf (standard normal-weight concrete density); dry bag weight was 3,480 lbs (58 × 60 lbs) — the ~12% difference is retained mix water. Center piers (P2, P5) are tallest because they're at mid-slope and must reach beam level. As-built pour used **58 bags** of 60-lb concrete (vs. 59 predicted by calculator).*

---

## Reinforcement

One vertical piece of GFRP (fiberglass) rebar (#4) per pier, extending from the bottom of the BigFoot bell through the sonotube column. GFRP eliminates corrosion concerns — no concrete cover required. Insert partway through the pour and adjust to keep centered — a slow-pour mixer (e.g., MudMixer) makes this easy. Cut with a hacksaw (wear dust mask — fiberglass dust is nasty).

---

## Placement Tolerance

The ABU66SS base plate on a 10" column gives ~1.9" clearance (corner piers) and on a 12" column gives ~2.75" clearance (center piers). 1–2" of pier misalignment is acceptable — the continuous beams and hardware connections accommodate it.

---

## Depth

- Frost line in Redmond: 12"
- Minimum embedment: 12" below frost line
- As-built depths vary by position (see `concrete.js` for per-pier breakdown)
