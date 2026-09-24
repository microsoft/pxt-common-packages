# Box2D Blocks

Blocks for scene-aware Box2D physics in MakeCode Arcade. The package lazily
creates one world per game scene, automatically steps it, draws attached shapes,
and raises body collision events. Body positions, velocities, shape dimensions,
gravity, and custom joint offsets use pixels; angles use radians.

Attaching a shape consumes its template. The body owns the resulting fixture,
and destroying the body also destroys its fixtures and connected joints.
Shape blocks create shape variables. Passing one to create-body creates its
first fixture with default material settings. The attach-shape block can add
more fixtures or customize their material and drawing options.
Collision groups apply to every existing fixture on a body and are retained for
fixtures added later. Equal positive groups always collide, equal negative
groups never collide, and group zero uses normal Box2D filtering.
Body kinds collide with every other kind by default. Pair-specific collision
rules allocate filter categories lazily, so kinds that only use the default do
not consume Box2D's limited category bits. Re-enabling a pair releases kinds
that no longer participate in any custom rule. Any number of default kinds can
be used; up to 15 distinct kinds can simultaneously participate in custom
collision rules.
The bodies-touching block reports whether two bodies have at least one pair of
fixtures touching in the latest physics state. Sensor contacts count as
touching. The contact-points block returns all current manifold points between
two bodies as world-space pixel points. Multiple fixtures can produce multiple
points; sensor contacts can be touching without producing manifold points.
The on-ground block checks for a physical contact whose support normal points
against the current scene gravity. Its optional maximum slope is measured in
degrees from level ground and defaults to 45 degrees. Walls, ceilings, and
sensor-only overlaps do not count as ground.
Polygon shapes accept a list of body-local pixel point blocks. Points must
describe a convex polygon in boundary order.
New bodies start at the center of the screen with an angle of zero. Use the
combined body property blocks to change their `x`, `y`, or angle afterward.
Forces and linear impulses accept either x/y components or a nonnegative
magnitude and radian angle. Their optional body-local anchor defaults to the
body center; selecting another anchor also produces rotation.
The body-material block requires friction and optionally overrides density and
restitution. It updates every existing fixture immediately. Fixtures added
later use the material values supplied to the add-shape block. Omitted density
or restitution values retain their previous per-fixture settings.
Edge shapes are centered on the body and use a pixel length and radian angle.
The create-ground block accepts a list of world-space point blocks and creates
one static Wall-kind body with an open edge chain connecting them in order.
The create-tilemap-walls block creates one static Wall-kind body for the
current scene. Before each Box2D update it checks the tilemap wall image
identity and revision, and rebuilds fixtures only when the wall pixels, map
dimensions, or tile scale actually change. Nonrectangular wall regions are
traced into closed one-sided chain contours around the remaining open regions.
Space outside the tilemap is treated as solid, matching Arcade tilemap
collision behavior. A connected region uses a box fixture only when every tile
in its bounding rectangle is a wall and the rectangle does not touch the map
edge. Repeated calls return the same body; destroying it disables
synchronization until the block is called again.
The body-at block returns the first-created body with a fixture containing the
requested world-space pixel coordinate, or `null` if no body is there. Box2D
point tests do not treat zero-width edge and chain fixtures as containing a
point.
The body-point block returns the live world-space pixel position for a named
body anchor such as its center, an edge midpoint, or a corner.

The `attach` block creates either a revolute or wheel joint between named points
such as the center, edge midpoints, or corners of two bodies. Wheel joints use a
vertical suspension axis. The anchor dropdowns are shadow blocks that can be
replaced with an `offset x y` block for a body-local coordinate.
The distance-joint block uses the same body-local anchor dropdowns and offsets,
but it does not reposition either body before creating the joint.
The joint-point block returns the live start, center, or end position in pixels.
Start belongs to the first body passed to the attach block and end belongs to
the second; center is the midpoint between the two anchors.
Both variants return the same block-facing joint type. Motor and limit blocks
work with either variant; wheel limits use pixels while revolute limits use
radians. The suspension block rejects non-wheel joints.
Before creating the joint, the second body and every body already attached to it
are translated so that the two selected points coincide. Connected dynamic and
kinematic bodies move together even when they are attached to a static body;
static bodies themselves are never repositioned. If the selected second body
is static, the first body and its movable connections are repositioned instead.

The mouse-joint block connects an anchor on a dynamic body to a sprite. A hidden
static body follows the sprite and updates the native mouse-joint target each
frame. Destroying the mouse joint or target body cleans up the hidden body
immediately; destroying the sprite cleans everything up on the next frame.

Body `x`, `y`, `vx`, `vy`, `angle (radians)`, `left`, `top`, `right`, and
`bottom` properties use combined getter/setter blocks like sprite properties.
Linear velocity uses pixels per second. The edge properties use the world-space
bounds of every attached shape and move the body so the selected edge reaches
the requested pixel coordinate.

The separate **Body Data** category stores typed values directly on bodies. It
provides scalar and array set/get blocks for strings, numbers, booleans,
tilemap locations, images, sprites, and bodies. Number data also has a change
block, and body functions can be defined by key and called later. Missing
number values read as zero. Data remains attached to the TypeScript body object
even after its native physics object is destroyed. The **Sprite Bodies** group
contains separate sprite-target APIs for storing and retrieving a body or body
array without mixing those blocks with the body-target versions.

This package depends on `box2d`; it contains only the block-facing TypeScript
API and no additional physics implementation.
