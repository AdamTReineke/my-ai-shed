# Wall Framing

## General

- **Studs:** 2×6 at 16" o.c., Hem-Fir #2 (insulated walls)
- **Bottom plate:** Pressure-treated 2×6 (contact with subfloor)
- **Top plate:** Double 2×6
- **Wall height:** 8' (92⅝" pre-cut studs)

## Wall Layout

The shed is 16' E-W × 12' N-S. Four walls:

| Wall | Length | Notes |
|------|--------|-------|
| North (front) | 16' | Contains entry door |
| South (back) | 16' | |
| East | 12' | |
| West | 12' | |

## Door Framing

**Location:** North wall, positioned 13.5" from east end (per OpenSCAD model). Shifted 1.5" west from original 12" position so the west king stud lands on a 16" o.c. stud position, eliminating one board.

**Door Measurements:**
- Frame thickness: 6.75"
- Frame width (outer): 31.5"
- Frame height: 76.5" (bottom of frame to top, measured from floor)
- Interior width: 29⅛"
- Swing: In-swing, hinge on right (viewed from exterior)

**Rough Opening Sizing:**
The rough opening should be slightly larger than the door frame to allow shimming:
- **Rough opening width:** ~33" (31.5" frame + ¾" shim space each side)
- **Rough opening height:** ~78" (76.5" frame + ½" bottom gap + 1" top shimming)

**Header:** (2) 2×6 with ½" plywood spacer (total 3.5" thick × 5.5" tall). Adequate for ~33" span (well under 4' limit). Cripple studs fill the ~10.5" gap between header top and top plate.

**Framing Detail:**
```
        ┌──────── Top Plates (double 2×6) ────────┐
        │                                          │
        │    ┌─ Cripple studs above header ─┐     │
        │    │         │         │           │     │
        │    ╠═══════ Header (2×6) ═════════╣     │
        │    ║                               ║     │
        │    ║  King stud        King stud   ║     │
        │    ║  ┌─ Jack stud  Jack stud ─┐   ║     │
        │    ║  │                         │   ║     │
        │    ║  │    Rough Opening        │   ║     │
        │    ║  │    ~33" × ~78.5"        │   ║     │
        │    ║  │                         │   ║     │
        │    ║  │    Door frame           │   ║     │
        │    ║  │    31.5" × 76.5"        │   ║     │
        │    ║  │                         │   ║     │
   ════════════════════════════════════════════════
                    Bottom Plate
              (cut out at door opening)
```

**Door Position in North Wall (from west end):**
```
    ←──────────────── 192" (16') ────────────────→
    0"          142.5"  145.5"    178.5" 180" 190.5" 192"
    ├─ 16" o.c. ─┤                        │     │     │
              king/stud  R.O. 33"    jack king  end
              jack(144)              (178.5)(180)(190.5)
```
West king stud at 142.5" coincides with the 16" o.c. position, saving one board.

## Open Questions

- Window openings — any planned?
- Siding material and attachment method
