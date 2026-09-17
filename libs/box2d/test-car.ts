// Adapted from Box2D 2.4.1's testbed/tests/car.cpp (Erin Catto, MIT).
// License: vendor/box2d-2.4.1/LICENSE. Positive Y is down in this version.
function runCarDemo() {
    const SCALE = 12
    const STEP = 1 / 60
    const BRIDGE_PLANKS = 8
    const CRATES = 3
    const BRIDGE_END = 160 + 2 * BRIDGE_PLANKS
    const WHEEL_RADIUS = 0.4
    const WHEEL_PIXELS = Math.round(WHEEL_RADIUS * SCALE)
    const SPEED = 50
    const TORQUE = 20
    const OMEGA = 2 * Math.PI * 4
    const WHEEL_MASS = Math.PI * WHEEL_RADIUS * WHEEL_RADIUS
    const STIFFNESS = WHEEL_MASS * OMEGA * OMEGA
    const DAMPING = 2 * WHEEL_MASS * 0.7 * OMEGA
    const PLANK = [1, 0.125, 0, 0]
    const CRATE = [0.5, 0.5, 0, 0]
    const SEESAW = [10, 0.25, 0, 0]
    const WHEEL = [WHEEL_RADIUS, WHEEL_RADIUS, 0, 0]
    const CHASSIS_BOUNDS = [1.5, 0.7, 0, -0.2]
    const CAMERA_POINT = [0.01, 0.01, 0, 0]
    const CHASSIS = [-1.5, 0.5, 1.5, 0.5, 1.5, 0, 0, -0.9, -1.15, -0.9, -1.5, -0.2]
    const worldView = [SCALE, 0, 0]
    const view = [SCALE, 0, 0]
    const vertices = [0, 0, 0, 0, 0, 0, 0, 0]
    const chassisPixels = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    const hills = [0.25, 1, 4, 0, 0, -1, -2, -2, -1.25, 0]
    const firstRoad = [-20, -20, -20, 0, 20, 0]
    for (let repeat = 0; repeat < 2; ++repeat) {
        for (let i = 0; i < hills.length; ++i) {
            firstRoad.push(25 + (repeat * hills.length + i) * 5)
            firstRoad.push(-hills[i])
        }
    }
    firstRoad.push(160)
    firstRoad.push(0)
    const roads = [
        firstRoad,
        [BRIDGE_END, 0, BRIDGE_END + 40, 0, BRIDGE_END + 50, -5],
        [BRIDGE_END + 60, 0, BRIDGE_END + 100, 0, BRIDGE_END + 100, -20]
    ]
    const roadPixels: number[][] = []
    for (let i = 0; i < roads.length; ++i) {
        const pixels: number[] = []
        for (let j = 0; j < roads[i].length; ++j) {
            pixels.push(Math.round(roads[i][j] * SCALE))
        }
        roadPixels.push(pixels)
    }

    let world: box2d.World
    let car: box2d.Body
    let rearWheel: box2d.Body
    let frontWheel: box2d.Body
    let rearSpring: box2d.WheelJoint
    let seesaw: box2d.Body
    let planks: box2d.Body[] = []
    let crates: box2d.Body[] = []
    let driveMode = 2
    let cameraX = 0
    let cameraY = 0
    let accumulator = 0
    let lastUpdate = 0

    // PXT needs explicit function values to capture helpers in sibling callbacks.
    const attach = function (body: box2d.Body, shape: box2d.Shape, density: number, friction: number) {
        body.createFixture(shape, density, friction)
        shape.destroy()
    }

    const suspension = function (wheel: box2d.Body, x: number, y: number): box2d.WheelJoint {
        const joint = car.createWheelJoint(wheel, x, y, 0, 1)
        joint.setSuspension(STIFFNESS, DAMPING)
        joint.setLimits(true, -0.25, 0.25)
        return joint
    }

    const locateCar = function () {
        car.readBoxVertices(CAMERA_POINT, worldView, vertices)
        cameraX = (vertices[0] + vertices[2] + vertices[4] + vertices[6]) >> 2
        cameraY = (vertices[1] + vertices[3] + vertices[5] + vertices[7]) >> 2
    }

    const reset = function () {
        if (world) world.destroy()
        planks = []
        crates = []
        world = new box2d.World(0, 10)
        const ground = world.createBody(box2d.BodyType.Static)
        for (let i = 0; i < roads.length; ++i) {
            attach(ground, box2d.Shape.chain(roads[i]), 0, 0.6)
        }

        seesaw = world.createBody(box2d.BodyType.Dynamic, 140, -1)
        attach(seesaw, box2d.Shape.box(SEESAW[0], SEESAW[1]), 1, 0.6)
        ground.createRevoluteJoint(seesaw, 140, -1).setLimits(true, -8 * Math.PI / 180, 8 * Math.PI / 180)
        seesaw.applyAngularImpulse(-100)

        const plankShape = box2d.Shape.box(PLANK[0], PLANK[1])
        let previous = ground
        for (let i = 0; i < BRIDGE_PLANKS; ++i) {
            const plank = world.createBody(box2d.BodyType.Dynamic, 161 + 2 * i, 0.125)
            plank.createFixture(plankShape, 1, 0.6)
            previous.createRevoluteJoint(plank, 160 + 2 * i, 0.125)
            previous = plank
            planks.push(plank)
        }
        previous.createRevoluteJoint(ground, BRIDGE_END, 0.125)
        plankShape.destroy()

        const crateShape = box2d.Shape.box(CRATE[0], CRATE[1])
        for (let i = 0; i < CRATES; ++i) {
            const crate = world.createBody(box2d.BodyType.Dynamic, BRIDGE_END + 30, -0.5 - i)
            crate.createFixture(crateShape, 0.5, 0.6)
            crates.push(crate)
        }
        crateShape.destroy()

        car = world.createBody(box2d.BodyType.Dynamic, 0, -1)
        attach(car, box2d.Shape.polygon(CHASSIS), 1, 0.2)
        rearWheel = world.createBody(box2d.BodyType.Dynamic, -1, -0.35)
        frontWheel = world.createBody(box2d.BodyType.Dynamic, 1, -0.4)
        const wheelShape = box2d.Shape.circle(WHEEL_RADIUS)
        rearWheel.createFixture(wheelShape, 1, 0.9)
        frontWheel.createFixture(wheelShape, 1, 0.9)
        wheelShape.destroy()
        rearSpring = suspension(rearWheel, -1, -0.35)
        rearSpring.setMotor(true, 0, TORQUE)
        suspension(frontWheel, 1, -0.4).setMotor(false, 0, 10)
        driveMode = 2
        accumulator = 0
        lastUpdate = game.runtime()
        locateCar()
    }

    const drawBox = function (target: Image, body: box2d.Body, box: number[], color: number) {
        body.readBoxVertices(box, view, vertices)
        if (vertices[0] < 0 && vertices[2] < 0 && vertices[4] < 0 && vertices[6] < 0) return
        if (vertices[0] > target.width && vertices[2] > target.width
            && vertices[4] > target.width && vertices[6] > target.width) return
        target.fillPolygon4(vertices[0], vertices[1], vertices[2], vertices[3],
            vertices[4], vertices[5], vertices[6], vertices[7], color)
        target.drawLine(vertices[0], vertices[1], vertices[2], vertices[3], 1)
    }

    const drawWheel = function (target: Image, wheel: box2d.Body) {
        wheel.readBoxVertices(WHEEL, view, vertices)
        const x = (vertices[0] + vertices[2] + vertices[4] + vertices[6]) >> 2
        const y = (vertices[1] + vertices[3] + vertices[5] + vertices[7]) >> 2
        target.fillCircle(x, y, WHEEL_PIXELS, 15)
        target.drawCircle(x, y, WHEEL_PIXELS, 1)
        target.drawLine(x, y, (vertices[2] + vertices[4]) >> 1, (vertices[3] + vertices[5]) >> 1, 13)
    }

    const drawCar = function (target: Image) {
        car.readBoxVertices(CHASSIS_BOUNDS, view, vertices)
        // Interpolate the six chassis corners from its integer projected bounds.
        for (let axis = 0; axis < 2; ++axis) {
            chassisPixels[axis] = vertices[6 + axis]
            chassisPixels[2 + axis] = vertices[4 + axis]
            chassisPixels[4 + axis] = Math.idiv(9 * vertices[4 + axis] + 5 * vertices[2 + axis], 14)
            chassisPixels[6 + axis] = (vertices[axis] + vertices[2 + axis]) >> 1
            chassisPixels[8 + axis] = Math.idiv(53 * vertices[axis] + 7 * vertices[2 + axis], 60)
            chassisPixels[10 + axis] = (vertices[axis] + vertices[6 + axis]) >> 1
        }
        target.fillPolygon4(chassisPixels[0], chassisPixels[1], chassisPixels[2], chassisPixels[3],
            chassisPixels[4], chassisPixels[5], chassisPixels[6], chassisPixels[7], 2)
        target.fillPolygon4(chassisPixels[0], chassisPixels[1], chassisPixels[6], chassisPixels[7],
            chassisPixels[8], chassisPixels[9], chassisPixels[10], chassisPixels[11], 2)
        for (let i = 0; i < 6; ++i) {
            const next = (i + 1) % 6
            target.drawLine(chassisPixels[2 * i], chassisPixels[2 * i + 1],
                chassisPixels[2 * next], chassisPixels[2 * next + 1], 1)
        }
    }

    reset()
    controller.B.onEvent(ControllerButtonEvent.Pressed, reset)
    game.onUpdate(function () {
        const nextMode = controller.A.isPressed() ? 2
            : controller.right.isPressed() ? 1 : controller.left.isPressed() ? -1 : 0
        if (nextMode != driveMode) {
            driveMode = nextMode
            rearSpring.setMotor(driveMode != 0, driveMode == 2 ? 0 : driveMode * SPEED, TORQUE)
        }
        const now = game.runtime()
        accumulator += Math.min((now - lastUpdate) / 1000, STEP * 3)
        lastUpdate = now
        while (accumulator >= STEP) {
            world.step(STEP)
            accumulator -= STEP
        }
        for (let i = crates.length - 1; i >= 0; --i) {
            crates[i].readBoxVertices(CRATE, worldView, vertices)
            if (((vertices[1] + vertices[3] + vertices[5] + vertices[7]) >> 2) > 20 * SCALE) {
                crates[i].destroy()
                crates.removeAt(i)
            }
        }
        locateCar()
        if (cameraY > 20 * SCALE) reset()
    })

    scene.createRenderable(0, function (target: Image) {
        target.fill(9)
        view[1] = (target.width >> 1) - cameraX
        view[2] = Math.idiv(target.height * 3, 5) - cameraY
        for (let road = 0; road < roadPixels.length; ++road) {
            const points = roadPixels[road]
            for (let i = 0; i < points.length - 2; i += 2) {
                const x1 = points[i] + view[1]
                const y1 = points[i + 1] + view[2]
                const x2 = points[i + 2] + view[1]
                const y2 = points[i + 3] + view[2]
                if (x2 < 0 || x1 > target.width) continue
                target.fillPolygon4(x1, y1, x2, y2, x2, target.height, x1, target.height, 11)
                target.drawLine(x1, y1, x2, y2, 7)
            }
        }
        drawBox(target, seesaw, SEESAW, 13)
        for (let i = 0; i < planks.length; ++i) drawBox(target, planks[i], PLANK, 4)
        for (let i = 0; i < crates.length; ++i) drawBox(target, crates[i], CRATE, 5)
        drawCar(target)
        drawWheel(target, rearWheel)
        drawWheel(target, frontWheel)
        target.print("BOX2D CAR", 2, 2, 1)
        target.print("L/R:drive A:brake B:reset", 2, target.height - 9, 1)
    })
}
