// const ground = box2dBlocks.createGround([
//     box2dBlocks.point(10, 115),
//     box2dBlocks.point(150, 115)
// ])

// const body = box2dBlocks.createBody(
//     box2d.BodyType.Dynamic,
//     PhysicsBodyKind.Body,
//     box2dBlocks.circleShape(6)
// )
// body.x = 80
// body.y = 20
// control.assert(box2dBlocks.bodyAt(80, 20) == body, 0x208)

// const polygonBody = box2dBlocks.createBody(
//     box2d.BodyType.Dynamic,
//     PhysicsBodyKind.Body,
//     box2dBlocks.polygonShape([
//         box2dBlocks.point(-8, 6),
//         box2dBlocks.point(0, -8),
//         box2dBlocks.point(8, 6)
//     ])
// )

// box2dBlocks.onCollision(PhysicsBodyKind.Body, PhysicsBodyKind.Wall, function (fallingBody, wall) {
//     box2dBlocks.applyLinearImpulseToCenter(fallingBody, 0, -2)
// })

// const leftBody = box2dBlocks.createBody(box2d.BodyType.Static, PhysicsBodyKind.Body)
// leftBody.x = 20
// leftBody.y = 20
// box2dBlocks.attachShape(leftBody, box2dBlocks.boxShape(5, 5))

// const middleBody = box2dBlocks.createBody(box2d.BodyType.Dynamic, PhysicsBodyKind.Body)
// middleBody.x = 100
// middleBody.y = 50
// box2dBlocks.attachShape(middleBody, box2dBlocks.boxShape(10, 10))

// const rightBody = box2dBlocks.createBody(box2d.BodyType.Dynamic, PhysicsBodyKind.Body)
// rightBody.x = 140
// rightBody.y = 50
// box2dBlocks.attachShape(rightBody, box2dBlocks.boxShape(5, 5))

// const wheelJoint = box2dBlocks.attachBodies(
//     middleBody,
//     box2dBlocks.bodyAnchor(box2dBlocks.BodyAnchor.Right),
//     rightBody,
//     box2dBlocks.bodyAnchor(box2dBlocks.BodyAnchor.Left),
//     box2dBlocks.AttachmentJointType.Wheel
// )
// box2dBlocks.setJointMotor(wheelJoint, false, 0, 10)
// box2dBlocks.setJointLimits(wheelJoint, true, -5, 5)
// box2dBlocks.setWheelSuspension(wheelJoint, 10, 1)
// const connectedOffset = rightBody.x - middleBody.x

// box2dBlocks.attachBodies(
//     leftBody,
//     box2dBlocks.bodyAnchor(box2dBlocks.BodyAnchor.BottomRight),
//     middleBody,
//     box2dBlocks.bodyAnchor(box2dBlocks.BodyAnchor.TopLeft)
// )

// control.assert(Math.abs(middleBody.x - 35) < 0.001, 0x200)
// control.assert(Math.abs(middleBody.y - 35) < 0.001, 0x201)
// control.assert(Math.abs(rightBody.x - middleBody.x - connectedOffset) < 0.001, 0x202)

// middleBody.x = 45
// middleBody.y = 55
// middleBody.angle = Math.PI / 4
// control.assert(Math.abs(middleBody.x - 45) < 0.001, 0x203)
// control.assert(Math.abs(middleBody.y - 55) < 0.001, 0x204)
// control.assert(Math.abs(middleBody.angle - Math.PI / 4) < 0.001, 0x205)

// const offsetBody = box2dBlocks.createBody(box2d.BodyType.Dynamic, PhysicsBodyKind.Body)
// offsetBody.x = 100
// offsetBody.y = 100
// box2dBlocks.attachBodies(
//     leftBody,
//     box2dBlocks.jointOffset(3, 4),
//     offsetBody,
//     box2dBlocks.jointOffset(-2, -1)
// )
// control.assert(Math.abs(offsetBody.x - 25) < 0.001, 0x206)
// control.assert(Math.abs(offsetBody.y - 25) < 0.001, 0x207)

// const dragSprite = sprites.create(image.create(1, 1))
// const dragBody = box2dBlocks.createBody(
//     box2d.BodyType.Dynamic,
//     PhysicsBodyKind.Body,
//     box2dBlocks.circleShape(4)
// )
// const mouseJoint = box2dBlocks.createMouseJoint(
//     dragSprite,
//     dragBody,
//     box2dBlocks.bodyAnchor(box2dBlocks.BodyAnchor.Center)
// )
// box2dBlocks.destroyMouseJoint(mouseJoint)
// dragSprite.destroy()
