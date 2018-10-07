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
