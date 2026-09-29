const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const context = vm.createContext({
    Math,
    scene: { SPRITE_Z: 0 },
    box2d: { BodyType: { Static: 0, Kinematic: 1, Dynamic: 2 } }
});
vm.runInContext(
    "Array.prototype.removeElement = function (value) { const i = this.indexOf(value); if (i >= 0) this.splice(i, 1); };",
    context
);

const prefix = `
interface SpriteLike {
    z: number;
    id: number;
    __update(camera: any, dt: number): void;
    __draw(camera: any): void;
    __serialize(offset: number): any;
}
namespace box2dblocks {
    export class Destroyable {}
    export class _FixtureDrawing {}
    export enum ShapeType { Circle, Box, Polygon, Edge, Chain }
    export function pointX(state: any, x: number, y: number) { return x; }
    export function pointY(state: any, x: number, y: number) { return y; }
}
`;
const source = prefix + fs.readFileSync(path.join(__dirname, "..", "body.ts"), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.None
    }
}).outputText;
vm.runInContext(compiled, context, { filename: "body.ts" });

const sceneSprites = [];
let sortRequests = 0;
let drawCalls = 0;
const owner = {
    addBodySprite(body) {
        sceneSprites.push(body);
        body.id = 42;
    },
    removeBodySprite(body) {
        const index = sceneSprites.indexOf(body);
        if (index >= 0)
            sceneSprites.splice(index, 1);
    },
    requestSpriteSort() {
        ++sortRequests;
    },
    drawBody(body, camera) {
        assert.equal(body, physicsBody);
        assert.equal(camera.name, "camera");
        ++drawCalls;
    },
    destroyMouseJointsForBody() {},
    removeBody(body) {
        body._removeFromScene();
    }
};
const nativeBody = {
    valid: true,
    getState() {
        return {
            x: 0, y: 0, angle: 0,
            velocityX: 0, velocityY: 0,
            angularVelocity: 0, mass: 3.5
        };
    },
    destroy() {
        this.valid = false;
    }
};
const physicsBody = new context.box2dblocks.Body(
    nativeBody,
    7,
    1,
    context.box2d.BodyType.Dynamic,
    owner
);

assert.equal(physicsBody.z, 0);
assert.equal(physicsBody.mass, 3.5, "Body mass reads the current native mass");
assert.deepEqual(sceneSprites, [], "Bodies without shapes are not registered for drawing");
physicsBody.z = 12;
assert.equal(physicsBody.z, 12);
assert.equal(sortRequests, 1, "Changing z requests scene sorting");

physicsBody._ensureInScene();
physicsBody._ensureInScene();
assert.deepEqual(sceneSprites, [physicsBody], "A body is registered only once");
assert.equal(physicsBody.id, 42, "Scene registration assigns the SpriteLike id");

physicsBody.__update({ name: "camera" }, 0.016);
physicsBody.__draw({ name: "camera" });
assert.equal(drawCalls, 1);
assert.equal(physicsBody.__serialize(0), undefined);

physicsBody.destroy();
assert.equal(nativeBody.valid, false);
assert.deepEqual(sceneSprites, [], "Destroying a body removes it from scene drawing");
physicsBody.__draw({ name: "camera" });
assert.equal(drawCalls, 1, "Destroyed bodies are not drawn");

console.log("Box2D body SpriteLike rendering tests passed");
