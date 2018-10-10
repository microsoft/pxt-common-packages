jacdac.listenEvent(DAL.DEVICE_ID_BUTTON_A, DAL.DEVICE_BUTTON_EVT_CLICK);
control.onEvent(DAL.DEVICE_ID_BUTTON_A, DAL.DEVICE_BUTTON_EVT_CLICK, function () {
    console.log('click')
})