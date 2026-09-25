const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const owner = {
    configureFixture() {}
};
const context = vm.createContext({
    Math,
    _state() {
        return owner;
    },
    PIXELS_PER_METER: 10,
    ShapeType: { Circle: 0, Box: 1, Polygon: 2, Edge: 3, Chain: 4 },
    _FixtureDrawing: function (fixture, shape) {
        this.fixture = fixture;
        this.shape = shape;
    },
    JointAnchor: function () {},
    BodyAnchor: { Center: 0 },
    pointX() {},
    pointY() {},
    box2d: {
        Shape: {
            box(...args) {
                return {
                    args,
                    destroy() {}
                };
            }
        }
    }
});
for (const file of ["physics.ts", "shapes.ts"]) {
    const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.None
        }
    }).outputText;
    vm.runInContext(compiled, context, { filename: file });
}

const calls = [];
function fixture() {
    return {
        valid: true,
        setFriction(value) {
            calls.push(["friction", value]);
        },
        setDensity(value) {
            calls.push(["density", value]);
        },
        setRestitution(value) {
            calls.push(["restitution", value]);
        },
        setGroup() {}
    };
}

let createdMaterial;
const body = {
    destroyed: false,
    collisionGroup: 0,
    fixtures: [{ fixture: fixture() }, { fixture: fixture() }],
    nativeBody: {
        valid: true,
        createFixture(_shape, density, friction, restitution) {
            createdMaterial = [density, friction, restitution];
            return fixture();
        }
    },
    belongsTo(value) {
        return value === owner;
    },
    _ensureInScene() {
    }
};

const api = context.box2dblocks;
api.setBodyMaterial(body, 0.8);
assert.deepEqual(calls, [["friction", 0.8], ["friction", 0.8]]);

calls.length = 0;
api.setBodyMaterial(body, 0.6, 3, 0.4);
assert.deepEqual(calls, [
    ["friction", 0.6], ["density", 3], ["restitution", 0.4],
    ["friction", 0.6], ["density", 3], ["restitution", 0.4]
]);

api.addShape(body, api.box(10, 20), { x: 0, y: 0 }, 0, 1, 0.2, 0);
assert.deepEqual(createdMaterial, [1, 0.2, 0], "New fixtures use their explicitly supplied material");
assert.throws(() => api.setBodyMaterial(body, -1), /nonnegative finite numbers/);

console.log("Box2D body material tests passed");
