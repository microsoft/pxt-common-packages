
loops.forever(() => {
    for (let i = 0; i < 15; ++i) {
        photon.forward(1)
        loops.pause(250)
    }
    photon.setColor(100)
    photon.forward(10)
    loops.pause(500)
    for (let i = 0; i < 10; ++i) {
        photon.backward(1)
        loops.pause(100)
    }
    photon.setMode(PhotonMode.PenUp);
    for (let i = 0; i < 10; ++i) {
        photon.forward(1)
        loops.pause(100)
    }
    photon.setMode(PhotonMode.Eraser);
    for (let i = 0; i < 10; ++i) {
        photon.forward(1)
        loops.pause(100)
    }
})
