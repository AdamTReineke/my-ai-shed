# Shed Construction Checklist

*Building from the ground up - 16' x 12' shed with joist-over-beam floor on concrete piers*

---

## Open Questions & Design Decisions

*Resolve these before finalizing materials and construction details. Decided items marked with [x].*

### Decisions Made
- [x] **Framing**: 2x6 studs at 16" o.c., insulated
- [x] **Siding**: HardiePlank cedarmill texture, 8.25" plank with ~7" exposure, 16' on back (south), 12' on other sides
- [x] **Siding finish**: Primed, field-painted to match house
- [x] **Size**: 16' x 12' (192 sf, under 200 sf threshold)
- [x] **Permitting**: No structural permit; electrical permitted separately
- [x] **HVAC**: DIY mini-split and/or dehumidifier
- [x] **Location**: Redmond, WA (climate zone 4C, marine)
- [x] **Design life**: 50 years
- [x] **Primary use**: Storage (all walls clear, minimal electrical)
- [x] **Windows**: None
- [x] **Door**: Single wood man door (already purchased, measurements TBD), north wall east end
- [x] **Floor insulation**: Polyiso rigid foam between joists (Rmax ThermoSheath-3, 3" R-20.3, purchased)
- [x] **Roof insulation**: At roof plane (unvented/hot roof)
- [x] **Electrical**: Underground trench (DIY), 2 circuits (mini-split dedicated + lights/outlets), electrician for wiring. Two-switch design: one for lights, one master kill switch.
- [x] **Pier skirting**: None for now
- [x] **Exterior colors**: Matching house (already selected)
- [x] **Access**: Steps with landing at door (door opens inward)

### Still Open

#### Roof
- [ ] **Metal roof profile?** Standing seam vs exposed fastener - see tradeoffs above. What's your preference?
- [ ] **Roof color?**
- [ ] **Gutters?** Recommend yes for pier foundation protection. Aluminum, with downspout extensions 4'+ from piers.

<move to a new file, 11-trades.md. Well insulated with rarely being opened and no heat load, it seems that tiny will be great.>
#### HVAC Details
- [ ] **Mini-split sizing?** 9,000 BTU (3/4 ton) is likely right for well-insulated 192 sf storage. 12,000 BTU if you want fast heat-up.
- [ ] **Mini-split placement?** Which wall for indoor head? Which wall for outdoor unit?
- [ ] **Dehumidifier?** In Redmond, a mini-split alone may not control humidity in shoulder seasons (50F, 90% RH). A standalone dehumidifier with drain line through the floor is worth considering for protecting stored items.

#### Interior Finish
- [ ] **Wall covering?** For a storage shed, three reasonable options:
  - Leave Rockwool exposed with wire stays (cheapest, functional)
  - 1/2" plywood on walls you want to hang things on, exposed elsewhere
  - Full plywood all walls (~$200-300 in material)
- [ ] **Floor finish?** Epoxy, sealer, or bare Advantech?

<move to a new file, 11-trades.md>
#### Exterior
- [ ] **Exterior lighting?** Motion-activated, switched from inside, or none?

---

## 0. Permits & Planning

- [x] ~~Check if permit required~~ - Under 200 sf, no structural permit
- [x] Confirm setback requirements (property lines, easements) - *still applies even without permit*
- [x] Verify utility locations (call 811) - *required for electrical trench if underground feed*
- [ ] Pull electrical permit for power feed to shed

### Tools & Safety
- [x] Post-hole digger or auger
- [x] Level (4' minimum)
- [x] String line and line level <used laser level instead>
- [x] Transit or laser level (for elevation control)
- [x] Circular saw / miter saw
- [x] Drill/impact driver
- [x] Framing nailer (optional but recommended)
- [x] Safety glasses, hearing protection, gloves
- [x] First aid kit on site

---

## 1. Site Preparation & Layout

### Survey & Marking
- [x] Verify property setbacks with Redmond requirements
- [x] Mark 16' x 12' footprint corners (16' E-W, 12' N-S)
- [x] Mark 6 pier center locations (1', 8', 15' from east edge on each beam line)
- [x] Verify beam lines at 1.5' and 10.5' from north edge
- [x] Check diagonals for square
- [x] Set up batter boards for string lines
- [x] Establish elevation reference point (east = high ground)
- [x] Survey ground slope (expect ~28" drop east to west)
- [x] Calculate pier top elevations to achieve level beams

### Site Clearing
- [x] Remove vegetation from footprint + 2' perimeter
- [x] Remove roots that could affect pier locations
- [x] Grade for drainage away from shed location

---

## 2. Concrete Piers (6 total)

### Excavation
- [x] Dig 4 corner pier holes: wide enough for BigFoot 25.5" base × 24" deep
- [x] Dig 2 center pier holes: wide enough for BigFoot 29.5" base × 24" deep
- [x] Verify depth below 12" frost line
- [x] Level and compact bottom of each hole (BigFoot base must sit on undisturbed/compacted soil)
- [x] Check for groundwater intrusion

**Note:** East and center piers rise to beam level — beam sits directly on concrete via saddle hardware (no posts). Only west piers are short and use 6×6 posts. Verify pier top elevations at east/center positions match beam bottom elevation. See `shed/concrete.js` for as-built measurements.

### Forming & Pouring
- [x] Check weather - need 48+ hours without rain/freeze
- [x] Set BigFoot form feet in holes, level on compacted soil
- [x] Attach sonotubes to BigFoot bases (10" for corners, 12" for centers; cut tubes to length)
  <actual dimensions as-poured are recorded in concrete.js>
- [x] Set tube forms plumb
- [x] Level form tops at correct elevations (accounting for 28" slope)
- [x] Brace forms securely
- [x] East and center pier forms taller (beam sits directly on saddle at these 4 positions)
- [x] Cut GFRP rebar to length (hacksaw — wear dust mask for fiberglass dust)
- [x] Insert one vertical GFRP bar per pier partway through pour, adjust to keep centered
- [x] Mix/order 4000 psi concrete
- [x] Pour and vibrate to consolidate
- [x] Screed tops flat and level
- [x] Leave smooth for post-install anchors
- [x] Cover and protect from rain
- [x] Cure minimum 7 days before loading

### Post-Pour
- [x] Strip tube forms
- [x] Backfill around piers
- [x] Compact backfill

---

## 3. Post Bases & Hardware

### Layout Verification
- [ ] Re-check pier positions against beam layout
- [ ] Mark anchor bolt locations on pier tops
- [ ] Verify elevations match design (east piers highest)

### Anchor Installation
- [ ] Drill 5/8" holes for Titen HD screw anchors (min 6" deep, overdrill 1/2" past embedment)
- [ ] Install Simpson ABU66SS at east positions (2) - beam direct to concrete, using 5/8" × 6" Titen HD (THDB62600H4SS)
- [ ] Install Simpson ABU66SS at center positions (2) - beam direct to concrete, using 5/8" × 6" Titen HD
- [ ] Install Simpson ABU66SS at west positions (2) - for 6×6 posts, using 5/8" × 6" Titen HD
- [ ] Torque all anchors to spec (max 85 ft-lbf)

---

## 4. Vertical Posts (West Only — 2 posts)

*East and center positions have no posts — beam sits directly on tall piers via ABU66SS saddles.*

### Cutting
- [ ] Measure beam-bottom-to-pier-top gap at each west position (after pier cure)
- [ ] Cut 2 west posts: 6×6 × measured height (subtract hardware heights)
- [ ] Allow ~1" extra for final leveling cuts

### Installation
- [ ] Set posts in ABU66SS bases at west positions
- [ ] Check plumb on two faces
- [ ] Temporarily brace posts
- [ ] Install Simpson CC66 post caps on both west posts

---

## 5. Beams (2 × 16')

### Fabrication
- [ ] Select straight stock: 2×10 outer plies (4 pcs) + 3×10 center ply (2 pcs), all 16' PT Hem-Fir #2
- [ ] Crown all pieces same direction
- [ ] Clamp all 3 plies together, drill 1/2" holes through full 5.5" width
- [ ] Laminate with 1/2" × 6.5" HDG carriage bolt + nut + 2 washers, staggered top/bottom at 24" o.c. (8 bolts per beam); edge distance ≥ 1.5"

### Installation
- [ ] Set beams in ABU66SS saddles at east end (beam direct to concrete)
- [ ] Set beams in ABU66SS saddles at center (beam direct to concrete)
- [ ] Shim all 4 ABU66SS positions with 1/2" structural plywood each side of beam
- [ ] Set beams in CC66 post caps at west posts
- [ ] Verify beams are level east-to-west
- [ ] Verify beams are parallel (9' apart center-to-center)
- [ ] Verify 1' cantilever at each end
- [ ] Bolt post caps to beams per CC66 spec (5/8" × 8" HDG bolts)

---

## 6. Floor Joists

### Layout
- [ ] Mark joist locations on beams at 16" o.c.
- [ ] Verify 13 joists fit in 16' span (joist-over-beam framing — no hangers)

### Joist Installation
- [ ] Cut 11 field joists: 2×8 × 12'
- [ ] Set joists on top of beams, bear directly (joist-over-beam)
- [ ] Verify 1.5' cantilever past each beam on both N and S sides
- [ ] Install Simpson H2.5ASS hurricane ties at each joist-beam intersection (26 total — 13 joists × 2 beams); SS nails per Simpson schedule
- [ ] Check joists for level and adjust as needed

### Rim Joists
- [ ] Cut 2 rim joists: 2×8 × 16'
- [ ] Install at joist ends (east and west)
- [ ] Face-nail through rim into joist ends

### Blocking
- [ ] Cut 24 blocks: 2×8 × 14.5"
- [ ] Install blocking between joists at each beam line
- [ ] Toe-nail or use Simpson A35 angles
- [ ] Ensure tight fit for diaphragm shear transfer

---

## 7. Subfloor

### Sheathing
- [ ] Dry-fit 6 sheets of 3/4" plywood/Advantech
- [ ] Stagger joints - no 4-corner intersections
- [ ] Leave 1/8" gap at panel edges for expansion
- [ ] Glue with construction adhesive (optional but recommended)
- [ ] Fasten with 8d ring-shank or #8 × 2" screws
- [ ] Nail schedule: 6" o.c. at edges, 12" o.c. in field
- [ ] Set fastener heads flush (not countersunk)

### Quality Check
- [ ] Walk floor checking for squeaks
- [ ] Verify no bounce or excessive deflection
- [ ] Check perimeter is square for wall framing
- [ ] Check floor is level side-to-side and end-to-end
- [ ] Verify cantilever lengths (1.5' past each beam)

---

## 8. Wall Framing

### Bottom Plates
- [ ] Cut PT bottom plates to length
- [ ] Mark stud layout at 16" o.c.
- [ ] Mark door rough opening on north wall (east end, ~33" wide × ~78" tall)
- ~~Mark window rough openings~~ - No windows

### Stud Walls (2×6 at 16" o.c.)
- [ ] Cut studs to height (92-5/8" for 8' walls)
- [ ] Cut top plates (single, then double)
- [ ] Frame walls flat on deck
- [ ] Install cripples, headers, king studs, jack studs at openings
- [ ] Square each wall before standing

### Wall Raising
- [ ] Raise and brace first wall
- [ ] Raise remaining walls
- [ ] Nail bottom plates to subfloor/rim
- [ ] Plumb and brace corners
- [ ] Nail corners together
- [ ] Install double top plates with staggered joints
- [ ] Overlap top plates at corners (minimum 24" past joint)
- [ ] Tie top plate corners with metal straps or let-in

### Lateral Bracing (Seismic D, 110 mph wind)
- [ ] Install let-in bracing or structural sheathing on walls
- [ ] Nail sheathing per high-wind schedule if required
- [ ] Install hold-down anchors at shear wall ends if required

### Headers
- [ ] Size per span: (2) 2×6 up to 4', (2) 2×8 up to 6', (2) 2×10 up to 8'
- [ ] Install with 1/2" plywood spacer if needed for wall depth

---

## 9. Roof Structure

### Truss Components (per truss × 9)
- [ ] Cut bottom chords: 2×4 × 12' (144")
- [ ] Cut rafters: 2×4 at 6/12 pitch
- [ ] Mark and cut bird's mouth at wall bearing points
- [ ] Mark and cut plumb cuts at ridge
- [ ] Mark and cut tail cuts at overhang ends
- [ ] Cut queen posts: 2×4 × ~23" (at 46" inset from ends)
- [ ] Cut straining beams: 2×4 × 48" horizontal
- [ ] Cut gusset plates from 1/2" plywood

### Truss Assembly
- [ ] Build assembly jig on shed floor
- [ ] Cut gussets: peak (12"×12"), queen post tops (10"×8"), queen post bottoms (8"×8"), eaves (8"×10")
- [ ] Assemble trusses with construction adhesive + 8d nails at 3" o.c.
- [ ] Double-gusset all joints (both sides)
- [ ] Verify overall dimensions match jig
- [ ] Stack completed trusses flat with stickers

### Truss Installation
- [ ] Mark truss locations on top plates at 24" o.c. (9 trusses)
- [ ] Set first truss at gable end, flush with wall sheathing
- [ ] Install hurricane ties/clips at each bearing point (H2.5A or similar)
- [ ] Brace trusses with temporary lateral bracing
- [ ] Set remaining trusses
- [ ] Verify 1' eave overhang past N/S walls
- [ ] Install permanent purlins or ridge blocking as bracing

### Gable Overhangs (Ladder Framing)
- [ ] Cut lookouts: 2×4 × 36" (8 per gable end, angled to roof plane)
- [ ] Install lookouts at 24" o.c. from second truss to fly rafter
- [ ] Cut fly rafters to match main rafter profile (bird's mouth, plumb cut, tail cut)
- [ ] Install fly rafters at 1' past E/W walls

### Fascia & Barge Boards
- [ ] Install fascia along eaves (1×6 or 1×8)
- [ ] Install barge boards along gable rakes

---

## 10. Roof Sheathing

- [ ] Install 1/2" CDX or OSB
- [ ] Start at eave, work up to ridge
- [ ] Stagger joints
- [ ] H-clips between panels if required
- [ ] Nail 6" o.c. edges, 12" o.c. field
- [ ] Extend to cover fascia edge (drip edge support)

---

## 11. Roofing

### Underlayment
- [ ] Install drip edge at eaves first
- [ ] Install ice & water shield at eaves (2' minimum)
- [ ] Install synthetic underlayment or felt
- [ ] Install drip edge at rakes over underlayment
- [ ] Seal all penetrations

### Metal Roofing
- [ ] Install eave trim/starter
- [ ] Install panels from eave to ridge
- [ ] Overlap panels per manufacturer spec
- [ ] Use correct fasteners (with rubber washers)
- [ ] Don't overdrive fasteners
- [ ] Install ridge cap
- [ ] Install gable trim
- [ ] Seal panel ends at ridge and eave with closure strips
- [ ] Bond metal roofing to ground rod if code requires

---

## 12. Exterior Walls

### Sheathing
- [ ] Install 7/16" Zip System panels (purchased — 24 sheets); integrated WRB replaces plain housewrap on sheathing face
- [ ] Nail per diaphragm schedule: 8d (3" ring-shank HDG) 6" o.c. edges / 12" o.c. field into studs
- [ ] Leave gap at door opening

### Weather Barrier
- [ ] Tape all Zip panel seams with Zip tape
- [ ] At door opening: apply flexible flashing tape (Vycor or similar) at sill, jambs, head (in that order)
- [ ] Integrate with roof underlayment at top
- [ ] Install Tyvek at sill and any areas not covered by Zip panels

### Rainscreen
- [ ] Install Cor-A-Vent SV-3 bug screen strip at base of each wall (¾" gap for air intake)
- [ ] Install 1×3 vertical furring strips at 16" o.c. over Zip panels, aligned with studs (#8 × 3" SS screws)
- [ ] Leave top gap open behind fascia for exhaust

### Siding (HardiePlank Cedarmill, 8.25" plank, 6.25" exposure)
- [ ] Install HardiePlank starter strip at bottom of each wall (behind first course)
- [ ] Install aluminum outside corner pieces course-by-course (4 corners, 16 courses = 64 pieces)
- [ ] Install door trim/casing (PVC or HardieTrim)
- [ ] Install HardiePlank courses from bottom up — all walls use 12' planks; N/S walls need 2 planks per course with butt joints staggered ≥24" between courses
- [ ] Blind-nail 1" from top of plank with 3" SS ring-shank siding nails, into studs (through furring + Zip OSB)
- [ ] Leave 1/8" gap at butt joints; caulk with paintable exterior sealant
- [ ] Prime and paint all cut edges immediately (exposed fiber cement absorbs water)
- [ ] Field-paint to match house

---

## 13. Door Installation

*(No windows)*

### Door
- [ ] Verify rough opening
- [ ] Install threshold/sill pan
- [ ] Set door unit
- [ ] Shim hinge side first
- [ ] Check operation
- [ ] Fasten through shims
- [ ] Install hardware
- [ ] Flash head
- [ ] Install exterior casing
- [ ] Caulk perimeter
- [ ] Weatherstrip as needed

### Flashing Details
- [ ] Flashing tape at door corners
- [ ] Metal drip cap above door

---

## 14. Electrical

### Underground Feed (DIY trench, hired electrician)
- [ ] Plan trench route from house panel to shed
- [ ] Call 811 before digging
- [ ] Dig trench (18" deep minimum for UF cable, 24" for PVC conduit)
- [ ] Install conduit in trench
- [ ] Electrician: pull wire through conduit
- [ ] Backfill and compact trench

### Shed Wiring (electrician)
- [ ] Install small sub-panel (4-space, electrician will size)
- [ ] Circuit 1: Mini-split dedicated circuit (20A or 30A per unit spec)
- [ ] Circuit 2: Lights + outlets (15A or 20A)
- [ ] Install two switches by door: one for lights, one main disconnect (kills all power)
- [ ] Install outlet(s) near door
- [ ] Install LED light fixture(s)
- [ ] Mini-split whip/disconnect on exterior wall
- [ ] Pull electrical permit
- [ ] Schedule inspection

---

## 15. Insulation & Interior Finishing

### Floor Insulation (before or after subfloor - see Section 7)
- [ ] Drop hardware cloth between joists from above; staple to joist sides or bottom edges (cloth acts as shelf for foam)
- [ ] Lower 3" polyiso boards (Rmax ThermoSheath-3 R-20.3) onto cloth — foam rests between cloth (below) and subfloor (above)
- [ ] Cut boards snug; seal edges with canned spray foam for air sealing

### Wall Insulation
- [ ] Install batts in all wall cavities (Rockwool R-23 recommended - see cost comparison in Open Questions)
- [ ] Friction-fit, no gaps at edges or around wiring/boxes

### Roof Plane Insulation (hot roof - no attic ventilation)
- [ ] Install batts between truss top chords (R-15 Rockwool or R-13 fiberglass in 3.5" cavity)
- [ ] Hold in place with insulation support wire (zig-zag wire stapled between rafters)
- [ ] Optional: add 1-1.5" rigid foam board under rafters for extra R-value (~R-20 to R-23 total)
- [ ] Optional: install CertainTeed MemBrain smart vapor retarder under rafters (~$50-70 for whole ceiling, good insurance for hot roof)

### Interior Walls (optional - see Open Questions)
- [ ] Install interior sheathing if desired (plywood recommended over drywall for storage shed)

### Floor Finish (optional - see Open Questions)
- [ ] Apply epoxy, sealer, or leave bare Advantech

---

## 16. Final Details

### Ventilation
- ~~Attic ventilation~~ - Not required: insulating at roof plane (unvented/hot roof assembly)
- [ ] Ensure air sealing is thorough at wall-to-roof connection
- [ ] Rely on mini-split / dehumidifier for interior moisture control

### Exterior
- [ ] Touch up paint/caulk
- [ ] Install address numbers if required
- [ ] Final grading for drainage away from shed
- [ ] Install splash blocks or gutters
- [ ] Install downspout extensions if needed

### Hardware & Security
- [ ] Seal all six sides of wood door (especially bottom edge) before installation — repaint/reseal every 3-5 years in PNW
- [ ] Install door locks
- [ ] Install any shelving brackets
- [ ] Install any wall-mounted storage

### Inspection & Documentation
- [ ] Schedule electrical inspection (required for permitted work)
- [ ] Document as-built dimensions
- [ ] Keep electrical permit and inspection records

---

## Materials Procurement Checklist

### Concrete & Foundation
- [ ] Concrete (4000 psi) - ~26 cf total for 6 piers (59 × 60-lb bags, or 64 with 10% waste)
- [ ] BigFoot form feet 25.5" (BF24) × 4 (corner piers)
- [ ] BigFoot form feet 29.5" (BF28) × 2 (center piers)
- [ ] Sonotubes 10" dia × 48" × 4 (corners, cut to length on site)
- [ ] Sonotubes 12" dia × 48" × 2 (centers, cut to length on site)
- [ ] GFRP (fiberglass) rebar #4 - ~12 lf total (one ~2' vertical bar per pier)
- [ ] Zip ties (for securing rebar to tube tops during pour)
- [ ] Simpson ABU66SS × 6 (all positions — beam saddle at east/center, post base at west)
- [ ] Simpson CC66 × 2 (west only — beam-to-post column caps)
- [ ] Titen HD screw anchors 5/8" × 6" (THDB62600H4SS) × 6 — purchased
- [ ] 1/2" × 7" SS hex bolts + nuts + washers × 12 sets (ABU66SS beam attachment) — purchased
- [ ] 5/8" × 8" HDG bolts + nuts + washers × 12 sets (CC66 beam/post attachment) — purchased
- [ ] Structural shims 1/2" plywood × 8 pcs (for ABU66SS, each side of beam at 4 positions)

### Framing Lumber (PT for ground contact)
- [ ] 6×6 PT posts - 2 pcs for west positions only (measure after pier cure)
- [ ] 2×10 PT × 16' × 4 (beam outer plies: 2 per beam × 2 beams)
- [ ] 3×10 PT × 16' × 2 (beam center ply: 1 per beam × 2 beams)
- [ ] 2×8 PT × 12' × 11 (field joists)
- [ ] 2×8 PT × 16' × 2 (rim joists)
- [ ] 2×8 PT blocking stock

### Framing Lumber (standard)
- [ ] 2×6 studs - count based on wall layout
- [ ] 2×6 plates - perimeter × 3 (bottom + double top)
- [ ] 2×4 truss stock
- [ ] 2×6, 2×8 header stock (only door opening, no windows)

### Hardware
- [ ] Simpson H2.5ASS hurricane ties × 26 (joist-over-beam uplift restraint — stainless)
- [ ] Simpson H2.5A hurricane ties × 18 (truss-to-top-plate — HDG)
- [ ] Simpson A35 × 48 (optional for blocking — alternative to toe-nailing)
- [ ] Simpson SD9 × 1-1/2" connector screws × 200 (truss ties) — purchased
- [ ] 1/2" × 6.5" HDG carriage bolts + nuts + washers × 16 sets (beam lamination) — purchased
- [ ] 3" × 0.131" HDG ring-shank framing nails (blocking, subfloor, wall sheathing, roof sheathing) — purchased
- [ ] 2" × 0.113" HDG ring-shank nails × 3,000 ct (truss gussets) — purchased
- [ ] 16d HDG smooth common nails (rim joists) — purchased
- [ ] 16d bright common nails (wall framing, lookouts) — purchased (short ~100, buy one more box)
- [ ] 3" SS ring-shank siding nails (HardiePlank)
- [ ] #8 × 3" SS deck screws (furring strips)

### Sheathing
- [ ] 3/4" T&G Advantech subfloor × 6 sheets
- [ ] 1/2" CDX or OSB roof sheathing × 10 sheets
- [ ] 1/2" structural plywood for truss gussets × 2 sheets
- [x] 7/16" Zip System wall panels × 24 sheets (purchased — integrated WRB)

### Roofing
- [ ] Metal roofing panels (~200 sf)
- [ ] Ridge cap
- [ ] Eave/gable trim
- [ ] Roofing screws with washers
- [ ] Ice & water shield
- [ ] Synthetic underlayment
- [ ] Drip edge

### Siding & Exterior
- [ ] HardiePlank 8.25" cedarmill 12' planks — ~70 to start (all walls use 12' stock; buy more as needed)
- [ ] HardiePlank starter strip — 5 strips (12' each, covers 53 lf perimeter minus door)
- [ ] Aluminum outside corner pieces — 64 pcs (4 corners × 16 courses, sold individually)
- [ ] 1×3 furring strips × 8' — ~58 strips (rainscreen)
- [ ] Cor-A-Vent SV-3 bug screen — ~60 lf (base of rainscreen gap)
- [ ] Metal Z-flashing — ~60 lf (base of wall)
- [ ] Zip tape (Zip System seam tape)
- [ ] Tyvek (for sill/jamb flashing areas not covered by Zip panels)
- [ ] Door casing/trim — PVC or HardieTrim
- [ ] 3" SS ring-shank siding nails (~1,500 ct)
- [ ] #8 × 3" SS deck screws (~120 ct, furring strips)
- [ ] Caulk (exterior grade, paintable)
- [ ] Primer + paint (match house)

### Door (already purchased - wood man door)
- [ ] Flashing tape
- [ ] Metal drip cap
- [ ] Exterior casing (HardieTrim or match siding trim)
- [ ] Door hardware (lock, hinges if not prehung)
- [ ] Weatherstripping
- [ ] Threshold

### Insulation & Vapor
- [x] Wall insulation batts - Rockwool ComfortBatt R-23 15" × 10 packs ~398 sf (purchased; may need 1-2 more packs)
- [ ] Roof plane insulation batts - ~192 sf (Rockwool R-15 or fiberglass R-13)
- [x] Polyiso rigid foam for floor - Rmax ThermoSheath-3 3" R-20.3 foil-faced 4×8 sheets × 6 (purchased)
- [ ] Canned spray foam for sealing foam edges
- [x] 1/4" galvanized hardware cloth - 4'×25' rolls × 2 (purchased; ~200 sf coverage)
- [ ] Insulation support wire (for holding roof batts in place)
- [ ] Optional: CertainTeed MemBrain smart vapor retarder (~200 sf for roof plane)
- [ ] Optional: 1-1.5" rigid foam for under-rafter boost

### Electrical (materials by electrician, listed for reference)
- [ ] Underground conduit + wire (house to shed)
- [ ] Small sub-panel (4-space)
- [ ] Outlet(s), switch(es), light fixture(s)
- [ ] Mini-split disconnect/whip

### Access
- [ ] Steps / stringers for door entry
- [ ] Landing platform (~36" deep minimum)

---

*Last updated: 2026-02-11*
