function runTumblerDemo() {
    // Inspired by Box2D 2.4.1's testbed/tests/tumbler.cpp (Erin Catto, MIT).
    // License: vendor/box2d-2.4.1/LICENSE.
    // A motor turns a hollow dynamic body while small boxes fall into it.
    const TUMBLER_HALF_SIZE = 4
    const WALL_HALF_THICKNESS = 0.2
    const BOX_HALF_SIZE = 0.24
    const MAX_BOXES = 48
    const PIXELS_PER_METER = 8
    const TIME_STEP = 1 / 60
    const SPAWN_EVERY_STEPS = 12
    const MOTOR_SPEED = 0.4
    const MOTOR_TORQUE = 10000
    const BOX_COLORS = [2, 4, 5, 7, 8, 9, 10, 12]
    const WALL_HALF_LENGTH = TUMBLER_HALF_SIZE + WALL_HALF_THICKNESS
    const SMALL_BOX = [BOX_HALF_SIZE, BOX_HALF_SIZE, 0, 0]
    const WALL_BOXES = [
        [WALL_HALF_THICKNESS, WALL_HALF_LENGTH, TUMBLER_HALF_SIZE, 0],
        [WALL_HALF_THICKNESS, WALL_HALF_LENGTH, -TUMBLER_HALF_SIZE, 0],
        [WALL_HALF_LENGTH, WALL_HALF_THICKNESS, 0, TUMBLER_HALF_SIZE],
        [WALL_HALF_LENGTH, WALL_HALF_THICKNESS, 0, -TUMBLER_HALF_SIZE]
    ]
    let tumblerWorld: box2d.World
    let tumbler: box2d.Body
    let tumblerMotor: box2d.RevoluteJoint
    let tumblerBoxes: box2d.Body[] = []
    let motorDirection = 1
    let spawnSteps = 0
    let accumulator = 0
    let lastUpdate = 0
    const drawView = [PIXELS_PER_METER, 0, 0]
    const drawVertices = [0, 0, 0, 0, 0, 0, 0, 0]

    // Fixtures copy this template. Keep just one to reuse across spawns and resets.
    const smallBoxShape = box2d.Shape.box(BOX_HALF_SIZE, BOX_HALF_SIZE)

    // PXT needs explicit function values to capture helpers in sibling callbacks.
    const addTumblerWall = function (halfWidth: number, halfHeight: number, x: number, y: number) {
        const shape = box2d.Shape.box(halfWidth, halfHeight, x, y)
        tumbler.createFixture(shape, 5, 0.5)
        shape.destroy()
    }

    const spawnTumblerBox = function () {
        if (tumblerBoxes.length >= MAX_BOXES) return
        // Spread new boxes across three lanes instead of always using the same point.
        const index = tumblerBoxes.length
        const body = tumblerWorld.createBody(
            box2d.BodyType.Dynamic, (index % 3 - 1) * 0.6, 0, (index % 5) * 0.15
        )
        body.createFixture(smallBoxShape, 1, 0.3, 0.1)
        tumblerBoxes.push(body)
    }

    const resetTumbler = function () {
        if (tumblerWorld) tumblerWorld.destroy()
        tumblerBoxes = []
        tumblerWorld = new box2d.World(0, 10)
        const ground = tumblerWorld.createBody(box2d.BodyType.Static)
        tumbler = tumblerWorld.createBody(box2d.BodyType.Dynamic)
        tumbler.setFlag(box2d.BodyFlag.SleepingAllowed, false)

        for (let i = 0; i < WALL_BOXES.length; ++i) {
            const wall = WALL_BOXES[i]
            addTumblerWall(wall[0], wall[1], wall[2], wall[3])
        }

        tumblerMotor = ground.createRevoluteJoint(tumbler, 0, 0)
        motorDirection = 1
        tumblerMotor.setMotor(true, MOTOR_SPEED, MOTOR_TORQUE)
        spawnSteps = 0
        accumulator = 0
        lastUpdate = game.runtime()
        spawnTumblerBox()
    }

    const drawTumblerBox = function (target: Image, body: box2d.Body, box: number[], color: number) {
        body.readBoxVertices(box, drawView, drawVertices)
        target.fillPolygon4(drawVertices[0], drawVertices[1], drawVertices[2], drawVertices[3],
            drawVertices[4], drawVertices[5], drawVertices[6], drawVertices[7], color)
        target.drawLine(drawVertices[0], drawVertices[1], drawVertices[2], drawVertices[3], 1)
    }

    resetTumbler()

    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        motorDirection = -motorDirection
        tumblerMotor.setMotor(true, motorDirection * MOTOR_SPEED, MOTOR_TORQUE)
    })

    controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
        resetTumbler()
    })

    game.onUpdate(function () {
        const now = game.runtime()
        // Fixed steps with bounded catch-up keep slow frames/menu pauses from destabilizing physics.
        accumulator += Math.min((now - lastUpdate) / 1000, TIME_STEP * 3)
        lastUpdate = now
        while (accumulator >= TIME_STEP) {
            tumblerWorld.step(TIME_STEP)
            accumulator -= TIME_STEP
            ++spawnSteps
            if (spawnSteps >= SPAWN_EVERY_STEPS) {
                spawnSteps = 0
                spawnTumblerBox()
            }
        }
    })

    scene.createRenderable(0, function (target: Image) {
        target.fill(15)
        drawView[1] = target.width >> 1
        drawView[2] = target.height >> 1
        for (let i = 0; i < tumblerBoxes.length; ++i) {
            drawTumblerBox(target, tumblerBoxes[i], SMALL_BOX, BOX_COLORS[i % BOX_COLORS.length])
        }

        for (let i = 0; i < WALL_BOXES.length; ++i) {
            drawTumblerBox(target, tumbler, WALL_BOXES[i], 11)
        }
        target.drawLine(drawView[1] - 2, drawView[2], drawView[1] + 2, drawView[2], 1)
        target.drawLine(drawView[1], drawView[2] - 2, drawView[1], drawView[2] + 2, 1)

        target.print("BOX2D TUMBLER", 2, 2, 1)
        target.print("" + tumblerBoxes.length + "/" + MAX_BOXES, target.width - 32, 2, 5)
        target.print("A:reverse B:reset", 32, target.height - 9, 1)
    })
}
