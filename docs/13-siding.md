# Siding Installation

Process guide for hanging the HardiePlank lap siding over the rainscreen. Design background is in [5-wall-layers.md](5-wall-layers.md); fastener spec is in [8-fasteners.md](8-fasteners.md) §16. Cut list comes from `node tools/siding-cuts.js`.

## Where This Starts

Assumed already done before siding day:

- [ ] Zip sheathing up on all four walls, all seams taped and rolled
- [ ] Door installed, trimmed, and caulked (✓ done — siding butts to the existing trim)
- [ ] Z-flashing (or peel-and-stick) at the base of the Zip, lapping down over the rim/bottom plate

## The Stack (inside → out)

```
Zip sheathing (WRB)
  → 1×3 PT furring, vertical @ 16" o.c. over studs   (¾" rainscreen gap)
    → bug mesh closing the bottom of the gap
      → ripped HardiePlank starter strip
        → HardiePlank lap siding, 6.25" exposure, blind-nailed
          → metal outside corners, one per corner per course
```

Total buildup off the Zip face: ¾" furring + 5/16" plank ≈ **1-1/16"**. Remember this number — every screw that mounts anything to the finished wall has to cross it before reaching wood.

---

## Step 1 — Furring (1×3 PT, vertical)

- One strip over **every stud line**, 16" o.c., plus a strip at each **corner** (both faces of the corner need an edge to nail to) and tight to each side of the **door trim**.
- Fasten with #8 × 3" deck screws into the studs, ~16" o.c. vertically.
- Check the furring plane for flatness as you go — a bowed strip telegraphs through every course above it. Shim or swap bad strips now, not later.
- **Extra furring where butt joints land.** Every plank butt joint must be backed by a furring strip. The cut list puts joints on stud lines, so the standard layout covers it — but if you improvise a joint mid-bay, add a strip behind it first.
- **Mark gutter bracket and electrical box locations on the Zip now** (see Steps 6–7) and add backing before the siding hides everything.

Leave the top of the gap open — top venting differs by wall, see **Top-of-Wall Transitions** below. The bottom gets closed next.

## Step 2 — Bug Mesh at the Bottom

Close the bottom of the ¾" gap so it vents but doesn't host wasps:

- Run the mesh (Cor-A-Vent SV-3 or insect screen strip) along the bottom of the wall, spanning the gap between the Zip face and the back of the siding plane.
- If using screen roll rather than a rigid vent strip: staple one edge to the Zip just above the Z-flashing, wrap it forward under the furring bottoms, and let the siding's first course pin the front edge. Don't block the airflow — the mesh breathes, a solid closure doesn't.
- Trim flush; it shouldn't be visible below the finished siding.

## Step 3 — Rip the Starter Strip

The starter strip kicks the first course out to the same angle as every other course (each normal course sits on the 2" of plank below it; course 1 has nothing under it without a starter).

- Rip **1¼"-wide strips** from one HardiePlank. One 12' plank ripped into 6 strips yields 72 lf — the perimeter needs ~53 lf, so **one plank does the whole shed** with spare.
- Cut with a circular saw + fiber-cement (PCD) blade against a rip guide, **outdoors, upwind, with an N95/P100 on** — fiber cement dust is crystalline silica. Score-and-snap doesn't work well for long rips.
- Nail the strips along the very bottom of the furring, bottom edges flush with the furring bottoms, one nail per strip per furring line.

## Step 4 — Layout

- **Story pole / chalk lines:** mark course tops every **6.25"** up from the first-course line on the corner furring strips and snap lines, or make a story pole and transfer marks. 16 courses reach the top of the 8' wall (16 × 6.25" = 100", so the top course gets ripped down — see Step 5).
- **First course:** bottom edge hangs **~¼" below the starter strip** to form a drip over the Z-flashing. Keep the bottom edge at least 1" clear of any horizontal surface and 6" clear of grade (the floor is up on piers, so this should be automatic — verify at the low corner).
- **Level check:** the first course sets every course above it. Get it dead level with a laser or 8' level before nailing off.

## Step 5 — Hang the Planks

Work bottom-up, one course at a time around the building. The cut list (`node tools/siding-cuts.js`) gives every piece per wall per course with stagger already worked out — cut a few courses ahead, label the backs (`S-3-1` = south, course 3, piece 1).

**Nailing** (per [8-fasteners.md](8-fasteners.md) §16):
- **3" stainless ring-shank**, blind-nailed **1" down from the top edge**, at **every furring strip** (16" o.c.).
- Keep nails **⅜" or more from plank ends**.
- Drive **flush, not countersunk** — an overdriven nail crushes the fiber cement and loses holding power. Set the gun pressure on a scrap first.

**Butt joints:**
- Land on furring, **⅛" gap**, caulked with paintable sealant after hanging.
- Prime every field-cut end before the piece goes up (touch-up primer or exterior acrylic paint — cut edges are bare cement).

**Metal outside corners:**
- One corner piece **per corner per course** (64 total). Hang the planks on both adjoining walls first, stopping each plank ⅛" shy of the corner (the cut list already builds this in), then slip the corner cap over both plank ends and nail through its top flange. The next course's planks and cap cover the nailing.
- E/W wall planks wrap over the N/S wall buildup at corners — that's why E/W courses are 146⅞", not 144" (one plank + a short piece per course, per the cut list).

**North wall / door:**
- Planks butt to the existing door trim with a **⅛" caulked gap** — do not nail within 2" of the trim edge.
- Courses 0–12 are split by the door: long run west of the door (has a staggered butt joint), short 13⅜" pieces between door trim and the east corner. Courses 13–15 run over the door full-width.
- Confirm there's a **metal drip cap over the door head trim** before siding above it; the course above the door laps over the drip cap flange, with a ¼" air gap above the horizontal leg (don't caulk that gap — it drains).

**Top course (N/S eave walls):**
- 16 courses × 6.25" overshoots the 96" wall by ~4" — rip the top course to end at the top of the wall Zip. Top-of-gap detail: see **Top-of-Wall Transitions** below.
- A ripped top course loses its blind-nail zone: **face-nail** it (2 nails per furring, ¾" from the top edge), and dab the heads with sealant + touch-up paint.

**Gable ends (E/W walls):**
- The cut list covers only the 16 rectangular courses — the gable triangles are measure-in-place. Continue courses up the gable, cutting plank ends at the roof pitch angle (**6/12 = 26.6°**).
- Gable planks need furring backing on the end-truss framing — add vertical 1×3 over the gable studs/webs before starting the triangle.
- Hold the top cuts **~¾" below the rake underside** to form the exhaust slot — see **Top-of-Wall Transitions** below. Cut edges must be primed.

### Top-of-Wall Transitions (Rainscreen Exhaust)

The two wall types terminate differently because the overhangs are built differently (no rafter tails — the eave is battens extended past the wall over the polyiso, open soffit, per [A2-eaves-proposal.md](A2-eaves-proposal.md)).

**N/S eave walls — vented closure block between battens.** The roof's airspace (between battens, above the foam, under the panels) passes directly over the wall top. A blocking board in each batten bay terminates the siding, screens the exhaust, and covers the exposed deck/foam edges — all in one piece:

```
   slope ↗  metal panel / purlins
  ═══════════════════════════════════
   batten ─────────────────────────►  extends 12" past wall
   ░░ 2" polyiso ░░│▒ ← mesh: stapled to block back (top edge),
   ── Zip deck ────│▒       draped down cavity, stapled to wall Zip
      heel blocking│▒┌───┐
      / top plate  │ │blk│ ← 1×6 between battens, ¾" spacers behind,
                   │¾│   │   face flush with furring plane
   wall Zip ──────►│"│───┘
                   │ ├───┐
                   │g│sid│ ← ripped top course laps block bottom ~1",
                   │a│ing│   face-nailed into the block
                   │p│   │
```

- Cut blocks ~22.5" (24" o.c. battens minus 1.5") from 1×6 — PT like the furring, or primed. Height is measure-in-place: from ~1" below the siding top line up to the **top of the polyiso** (underside plane of the battens). Bevel the top edge at 26.6° if desired, but don't extend it up into the between-batten channel — that channel is the exhaust outlet.
- **On the bench:** staple a 4" strip of insect mesh to the back of each block along its top edge.
- Install each block on **¾" spacers** (furring offcuts) with 3" screws into the heel blocking/top plate — its face lands flush with the furring plane. Fold the mesh down the cavity behind and staple its lower edge to the wall Zip just above the furring tops. The mesh now screens the ¾" passage while air flows through.
- Exhaust path: up the wall gap → through the mesh behind the block → into the 1.5" between-batten channel → open soffit and up-slope to the ridge vent. Do not fill the ¾" standoff — a block tight to the Zip corks the rainscreen.
- Run the ripped top siding course up over the block's bottom edge and **face-nail into the block** (it doubles as the top-course nailer). No caulk along the top edge.
- Bonus: the block shields the bare roof-deck and polyiso edges at the wall line from UV, mice, and woodpeckers.

**E/W gable ends — terminated slot vent under the rake.** The gable gap cannot join the roof channel — the Zip deck edge, foam edge, and butyl-sealed gable trim close it off at the rake. It's a dead-end circuit: intake at the bottom mesh, exhaust through a screened slot under the rake overhang:

- Cut furring tops parallel to the rake, **~¾" below the underside of the rake structure** (foam/batten edge, or barge board if installed).
- Cut the siding top edges to the same line — this leaves a continuous downward-facing slot under the 12" rake overhang. Rain-protected; anything that blows in drains out the bottom mesh.
- Screen the slot the same way — mesh stapled to the Zip, folded out over the furring tops.
- **Do not caulk** the siding-to-rake edge.

## Step 6 — Electrical Mounting Blocks (outlets & lights)

Install the siding mounting blocks **as the courses reach them**, not after:

1. Before siding (Step 1), confirm each box location has **solid backing** — a stud/furring line, or add a horizontal 1×3 block between furring strips (leave ½" drainage gaps at its ends so it doesn't dam the rainscreen).
2. Drill the wire penetration through the Zip, pull the cable, and **seal the penetration** with Zip tape or sealant — the WRB is the water barrier, not the block.
3. When the course row reaches the block height, fasten the block to the backing, then cut the surrounding planks to it with a **⅛" caulked gap** on sides and bottom.
4. **Flash the top:** the block's built-in flange or a strip of Zip tape/drip cap behind the course above, so water sheds over the block face rather than behind it.

## Step 7 — Gutters on the Wall

Wall-mounted brackets have two problems on a rainscreen wall: the fastener has to reach real wood, and it must not crush the siding into the ¾" air gap.

- **Land every bracket on a stud line** (which is also a furring line — 16" o.c.). Marks made on the Zip in Step 1 transfer up via the furring strips.
- **Fastener:** stainless or coated structural screw long enough for the buildup — 5/16" plank + ¾" furring + 7/16" Zip = 1.5" before wood, so a **3½"–4" screw** gets 2"+ into the stud.
- **Pre-drill the HardiePlank** at each screw location (fiber cement cracks if a lag wanders) and snug the screw until the bracket bears — **stop before the plank deflects**. Because the bracket lands over a furring strip, the sandwich is solid there; that's the whole reason for hitting the stud lines.
- Bed each bracket in a dab of exterior sealant and cap the screw heads with the same. Any hole through the siding that misses (there's always one) gets filled with sealant immediately.
- If a bracket must land between studs, add horizontal blocking behind the siding **before** that course goes up — there is no fixing this after.

## Step 8 — Caulk and Paint

- Caulk: all butt joints, siding-to-door-trim, siding-to-mounting-block sides/bottoms. **Do not caulk** the bottom of any lap, the gap above the door drip cap, or the top/bottom rainscreen vents — those all drain or breathe by design.
- Paint: planks come pre-primed; finish-coat all faces with exterior acrylic. Every field cut should already have primer from Step 5 — the finish coat goes over it.

---

## Cut List & Materials

Full per-piece cut list: `node tools/siding-cuts.js` (77 stock planks, 141 pieces, stagger and corner gaps computed). Quantities table is in [5-wall-layers.md](5-wall-layers.md), with these deltas:

| Item | Change |
|------|--------|
| HardiePlank starter strip (5 × 12') | **Not needed** — rip 1 plank into 1¼" strips instead |
| Aluminum outside corners | 64 pieces (4 corners × 16 courses), plus gable-course corners are N/A (gables have no outside corners) |
| Structural screws for gutter brackets | 3½"–4" SS/coated, qty per bracket count |
| Siding mounting blocks | Per fixture count (outlets + lights) |

## Safety Notes

- **Silica dust:** all fiber-cement cutting outdoors, upwind, N95/P100 respirator, PCD blade or fiber-cement shears. Shears make no dust — prefer them for notches and short cuts.
- HardiePlank is floppy and snaps under its own weight — carry 12' planks on edge, two people or a plank carrier.
