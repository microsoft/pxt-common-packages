#include "pxt.h"

#include "DeviceSystemTimer.h"

enum class PulseValue {
    //% block=high
    High = DEVICE_PIN_EVT_PULSE_HI,
    //% block=low
    Low = DEVICE_PIN_EVT_PULSE_LO
};

enum class PinPullMode {
    //% block="down"
    PullDown = 0,
    //% block="up"
    PullUp = 1,
    //% block="none"
    PullNone = 2
};

namespace pxt {
//%
DevicePin *getPin(int id) {
    if (!(0 <= id && id <= LastPinID))
        device.panic(42);
    DevicePin *p = &io->pins[id];
    // if (p->name == NC)
    //    return NULL;
    return p;
}

#pragma GCC diagnostic ignored "-Warray-bounds"

//%
DevicePin *lookupPin(int pinName) {
    for (int i = 0; i <= LastPinID; ++i) {
        if (io->pins[i].name == pinName)
            return &io->pins[i];
    }
    return NULL;
}
}

#define PINOP(op) name->op

#define PINREAD(op) return (name->op != 0)

namespace DigitalPinMethods {
/**
 * Read the specified pin or connector as either 0 or 1
 * @param name pin to read from
 */
//% help=pins/digital-read-pin weight=30
//% blockId=device_get_digital_pin block="digital read|pin %name" blockGap=8
//% parts="slideswitch" trackArgs=0
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
bool digitalRead(DigitalPin name) {
    PINREAD(getDigitalValue());
}

/**
  * Set a pin or connector value to either 0 or 1.
  * @param name pin to write to
  * @param value value to set on the pin
  */
//% help=pins/digital-write-pin weight=29
//% blockId=device_set_digital_pin block="digital write|pin %name|to %value"
//% parts="led" trackArgs=0
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220 
//% name.fieldOptions.columns=4
void digitalWrite(DigitalPin name, bool value) {
    PINOP(setDigitalValue(value));
}

/**
* Configures this pin to a digital input, and generates events where the timestamp is the duration
* that this pin was either ``high`` or ``low``.
*/
//% help=pins/on-pulsed weight=22 blockGap=8 advanced=true
//% blockId=pins_on_pulsed block="on|pin %pin|pulsed %pulse"
//% blockNamespace=pins
//% pin.fieldEditor="gridpicker"
//% pin.fieldOptions.width=220
//% pin.fieldOptions.columns=4
void onPulsed(DigitalPin pin, PulseValue pulse, Action body) {
    pin->eventOn(DEVICE_PIN_EVENT_ON_PULSE);
    registerWithDal(pin->id, (int)pulse, body);
}

/**
* Returns the duration of a pulse in microseconds
* @param name the pin which measures the pulse
* @param value the value of the pulse (default high)
* @param maximum duration in micro-seconds
*/
//% blockId="pins_pulse_in" block="pulse in (µs)|pin %name|pulsed %value"
//% weight=20 advanced=true
//% blockNamespace=pins
//% pin.fieldEditor="gridpicker"
//% pin.fieldOptions.width=220
//% pin.fieldOptions.columns=4
int pulseIn(DigitalPin pin, PulseValue value, int maxDuration = 2000000) {
    int pulse = value == PulseValue::High ? 1 : 0;
    uint64_t tick = system_timer_current_time_us();
    uint64_t maxd = (uint64_t)maxDuration;
    while (pin->getDigitalValue() != pulse) {
        if (system_timer_current_time_us() - tick > maxd)
            return 0;
    }

    uint64_t start = system_timer_current_time_us();
    while (pin->getDigitalValue() == pulse) {
        if (system_timer_current_time_us() - tick > maxd)
            return 0;
    }
    uint64_t end = system_timer_current_time_us();
    return end - start;
}

/**
* Configures the pull of this pin.
* @param name pin to set the pull mode on
* @param pull one of the mbed pull configurations: PullUp, PullDown, PullNone
*/
//% help=pins/set-pull weight=3 advanced=true
//% blockId=device_set_pull block="set pull|pin %pin|to %pull"
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
void setPull(DigitalPin name, PinPullMode pull) {
    PinMode m = pull == PinPullMode::PullDown ? PinMode::PullDown : pull == PinPullMode::PullUp
                                                                        ? PinMode::PullUp
                                                                        : PinMode::PullNone;
    PINOP(setPull(m));
}

}

namespace AnalogPinMethods {

/**
 * Read the connector value as analog, that is, as a value comprised between 0 and 1023.
 * @param name pin to write to
 */
//% help=pins/analog-read-pin weight=25
//% blockId=device_get_analog_pin block="analog read|pin %name" blockGap="8"
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
int analogRead(AnalogPin name) {
    PINREAD(getAnalogValue());
}

/**
 * Set the connector value as analog. Value must be comprised between 0 and 1023.
 * @param name pin name to write to
 * @param value value to write to the pin between ``0`` and ``1023``. eg:1023,0
 */
//% help=pins/analog-write-pin weight=24
//% blockId=device_set_analog_pin block="analog write|pin %name|to %value" blockGap=8
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
void analogWrite(AnalogPin name, int value) {
    PINOP(setAnalogValue(value));
}
}

namespace PwmPinMethods {

/**
 * Configures the Pulse-width modulation (PWM) of the analog output to the given value in
 * **microseconds** or `1/1000` milliseconds.
 * If this pin is not configured as an analog output (using `analog write pin`), the operation has
 * no effect.
 * @param name analog pin to set period to
 * @param micros period in micro seconds. eg:20000
 */
//% help=pins/analog-set-period weight=23 blockGap=8
//% blockId=device_set_analog_period block="analog set period|pin %pin|to (µs)%micros"
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
void analogSetPeriod(PwmPin name, int micros) {
    PINOP(setAnalogPeriodUs(micros));
}

/**
 * Writes a value to the servo, controlling the shaft accordingly. On a standard servo, this will
 * set the angle of the shaft (in degrees), moving the shaft to that orientation. On a continuous
 * rotation servo, this will set the speed of the servo (with ``0`` being full-speed in one
 * direction, ``180`` being full speed in the other, and a value near ``90`` being no movement).
 * @param name pin to write to
 * @param value angle or rotation speed, eg:180,90,0
 */
//% help=pins/servo-write-pin weight=20
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
 * Configures this IO pin as an analog/pwm output, configures the period to be 20 ms, and sets the
 * pulse width, based on the value it is given **microseconds** or `1/1000` milliseconds.
 * @param name pin name
 * @param micros pulse duration in micro seconds, eg:1500
 */
//% help=pins/servo-set-pulse weight=19
//% blockId=device_set_servo_pulse block="servo set pulse|pin %value|to (µs) %micros"
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
void servoSetPulse(PwmPin name, int micros) {
    PINOP(setServoPulseUs(micros));
}

}

namespace pins {
/**
 * Create a new zero-initialized buffer.
 * @param size number of bytes in the buffer
 */
//%
Buffer createBuffer(int size) {
    return ManagedBuffer(size).leakData();
}

/**
* Gets the duration of the last pulse in micro-seconds. This function should be called from a
* ``onPulsed`` handler.
*/
//% help=pins/pulse-duration advanced=true
//% blockId=pins_pulse_duration block="pulse duration (µs)"
//% weight=21 blockGap=8
int pulseDuration() {
    return pxt::lastEvent.timestamp;
}
}


namespace ir {

#define IR_MAX_MSG_SIZE 64
#define IR_COMPONENT_ID 0x2000
#define IR_TIMER_EVENT 0x1
#define IR_PACKET_EVENT 0x2

#define IR_DEBUG 1

enum IrState : uint8_t {
    IR_IDLE,
    IR_MARK_START,
    IR_GAP_START,
    IR_MARK_DATA,
    IR_GAP_DATA,
    IR_MARK_END,
};

enum IrRecvState : uint8_t {
    IR_RECV_ERROR,
    IR_WAIT_START_GAP,
    IR_WAIT_DATA,
};

class IrWrap {
    //Ticker clock;
    DevicePin *pin;
    DevicePin *inpin;
    BufferData *data;
    uint16_t dataptr;
    int8_t wait;
    int8_t shift;
    IrState state;

    IrRecvState recvState;
    uint8_t recvBuf[IR_MAX_MSG_SIZE];
    uint8_t recvPtr;
    uint8_t recvShift;
    BufferData *outBuffer;

#if IR_DEBUG
    char dbgBuf[512];
    int dbgPtr;
#endif

public:

    IrWrap() {
#if IR_DEBUG
        dbgPtr = 0;
#endif
        state = IR_IDLE;
        recvState = IR_RECV_ERROR;
        data = NULL;
        outBuffer = NULL;
        pin = lookupPin(PIN_IR_OUT);
        if (pin) {
            system_timer_event_every_us(250, IR_COMPONENT_ID, IR_TIMER_EVENT);
            devMessageBus.listen(IR_COMPONENT_ID, IR_TIMER_EVENT, this, &IrWrap::process, MESSAGE_BUS_LISTENER_IMMEDIATE);

            //clock.attach_us(this, &IrWrap::process, 4*1000/38);
            pin->setAnalogPeriodUs(1000/38); // 38kHz
            
            inpin = lookupPin(PIN_IR_IN);
            inpin->eventOn(DEVICE_PIN_EVENT_ON_PULSE);
            devMessageBus.listen(inpin->id, DEVICE_PIN_EVT_PULSE_HI, this, &IrWrap::pulseGap, MESSAGE_BUS_LISTENER_IMMEDIATE);
            devMessageBus.listen(inpin->id, DEVICE_PIN_EVT_PULSE_LO, this, &IrWrap::pulseMark, MESSAGE_BUS_LISTENER_IMMEDIATE);
        }
    }

    void dbg(const char *msg) {
#if IR_DEBUG
        int len = strlen(msg);
        if (len + dbgPtr > (int)sizeof(dbgBuf) - 1) {
            dbgPtr = 1;
            dbgBuf[0] = '>';
        }
        memcpy(dbgBuf + dbgPtr, msg, len + 1);
        dbgPtr += len;
#endif
    }

    void dbgNum(int n) {
#if IR_DEBUG
        char buf[30];
        itoa(n, buf);
        dbg(" ");
        dbg(buf);
        //DMESG("D %d", n);
#endif
    }

    void send(BufferData *d) {
        if (data)
            return; // error code?

        incrRC(d);
        state = IR_MARK_START;
        wait = 7;
        pin->setAnalogValue(333);
        pin->setPwm(1);
        data = d;
        while (data) {
            fiber_sleep(5);
        }
        fiber_sleep(5);
    }

    void finish(int code) {
        if (recvState == IR_RECV_ERROR)
            return;

#if IR_DEBUG
        if (code == 0) {
            DMESG("IR OK len=%d [%s]", recvPtr, dbgBuf);
        } else {
            DMESG("IR ERROR %d [%s]", code, dbgBuf);
        }
        dbgPtr = 0;
#endif
        recvState = IR_RECV_ERROR;        
    }

    void pulseGap(DeviceEvent ev) {
        if (ev.timestamp > 10000) {
            dbg(" BRK ");
            finish(11);
            return;
        }
        
        dbgNum((int)ev.timestamp);

        int len = (int)(ev.timestamp + 20 + 125) / 250;

        if (len == 0) len = 1;
        if (len == 5 || len == 6) len = 4;

        if (len > 4) {
            finish(1);
            return;
        }

        if (recvState == IR_WAIT_START_GAP) {
            recvState = IR_WAIT_DATA;
            recvPtr = 0;
            recvShift = 0;
            memset(recvBuf, 0, IR_MAX_MSG_SIZE);
            dbg(" *** ");
            return;
        }

        if (recvState == IR_WAIT_DATA) {
            if (recvShift >= 8) {
                recvShift = 0;
                recvPtr++;
                if (recvPtr >= IR_MAX_MSG_SIZE) {
                    finish(2);
                    return;
                }
            }
            recvBuf[recvPtr] |= (len - 1) << recvShift;
            recvShift += 2;
            return;
        }
    }

    void pulseMark(DeviceEvent ev) {
        if (ev.timestamp > 10000) {
            dbg(" -BRK ");
            finish(10);
            return;
        }

        dbgNum(-(int)ev.timestamp);

        int len = (int)(ev.timestamp - 20 + 125) / 250;

        if (len >= 7) {
            recvState = IR_WAIT_START_GAP;
            return;
        }

        if (recvState == IR_WAIT_DATA) {
            if (len <= 2)
                return; // just a bit
            else if (len < 6) {
                // stop
                if (recvShift != 8) {
                    finish(3);
                    return;
                }

                recvPtr++;
                decrRC(outBuffer);
                outBuffer = pins::createBuffer(recvPtr);
                memcpy(outBuffer->payload, recvBuf, recvPtr);
                finish(0);
                DeviceEvent evt(IR_COMPONENT_ID, IR_PACKET_EVENT);
            } else {
                finish(4);
            }
        }
    }

    Buffer getBuffer() {
        incrRC(outBuffer);
        return outBuffer;
    }

    /*
    Protocol:
    start: 8 marks, 2 gaps
    data: 1 mark, 1-4 gaps
    stop: 4 marks
    */

    void process(DeviceEvent) {
        if (!data)
            return;

        if (wait > 0) {
            wait--;
            return;
        }
      
        switch (state) {
            case IR_IDLE:
                device.panic(100);
                break;
            case IR_MARK_START:
                state = IR_GAP_START;
                wait = 2;
                pin->setPwm(0);
                break;
            case IR_GAP_START:
                shift = 0;
                dataptr = 0;
            case IR_GAP_DATA:
                pin->setPwm(1);
                if (dataptr >= data->length) {
                    state = IR_MARK_END;
                    wait = 3;
                } else {
                    state = IR_MARK_DATA;
                    wait = -((data->payload[dataptr] >> shift) & 3);
                    shift += 2;
                    if (shift >= 8) {
                        shift = 0;
                        dataptr++;
                    }
                }
                break;
            case IR_MARK_DATA:
                pin->setPwm(0);
                wait = -wait;
                state = IR_GAP_DATA;
                break;
            case IR_MARK_END:
                decrRC(data);
                data = NULL;
                state = IR_IDLE;
                pin->setAnalogValue(0);
                pin->setPwm(1);
                break;
        }
    }
};
SINGLETON(IrWrap);

/**
 * Send data over IR.
 */
//%
void send(Buffer buf) {
    auto w = getIrWrap();
    w->send(buf);
}

/**
 * Get data over IR.
 */
//%
Buffer currentPacket() {
    auto w = getIrWrap();
    return w->getBuffer();
}


/**
 * Get data over IR.
 */
//%
void onPacket(Action body) {
    getIrWrap(); // attach events
    registerWithDal(IR_COMPONENT_ID, IR_PACKET_EVENT, body);
}


}