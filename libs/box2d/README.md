# Box2D for MakeCode Arcade

Box2D **2.4.1**, bundled as C++, with `box2d` Static TypeScript classes and a
low-level `box2dNative` API. Native worlds, bodies, shapes, fixtures, and joints
are represented by opaque PXT `RefObject` handles, so unreachable objects are
released by the MakeCode garbage collector. Enums and physics values remain
numeric. Functions with more than four public arguments pack values and object
references into an array before crossing PXT's four-argument native-call boundary.

The browser simulator runs the same C++ implementation compiled to an embedded
WebAssembly module with Emscripten. This package does not replace Arcade's
sprite physics or automatically draw bodies. Box2D consumes additional RAM and
flash; available scene size depends on the board and the rest of the game.

See [Rebuilding the simulator WebAssembly](#rebuilding-the-simulator-webassembly)
for the exact toolchain and commands used to regenerate `sim/wasm.ts`.

## Sample programs

Building this package itself launches the **car** sample. Set `DEMO` in `test.ts`
to `"car"`, `"tumbler"`, or `"pyramid"` to select a sample. Only the selected
program creates native objects and registers handlers; the other samples' data
stays unallocated.
Native smoke checks are opt-in via `RUN_SMOKE_TESTS` in the same file and are
disabled by default.

### Car (`test-car.ts`)

Inspired by the [Box2D 2.4.1 car testbed](https://github.com/erincatto/box2d/blob/v2.4.1/testbed/tests/car.cpp),
this sample has a six-vertex chassis, two circular wheels, and real wheel-joint
suspension tuned to 4 Hz with a 0.7 damping ratio and +/-0.25 m travel. A scrolling
camera follows the car over hills, a hinged seesaw, a suspension bridge, crates,
and a ramp/jump. Positive Y is flipped from the upstream example to match Arcade.

**Hold right/left to drive forward/reverse, release to coast, hold A to brake,
and press B to reset.** The rear wheel is driven; the front rolls freely.
Falling into the jump gap resets the scene automatically.

For smaller boards, the bridge has **eight planks** rather than twenty, and the
crate stack has **three boxes** rather than five: **16 bodies total**, with no
continuous spawning. Terrain uses three static chain fixtures. Templates are
released after fixtures copy them, and fallen crates are destroyed. Drawing
reuses integer vertex buffers and projects the chassis silhouette from its
bounds; it does not allocate body snapshots. Physics uses fixed 1/60-second
steps with at most three catch-up steps per frame. This is a reduced course
adaptation, not a pixel-exact port or a guarantee of hardware memory capacity.

### Tumbler (`test-tumbler.ts`)

The preserved tumbler sample is inspired by the
[Box2D 2.4.1 tumbler testbed](https://github.com/erincatto/box2d/blob/v2.4.1/testbed/tests/tumbler.cpp):
a dynamic four-wall container is pinned to a static body by a motorized revolute
joint, while small dynamic boxes are added near its center.

The Arcade version uses a configurable **`MAX_BOXES` limit**, a slower spawn rate, and a scaled
container that stays on the 160x120 screen through a full rotation. Colored
boxes and walls are drawn directly from their physics transforms, without
Arcade sprite physics. **A reverses rotation; B resets and refills the tumbler.**
The screen also shows the current box count.

### Pyramid (`test-pyramid.ts`)

The pyramid demo stacks 55 dynamic boxes in ten rows. Press **A** to launch a
heavy box from the left, hold **up/down** to aim, and press **B** to rebuild the
pyramid. At most eight launched boxes remain alive; the oldest is destroyed
before another is created.

Physics uses fixed 1/60-second steps, with at most three catch-up steps per
frame. Slow frames or menu pauses can slow simulation rather than trigger an
unbounded catch-up loop. Reset destroys the old world and its contents; the
single reusable small-box shape is retained. As with the rest of the package, this demo runs on native hardware and in the
browser simulator.
Rendering reuses one eight-number vertex array, one view array, and persistent
rectangle definitions. Rotation, projection, and rounding happen in the native
binding; TypeScript draws from integer pixel coordinates without reading
fractional poses or creating `BodySnapshot` objects.

**PyBadge memory limit:** the 48-box configuration has been reported to fail
with panic **021** (heap exhaustion), even with integer rendering and smoke
checks disabled. Contact storage and solver scratch memory can continue growing
after spawning stops. Lower `MAX_BOXES` to leave headroom; a successful native
build or host run does not establish that a scene fits on hardware.

## Example

```typescript
const world = new box2d.World(0, 9.8)
const ground = world.createBody(box2d.BodyType.Static, 5, 7)
const groundShape = box2d.Shape.box(5, 0.5)
ground.createFixture(groundShape, 0)
groundShape.destroy()

const ball = world.createBody(box2d.BodyType.Dynamic, 5, 1)
const circle = box2d.Shape.circle(0.5)
ball.createFixture(circle, 1, 0.2, 0.6)
circle.destroy()

const ballSprite = sprites.create(img`
    . 2 2 2 2 .
    2 2 2 2 2 2
    2 2 2 2 2 2
    2 2 2 2 2 2
    . 2 2 2 2 .
`)
game.onUpdateInterval(20, function () {
    world.step(0.02)
    const state = ball.getState()
    ballSprite.setPosition(
        state.x * 15,
        state.y * 15
    )
})
```

The interval and simulation step both use 20 ms. A delayed frame slows this
simple example rather than passing an unstable, large time step to Box2D.
The example uses 15 pixels per meter; sprite dimensions and drawing are up to
the game. Do not also apply Arcade velocity, acceleration, or tile collisions
to a sprite whose position you control with Box2D.

## TypeScript classes

`wrappers.ts` implements the class API. It delegates to the unchanged low-level
functions in `main.ts`; no extra C++ bindings are needed.

| Class | Creation and main operations |
| --- | --- |
| `World` | `new World(gravityX?, gravityY?)`, `createBody`, `step`, `setGravity`, `setSleepingAllowed`, `getContacts`, `queryAABB`, `rayCast`, `destroy` |
| `Body` | `world.createBody(type, x?, y?, angle?)`, `createFixture`, `getState`, `readTransform`, `readBoxVertices`, `setPosition`, `setTransform`, `setLinearVelocity`, `setType`, `setDamping`, `setGravityScale`, `setFlag`, `getFlag`, force/impulse and coordinate methods, `destroy` |
| `Shape` | Static `circle`, `box`, `polygon`, `edge`, and `chain` factories; `destroy` |
| `Fixture` | `body.createFixture(shape, density?, friction?, restitution?, sensor?)`, `body`, `setMaterial`, `setSensor`, `setFilter`, `testPoint`, `destroy` |
| `Joint` | `getAnchors`, `destroy` |
| `DistanceJoint` | `body.createDistanceJoint(other, anchorX, anchorY, otherAnchorX, otherAnchorY, collideConnected?)`, `getAnchors`, `configure(length, minLength, maxLength, stiffness?, damping?)`, `destroy` |
| `RevoluteJoint` | `body.createRevoluteJoint(other, anchorX, anchorY, collideConnected?)`, `setMotor`, `setLimits`, `destroy` |
| `WheelJoint` | `body.createWheelJoint(other, anchorX, anchorY, axisX, axisY, collideConnected?)`, `setMotor`, `setLimits`, `setSuspension`, `destroy` |
| `MouseJoint` | `body.createMouseJoint(other, anchorX, anchorY, maxForce, stiffness, damping)`, `setTarget`, `destroy` |

All joint classes extend `Joint`. All native-object wrappers expose a read-only opaque `.handle` and a live
`.valid` property. Calling `.destroy()` releases an object immediately; otherwise
the MakeCode garbage collector releases it after the last reference disappears.
Fixtures retain their body, joints retain both bodies, bodies retain their
connected joints, and every world-owned object retains its world. A joint
therefore remains alive while either connected body is alive unless it is
destroyed explicitly. Destroying a world/body invalidates wrappers of its native
children. Destruction through the public API is not idempotent: destroying
through one wrapper invalidates all views of that handle.

Wheel-joint anchors and suspension axes are specified in world space. The axis
must be nonzero and is normalized natively. `setLimits(enabled, lower, upper)`
uses meters of travel along that axis; `setMotor(enabled, speed, maxTorque)`
uses radians/second and N*m. `setSuspension(stiffness, damping)` uses N/m and
N*s/m, not frequency and damping ratio. The car converts its chosen frequency
and damping ratio using the wheel mass, as the upstream sample does.

`body.getState()` returns a detached `BodySnapshot` with `x`, `y`, `angle`,
`velocityX`, `velocityY`, `angularVelocity`, `mass`, and `inertia`.
Convenience properties `body.position`, `body.linearVelocity`, `body.angle`,
`body.angularVelocity`, `body.mass`, and `body.inertia` each read native state.
Use one `getState()` call when reading several fields per frame to avoid
repeated native calls and allocations. Assigning `body.angle` or
`body.angularVelocity` updates native state; use `setPosition(x, y)` and
`setLinearVelocity(x, y)` for vectors.

Mouse joints require a dynamic second body. Their creation point becomes the
local anchor on that body, while `setTarget(x, y)` updates the world-space point
that the anchor follows. Maximum force, stiffness, and damping must be
nonnegative.

For reusable access to a body's pose, use `body.readTransform(output)` (or the low-level
`box2dNative.readBodyTransform(handle, output)`) instead:

```typescript
const transform = [0, 0, 0] // Allocate once, outside the update/drawing callback.
// Each frame:
ball.readTransform(transform)
// transform[0] = x, transform[1] = y, transform[2] = angle in radians
```

The output array must already have at least three entries. The reader overwrites
only those entries, leaves any remaining entries unchanged, and never resizes
the array or constructs a `BodySnapshot`. Invalid handles, null output, or an
undersized array stop execution with panic 906. One buffer can be shared across
bodies if each transform is consumed before the next read.

This reduces each pose read from eight numeric conversions to three and removes
the per-read array/snapshot allocations. Fractional numbers still require PXT
boxing, and drawing arithmetic and Box2D itself still allocate memory; this is
not an allocation-free path or a guarantee that 48 bodies fit on hardware.
`getState()` retains its existing detached-snapshot behavior.

For rectangle rendering, `body.readBoxVertices(box, view, output)` goes further:
it performs the rotation, projection, and pixel rounding in C++. The equivalent
low-level call is `box2dNative.readBodyBoxVertices(handle, box, view, output)`.

```typescript
// Allocate these once, not inside the drawing callback.
const box = [0.5, 0.25, 0, 0] // Half width/height and body-local center, in meters.
const view = [8, 80, 60]      // Pixels per meter and the screen origin.
const vertices = [0, 0, 0, 0, 0, 0, 0, 0]
body.readBoxVertices(box, view, vertices)
// vertices = [x0, y0, x1, y1, x2, y2, x3, y3], ready for Image.fillPolygon4.
```

`box` must contain exactly four numbers, `view` exactly three, and `output`
at least eight entries. The rectangle is axis-aligned in body-local space,
then rotated with the body; this function projects the supplied geometry, not
the body's fixtures. Positive Y points down. Half extents follow the same
minimum size as `Shape.box`; the scale must be positive, and all input scalars
must satisfy the binding's finite +/-1,000,000 bounds.

Corners are ordered from local top-left to top-right, bottom-right, bottom-left.
Rounding matches `Math.round`, including negative half-pixels. Rounded
coordinates must be within +/-30,000, matching Arcade's line-drawing range and
fitting PXT's tagged integers. Invalid inputs stop with panic 906 before changing
any output entries; trailing output entries are preserved.

Reuse all three arrays to avoid call-site allocations. In normal PXT builds,
the native vertex reader uses tagged integers rather than allocating boxed
fractional results, and does not create or resize arrays. Physics, spawning,
and other game code still allocate; this does not establish that 48 bodies fit
on a particular board. The transform and snapshot APIs remain available.

`Vec2` values and body snapshots are ordinary, detached TypeScript data.
Changing `body.position.x` or a snapshot field does **not** move the body.
Coordinate conversion methods return `Vec2` values as well.

Class queries return typed results:

- `world.getContacts()` returns `Contact[]` with `.fixtureA` and `.fixtureB`.
- `world.queryAABB(...)` returns `Fixture[]`.
- `world.rayCast(...)` returns a `RayCastHit` with `.fixture`, `.point`,
  `.normal`, and `.fraction`, or **null** if there is no hit.

Query results and `fixture.body` create fresh wrappers, not cached identities.
Compare `.handle` values rather than wrapper identity to identify the same native object.
This also works for objects originally created through the low-level API:

```typescript
const handle = box2dNative.createBody(world.handle, box2d.BodyType.Dynamic, 2, 3)
const body = new box2d.Body(handle)
body.applyLinearImpulseToCenter(1, 0)
box2dNative.destroyBody(handle)
// body.valid is now false
```

`Body`, `Shape`, `Fixture`, `Joint`, `DistanceJoint`, and `RevoluteJoint`
constructors wrap existing native references; they do not allocate native objects.
Supply a live handle of the matching kind. Native operations validate it;
`.valid` alone only checks whether the handle is live, not its kind.
Joint creation validates that the two bodies are different and in the same world.

## Ownership and handles

- Creation functions return opaque `box2dNative.Handle` references managed by
  the MakeCode garbage collector.
- A body keeps its world and connected joints alive. A fixture keeps its body
  alive, and a joint keeps both bodies alive. Dropping the last reachable
  reference releases the native object graph.
- `destroyWorld` destroys its bodies, fixtures, and joints.
- `destroyBody` destroys its fixtures and joints attached to **either** end.
- Shapes are independent, reusable templates. `createFixture` copies a shape,
  so the template may be destroyed immediately or reused on another body/world.
  Destroying a body/world does **not** destroy shape templates.
- `destroyFixture`, `destroyJoint`, and `destroyShape` release individual objects.
  Explicit destruction is useful for deterministic memory release but is not
  required for garbage-collected objects.
- `isValid` checks whether the referenced native object is still live. Other
  operations require the correct object kind and reject stale or wrong-kind
  handles. Calling a destroy function twice is an error.

## Low-level API

All low-level functions are available in `box2dNative`; `main.ts` has the complete signatures and defaults.
Optional parameters are supplied by TypeScript, not native definition objects.

| Area | Functions |
| --- | --- |
| Worlds | `createWorld`, `destroyWorld`, `setGravity`, `step`, `setWorldSleepingAllowed` |
| Bodies | `createBody`, `destroyBody`, `getBodyState`, `readBodyTransform`, `readBodyBoxVertices`, `setBodyType`, `setTransform`, `setLinearVelocity`, `setAngularVelocity`, `setDamping`, `setGravityScale`, `setBodyFlag`, `getBodyFlag` |
| Forces | `applyForce`, `applyForceToCenter`, `applyLinearImpulse`, `applyLinearImpulseToCenter`, `applyTorque`, `applyAngularImpulse` |
| Coordinates | `getWorldPoint`, `getLocalPoint` |
| Shapes | `createCircleShape`, `createBoxShape`, `createPolygonShape`, `createEdgeShape`, `createChainShape`, `destroyShape` |
| Fixtures | `createFixture`, `destroyFixture`, `getFixtureBody`, `setFixtureMaterial`, `setFixtureSensor`, `setFixtureFilter`, `testPoint` |
| Joints | `createDistanceJoint`, `setDistanceJoint`, `createRevoluteJoint`, `setRevoluteJointMotor`, `setRevoluteJointLimits`, `createWheelJoint`, `setWheelJointMotor`, `setWheelJointLimits`, `setWheelJointSuspension`, `getJointAnchors`, `destroyJoint` |
| Queries | `getContacts`, `queryAABB`, `rayCast`, `isValid` |

`BodyType` is `Static`, `Kinematic`, or `Dynamic`. `BodyFlag` is `Bullet`,
`FixedRotation`, `SleepingAllowed`, `Awake`, or `Enabled`. Distance, revolute,
and wheel joints are bound; other upstream joint types, rope simulation,
debug drawing, and contact callbacks are not exposed.

### Units and constraints

Use meters, kilograms, seconds, radians, and radians/second, **not pixels or
degrees**. Positive Y can point down, matching Arcade. All physical scalar
inputs must be finite and within +/-1,000,000; these are validation bounds,
not a recommendation to simulate at that scale. Prefer moving shapes around
0.1-10 meters in size.

`step` accepts a time step greater than zero and no more than one second, and
integer solver iterations from 1 through 100. Defaults are `1 / 60`, 8 velocity
iterations, and 3 position iterations. Use a small, fixed step. Forces clear
automatically after each step.

Circle radii, box half extents, and distance-joint lengths must be at least
0.005 meters. Edge and adjacent chain vertices must be more than 0.005 meters
apart. Polygon input is 3-8 strictly convex vertices in boundary order
(clockwise or counterclockwise), with no repeated or collinear vertices.
The binding rejects invalid polygons instead of allowing Box2D to substitute
a fallback box. Vertex arrays are `[x0, y0, x1, y1, ...]`.

Chains accept 2-128 vertices, or at least 3 for loops. Do not repeat the first
vertex at the end of a loop. Chains are one-sided: their front face is on the
right of each directed edge. Open-chain ghost vertices are extrapolated from
the end segments. Use edges/chains for static terrain, not dynamic mass.

Density, friction, restitution, damping, stiffness, and maximum motor torque
must be nonnegative. Restitution is usually 0-1, but values above 1 are allowed
by Box2D. Collision category and mask values are unsigned 16-bit integers;
groups are signed 16-bit integers. Joint bodies must be different and belong
to the same world.

Invalid native input stops execution with **panic 906**. Out-of-memory errors
are separate runtime failures. `isValid` is the nonfatal way to check handles;
empty query results are normal, not errors.

### Returned arrays

Arrays are snapshots, not native storage. Mutating them cannot change physics.

| Function | Array layout |
| --- | --- |
| `getBodyState` | `[x, y, angle, velocityX, velocityY, angularVelocity, mass, inertia]`; use `BodyState` indices |
| `getWorldPoint`, `getLocalPoint` | `[x, y]` |
| `getContacts` | `[fixtureA, fixtureB, fixtureA, fixtureB, ...]` |
| `queryAABB` | Unique fixture references |
| `rayCast` | `[fixture, x, y, normalX, normalY, fraction]`; use `RayHit` indices; `[]` for no hit |

Contacts report touching, enabled contacts from the last step, including sensors.
They are not begin/end events; compare snapshots if needed. Chain child contacts
may repeat a fixture pair. Mutations take effect in contact results on subsequent
steps. `getFixtureBody` maps a contact fixture to its owning body.

An AABB query uses broad-phase bounds and can have false positives. Use
`testPoint` for exact point containment in circles/polygons. Ray casts return
the closest hit, include sensors, and follow Box2D's rule that rays starting
inside a convex shape do not hit that shape. Query result ordering is unspecified.

## Development

```sh
mkc build -j                    # Static TypeScript and shim metadata
mkc build -n                    # Native SAMD51 Arcade build (mkc.json)
bash tools/test-native.sh      # Host C++ physics/lifetime/input tests (requires g++)
node tests/wrapper-tests.cjs   # Class forwarding/snapshot tests (Node 22.13+)
node tests/tumbler-tests.cjs   # Demo controls, timing, rendering bounds and reset
node tests/car-tests.cjs       # Car setup, suspension wiring, controls, camera and reset
node tests/native-codegen-tests.cjs # Check sample stack slots after the native build
```

### Rebuilding the simulator WebAssembly

`sim/wasm.ts` contains the compiled Box2D WebAssembly as base64. Regenerate and
commit it whenever `native.cpp`, `sim/bridge.cpp`, the exported native API, or
the selected vendored Box2D sources change.

With an activated Emscripten SDK that provides `em++` on `PATH`, run:

```sh
cd libs/box2d
bash sim/build.sh
node tests/sim-tests.cjs
```

The mouse-joint update was built with Debian/Ubuntu Emscripten 3.1.6 and
LLVM 15. On an Ubuntu 24.04 machine without root access, the required packages
were downloaded and extracted into a temporary directory as follows:

```sh
cd libs/box2d

toolchain="${TMPDIR:-/tmp}/box2d-emscripten"
mkdir -p "$toolchain/debs" "$toolchain/root" "$toolchain/bin"

(
    cd "$toolchain/debs"
    apt download \
        emscripten binaryen clang-15 lld-15 llvm-15 \
        libclang-cpp15t64 libllvm15t64 libclang-common-15-dev \
        llvm-15-linker-tools libclang1-15t64 llvm-15-runtime

    for package in ./*.deb; do
        dpkg-deb -x "$package" "$toolchain/root"
    done
)
```

The Ubuntu package's `/usr/bin/em++` wrapper assumes a system installation at
`/usr/share/emscripten`. Point a temporary executable directly at `em++.py`
instead. Its configuration also appends `-15` to LLVM tool names, while the
extracted LLVM directory contains mostly unsuffixed names, so create matching
temporary symlinks:

```sh
root="$toolchain/root"
ln -sf "$root/usr/share/emscripten/em++.py" "$toolchain/bin/em++"

(
    cd "$root/usr/lib/llvm-15/bin"
    for path in clang clang++ ld.lld llvm-* llc opt wasm-ld; do
        test -e "$path" || continue
        case "$path" in
            *-15) ;;
            *) ln -sf "$path" "$path-15" ;;
        esac
    done
)
```

Override every system path from the packaged `.emscripten` configuration, then
run the normal build script:

```sh
multiarch_lib="$(find "$root/usr/lib" -maxdepth 1 -type d -name '*-linux-gnu' -print -quit)"

export PATH="$toolchain/bin:$root/usr/bin:$PATH"
export EM_CONFIG="$root/usr/share/emscripten/.emscripten"
export EM_LLVM_ROOT="$root/usr/lib/llvm-15/bin"
export EM_BINARYEN_ROOT="$root/usr"
export EM_CACHE="$root/usr/share/emscripten/cache"
export EM_NODE_JS="$(command -v node)"
export LD_LIBRARY_PATH="$multiarch_lib:$root/usr/lib/llvm-15/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

bash sim/build.sh
node tests/sim-tests.cjs
```

`sim/build.sh` permits the intentional unresolved `box2d_panic` import and
exports every `bx_*` function consumed by `sim/box2d.ts`. The simulator test
instantiates the generated module, so it catches missing exports and imports in
addition to exercising the native implementation.

After a successful build, remove the temporary toolchain:

```sh
rm -rf "$toolchain"
```

`test-native.ts` and `test-wrappers.ts` define `runNativeSmokeTests()` and
`runWrapperSmokeTests()`. Set `RUN_SMOKE_TESTS = true` in `test.ts` to run them
before the demo. Their temporary objects and arrays are function-local, so even
when enabled they are not retained by global variables afterward. The default
is false to avoid the test allocation workload during ordinary demo startup.
These files are included only when building this package itself, not when
importing it as an extension.
Wrapper host tests use mocked primitive functions, not a simulator physics engine.
The C++ host tests compile the actual
Box2D sources and binding code, using a small test-only PXT ABI model.
They also exercise a 48-box tumbler stress scene, including reversal and
containment, and wheel-joint suspension/driving behavior. Demo JavaScript tests
use a mocked world to check sample selection, scene wiring and
the actual drawing/control code.
They do not emulate the MakeCode garbage collector or hardware.
The native-codegen check also inspects the compiled sample stack references.
Keep nested sample helpers as function-valued `const` declarations, not named
function declarations: Arcade 4.1.25 can miscompile the latter when referenced
from sibling closures, reading an unrelated stack slot as a function and
triggering a cast panic such as 982 on hardware.
`mkc.json` selects `samd51`; change `hwVariant` for another Arcade board
(for example, `stm32f401`). Output firmware is under `built/<hwVariant>/`.
After changing API signatures in `main.ts`, run
`python3 tools/generate-bindings.py` to regenerate `bindings.cpp` and
`native-api.h` and the internal `packed.d.ts` shim declarations, then implement
matching functions in `native.cpp`.

The vendored release and MIT license are under `vendor/box2d-2.4.1`.
`python3 tools/vendor-box2d.py` fetches the pinned release, verifies its SHA-256,
rewrites includes to relative paths, and updates the source list in `pxt.json`.
Named enum declarations are reflowed so MakeCode's line-based shim parser does
not publish Box2D's private enums; all headers remain in the package for builds.
The per-world scratch allocator is reduced from 100 KiB to 8 KiB for Arcade;
Box2D's existing heap fallback handles larger steps without changing physics.
Block-allocation chunks are reduced from 16 KiB to 4 KiB (below PXT's
single-allocation limit), with chunk tables growing by 16 instead of 128 entries.
These changes reduce the memory overhead of small scenes; they do not cap the
number of bodies. Total available RAM and PXT allocation limits still apply.
The native joint factory enables only the exposed distance, revolute, and wheel types
by default, allowing unused joint solvers to be removed by the linker so the
SAMD51 firmware fits in flash. C++ builds can define `B2_ENABLE_EXTRA_JOINTS=1`
to restore the other upstream joint types; this does not add TypeScript bindings.
Keep the upstream license with redistributed sources.
