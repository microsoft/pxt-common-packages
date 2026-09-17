const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { stripTypeScriptTypes } = require("node:module");

let now = 0;
let update;
let paint;
let polygons = [];
const pressed = { up: false, down: false };
const buttons = {};
const worlds = [];
const shapes = [];

class Shape {
    constructor(width, height) {
        Object.assign(this, { width, height, destroyed: false });
        shapes.push(this);
    }
    destroy() {
        assert.equal(this.destroyed, false);
        this.destroyed = true;
    }
}

class Body {
    constructor(world, type, x, y) {
        Object.assign(this, {
            world, type, x, y, angle: 0, fixtures: [], destroyed: false
        });
    }
    createFixture(shape, density, friction, restitution) {
        assert.equal(shape.destroyed, false);
        this.fixtures.push({ shape, density, friction, restitution });
    }
    setFlag(flag, enabled) {
        assert.deepEqual([flag, enabled], [0, true]);
        this.bullet = true;
    }
    applyLinearImpulseToCenter(x, y) {
        this.impulse = [x, y];
    }
    applyAngularImpulse(value) {
        this.angularImpulse = value;
    }
    readBoxVertices(box, view, output) {
        const x = view[1] + (this.x + box[2]) * view[0];
        const y = view[2] + (this.y + box[3]) * view[0];
        const w = box[0] * view[0], h = box[1] * view[0];
        const values = [
            x - w, y - h, x + w, y - h,
            x + w, y + h, x - w, y + h
        ];
        for (let i = 0; i < values.length; ++i)
            output[i] = Math.floor(values[i] + 0.5);
    }
    destroy() {
        assert.equal(this.destroyed, false);
        this.destroyed = true;
    }
}

class World {
    constructor(x, y) {
        assert.deepEqual([x, y], [0, 10]);
        Object.assign(this, { bodies: [], steps: 0, destroyed: false });
        worlds.push(this);
    }
    createBody(type, x = 0, y = 0) {
        const body = new Body(this, type, x, y);
        this.bodies.push(body);
        return body;
    }
    step(seconds) {
        assert.equal(seconds, 1 / 60);
        ++this.steps;
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
    width: 160,
    height: 120,
    fill(color) {
        assert.equal(color, 9);
        polygons = [];
    },
    fillPolygon4(...args) {
        assert.ok(args.every(Number.isInteger));
        polygons.push(args);
    },
    drawLine(...args) {
        assert.ok(args.every(Number.isInteger));
    },
    print() {}
};

const context = vm.createContext({
    Math,
    box2d: {
        World,
        BodyType: { Static: 0, Dynamic: 2 },
        BodyFlag: { Bullet: 0 },
        Shape: { box: (width, height) => new Shape(width, height) }
    },
    game: {
        runtime: () => now,
        onUpdate(callback) {
            update = callback;
        }
    },
    scene: {
        createRenderable(z, callback) {
            assert.equal(z, 0);
            paint = () => callback(target);
        }
    },
    controller: {
        A: button("A"),
        B: button("B"),
        up: { isPressed: () => pressed.up },
        down: { isPressed: () => pressed.down }
    },
    ControllerButtonEvent: { Pressed: 1 }
});
vm.runInContext("Array.prototype.removeAt = function (i) { return this.splice(i, 1)[0]; };", context);

function load(file) {
    const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    vm.runInContext(stripTypeScriptTypes(source, { mode: "transform" }), context, { filename: file });
}

load("test-pyramid.ts");
assert.equal(worlds.length, 0, "Loading an unselected demo must not allocate a world");
const selector = fs.readFileSync(path.join(__dirname, "../test.ts"), "utf8")
    .replace(/const DEMO = "[^"]+"/, 'const DEMO = "pyramid"')
    .replace("runNativeSmokeTests()", "")
    .replace("runWrapperSmokeTests()", "");
context.runCarDemo = () => assert.fail("Car demo must not run");
context.runTumblerDemo = () => assert.fail("Tumbler demo must not run");
context.control = { fail: message => assert.fail(message) };
context.game.stats = false;
vm.runInContext(stripTypeScriptTypes(selector, { mode: "transform" }), context, { filename: "test.ts" });

assert.equal(worlds.length, 1);
const firstWorld = worlds[0];
assert.equal(firstWorld.bodies.length, 56, "Ground plus a ten-row, 55-box pyramid");
assert.equal(shapes.filter(shape => !shape.destroyed).length, 1, "Reuse one box template");
paint();
assert.equal(polygons.length, 56);

buttons.A();
const firstProjectile = firstWorld.bodies[firstWorld.bodies.length - 1];
assert.equal(firstProjectile.bullet, true);
assert.ok(firstProjectile.impulse[0] > 25);
assert.ok(firstProjectile.impulse[1] < 0);

pressed.up = true;
now += 20;
update();
pressed.up = false;
buttons.A();
const aimedProjectile = firstWorld.bodies[firstWorld.bodies.length - 1];
assert.ok(aimedProjectile.impulse[1] < firstProjectile.impulse[1]);

for (let i = 0; i < 10; ++i)
    buttons.A();
assert.equal(firstWorld.bodies.filter(body => body.bullet && !body.destroyed).length, 8);
assert.equal(firstProjectile.destroyed, true);

const beforePause = firstWorld.steps;
now += 60000;
update();
assert.ok(firstWorld.steps - beforePause <= 3);
buttons.B();
assert.equal(firstWorld.destroyed, true);
assert.equal(worlds.length, 2);
assert.equal(worlds[1].bodies.length, 56);
assert.equal(shapes.filter(shape => !shape.destroyed).length, 1);

console.log("All pyramid demo tests passed");
