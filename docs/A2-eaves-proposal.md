# A2 — Eaves & Overhangs

## Hard Constraint: Nothing Penetrates the Zip Envelope

The walls and roof are sheathed with Zip System panels, taped and rolled, forming a continuous air/water barrier. Rigid foam insulation goes above the roof Zip deck (hot roof). **No framing member can pass through the Zip plane.** All overhang structure must be **entirely outboard** of the sealed envelope.

---

## Overhang Approach: Batten Grid Extended as Overhangs

The above-deck assembly is: **Zip deck → rigid foam → battens (up slope) → purlins (across slope) → metal roofing**. The battens extend past the wall face to create the eave overhang — no separate outrigger layer needed.

### Overhang Sized for 8' Metal Roofing Panels

```
Usable panel run along slope: 96" - 1" (ridge) - 1.5" (drip) = 93.5"
Slope from ridge to wall face: 72" / cos(26.57°) = 80.5"
Remaining slope for overhang: 93.5" - 80.5" = 13.0"
Horizontal overhang: 13.0" × cos(26.57°) = 11.6"
```

**Result: ~12" horizontal overhang** — 8' panels fit without cutting.

---

## N/S Eave Overhangs (12")

Battens (2×4 flat, running up the slope) extend 12" past the N/S wall faces. This is configurable (`batten_overhang` in the model).

## E/W Gable Overhangs (12")

Purlins (2×4 flat, running E-W) extend 12" past each E/W wall. This is configurable (`purlin_gable_overhang` in the model).

---

## Assembly Stack-Up (Ridge to Eave)

| Layer | Thickness | Notes |
|-------|-----------|-------|
| Metal roofing | ~1" (profile height) | Screwed to purlins |
| Purlins (2×4 flat) | 1.5" | 5 rows per slope, running E-W over battens |
| Battens (2×4 flat) | 1.5" | At each truss (24" o.c.), running up slope on foam |
| Rigid foam (polyiso) | 2" | R-13.1, continuous, no thermal bridging |
| Zip roof sheathing | 7/16" | Sealed envelope |
| Rafter (truss top chord) | 3.5" | Structural |

**Total above rafter**: ~5.4" (foam + batten + purlin) + roofing

---

## Resolved Questions

| # | Question | Answer |
|---|----------|--------|
| 1 | Overhang depth | **12" horizontal** — sized so 8' metal panels fit without cutting |
| 3 | Gutters | **Yes** — use Type D/F drip edge |
| 4 | Outrigger orientation | **Moot** — battens extending past wall replace separate outriggers |
| 5 | Soffit | **Open** |
| 6 | Foam thickness | **2" polyiso (R-13.1)** — unvented hot roof in zone 4C requires ≥40% of total R at the exterior (IRC R806.5). With R-15 cavity Rockwool, 2" foam = 47% exterior ratio. |
