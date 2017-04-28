
control.forever(() => {
    for (let i = 0; i < 15; ++i) {
        photon.forward(1)
        control.pause(250)
    }
    photon.setColor(0x00f0f0)
    photon.forward(10)
    control.pause(500)
    for (let i = 0; i < 10; ++i) {
        photon.backward(1)
        control.pause(100)
    }
    photon.setMode(PhotonMode.Off);
    for (let i = 0; i < 10; ++i) {
        photon.forward(1)
        control.pause(100)
    }
    photon.setMode(PhotonMode.Erase);
    for (let i = 0; i < 10; ++i) {
        photon.forward(1)
        control.pause(100)
    }
})
