jacdac.listenEvent(9008, DAL.DEVICE_BUTTON_EVT_CLICK);
control.onEvent(9008, DAL.DEVICE_BUTTON_EVT_CLICK, function () {
    console.log('click')
})