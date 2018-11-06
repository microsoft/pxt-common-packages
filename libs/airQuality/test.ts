// tests go here; this will not be compiled when this package is used as a library
let eCO2 = 0
let TVOCs = 0
function ccs811() {
  control.runInParallel(() => {
    TVOCs = airQuality.readTvoc()
    eCO2 = airQuality.readCo2()
    loops.pause(1000)
})
}
//airQuality.appStart()
ccs811()