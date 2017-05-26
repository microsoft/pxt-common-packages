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

static const uint8_t hamming[16] = {
0b0000000,
0b1110000,
0b1001100,
0b0111100,
0b0101010,
0b1011010,
0b1100110,
0b0010110,
0b1101001,
0b0011001,
0b0100101,
0b1010101,
0b1000011,
0b0110011,
0b0001111,
0b1111111,
};

static const uint8_t invHamming[64] = { 
    0x00, 0x0c, 0x0a, 0x7e, 0x09, 0x4e, 0x2e, 0xee, 0x09, 0x7d, 0x7b, 
    0x77, 0x99, 0x59, 0x39, 0x7e, 0x0a, 0x4d, 0xaa, 0x6a, 0x48, 0x44, 
    0x3a, 0x4e, 0x1d, 0xdd, 0x3a, 0x7d, 0x39, 0x4d, 0x33, 0x3f, 0x0c, 
    0xcc, 0x2b, 0x6c, 0x28, 0x5c, 0x22, 0x2e, 0x1b, 0x5c, 0xbb, 0x7b,
    0x59, 0x55, 0x2b, 0x5f, 0x18, 0x6c, 0x6a, 0x66, 0x88, 0x48, 0x28, 
    0x6f, 0x11, 0x1d, 0x1b, 0x6f, 0x18, 0x5f, 0x3f, 0xff
};

static const int8_t waitTbl[] = { 0, 1, 3, 2 };
static const int8_t invWaitTbl[] = { 0, 1, 3, 2 };

static int lookupInvHaming(int v) {
    int k = invHamming[v >> 1];
    if (v & 1) return (k & 0xf);
    else return (k >> 4);
}

static int splitBits(int v) {
    #define SB(n) ((v & (3 << n)) << n)
    return SB(0) | SB(2) | SB(4) | SB(6);
    #undef SB
}

static int joinBits(int v) {
    #define SB(n) ((v & (3 << 2 * n)) >> n)
    return SB(0) | SB(2) | SB(4) | SB(6);
    #undef SB
}

static int split14(int v) {
    int r = splitBits(v & 0x7f) | (splitBits(v >> 7) << 2);
    r = (r << 1) & 0x3fff;
    if (v & 0x2000) r |= 1;
    return r;
}

static int join14(int v) {
    return joinBits(v >> 1) | (joinBits(v >> 3) << 7) | ((v & 1) ? 0x2000 : 0);
}

static int decodeHamming(int v) {
    v = join14(v);
    return (lookupInvHaming((v >> 7)) << 4) | (lookupInvHaming(v & 0x7f));
}

static int encodeHamming(int v) {
    return split14((hamming[v >> 4] << 7) | hamming[v & 0xf]);
}

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

class DbgBuffer {
    public:
#if IR_DEBUG
    char dbgBuf[1200];
    int dbgPtr;
    DbgBuffer() {
        dbgBuf[0] = 0;
        dbgPtr = 0;
    }
#endif
    
    void put(const char *msg) {
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

    void putNum(int n) {
#if IR_DEBUG
        char buf[30];
        itoa(n, buf);
        put(" ");
        put(buf);
#endif
    }

    const char *get() {
#if IR_DEBUG        
        dbgPtr = 0;
        return dbgBuf;
#else
        return "NoDebug";
#endif
    }
};

class IrWrap {
    //Ticker clock;
    DevicePin *pin;
    DevicePin *inpin;
    BufferData *data;
    int16_t dataptr;
    uint16_t dataval; // Hamming-encoded
    int8_t wait;
    int8_t shift;
    IrState state;
    uint64_t lastInt;
    uint32_t prevPulse;

    IrRecvState recvState;
    uint8_t recvBuf[IR_MAX_MSG_SIZE];
    uint8_t recvPtr;
    uint8_t recvShift;
    uint16_t recvVal;
    BufferData *outBuffer;

#if IR_DEBUG
    uint8_t prevData[IR_MAX_MSG_SIZE];
    uint8_t prevDataSize;
    DbgBuffer dbg;
    DbgBuffer sendDbg;
#endif

public:
    int drift;

    IrWrap() {
        state = IR_IDLE;
        recvState = IR_RECV_ERROR;
        data = NULL;
        outBuffer = NULL;
        pin = lookupPin(PIN_IR_OUT);
        prevDataSize = 0;
        if (pin) {
            system_timer_event_every_us(250, IR_COMPONENT_ID, IR_TIMER_EVENT);
            devMessageBus.listen(IR_COMPONENT_ID, IR_TIMER_EVENT, this, &IrWrap::process, MESSAGE_BUS_LISTENER_IMMEDIATE);

            //clock.attach_us(this, &IrWrap::process, 4*1000/38);
            pin->setDigitalValue(0);

            inpin = lookupPin(PIN_IR_IN);
            inpin->eventOn(DEVICE_PIN_EVENT_ON_PULSE);
            devMessageBus.listen(inpin->id, DEVICE_PIN_EVT_PULSE_HI, this, &IrWrap::pulseGap, MESSAGE_BUS_LISTENER_IMMEDIATE);
            devMessageBus.listen(inpin->id, DEVICE_PIN_EVT_PULSE_LO, this, &IrWrap::pulseMark, MESSAGE_BUS_LISTENER_IMMEDIATE);
        }
    }

    void send(BufferData *d) {
        if (data)
            return; // error code?

        incrRC(d);
        state = IR_MARK_START;
        wait = 7;
        drift = 0;
        lastInt = 0;
        pin->setAnalogPeriodUs(1000/38); // 38kHz
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
            if (prevDataSize == 0) {
                prevDataSize = 6;
                memcpy(prevData, recvBuf, 3);
                memcpy(prevData + 3, recvBuf, 3);
                prevData[3] ^= 182;
                prevData[4] ^= 182;
                prevData[5] ^= 182;
            }
            if (prevDataSize != recvPtr || memcmp(prevData, recvBuf, recvPtr))
                DMESG("IR DATA ERR dr=%d [%s] [%s]", drift, dbg.get(), sendDbg.get());
            else {
                DMESG("IR OK len=%d [%s]", recvPtr, dbg.get());
            }
            prevDataSize = 0;
        } else {
            DMESG("IR ERROR %d dr=%d [%s] [%s]", code, drift, dbg.get(), sendDbg.get());
        }
        dbg.get();
        sendDbg.get();
#endif
        recvState = IR_RECV_ERROR;        
    }

    void pulseGap(DeviceEvent ev) {
        if (ev.timestamp > 10000) {
            dbg.put(" BRK ");
            finish(11);
            return;
        }
        
        //dbg.putNum((int)ev.timestamp);

        int sum = (int)ev.timestamp + prevPulse;
        int len = ((sum + 125) / 250) - 1;
        dbg.putNum(sum);

        if (len <= 0) len = 1;
        if (len == 5 || len == 6) len = 4;

        if (len > 4) {
            finish(1);
            return;
        }

        if (recvState == IR_WAIT_START_GAP) {
            recvState = IR_WAIT_DATA;
            recvPtr = 0;
            recvShift = 0;
            recvVal = 0;
            dbg.put(" *** ");
            return;
        }

        if (recvState == IR_WAIT_DATA) {
            recvVal |= invWaitTbl[len - 1] << recvShift;
            recvShift += 2;
            if (recvShift >= 14) {
                recvBuf[recvPtr++] = decodeHamming(recvVal);
                recvShift = 0;
                recvVal = 0;
                if (recvPtr >= IR_MAX_MSG_SIZE) {
                    finish(2);
                    return;
                }
            }
            return;
        }
    }

    void pulseMark(DeviceEvent ev) {
        if (ev.timestamp > 10000) {
            dbg.put(" -BRK ");
            finish(10);
            return;
        }

        dbg.putNum(-(int)ev.timestamp);

        int len = (int)(ev.timestamp - 20 + 125) / 250;

        if (len >= 7) {
            recvState = IR_WAIT_START_GAP;
            prevPulse = 0;
            return;
        }

        if (recvState == IR_WAIT_DATA) {
            if (len <= 2) {
                prevPulse = (int)ev.timestamp;
                return; // just a bit
            } else if (len <= 6) {
                // stop
                if (recvShift != 0) {
                    recvPtr = 0; // emit empty packet
                }
                decrRC(outBuffer);
                outBuffer = pins::createBuffer(recvPtr);
                memcpy(outBuffer->payload, recvBuf, recvPtr);
                if (recvShift != 0)
                    finish(300 + recvShift);
                else
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

    void nextByte() {
        shift = 0;
        dataval = encodeHamming(data->payload[++dataptr]);
    }

    void process(DeviceEvent) {
        if (!data)
            return;

        auto now = system_timer_current_time_us();
        if (lastInt) {
            auto delta = abs( (int)(now - lastInt) - 250 );
            if (delta > 50)
                drift += delta + 100000;
            /*
            if (delta > 300) {
                drift += delta - 250;
            }
            */
        }
        lastInt = now;

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
                sendDbg.putNum(3 * 250);
                pin->setPwm(0);
                break;
            case IR_GAP_START:
                dataptr = -1;
                nextByte();
            case IR_GAP_DATA:
                pin->setPwm(1);
                if (dataptr >= data->length) {
                    sendDbg.putNum(-1000);
                    state = IR_MARK_END;
                    wait = 3;
                } else {
                    state = IR_MARK_DATA;
                    wait = -(waitTbl[(dataval >> shift) & 3]);
                    shift += 2;
                    sendDbg.putNum(-250);
                    if (shift >= 14) nextByte();
                }
                break;
            case IR_MARK_DATA:
                pin->setPwm(0);
                wait = -wait;
                sendDbg.putNum((wait + 1) * 250);
                sendDbg.putNum((wait + 1));
                state = IR_GAP_DATA;
                break;
            case IR_MARK_END:
            #if IR_DEBUG
                prevDataSize = data->length;
                memcpy(prevData, data->payload, prevDataSize);
            #endif
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
int drift() {
    auto w = getIrWrap();
    return w->drift;
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
