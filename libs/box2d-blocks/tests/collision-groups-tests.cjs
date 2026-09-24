const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const owner = {
    configureFixture(_body, fixture) {
        fixture.setCategoryMask(1, 65535);
    }
};
function Destroyable() {}
function _FixtureDrawing(fixture, shape) {
    this.fixture = fixture;
    this.shape = shape;
}
const context = vm.createContext({
    Math,
    Destroyable,
    _FixtureDrawing,
    _state() {
        return owner;
    },
    box2d: {
        BodyType: { Static: 0, Kinematic: 1, Dynamic: 2 }
    },
    screen: { width: 160, height: 120 },
    PhysicsBodyKind: { Body: 1, Wall: 2 }
});
for (const file of ["body.ts", "shapes.ts"]) {
    const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.None
        }
    }).outputText;
    vm.runInContext(compiled, context, { filename: file });
}

const api = context.box2dblocks;
const groups = [];
function fixture() {
    return {
        setGroup(group) {
            groups.push(group);
        },
        setCategoryMask() {
        }
    };
}
const existingFixture = fixture();
const body = {
    collisionGroup: 0,
    destroyed: false,
    fixtures: [{ fixture: existingFixture }],
    nativeBody: {
        valid: true,
        createFixture() {
            return fixture();
        }
    },
    belongsTo(value) {
        return value === owner;
    }
};

api.setCollisionGroup(body, -12);
assert.equal(body.collisionGroup, -12);
assert.deepEqual(groups, [-12], "Existing fixtures receive the new group");

let shapeDestroyed = false;
api.addShape(
    body,
    {
        toNativeShape() {
            return {
                destroy() {
                    shapeDestroyed = true;
                }
            };
        }
    },
    { x: 0, y: 0 },
    0
);
assert.deepEqual(groups, [-12, -12], "New fixtures inherit the body's group");
assert.equal(shapeDestroyed, true);
assert.throws(
    () => api.setCollisionGroup(body, 1.5),
    /integers from -32768 to 32767/
);

console.log("Box2D body collision group tests passed");
