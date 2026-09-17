// Only the selected sample allocates a world or registers event handlers.
const DEMO = "car" // "car", "tumbler", or "pyramid"
const RUN_SMOKE_TESTS = false
game.stats = true

if (RUN_SMOKE_TESTS) {
    runNativeSmokeTests()
    runWrapperSmokeTests()
}

if (DEMO == "car") {
    runCarDemo()
} else if (DEMO == "tumbler") {
    runTumblerDemo()
} else if (DEMO == "pyramid") {
    runPyramidDemo()
} else {
    control.fail("Unknown Box2D demo")
}
