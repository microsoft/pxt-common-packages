azureiot.connect();
forever(() => {
    azureiot.publishMessage({
        text: `t: ${control.millis()}`,
        num: control.millis()
    });
    pause(1000)
})
