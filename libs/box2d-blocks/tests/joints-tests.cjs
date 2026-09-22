const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const owner = {};
function Destroyable() {}
function PhysicsPoint(x, y) {
    this.x = x;
    this.y = y;
}
const context = vm.createContext({
    Math,
    Destroyable,
    PhysicsPoint,
    PIXELS_PER_METER: 10,
    _state() {
        return owner;
    },
    box2dblocks: {
        _state() {
            return owner;
        }
    },
    box2d: {
        BodyType: { Static: 0, Kinematic: 1, Dynamic: 2 }
    },
    sprites: { Flag: { Destroyed: 1 << 1 } }
});
const source = fs.readFileSync(path.join(__dirname, "..", "joints.ts"), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.None
    }
}).outputText;
vm.runInContext(compiled, context, { filename: "joints.ts" });

const api = context.box2dblocks;
let jointArguments;
function body(state, localAnchor) {
    const nativeBody = {
        getState() {
            return state;
        },
        createDistanceJoint(other, ...args) {
            jointArguments = [other, ...args];
            return {
                valid: true,
                destroy() {},
                getAnchors() {
                    return [2, 4, 5, 5];
                }
            };
        }
    };
    return {
        destroyed: false,
        nativeBody,
        belongsTo(value) {
            return value === owner;
        },
        localAnchor(value) {
            assert.ok(value instanceof api.JointAnchor);
            return localAnchor;
        }
    };
}

const bodyA = body({ x: 2, y: 3, angle: Math.PI / 2 }, [1, 0]);
const bodyB = body({ x: 5, y: 7, angle: Math.PI }, [0, 2]);
const joint = api.attachBodies(
    bodyA,
    api.bodyAnchor(api.BodyAnchor.Right),
    bodyB,
    api.jointOffset(0, 20),
    api.AttachmentJointType.Distance
);

assert.ok(joint instanceof api.Joint);
assert.equal(jointArguments[0], bodyB.nativeBody);
assert.ok(Math.abs(jointArguments[1] - 2) < 0.0001);
assert.ok(Math.abs(jointArguments[2] - 4) < 0.0001);
assert.ok(Math.abs(jointArguments[3] - 5) < 0.0001);
assert.ok(Math.abs(jointArguments[4] - 5) < 0.0001);
assert.deepEqual(
    [api.jointPoint(joint, api.JointPoint.Start).x, api.jointPoint(joint, api.JointPoint.Start).y],
    [20, 40]
);
assert.deepEqual(
    [api.jointPoint(joint).x, api.jointPoint(joint).y],
    [35, 45]
);
assert.deepEqual(
    [api.jointPoint(joint, api.JointPoint.End).x, api.jointPoint(joint, api.JointPoint.End).y],
    [50, 50]
);
assert.throws(() => api.jointPoint(joint, 99), /Unknown Box2D joint point/);
assert.throws(
    () => api.attachBodies(
        bodyA,
        api.bodyAnchor(api.BodyAnchor.Center),
        bodyA,
        api.bodyAnchor(api.BodyAnchor.Center),
        api.AttachmentJointType.Distance
    ),
    /Cannot connect these Box2D bodies/
);

console.log("Box2D block joint anchor tests passed");
