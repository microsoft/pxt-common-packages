//% noRefCounting fixedInstances
interface DigitalInOutPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface AnalogInPin extends DigitalInOutPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface AnalogOutPin extends DigitalInOutPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface AnalogInOutPin extends AnalogInPin, AnalogOutPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface PwmOnlyPin extends DigitalInOutPin, AnalogOutPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface PwmPin extends PwmOnlyPin, AnalogInOutPin {
}

/**
 * Control currents in Pins for analog/digital signals, servos, i2c, ...
 */
//% color=#A80000 weight=85 icon="\uf140" advanced=true
//% groups='["other", "Servo", "i2c"]'
namespace pins {
    
}