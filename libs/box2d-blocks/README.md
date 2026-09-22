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
Polygon shapes accept a list of body-local pixel point blocks. Points must
describe a convex polygon in boundary order.
New bodies start at the center of the screen with an angle of zero. Use the
combined body property blocks to change their `x`, `y`, or angle afterward.
Edge shapes are centered on the body and use a pixel length and radian angle.
The create-ground block accepts a list of world-space point blocks and creates
one static Wall-kind body with an open edge chain connecting them in order.
The body-at block returns the first-created body with a fixture containing the
requested world-space pixel coordinate, or `null` if no body is there. Box2D
point tests do not treat zero-width edge and chain fixtures as containing a
point.

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

Body `x`, `y`, `angle (radians)`, `left`, `top`, `right`, and `bottom`
properties use combined getter/setter blocks like sprite properties. The edge
properties use the world-space bounds of every attached shape and move the body
so the selected edge reaches the requested pixel coordinate.

This package depends on `box2d`; it contains only the block-facing TypeScript
API and no additional physics implementation.
