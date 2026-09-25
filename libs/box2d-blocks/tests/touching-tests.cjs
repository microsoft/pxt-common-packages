const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function Destroyable() {}

const fixtureBodies = {};
const owner = {
    gravityX: 0,
    gravityY: 10,
    world: {
        contacts: [],
        getContacts() {
            return this.contacts;
        }
    },
    findFixture(handle) {
        return fixtureBodies[handle];
    }
};

const context = vm.createContext({
    Math,
    Destroyable,
    PhysicsPoint: function (x, y) {
        this.x = x;
        this.y = y;
    },
    PIXELS_PER_METER: 10,
    _state() {
        return owner;
    },
    box2d: {
        BodyType: { Static: 0, Kinematic: 1, Dynamic: 2 }
    },
    screen: { width: 160, height: 120 }
});

const source = fs.readFileSync(path.join(__dirname, "..", "body.ts"), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.None
    }
}).outputText;
vm.runInContext(compiled, context, { filename: "body.ts" });

const api = context.box2dblocks;

function body(type = 2) {
    return {
        type,
        destroyed: false,
        nativeBody: { valid: true },
        belongsTo(value) {
            return value === owner;
        }
    };
}

const bodyA = body(0);
const bodyB = body();
const bodyC = body();
const bodyD = body(1);
fixtureBodies[1] = bodyA;
fixtureBodies[2] = bodyB;
fixtureBodies[3] = bodyC;
fixtureBodies[4] = bodyD;

assert.equal(api.bodiesTouching(bodyA, bodyB), false);

owner.world.contacts = [{
    fixtureA: { handle: 1 },
    fixtureB: { handle: 2 },
    getPoints() {
        return [{ x: 1.5, y: 2 }, { x: 1.75, y: 2 }];
    },
    getNormals() {
        return [{ x: 0, y: -1 }];
    }
}];
assert.equal(api.bodiesTouching(bodyA, bodyB), true);
assert.equal(api.bodiesTouching(bodyB, bodyA), true, "Body argument order does not matter");
assert.equal(api.bodiesTouching(bodyA, bodyC), false, "Unrelated contacts do not match");
assert.equal(api.bodiesTouching(bodyA, bodyA), false, "A body does not touch itself");
assert.deepEqual(
    Array.from(api.contactPoints(bodyA, bodyB), point => [point.x, point.y]),
    [[15, 20], [17.5, 20]],
    "Contact points convert from meters to world-space pixels"
);
assert.equal(api.contactPoints(bodyA, bodyC).length, 0);
assert.equal(api.contactPoints(bodyA, bodyA).length, 0);
assert.equal(api.isOnGround(bodyB), true, "The supported body is on level ground");
assert.equal(api.isOnGround(bodyA), false, "The body below the contact is not supported");

owner.world.contacts[0].getNormals = () => [{ x: 1, y: 0 }];
assert.equal(api.isOnGround(bodyB), false, "Walls do not count as ground");

owner.world.contacts[0].getNormals = () => [{
    x: Math.sin(Math.PI / 3),
    y: -Math.cos(Math.PI / 3)
}];
assert.equal(api.isOnGround(bodyB), false, "Slopes above the default angle are rejected");
assert.equal(api.isOnGround(bodyB, 60), true, "The maximum slope angle is configurable");

owner.gravityX = 10;
owner.gravityY = 0;
owner.world.contacts[0].getNormals = () => [{ x: -1, y: 0 }];
assert.equal(api.isOnGround(bodyB), true, "Ground follows the scene gravity direction");

owner.gravityX = 0;
owner.gravityY = 0;
assert.equal(api.isOnGround(bodyB), false, "Zero gravity has no ground direction");
assert.throws(() => api.isOnGround(bodyB, 91), /0 to 90 degrees/);

owner.world.contacts = [
    {
        fixtureA: { handle: 1 },
        fixtureB: { handle: 2 },
        getNormals() {
            return [{ x: 0, y: -1 }];
        }
    },
    {
        fixtureA: { handle: 2 },
        fixtureB: { handle: 4 },
        getNormals() {
            return [{ x: 0, y: -1 }];
        }
    }
];
assert.equal(api.isBeingSquished(bodyB), true, "Opposing static and kinematic contacts squish a body");

bodyD.type = 2;
assert.equal(api.isBeingSquished(bodyB), false, "Dynamic bodies do not count as immovable");
bodyD.type = 1;
owner.world.contacts[1].getNormals = () => [{ x: -1, y: 0 }];
assert.equal(api.isBeingSquished(bodyB), false, "Perpendicular contacts do not squish a body");

owner.world.contacts[1].getNormals = () => [{
    x: -Math.sin(Math.PI / 12),
    y: -Math.cos(Math.PI / 12)
}];
assert.equal(api.isBeingSquished(bodyB), true, "The default tolerance accepts a 15 degree offset");
assert.equal(api.isBeingSquished(bodyB, 10), false, "The squish angle tolerance is configurable");
assert.throws(() => api.isBeingSquished(bodyB, 91), /0 to 90 degrees/);

bodyB.destroyed = true;
assert.throws(
    () => api.bodiesTouching(bodyA, bodyB),
    /One or both Box2D bodies are invalid/
);

console.log("Box2D body touching tests passed");
