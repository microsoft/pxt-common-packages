const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { stripTypeScriptTypes } = require("node:module");

// Exercise the actual demo's setup, controls, fixed-step loop and drawing.
// Native tests separately exercise collision containment with this scene's parameters.
let now = 0;
let update;
let paint;
let polygons = [];
let labels = [];
const buttons = {};
const worlds = [];
const shapes = [];
const vertexBuffers = new Set();
const viewBuffers = new Set();
const boxBuffers = new Set();
let vertexReads = 0;
class Shape {
    constructor(halfWidth, halfHeight, x, y) {
        Object.assign(this, { halfWidth, halfHeight, x, y, destroyed: false });
        shapes.push(this);
    }
    destroy() {
        assert.equal(this.destroyed, false);
        this.destroyed = true;
    }
}
class Body {
    constructor(world, type, x, y, angle) {
        Object.assign(this, { world, type, x, y, angle, fixtures: [] });
    }
    setFlag(flag, enabled) {
        assert.equal(flag, 2);
        assert.equal(enabled, false);
    }
    createFixture(shape, density, friction, restitution = 0) {
        assert.equal(shape.destroyed, false);
        this.fixtures.push({ ...shape, density, friction, restitution });
    }
    createRevoluteJoint(other, x, y) {
        assert.equal(this.world, other.world);
        assert.deepEqual([x, y], [0, 0]);
        const motor = {
            body: other, speed: 0,
            setMotor(enabled, speed, torque) {
                assert.equal(enabled, true);
                assert.equal(torque, 10000);
                this.speed = speed;
            }
        };
        this.world.motor = motor;
        return motor;
    }
    getState() {
        assert.fail("Rendering must not allocate body snapshots");
    }
    readTransform() {
        assert.fail("Rendering must not read fractional transforms into TypeScript");
    }
    readBoxVertices(box, view, output) {
        assert.equal(this.world.destroyed, false);
        assert.equal(box.length, 4);
        assert.equal(view.length, 3);
        assert.equal(output.length, 8);
        assert.ok(this.fixtures.some(f =>
            f.halfWidth === box[0] && f.halfHeight === box[1] && f.x === box[2] && f.y === box[3]));
        vertexBuffers.add(output);
        viewBuffers.add(view);
        boxBuffers.add(box);
        ++vertexReads;
        const cosine = Math.cos(this.angle);
        const sine = Math.sin(this.angle);
        const x = view[1] + (this.x + cosine * box[2] - sine * box[3]) * view[0];
        const y = view[2] + (this.y + sine * box[2] + cosine * box[3]) * view[0];
        const ux = cosine * box[0] * view[0];
        const uy = sine * box[0] * view[0];
        const vx = -sine * box[1] * view[0];
        const vy = cosine * box[1] * view[0];
        const corners = [x - ux - vx, y - uy - vy, x + ux - vx, y + uy - vy,
            x + ux + vx, y + uy + vy, x - ux + vx, y - uy + vy];
        for (let i = 0; i < 8; ++i) output[i] = Math.floor(corners[i] + 0.5);
    }
}
class World {
    constructor(x, y) {
        assert.deepEqual([x, y], [0, 10]);
        this.bodies = [];
        this.steps = 0;
        this.destroyed = false;
        worlds.push(this);
    }
    createBody(type, x = 0, y = 0, angle = 0) {
        assert.equal(this.destroyed, false);
        const body = new Body(this, type, x, y, angle);
        this.bodies.push(body);
        return body;
    }
    step(seconds) {
        assert.equal(this.destroyed, false);
        assert.equal(seconds, 1 / 60);
        ++this.steps;
        this.motor.body.angle += this.motor.speed * seconds;
    }
    destroy() {
        assert.equal(this.destroyed, false);
        this.destroyed = true;
    }
}
function button(name) {
    return {
        onEvent(event, callback) {
            assert.equal(event, 1);
            buttons[name] = callback;
        }
    };
}
const target = {
    width: 160, height: 120,
    fill: color => { assert.equal(color, 15); polygons = []; labels = []; },
    fillPolygon4: (...args) => { assert.ok(args.every(Number.isInteger)); polygons.push(args); },
    drawLine: (...args) => assert.ok(args.every(Number.isInteger)),
    print: (...args) => { labels.push(args); }
};
const demoMath = Object.create(Math);
for (const name of ["cos", "sin", "round"]) {
    demoMath[name] = () => assert.fail(`Demo must perform ${name} in the native vertex reader`);
}
const context = vm.createContext({
    Math: demoMath,
    box2d: {
        World,
        BodyType: { Static: 0, Dynamic: 2 },
        BodyFlag: { SleepingAllowed: 2 },
        Shape: { box: (w, h, x = 0, y = 0) => new Shape(w, h, x, y) }
    },
    game: {
        runtime: () => now,
        onUpdate: callback => { assert.equal(update, undefined); update = callback; }
    },
    scene: {
        createRenderable: (z, callback) => {
            assert.equal(z, 0);
            assert.equal(paint, undefined);
            paint = () => callback(target);
        }
    },
    controller: { A: button("A"), B: button("B") },
    ControllerButtonEvent: { Pressed: 1 }
});
for (const file of ["test-native.ts", "test-wrappers.ts"]) {
    const checks = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    vm.runInContext(stripTypeScriptTypes(checks, { mode: "transform" }), context, { filename: file });
}
assert.deepEqual(Object.keys(context).filter(name =>
    name !== "box2d" && name !== "game" && name !== "scene" && name !== "controller"
    && name !== "ControllerButtonEvent" && name !== "Math").sort(), ["check", "runNativeSmokeTests", "runWrapperSmokeTests"]);
assert.equal(worlds.length, 0, "Loading smoke checks must not create native worlds");
for (const name of ["physicsWorld", "ballBody", "point", "wrappedWorld", "wrappedState", "wrappedContacts", "wrappedHit"]) {
    assert.equal(vm.runInContext(`typeof ${name}`, context), "undefined", "Smoke data must be function-local");
}
const source = fs.readFileSync(path.join(__dirname, "../test-tumbler.ts"), "utf8");
vm.runInContext(stripTypeScriptTypes(source, { mode: "transform" }), context, { filename: "test-tumbler.ts" });
const carSource = fs.readFileSync(path.join(__dirname, "../test-car.ts"), "utf8");
vm.runInContext(stripTypeScriptTypes(carSource, { mode: "transform" }), context, { filename: "test-car.ts" });
const pyramidSource = fs.readFileSync(path.join(__dirname, "../test-pyramid.ts"), "utf8");
vm.runInContext(stripTypeScriptTypes(pyramidSource, { mode: "transform" }), context, { filename: "test-pyramid.ts" });
assert.equal(worlds.length, 0, "Loading unselected demos must not allocate worlds");
const selector = fs.readFileSync(path.join(__dirname, "../test.ts"), "utf8")
    .replace(/const DEMO = "[^"]+"/, 'const DEMO = "tumbler"');
vm.runInContext(stripTypeScriptTypes(selector, { mode: "transform" }), context, { filename: "test.ts" });
assert.equal(vm.runInContext("RUN_SMOKE_TESTS", context), false, "Demo startup must skip smoke checks");
const maxBoxes = Number(source.match(/const MAX_BOXES = (\d+)/)[1]);
const spawnEverySteps = Number(source.match(/const SPAWN_EVERY_STEPS = (\d+)/)[1]);
const timeStep = 1 / 60;
assert.ok(Number.isInteger(maxBoxes) && maxBoxes > 0);
assert.equal(worlds.length, 1);
const firstWorld = worlds[0];
assert.equal(firstWorld.bodies.length, 3); // Ground, tumbler, first small box.
assert.equal(firstWorld.bodies[1].fixtures.length, 4);
assert.equal(firstWorld.motor.speed, 0.4);
assert.equal(shapes.filter(shape => !shape.destroyed).length, 1);
const boxTemplate = shapes.find(shape => !shape.destroyed);

const framesToFill = Math.ceil(maxBoxes * spawnEverySteps * timeStep / 0.02) + 100;
for (let frame = 0; frame < framesToFill; ++frame) {
    now += 20;
    const previousSteps = firstWorld.steps;
    update();
    assert.ok(firstWorld.steps - previousSteps <= 3);
    assert.ok(firstWorld.bodies.length <= maxBoxes + 2);
}
assert.equal(firstWorld.bodies.length, maxBoxes + 2);
paint();
assert.equal(vertexReads, maxBoxes + 4);
assert.equal(vertexBuffers.size, 1, "All bodies must share one vertex buffer");
assert.equal(viewBuffers.size, 1);
assert.equal(boxBuffers.size, 5);
assert.equal(polygons.length, maxBoxes + 4);
assert.ok(labels.some(label => label[0] === `${maxBoxes}/${maxBoxes}`));
assert.ok(labels.some(label => label[0] === "A:reverse B:reset"));
for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
    firstWorld.motor.body.angle = angle;
    paint();
    for (const polygon of polygons.slice(-4)) {
        for (let i = 0; i < 8; i += 2) {
            assert.ok(Number.isInteger(polygon[i]) && polygon[i] >= 0 && polygon[i] < 160);
            assert.ok(Number.isInteger(polygon[i + 1]) && polygon[i + 1] >= 12 && polygon[i + 1] <= 108);
        }
    }
}
buttons.A();
assert.equal(firstWorld.motor.speed, -0.4);
buttons.A();
assert.equal(firstWorld.motor.speed, 0.4);
const beforePause = firstWorld.steps;
now += 60000;
update();
assert.ok(firstWorld.steps - beforePause <= 3, "Long pauses must not produce unbounded catch-up");
buttons.B();
assert.equal(firstWorld.destroyed, true);
assert.equal(worlds.length, 2);
assert.equal(worlds[1].bodies.length, 3);
assert.equal(worlds[1].motor.speed, 0.4);
assert.equal(shapes.filter(shape => !shape.destroyed).length, 1);
assert.equal(boxTemplate.destroyed, false, "Reset must reuse the independently owned shape");
paint();
assert.equal(polygons.length, 5);
assert.equal(vertexBuffers.size, 1, "Reset must reuse the same vertex buffer");
assert.equal(viewBuffers.size, 1, "Rendering must reuse the view buffer");
assert.equal(boxBuffers.size, 5, "Rendering must reuse the box definitions");
assert.ok(labels.some(label => label[0] === `1/${maxBoxes}`));
update();
assert.equal(worlds[1].steps, 0, "Reset must clear timing debt");
console.log("All tumbler demo tests passed");
