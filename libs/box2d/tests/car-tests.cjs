const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { stripTypeScriptTypes } = require("node:module");

const root = path.resolve(__dirname, "..");
const worlds = [];
const shapes = [];
const buffers = new Set();
const views = new Set();
const definitions = new Set();
const pressed = { A: false, left: false, right: false };
let now = 0, update, paint, reset;
let polygons = [], labels = [], circles = [];
class Shape {
    constructor(kind, values) {
        Object.assign(this, { kind, values, destroyed: false });
        shapes.push(this);
    }
    destroy() {
        assert.equal(this.destroyed, false);
        this.destroyed = true;
    }
}
class Joint {
    constructor(a, b, kind, args) {
        assert.equal(a.world, b.world);
        Object.assign(this, { a, b, kind, args });
        a.world.joints.push(this);
    }
    setMotor(enabled, speed, torque) { this.motor = { enabled, speed, torque }; }
    setLimits(enabled, lower, upper) { this.limits = { enabled, lower, upper }; }
    setSuspension(stiffness, damping) { this.spring = { stiffness, damping }; }
}
class Body {
    constructor(world, type, x, y, angle) {
        Object.assign(this, { world, type, x, y, angle, fixtures: [], destroyed: false });
    }
    createFixture(shape, density, friction) {
        assert.equal(shape.destroyed, false);
        this.fixtures.push({ kind: shape.kind, values: Array.from(shape.values), density, friction });
    }
    createRevoluteJoint(b, ...args) { return new Joint(this, b, "revolute", args); }
    createWheelJoint(b, ...args) { return new Joint(this, b, "wheel", args); }
    applyAngularImpulse(value) { this.impulse = value; }
    getState() { assert.fail("The sample must not allocate snapshots"); }
    readTransform() { assert.fail("The sample must render integer vertices"); }
    destroy() {
        assert.equal(this.destroyed, false);
        this.destroyed = true;
    }
    readBoxVertices(box, view, out) {
        assert.equal(this.world.destroyed, false);
        assert.equal(this.destroyed, false);
        assert.equal(box.length, 4);
        assert.equal(view.length, 3);
        assert.equal(out.length, 8);
        buffers.add(out);
        views.add(view);
        definitions.add(box);
        const c = Math.cos(this.angle), s = Math.sin(this.angle);
        const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
        for (let i = 0; i < 4; ++i) {
            const x = box[2] + corners[i][0] * box[0];
            const y = box[3] + corners[i][1] * box[1];
            out[2 * i] = Math.floor(view[1] + (this.x + c * x - s * y) * view[0] + 0.5);
            out[2 * i + 1] = Math.floor(view[2] + (this.y + s * x + c * y) * view[0] + 0.5);
        }
        assert.ok(out.every(n => n >= -30000 && n <= 30000));
    }
}
class World {
    constructor(x, y) {
        assert.deepEqual([x, y], [0, 10]);
        Object.assign(this, { bodies: [], joints: [], steps: 0, destroyed: false });
        worlds.push(this);
    }
    createBody(type, x = 0, y = 0, angle = 0) {
        assert.equal(this.destroyed, false);
        const body = new Body(this, type, x, y, angle);
        this.bodies.push(body);
        return body;
    }
    step(dt) {
        assert.equal(this.destroyed, false);
        assert.equal(dt, 1 / 60);
        ++this.steps;
    }
    destroy() {
        assert.equal(this.destroyed, false);
        this.destroyed = true;
    }
}
function integerDrawing(args) { assert.ok(args.every(Number.isInteger)); }
const target = {
    width: 160, height: 120,
    fill(color) { assert.equal(color, 9); polygons = []; labels = []; circles = []; },
    fillPolygon4(...args) { integerDrawing(args); polygons.push(args); },
    drawLine(...args) { integerDrawing(args); },
    fillCircle(...args) { integerDrawing(args); circles.push(args); },
    drawCircle(...args) { integerDrawing(args); },
    print(...args) { labels.push(args); }
};
const demoMath = Object.create(Math);
demoMath.idiv = (a, b) => Math.trunc(a / b);
for (const name of ["sin", "cos"]) {
    demoMath[name] = () => assert.fail(`Rendering must not use TypeScript ${name}`);
}
const context = vm.createContext({
    Math: demoMath,
    box2d: {
        World, BodyType: { Static: 0, Dynamic: 2 },
        Shape: {
            box: (...args) => new Shape("box", args),
            circle: radius => new Shape("circle", [radius]),
            polygon: points => new Shape("polygon", points),
            chain: points => new Shape("chain", points)
        }
    },
    control: { fail: message => assert.fail(message) },
    game: {
        runtime: () => now,
        onUpdate(callback) { assert.equal(update, undefined); update = callback; }
    },
    scene: {
        createRenderable(z, callback) {
            assert.equal(z, 0);
            assert.equal(paint, undefined);
            paint = () => callback(target);
        }
    },
    controller: {
        A: { isPressed: () => pressed.A },
        left: { isPressed: () => pressed.left },
        right: { isPressed: () => pressed.right },
        B: { onEvent(event, callback) { assert.equal(event, 1); assert.equal(reset, undefined); reset = callback; } }
    },
    ControllerButtonEvent: { Pressed: 1 },
    runNativeSmokeTests() { assert.fail("Smoke tests must be opt-in"); },
    runWrapperSmokeTests() { assert.fail("Smoke tests must be opt-in"); }
});
vm.runInContext("Array.prototype.removeAt = function (i) { return this.splice(i, 1)[0]; };", context);
function load(file) {
    vm.runInContext(stripTypeScriptTypes(fs.readFileSync(path.join(root, file), "utf8"),
        { mode: "transform" }), context, { filename: file });
}
load("test-tumbler.ts");
load("test-pyramid.ts");
load("test-car.ts");
assert.equal(worlds.length, 0);
assert.equal(shapes.length, 0, "Unselected demos must not allocate native shapes");
assert.equal(update, undefined);
load("test.ts");
assert.equal(vm.runInContext("DEMO", context), "car");
assert.equal(worlds.length, 1, "Only the selected demo may start");
const world = worlds[0];
assert.equal(world.bodies.length, 16);
assert.equal(world.joints.length, 12);
assert.equal(world.bodies[0].fixtures.length, 3);
assert.ok(world.bodies[0].fixtures.every(f => f.kind === "chain"));
assert.ok(shapes.every(shape => shape.destroyed), "Fixtures copy templates; release all templates");
const rear = world.joints.find(j => j.kind === "wheel");
const front = world.joints.filter(j => j.kind === "wheel")[1];
const car = rear.a;
assert.equal(car.fixtures[0].values.length, 12);
assert.deepEqual(rear.args, [-1, -0.35, 0, 1]);
assert.deepEqual(front.args, [1, -0.4, 0, 1]);
for (const joint of [rear, front]) {
    assert.deepEqual(joint.limits, { enabled: true, lower: -0.25, upper: 0.25 });
    assert.ok(Math.abs(joint.spring.stiffness - Math.PI * 0.16 * (8 * Math.PI) ** 2) < 1e-10);
    assert.ok(Math.abs(joint.spring.damping - 2 * Math.PI * 0.16 * 0.7 * 8 * Math.PI) < 1e-10);
}
function frame() { now += 20; update(); paint(); }
frame();
assert.equal(rear.motor.enabled, false, "Release both directions to coast");
pressed.right = true;
frame();
assert.deepEqual(rear.motor, { enabled: true, speed: 50, torque: 20 });
pressed.A = true;
frame();
assert.deepEqual(rear.motor, { enabled: true, speed: 0, torque: 20 });
pressed.A = pressed.right = false;
pressed.left = true;
frame();
assert.deepEqual(rear.motor, { enabled: true, speed: -50, torque: 20 });
assert.equal(front.motor.enabled, false, "Only the rear wheel is driven");
pressed.left = false;
for (let i = 0; i < 600; ++i) frame();
assert.equal(world.bodies.length, 16, "The car demo must not continually spawn bodies");
assert.equal(buffers.size, 1);
assert.equal(views.size, 2);
assert.equal(definitions.size, 6);
assert.equal(circles.length, 2);
assert.ok(circles.every(c => c[2] === 5));
assert.ok(labels.some(l => l[0] === "L/R:drive A:brake B:reset"));

const chassis = car.fixtures[0].values;
for (const angle of [0, 0.37, Math.PI / 2, 3]) {
    car.angle = angle;
    frame();
    const quads = polygons.filter(p => p[8] === 2);
    assert.equal(quads.length, 2);
    const projected = [...quads[0].slice(0, 8), ...quads[1].slice(4, 8)];
    for (let i = 0; i < 6; ++i) {
        const x = 80 + 12 * (Math.cos(angle) * chassis[2 * i] - Math.sin(angle) * chassis[2 * i + 1]);
        const y = 72 + 12 * (Math.sin(angle) * chassis[2 * i] + Math.cos(angle) * chassis[2 * i + 1]);
        assert.ok(Math.abs(projected[2 * i] - x) < 2);
        assert.ok(Math.abs(projected[2 * i + 1] - y) < 2);
    }
}
car.angle = 0;
frame();
const stationary = polygons.filter(p => p[8] === 2);
car.x += 50;
car.y -= 3;
frame();
assert.deepEqual(polygons.filter(p => p[8] === 2), stationary, "Camera must follow both axes");
const beforePause = world.steps;
now += 60000;
update();
assert.ok(world.steps - beforePause <= 3);
const crate = world.bodies.find(b => b.fixtures.some(f => f.density === 0.5));
crate.y = 21;
frame();
assert.equal(crate.destroyed, true, "Retire fallen crates before their coordinates become unbounded");
reset();
assert.equal(world.destroyed, true);
assert.equal(worlds.length, 2);
assert.equal(worlds[1].bodies.length, 16);
assert.ok(shapes.every(shape => shape.destroyed));
paint();
assert.equal(buffers.size, 1, "Reset must reuse rendering buffers");
assert.equal(views.size, 2);
assert.equal(definitions.size, 6);
update();
assert.equal(worlds[1].steps, 0, "Reset must clear accumulated time");
worlds[1].joints.find(j => j.kind === "wheel").a.y = 21;
frame();
assert.equal(worlds[1].destroyed, true, "Falling into the jump gap must reset the car");
assert.equal(worlds.length, 3);
console.log("All car sample setup, controls, camera, rendering and reset tests passed");
