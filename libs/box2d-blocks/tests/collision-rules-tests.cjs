const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

class World {
    destroy() {}
}
const context = vm.createContext({
    Math,
    box2d: { World },
    game: {
        runtime() {
            return 0;
        },
        eventContext() {
            return { registerFrameHandler() {} };
        },
        addScenePushHandler() {},
        addScenePopHandler() {}
    },
    scene: {
        PHYSICS_PRIORITY: 0,
        SPRITE_Z: 0,
        createRenderable() {}
    }
});
vm.runInContext(
    "Array.prototype.removeAt = function (index) { return this.splice(index, 1)[0]; };",
    context
);
const source = fs.readFileSync(path.join(__dirname, "..", "state.ts"), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.None
    }
}).outputText;
vm.runInContext(compiled, context, { filename: "state.ts" });

const api = context.box2dblocks;
function fixture() {
    return {
        filter: null,
        setCategoryMask(category, mask) {
            this.filter = [category, mask];
        }
    };
}
function body(kind) {
    return {
        kind,
        fixtures: [{ fixture: fixture() }]
    };
}

const state = new api._SceneState();
const kind1 = body(1);
const kind2 = body(2);
const defaultKind = body(99);
state.bodies.push(kind1, kind2, defaultKind);

state.setKindsCollide(1, 2, false);
assert.deepEqual(kind1.fixtures[0].fixture.filter, [2, 3]);
assert.deepEqual(kind2.fixtures[0].fixture.filter, [4, 5]);
assert.deepEqual(defaultKind.fixtures[0].fixture.filter, [1, 65535]);

state.setKindsCollide(1, 3, false);
const kind3Fixture = fixture();
state.configureFixture({ kind: 3 }, kind3Fixture);
assert.deepEqual(kind3Fixture.filter, [8, 13]);

state.setKindsCollide(1, 2, true);
assert.deepEqual(kind1.fixtures[0].fixture.filter, [2, 3]);
assert.deepEqual(kind2.fixtures[0].fixture.filter, [1, 65535]);
state.configureFixture({ kind: 3 }, kind3Fixture);
assert.deepEqual(kind3Fixture.filter, [4, 5]);

const capacityState = new api._SceneState();
for (let kind = 101; kind <= 114; ++kind)
    capacityState.setKindsCollide(100, kind, false);
assert.throws(
    () => capacityState.setKindsCollide(100, 115, false),
    /Too many Box2D body kinds/
);
assert.throws(
    () => capacityState.setKindsCollide(1.5, 2, false),
    /body kinds must be integers/
);

console.log("Box2D body-kind collision rule tests passed");
