function runPyramidDemo() {
    const SCALE = 7
    const STEP = 1 / 60
    const PYRAMID_ROWS = 10
    const BOX_HALF_SIZE = 0.45
    const BOX_SPACING = 0.94
    const GROUND_Y = 7
    const LAUNCH_X = -9
    const MAX_PROJECTILES = 8
    const LAUNCH_IMPULSE = 45
    const BOX = [BOX_HALF_SIZE, BOX_HALF_SIZE, 0, 0]
    const GROUND = [15, 0.5, 0, 0]
    const view = [SCALE, 0, 0]
    const worldView = [SCALE, 0, 0]
    const vertices = [0, 0, 0, 0, 0, 0, 0, 0]
    let world: box2d.World
    let ground: box2d.Body
    let pyramid: box2d.Body[] = []
    let projectiles: box2d.Body[] = []
    let aim = -0.18
    let accumulator = 0
    let lastUpdate = 0

    const boxShape = box2d.Shape.box(BOX_HALF_SIZE, BOX_HALF_SIZE)

    const createBox = function (x: number, y: number, density: number, friction: number) {
        const body = world.createBody(box2d.BodyType.Dynamic, x, y)
        body.createFixture(boxShape, density, friction, 0.05)
        return body
    }

    const resetPyramid = function () {
        if (world) world.destroy()
        pyramid = []
        projectiles = []
        world = new box2d.World(0, 10)
        ground = world.createBody(box2d.BodyType.Static, 0, GROUND_Y)
        const groundShape = box2d.Shape.box(GROUND[0], GROUND[1])
        ground.createFixture(groundShape, 0, 0.7)
        groundShape.destroy()

        for (let row = 0; row < PYRAMID_ROWS; ++row) {
            const count = PYRAMID_ROWS - row
            const y = GROUND_Y - 0.5 - BOX_HALF_SIZE - row * BOX_SPACING
            const startX = 4 - (count - 1) * BOX_SPACING / 2
            for (let column = 0; column < count; ++column) {
                pyramid.push(createBox(startX + column * BOX_SPACING, y, 1, 0.45))
            }
        }
        aim = -0.18
        accumulator = 0
        lastUpdate = game.runtime()
    }

    const launchBox = function () {
        if (projectiles.length >= MAX_PROJECTILES) {
            projectiles[0].destroy()
            projectiles.removeAt(0)
        }
        const projectile = createBox(LAUNCH_X, GROUND_Y - 1.8, 2.5, 0.6)
        projectile.setFlag(box2d.BodyFlag.Bullet, true)
        projectile.applyLinearImpulseToCenter(
            LAUNCH_IMPULSE * Math.cos(aim),
            LAUNCH_IMPULSE * Math.sin(aim)
        )
        projectile.applyAngularImpulse(0.35)
        projectiles.push(projectile)
    }

    const drawBox = function (target: Image, body: box2d.Body, definition: number[], color: number) {
        body.readBoxVertices(definition, view, vertices)
        target.fillPolygon4(vertices[0], vertices[1], vertices[2], vertices[3],
            vertices[4], vertices[5], vertices[6], vertices[7], color)
        target.drawLine(vertices[0], vertices[1], vertices[2], vertices[3], 1)
    }

    resetPyramid()
    controller.A.onEvent(ControllerButtonEvent.Pressed, launchBox)
    controller.B.onEvent(ControllerButtonEvent.Pressed, resetPyramid)

    game.onUpdate(function () {
        if (controller.up.isPressed()) aim = Math.max(-0.75, aim - 0.02)
        if (controller.down.isPressed()) aim = Math.min(0.1, aim + 0.02)

        const now = game.runtime()
        accumulator += Math.min((now - lastUpdate) / 1000, STEP * 3)
        lastUpdate = now
        while (accumulator >= STEP) {
            world.step(STEP)
            accumulator -= STEP
        }

        for (let i = projectiles.length - 1; i >= 0; --i) {
            projectiles[i].readBoxVertices(BOX, worldView, vertices)
            const x = (vertices[0] + vertices[2] + vertices[4] + vertices[6]) >> 2
            const y = (vertices[1] + vertices[3] + vertices[5] + vertices[7]) >> 2
            if (x > 30 * SCALE || y > 20 * SCALE) {
                projectiles[i].destroy()
                projectiles.removeAt(i)
            }
        }
    })

    scene.createRenderable(0, function (target: Image) {
        target.fill(9)
        view[1] = target.width >> 1
        view[2] = 66 - GROUND_Y * SCALE
        drawBox(target, ground, GROUND, 11)
        for (let i = 0; i < pyramid.length; ++i) {
            drawBox(target, pyramid[i], BOX, 4 + i % 4)
        }
        for (let i = 0; i < projectiles.length; ++i) {
            drawBox(target, projectiles[i], BOX, 2)
        }

        const launchX = Math.round(view[1] + LAUNCH_X * SCALE)
        const launchY = Math.round(view[2] + (GROUND_Y - 1.8) * SCALE)
        target.drawLine(launchX, launchY,
            launchX + Math.round(Math.cos(aim) * 14),
            launchY + Math.round(Math.sin(aim) * 14), 1)
        target.print("BOX2D PYRAMID", 2, 2, 1)
        target.print("A:launch U/D:aim B:reset", 2, target.height - 9, 1)
    })
}
