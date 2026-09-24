const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

class WallImage {
    constructor(rows) {
        this.rows = rows.map(row => row.slice());
        this.version = 0;
    }
    revision() {
        return this.version;
    }
    equals(other) {
        return !!other && JSON.stringify(this.rows) === JSON.stringify(other.rows);
    }
    clone() {
        const result = new WallImage(this.rows);
        result.version = this.version;
        return result;
    }
    set(col, row, wall) {
        this.rows[row][col] = wall;
        ++this.version;
    }
}

function data(image) {
    return {
        width: image.rows[0].length,
        height: image.rows.length,
        getWallImage() {
            return image;
        },
        isWall(col, row) {
            return image.rows[row][col];
        }
    };
}

function signedArea(points) {
    let result = 0;
    for (let i = 0; i < points.length; ++i) {
        const next = (i + 1) % points.length;
        result += points[i][0] * points[next][1] - points[next][0] * points[i][1];
    }
    return result / 2;
}

let currentData;
let currentScale = 4;
const tilemap = {
    enabled: true,
    get data() {
        return currentData;
    },
    get scale() {
        return currentScale;
    }
};
const context = vm.createContext({
    game: {
        currentScene() {
            return { tileMap: tilemap };
        }
    },
    tiles: {},
    PhysicsPoint: function (x, y) {
        this.x = x;
        this.y = y;
    },
    box(width, height) {
        return { type: "box", width, height };
    },
    chain(points, loop) {
        return {
            type: "chain",
            loop,
            points: Array.from(points, point => [point.x, point.y])
        };
    },
    addShape(body, shape, point) {
        body.fixtures.push({
            fixture: {
                valid: true,
                destroy() {
                    this.valid = false;
                }
            },
            shape,
            point
        });
    }
});

const source = fs.readFileSync(path.join(__dirname, "..", "tilemap.ts"), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.None
    }
}).outputText;
vm.runInContext(compiled, context, { filename: "tilemap.ts" });

const body = {
    destroyed: false,
    nativeBody: { valid: true },
    fixtures: []
};
const api = context.box2dblocks;
const walls = new WallImage([
    [false, false, false, false, false],
    [false, true, true, false, false],
    [false, true, true, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false]
]);
currentData = data(walls);
const state = new api._TilemapWallState(body);

state.update();
assert.equal(body.fixtures.length, 2, "An interior rectangle uses a box inside the map boundary");
assert.deepEqual(
    Array.from(body.fixtures, entry => [
        entry.shape.type,
        entry.shape.width,
        entry.shape.height,
        entry.point.x,
        entry.point.y
    ]),
    [["box", 32, 32, 32, 32], ["chain", undefined, undefined, 0, 0]]
);
assert.deepEqual(
    body.fixtures[1].shape.points,
    [[0, 0], [0, 80], [80, 80], [80, 0]],
    "The map perimeter prevents bodies from leaving the tilemap"
);

const firstFixtures = body.fixtures.slice();
state.update();
assert.equal(body.fixtures[0], firstFixtures[0], "Unchanged revisions do not rebuild fixtures");

walls.set(3, 1, true);
state.update();
assert.ok(firstFixtures.every(entry => !entry.fixture.valid), "Edited walls destroy old fixtures");
assert.equal(body.fixtures.length, 2);
assert.equal(body.fixtures[0].shape.type, "chain", "Nonrectangular components use chains");
assert.equal(body.fixtures[0].shape.loop, true);
assert.equal(body.fixtures[1].shape.type, "chain", "The map perimeter remains a chain");
const chainAreas = Array.from(body.fixtures, entry => signedArea(entry.shape.points)).sort((a, b) => a - b);
assert.ok(chainAreas[0] < 0 && chainAreas[1] > 0, "Perimeter and wall contours face opposite directions");

const replacement = new WallImage(walls.rows);
currentData = data(replacement);
const replacementFixtures = body.fixtures.slice();
state.update();
assert.equal(body.fixtures[0], replacementFixtures[0], "Equal replacement images do not rebuild");

currentScale = 3;
state.update();
assert.ok(replacementFixtures.every(entry => !entry.fixture.valid), "Tile scale changes rebuild fixtures");

const edgeWall = new WallImage([
    [false, true, false],
    [false, false, false],
    [false, false, false]
]);
currentData = data(edgeWall);
currentScale = 4;
state.update();
assert.equal(body.fixtures.length, 1, "Edge walls are incorporated into the outside boundary");
assert.equal(body.fixtures[0].shape.type, "chain");
assert.ok(body.fixtures[0].shape.points.length > 4, "The outside boundary follows edge wall indentations");
assert.ok(signedArea(body.fixtures[0].shape.points) < 0, "The outside boundary faces into the map");

tilemap.enabled = false;
state.update();
assert.equal(body.fixtures.length, 0, "Removing the tilemap clears wall fixtures");

console.log("Box2D tilemap wall tests passed");
