const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const owner = {};
const enabledJointTypes = {};
function Destroyable() {}
function PhysicsPoint(x, y) {
    this.x = x;
    this.y = y;
}
class PrismaticJoint {
    constructor() {
        this.valid = true;
    }
    setMotor(...args) {
        this.motorArguments = args;
    }
    setLimits(...args) {
        this.limitArguments = args;
    }
    destroy() {
        this.valid = false;
    }
    getAnchors() {
        return [2, 4, 2, 4];
    }
}
class WheelJoint {}
class RevoluteJoint {}
class PulleyJoint {
    constructor() {
        this.valid = true;
    }
    destroy() {
        this.valid = false;
    }
    getAnchors() {
        return [2, 4, 2, 4];
    }
}
class WeldJoint {
    constructor() {
        this.valid = true;
    }
    destroy() {
        this.valid = false;
    }
    getAnchors() {
        return [2, 4, 2, 4];
    }
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
        BodyType: { Static: 0, Kinematic: 1, Dynamic: 2 },
        JointType: {
            Distance: 0,
            Mouse: 1,
            Prismatic: 2,
            Pulley: 3,
            Revolute: 4,
            Weld: 5,
            Wheel: 6
        },
        isJointTypeEnabled(type) {
            return enabledJointTypes[type] !== false;
        },
        PrismaticJoint,
        PulleyJoint,
        WeldJoint,
        WheelJoint,
        RevoluteJoint
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
        valid: true,
        getState() {
            return state;
        },
        setTransform(x, y, angle) {
            state.x = x;
            state.y = y;
            state.angle = angle;
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
        },
        createPrismaticJoint(other, ...args) {
            jointArguments = [other, ...args];
            return new PrismaticJoint();
        },
        createPulleyJoint(other, ...args) {
            jointArguments = [other, ...args];
            return new PulleyJoint();
        },
        createWeldJoint(other, ...args) {
            jointArguments = [other, ...args];
            return new WeldJoint();
        }
    };
    return {
        destroyed: false,
        type: context.box2d.BodyType.Dynamic,
        connectedBodies: [],
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
    [
        api.jointPoint(joint, api.JointPoint.Center).x,
        api.jointPoint(joint, api.JointPoint.Center).y
    ],
    [35, 45]
);
assert.deepEqual(
    [api.jointPoint(joint, api.JointPoint.End).x, api.jointPoint(joint, api.JointPoint.End).y],
    [50, 50]
);
const slider = api.attachBodies(
    bodyA,
    api.bodyAnchor(api.BodyAnchor.Right),
    bodyB,
    api.jointOffset(0, 20),
    api.AttachmentJointType.Prismatic
);
assert.ok(slider.nativeJoint instanceof PrismaticJoint);
assert.deepEqual(jointArguments, [bodyB.nativeBody, 2, 4, 0, 1]);
api.setJointMotor(slider, true, 20, 12);
assert.deepEqual(slider.nativeJoint.motorArguments, [true, 2, 12]);
api.setJointLimits(slider, true, -5, 15);
assert.deepEqual(slider.nativeJoint.limitArguments, [true, -0.5, 1.5]);
const welded = api.attachBodies(
    bodyA,
    api.bodyAnchor(api.BodyAnchor.Right),
    bodyB,
    api.jointOffset(0, 20),
    api.AttachmentJointType.Weld
);
assert.ok(welded.nativeJoint instanceof WeldJoint);
assert.equal(jointArguments[0], bodyB.nativeBody);
assert.ok(Math.abs(jointArguments[1] - 2) < 0.0001);
assert.ok(Math.abs(jointArguments[2] - 4) < 0.0001);
const pulley = api.createPulleyJoint(
    bodyA,
    api.bodyAnchor(api.BodyAnchor.Right),
    new PhysicsPoint(10, 20),
    bodyB,
    api.jointOffset(0, 20),
    new PhysicsPoint(50, 60),
    2
);
assert.ok(pulley.nativeJoint instanceof PulleyJoint);
assert.equal(jointArguments[0], bodyB.nativeBody);
const expectedPulleyArguments = [1, 2, 5, 6, 2, 4, 2, 4, 2];
for (let i = 0; i < expectedPulleyArguments.length; ++i)
    assert.ok(Math.abs(jointArguments[i + 1] - expectedPulleyArguments[i]) < 0.0001);
assert.throws(
    () => api.createPulleyJoint(
        bodyA,
        api.bodyAnchor(api.BodyAnchor.Right),
        new PhysicsPoint(10, 20),
        bodyB,
        api.jointOffset(0, 20),
        new PhysicsPoint(50, 60),
        0
    ),
    /ratio must be positive/
);
const disabledA = body({ x: 0, y: 0, angle: 0 }, [0, 0]);
const disabledB = body({ x: 10, y: 10, angle: 0 }, [0, 0]);
enabledJointTypes[context.box2d.JointType.Weld] = false;
const disabledWeld = api.attachBodies(
    disabledA,
    api.bodyAnchor(api.BodyAnchor.Center),
    disabledB,
    api.bodyAnchor(api.BodyAnchor.Center),
    api.AttachmentJointType.Weld
);
assert.ok(disabledWeld.nativeJoint instanceof WeldJoint);
assert.deepEqual(disabledB.nativeBody.getState(), { x: 10, y: 10, angle: 0 });
assert.deepEqual(disabledA.connectedBodies, []);
assert.deepEqual(disabledB.connectedBodies, []);
assert.throws(() => api.jointPoint(joint, 99), /Unknown Box2D joint point/);
assert.deepEqual(
    [api.bodyPoint(bodyA, api.BodyAnchor.Right).x, api.bodyPoint(bodyA, api.BodyAnchor.Right).y],
    [20, 40]
);
assert.throws(() => api.bodyPoint(bodyA, 99), /Unknown Box2D body anchor/);
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
