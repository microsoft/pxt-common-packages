#include "pxt.h"
#include "pins.h"

namespace pins {
    /**
    * Write a value to the servo to control the rotation of the shaft. On a standard servo, this will
    * set the angle of the shaft (in degrees), moving the shaft to that orientation. On a continuous
    * rotation servo, this will set the speed of the servo (with ``0`` being full-speed in one
    * direction, ``180`` being full speed in the other, and a value near ``90`` being no movement).
    * @param name pin to write to
    * @param value angle or rotation speed, eg:180,90,0
    */
    //% help=pins/servo-write weight=41 group="Servo"
    //% blockId=device_set_servo_pin block="servo write|pin %name|to %value" blockGap=8
    //% parts=microservo trackArgs=0
    //% blockNamespace=pins
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4
    void servoWrite(PwmPin name, int value) {
        PINOP(setServoValue(value));
    }

    /**
    * Set the pin for PWM analog output, make the period be 20 ms, and set the pulse width.
    * The pulse width is based on the value it is given **microseconds** or `1/1000` milliseconds.
    * @param name pin name
    * @param duration pulse duration in micro seconds, eg:1500
    */
    //% help=pins/servo-set-pulse weight=40 group="Servo" blockGap=8
    //% blockId=device_set_servo_pulse block="servo set pulse|pin %value|to (µs) %duration"
    //% blockNamespace=pins
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4
    void servoSetPulse(PwmPin name, int duration) {
        PINOP(setServoPulseUs(duration));
    }
}