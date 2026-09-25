const ground = box2dblocks.createGround([
    box2dblocks.point(10, 115),
    box2dblocks.point(150, 115)
])
const tilemapWalls = box2dblocks.createTilemapWalls()
control.assert(tilemapWalls.type == box2d.BodyType.Static, 0x211)
control.assert(tilemapWalls.kind == PhysicsBodyKind.Wall, 0x212)

const body = box2dblocks.createBody(
    box2d.BodyType.Dynamic,
    PhysicsBodyKind.Body,
    box2dblocks.circle(6)
)
bodyData.setNumber(body, "health", 100)
bodyData.changeNumber(body, "health", -10)
bodyData.setBody(body, "ground", ground)
control.assert(bodyData.getNumber(body, "health") == 90, 0x213)
control.assert(bodyData.getBody(body, "ground") == ground, 0x214)
const bodySprite = sprites.create(image.create(1, 1))
bodyData.setSpriteBody(bodySprite, "body", body)
bodyData.setSpriteBodyArray(bodySprite, "bodies", [body, ground])
control.assert(bodyData.getSpriteBody(bodySprite, "body") == body, 0x215)
control.assert(bodyData.getSpriteBodyArray(bodySprite, "bodies").length == 2, 0x216)
bodySprite.destroy()
box2dblocks.setCollisionGroup(body, -1)
box2dblocks.setBodyMaterial(body, 0.5, 2, 0.1)
body.x = 80
body.y = 20
body.vx = 10
body.vy = 20
control.assert(body.vx == 10 && body.vy == 20, 0x20d)
control.assert(box2dblocks.bodyAt(box2dblocks.point(80, 20)) == body, 0x208)

const polygonBody = box2dblocks.createBody(
    box2d.BodyType.Dynamic,
    PhysicsBodyKind.Body,
    box2dblocks.polygon([
        box2dblocks.point(-8, 6),
        box2dblocks.point(0, -8),
        box2dblocks.point(8, 6)
    ])
)

box2dblocks.onCollision(PhysicsBodyKind.Body, PhysicsBodyKind.Wall, function (fallingBody, wall) {
    box2dblocks.applyLinearImpulseAtAngle(fallingBody, 2, -Math.PI / 2)
})
control.assert(!box2dblocks.bodiesTouching(body, polygonBody), 0x20e)
control.assert(box2dblocks.contactPoints(body, polygonBody).length == 0, 0x20f)
control.assert(!box2dblocks.isOnGround(body), 0x210)
control.assert(!box2dblocks.isBeingSquished(body), 0x217)
box2dblocks.setKindsCollide(PhysicsBodyKind.Body, PhysicsBodyKind.Projectile, false)

const leftBody = box2dblocks.createEmptyBody(box2d.BodyType.Static, PhysicsBodyKind.Body)
leftBody.x = 20
leftBody.y = 20
box2dblocks.addShape(leftBody, box2dblocks.box(10, 10), box2dblocks.point(0, 0), 0)
const leftBottomRight = box2dblocks.bodyPoint(leftBody, box2dblocks.BodyAnchor.BottomRight)
control.assert(leftBottomRight.x == 25 && leftBottomRight.y == 25, 0x20c)

const middleBody = box2dblocks.createEmptyBody(box2d.BodyType.Dynamic, PhysicsBodyKind.Body)
middleBody.x = 100
middleBody.y = 50
box2dblocks.addShape(middleBody, box2dblocks.box(20, 20), box2dblocks.point(0, 0), 0)

const rightBody = box2dblocks.createEmptyBody(box2d.BodyType.Dynamic, PhysicsBodyKind.Body)
rightBody.x = 140
rightBody.y = 50
box2dblocks.addShape(rightBody, box2dblocks.box(10, 10), box2dblocks.point(0, 0), 0)

const wheelJoint = box2dblocks.attachBodies(
    middleBody,
    box2dblocks.bodyAnchor(box2dblocks.BodyAnchor.Right),
    rightBody,
    box2dblocks.bodyAnchor(box2dblocks.BodyAnchor.Left),
    box2dblocks.AttachmentJointType.Wheel
)
box2dblocks.setJointMotor(wheelJoint, false, 0, 10)
box2dblocks.setJointLimits(wheelJoint, true, -5, 5)
box2dblocks.setWheelSuspension(wheelJoint, 10, 1)
const connectedOffset = rightBody.x - middleBody.x

const sliderBody = box2dblocks.createBody(
    box2d.BodyType.Dynamic,
    PhysicsBodyKind.Body,
    box2dblocks.box(8, 8)
)
sliderBody.x = 180
sliderBody.y = 50
const sliderJoint = box2dblocks.attachBodies(
    ground,
    box2dblocks.jointOffset(180, 50),
    sliderBody,
    box2dblocks.bodyAnchor(box2dblocks.BodyAnchor.Center),
    box2dblocks.AttachmentJointType.Prismatic
)
box2dblocks.setJointMotor(sliderJoint, false, 0, 10)
box2dblocks.setJointLimits(sliderJoint, true, -10, 10)

const weldedBody = box2dblocks.createBody(
    box2d.BodyType.Dynamic,
    PhysicsBodyKind.Body,
    box2dblocks.box(8, 8)
)
weldedBody.x = 180
weldedBody.y = 80
box2dblocks.attachBodies(
    ground,
    box2dblocks.jointOffset(180, 80),
    weldedBody,
    box2dblocks.bodyAnchor(box2dblocks.BodyAnchor.Center),
    box2dblocks.AttachmentJointType.Weld
)

const pulleyBodyA = box2dblocks.createBody(
    box2d.BodyType.Dynamic,
    PhysicsBodyKind.Body,
    box2dblocks.box(8, 8)
)
pulleyBodyA.x = 210
pulleyBodyA.y = 80
const pulleyBodyB = box2dblocks.createBody(
    box2d.BodyType.Dynamic,
    PhysicsBodyKind.Body,
    box2dblocks.box(8, 8)
)
pulleyBodyB.x = 250
pulleyBodyB.y = 80
box2dblocks.createPulleyJoint(
    pulleyBodyA,
    box2dblocks.bodyAnchor(box2dblocks.BodyAnchor.Top),
    box2dblocks.point(210, 40),
    pulleyBodyB,
    box2dblocks.bodyAnchor(box2dblocks.BodyAnchor.Top),
    box2dblocks.point(250, 40),
    1
)

box2dblocks.attachBodies(
    leftBody,
    box2dblocks.bodyAnchor(box2dblocks.BodyAnchor.BottomRight),
    middleBody,
    box2dblocks.bodyAnchor(box2dblocks.BodyAnchor.TopLeft)
)

control.assert(Math.abs(middleBody.x - 35) < 0.001, 0x200)
control.assert(Math.abs(middleBody.y - 35) < 0.001, 0x201)
control.assert(Math.abs(rightBody.x - middleBody.x - connectedOffset) < 0.001, 0x202)

middleBody.x = 45
middleBody.y = 55
middleBody.angle = Math.PI / 4
control.assert(Math.abs(middleBody.x - 45) < 0.001, 0x203)
control.assert(Math.abs(middleBody.y - 55) < 0.001, 0x204)
control.assert(Math.abs(middleBody.angle - Math.PI / 4) < 0.001, 0x205)

const offsetBody = box2dblocks.createEmptyBody(box2d.BodyType.Dynamic, PhysicsBodyKind.Body)
offsetBody.x = 100
offsetBody.y = 100
box2dblocks.attachBodies(
    leftBody,
    box2dblocks.jointOffset(3, 4),
    offsetBody,
    box2dblocks.jointOffset(-2, -1)
)
control.assert(Math.abs(offsetBody.x - 25) < 0.001, 0x206)
control.assert(Math.abs(offsetBody.y - 25) < 0.001, 0x207)

const distanceBody = box2dblocks.createBody(
    box2d.BodyType.Dynamic,
    PhysicsBodyKind.Body,
    box2dblocks.circle(4)
)
distanceBody.x = 80
distanceBody.y = 80
const distanceJoint = box2dblocks.attachBodies(
    ground,
    box2dblocks.jointOffset(80, 115),
    distanceBody,
    box2dblocks.bodyAnchor(box2dblocks.BodyAnchor.Center),
    box2dblocks.AttachmentJointType.Distance
)
box2dblocks.configureDistanceJoint(distanceJoint, 35, 35, 35)
const distanceStart = box2dblocks.jointPoint(distanceJoint, box2dblocks.JointPoint.Start)
const distanceCenter = box2dblocks.jointPoint(distanceJoint, box2dblocks.JointPoint.Center)
const distanceEnd = box2dblocks.jointPoint(distanceJoint, box2dblocks.JointPoint.End)
control.assert(distanceStart.x == 80 && distanceStart.y == 115, 0x209)
control.assert(distanceCenter.x == 80 && distanceCenter.y == 97.5, 0x20a)
control.assert(distanceEnd.x == 80 && distanceEnd.y == 80, 0x20b)

const dragSprite = sprites.create(image.create(1, 1))
const dragBody = box2dblocks.createBody(
    box2d.BodyType.Dynamic,
    PhysicsBodyKind.Body,
    box2dblocks.circle(4)
)
const mouseJoint = box2dblocks.createMouseJoint(
    dragSprite,
    dragBody,
    box2dblocks.bodyAnchor(box2dblocks.BodyAnchor.Center)
)
box2dblocks.destroyJoint(mouseJoint)
dragSprite.destroy()
