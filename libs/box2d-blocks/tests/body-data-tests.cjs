const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function Body() {
    this.data = {};
}
function Sprite() {
    this.data = {};
}
const context = vm.createContext({
    box2dblocks: { Body },
    Sprite
});
const source = fs.readFileSync(path.join(__dirname, "..", "body-data.ts"), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.None
    }
}).outputText;
vm.runInContext(compiled, context, { filename: "body-data.ts" });

const api = context.bodyData;
const body = new Body();
const other = new Body();
const spriteTarget = new Sprite();
const image = {};
const sprite = {};
const location = {};

assert.equal(api.getNumber(body, "score"), 0, "Missing numbers default to zero");
api.setNumber(body, "score", 10);
api.changeNumber(body, "score", 5);
assert.equal(api.getNumber(body, "score"), 15);

api.setString(body, "score", "fifteen");
assert.equal(api.getString(body, "score"), "fifteen", "Types use independent key spaces");
assert.equal(api.getNumber(body, "score"), 15);

api.setBoolean(body, "active", true);
api.setLocation(body, "spawn", location);
api.setImage(body, "portrait", image);
api.setSprite(body, "owner", sprite);
api.setBody(body, "other", other);
assert.equal(api.getBoolean(body, "active"), true);
assert.equal(api.getLocation(body, "spawn"), location);
assert.equal(api.getImage(body, "portrait"), image);
assert.equal(api.getSprite(body, "owner"), sprite);
assert.equal(api.getBody(body, "other"), other);
api.setSpriteBody(spriteTarget, "body", body);
api.setSpriteBodyArray(spriteTarget, "bodies", [body, other]);
assert.equal(api.getSpriteBody(spriteTarget, "body"), body);
assert.deepEqual(
    Array.from(api.getSpriteBodyArray(spriteTarget, "bodies")),
    [body, other],
    "Sprites can store body arrays"
);

const numbers = [1, 2, 3];
const bodies = [body, other];
api.setNumberArray(body, "numbers", numbers);
api.setBodyArray(body, "bodies", bodies);
assert.equal(api.getNumberArray(body, "numbers"), numbers);
assert.equal(api.getBodyArray(body, "bodies"), bodies);

let called;
api.setFunction(body, "run", value => called = value);
api.callFunction(body, "run");
assert.equal(called, body);
api.callFunction(body, "missing");

assert.throws(() => api.setNumber({}, "score", 1), /Unsupported body data target/);

console.log("Box2D body data tests passed");
