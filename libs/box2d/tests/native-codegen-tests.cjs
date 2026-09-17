const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Ordinary JS execution cannot detect bad stack slots emitted by the PXT compiler.
const root = path.resolve(__dirname, "..");
const variant = JSON.parse(fs.readFileSync(path.join(root, "mkc.json"), "utf8")).hwVariant;
const asm = fs.readFileSync(path.join(root, "built", variant, "binary.asm"), "utf8");
const seen = new Set();
const failures = [];
let checked = 0;
for (const match of asm.matchAll(/^; Function (test-(?:car|pyramid|tumbler)\.ts)\(([^\n]+)\n([\s\S]*?); endfun/gm)) {
    const [, file, location, code] = match;
    seen.add(file);
    const prologue = code.match(/\.locals:\n([\s\S]*?)@stackmark locals/);
    assert.ok(prologue, `${file}(${location}: missing local-stack prologue`);
    const slots = [...prologue[1].matchAll(/^\s*push \{r0\} ;loc$/gm)].length;
    assert.ok(!/\bsub sp\b/.test(prologue[1]), "Update this check for a changed stack-allocation format");
    for (const reference of code.matchAll(/\blocals@(\d+)/g)) {
        if (Number(reference[1]) >= slots) {
            failures.push(`${file}(${location}: local slot ${reference[1]} exceeds ${slots}-slot frame`);
        }
    }
    ++checked;
}
assert.deepEqual([...seen].sort(), ["test-car.ts", "test-pyramid.ts", "test-tumbler.ts"],
    "Build native firmware with both sample sources included before running this check");
assert.deepEqual(failures, [], "Generated sample code references another function's local stack slots");
console.log(`Native sample stack-slot checks passed for ${checked} compiled functions`);
