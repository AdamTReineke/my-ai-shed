- **Spans**: 84" + 84" (7' + 7') with 12" (1') cantilever each end
- **Posts at**: 1', 8', 15' from west end
- **Load**: 13 joists x 875 lbs = 711 plf equivalent

-------

Beam (x2):
    Hem/Fir #2 PT Incised
    16 ft with three-ply: 2x10 + 3x10 (or x12 trimmed) + 2x10
    (Creating a 5.5" × 9.25" beam in Hem/Fir #2)
    Connection: 1/2" × 6.5" HDG hex bolt + nut + 2 washers,
    staggered top/bottom at 24" o.c., 8 per beam.
    (Screw and nail+glue options were evaluated and discarded in favor of bolts.)

  Lamination connection design (NDS Table 11A):
    Fastener: 1/2" A307 hex bolt, HDG, double shear
    Members:  side members 1.5" each (2×10 outer plies)
              main member  2.5" (3×10 center ply)
    Species:  Hem-Fir, G = 0.43

    Stack check:
      Beam width (actual):   5.5"  (1.5 + 2.5 + 1.5)
      Two washers:           0.13"
      Nut (1/2"):            0.44"
      Total stack:           6.07"
      Bolt length:           6.5"  → 0.43" thread past nut ✓

    Lateral design value (NDS Table 11A, 1/2" bolt, double shear, Hem-Fir):
      Z per shear plane ≈ 1,050 lb
      Z_bolt = 2 planes × 1,050 = 2,100 lb/bolt

    Inter-ply shear demand:
      Same-depth plies placed side-by-side share the same neutral axis depth.
      Theoretical horizontal shear flow at the vertical interface = V·Q/I = 0
      (Q of one ply about the composite NA = 0 for equal-depth side-by-side plies).
      Fasteners resist clamping, differential shrinkage, and incidental lateral
      forces — not primary bending shear transfer.

    Capacity check:
      8 bolts/beam × 2,100 lb = 16,800 lb capacity
      V_max = 3,111 lb (at center support, from beam analysis)
      Utilization = 3,111 / 16,800 = 18% ✓ (governed by beam bending, not lamination)

    Spacing: stagger top/bottom rows at 24" o.c. along beam length;
    edge distance ≥ 1.5" from beam edges (NDS 11.5.1).
    HDG required — all plies are PT Hem-Fir (ACQ treatment).

  Adjustment factors (Hem/Fir #2 PT Incised, 2x10, normal duration):
    Fb base  = 850 psi  (Table 4A)
    CD       = 1.0      (normal load duration)
    CF       = 1.1      (size factor, 2x10 beam)
    Ci       = 0.80     (incising factor for Fb)
    Cr       = 1.0      (not applicable — see note below)
    Fb'      = 850 × 1.0 × 1.1 × 0.80 = 748 psi

    Fv base  = 150 psi
    Ci       = 0.80     (incising factor for Fv)
    Fv'      = 150 × 0.80 = 120 psi

    E base   = 1,300,000 psi
    Ci       = 0.95     (incising factor for E)
    E'       = 1,235,000 psi

  Section properties (3-ply 2x10: 5.5" × 9.25"):
    S = bd²/6  = 78.4 in³
    I = bd³/12 = 362.7 in⁴
    A = bd     = 50.9 in²

  Demand (two-span continuous beam, w = 711 plf = 59.25 lb/in, L = 84"):
    M_max = wL²/8 = 52,258 lb·in  (at center support, hogging)
    V_max = 5wL/8 = 3,111 lb       (at center support)
    δ_max = wL⁴/(185·EI) = 0.036"  (midspan of 84" span)

    fb = M/S   = 52,258 / 78.4 = 666 psi
    fv = 3V/2A = 3(3,111) / 2(50.9) = 92 psi

  ┌────────────┬─────────┬───────────┬─────────────┐
  │   Check    │ Actual  │ Allowable │ Utilization │
  ├────────────┼─────────┼───────────┼─────────────┤
  │ Bending    │ 666 psi │ 748 psi   │ 89%         │
  ├────────────┼─────────┼───────────┼─────────────┤
  │ Shear      │ 92 psi  │ 120 psi   │ 77%         │
  ├────────────┼─────────┼───────────┼─────────────┤
  │ Deflection │ 0.036"  │ 0.233"    │ 15%  (L/360)│
  └────────────┴─────────┴───────────┴─────────────┘

    Note: Cr (repetitive member factor, 1.15) does NOT apply to a
    built-up beam. Per NDS, Cr is for repetitive parallel members
    (joists, rafters, studs) spaced ≤24" o.c. and joined by sheathing
    — not for laminations within a single beam.

    Section properties note:
    The 2x10 + 3x10 + 2x10 layup is 5.5" wide (1.5 + 2.5 + 1.5).
    S and I are full geometric values — for same-depth plies, section
    properties are identical whether plies act compositely or independently
    (S = b_total × d²/6 either way). Through-bolts prevent inter-ply
    slip, ensuring all plies share load. A 75% composite stiffness factor
    is applied to EI for deflection (conservative for through-bolts),
    but deflection is so far from governing (15%) that this is academic.
    Verified with `node shed/beam.js` — results match.

    Previous errors corrected:
    - Fb' was 782 psi (applied Cr=1.15, omitted CF=1.1). Now 748 psi.
    - Deflection was 0.27" (used fixed-fixed model with L=168" full
      span). Correct model: two-span continuous, L=84" per span,
      giving 0.036" — deflection is not a concern.

    Why not a solid 6x10?
    A solid 6x10 is graded as "Beams & Stringers" (NDS Table 4D), not
    "Dimension Lumber" (Table 4A). The design values are lower:

    ┌─────────────────┬──────────────┬──────────────────┐
    │                 │  Solid 6x10  │ Built-up 3-ply   │
    │                 │  (B&S grade) │ (Dimension Lbr)  │
    ├─────────────────┼──────────────┼──────────────────┤
    │ NDS Table       │ 4D           │ 4A               │
    │ Base Fb         │ 675 psi      │ 850 psi          │
    │ Fb' (adjusted)  │ ~540 psi*    │ 748 psi          │
    │ E               │ 1,100,000    │ 1,300,000        │
    │ Utilization     │ 665/540=FAIL │ 665/748=89%      │
    └─────────────────┴──────────────┴──────────────────┘
    * B&S Ci=0.80: 675 × 0.80 = 540 psi (no CF for timbers)

    The lower B&S values are not a strength difference — a solid timber
    with continuous fibers is physically stronger. It's a grading
    confidence issue: large timbers are sold green, can't be inspected
    internally, and have higher probability of hidden defects at the
    critical section. Dimension lumber is kiln-dried and individually
    graded at smaller cross-sections, so NDS allows higher design values.

Post (2x):
    6x6 #2 PT Incised
    Height: < 3ft each?, TBD, cut to length on site from (likely) a 6-8 ft beam.

Concrete to Wood (x6):
    ABU66SS
    https://www.fastenersplus.com/products/simpson-abu66ss-6x6-stainless-steel-adjustable-post-base
    Simpson ABU66SS 6x6 Stainless Steel Adjustable Post Base
    $201.96

Post to Beam (x2, one per post):
    CC66 Painted (purchased from Dunn Lumber, $132.73 each)
    Simpson CC66 column cap — heavier-duty than AC6SS, same 6× pocket
