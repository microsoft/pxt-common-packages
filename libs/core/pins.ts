//% noRefCounting fixedInstances
interface DigitalPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface AnalogInPin extends DigitalPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface AnalogOutPin extends DigitalPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface AnalogPin extends AnalogInPin, AnalogOutPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface PwmOnlyPin extends DigitalPin, AnalogOutPin {
    // methods filled from C++
}

//% noRefCounting fixedInstances
interface PwmPin extends PwmOnlyPin, AnalogPin {
}
