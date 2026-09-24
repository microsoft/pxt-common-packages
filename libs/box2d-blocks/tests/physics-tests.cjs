const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function JointAnchor(anchor, dx, dy) {
    this.anchor = anchor;
    this.dx = dx;
    this.dy = dy;
}
const BodyAnchor = { Center: 0, Right: 4 };
const context = vm.createContext({
    Math,
    JointAnchor,
    BodyAnchor,
    pointX(state, localX, localY) {
        return state.x + Math.cos(state.angle) * localX - Math.sin(state.angle) * localY;
    },
    pointY(state, localX, localY) {
        return state.y + Math.sin(state.angle) * localX + Math.cos(state.angle) * localY;
    }
});
const source = fs.readFileSync(path.join(__dirname, "..", "physics.ts"), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.None
    }
}).outputText;
vm.runInContext(compiled, context, { filename: "physics.ts" });

const api = context.box2dblocks;
const calls = [];
const body = {
    localAnchor(anchor) {
        return anchor.anchor == BodyAnchor.Right ? [1, 0] : [0, 0];
    },
    nativeBody: {
        getState() {
            return { x: 2, y: 3, angle: Math.PI / 2 };
        },
        applyForce(x, y, pointX, pointY) {
            calls.push(["force", x, y, pointX, pointY]);
        },
        applyLinearImpulse(x, y, pointX, pointY) {
            calls.push(["impulse", x, y, pointX, pointY]);
        }
    }
};

api.applyForceAtAngle(body, 10, Math.PI / 2);
api.applyLinearImpulseAtAngle(
    body,
    4,
    Math.PI,
    new JointAnchor(BodyAnchor.Right, 0, 0)
);

assert.equal(calls[0][0], "force");
assert.ok(Math.abs(calls[0][1]) < 0.0001);
assert.ok(Math.abs(calls[0][2] - 10) < 0.0001);
assert.deepEqual(calls[0].slice(3), [2, 3]);
assert.equal(calls[1][0], "impulse");
assert.ok(Math.abs(calls[1][1] + 4) < 0.0001);
assert.ok(Math.abs(calls[1][2]) < 0.0001);
assert.ok(Math.abs(calls[1][3] - 2) < 0.0001);
assert.ok(Math.abs(calls[1][4] - 4) < 0.0001);

console.log("Box2D polar force and impulse tests passed");
