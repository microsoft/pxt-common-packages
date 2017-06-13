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

namespace DigitalPinMethods {
/**
 * Read a pin or connector as either 0 or 1
 * @param name pin to read from
 */
//% help=pins/digital-read weight=30
//% blockId=device_get_digital_pin block="digital read|pin %name" blockGap=8
//% parts="slideswitch" trackArgs=0
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
bool digitalRead(DigitalPin name) {
    return PINOP(getDigitalValue()) != 0;
}

/**
  * Set a pin or connector value to either 0 or 1.
  * @param name pin to write to
  * @param value value to set on the pin
  */
//% help=pins/digital-write weight=29
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
* Make this pin a digital input, and create events where the timestamp is the duration
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
* Return the duration of a pulse in microseconds
* @param name the pin which measures the pulse
* @param value the value of the pulse (default high)
* @param maximum duration in micro-seconds
*/
//% blockId="pins_pulse_in" block="pulse in (µs)|pin %name|pulsed %value"
//% weight=20 advanced=true
//% help="pins/pulse-in"
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
* Set the pull direction of this pin.
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
//% help=pins/analog-read weight=25
//% blockId=device_get_analog_pin block="analog read|pin %name" blockGap="8"
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
int analogRead(AnalogPin name) {
    return PINOP(getAnalogValue());
}

/**
 * Set the connector value as analog. Value must be comprised between 0 and 1023.
 * @param name pin name to write to
 * @param value value to write to the pin between ``0`` and ``1023``. eg:1023,0
 */
//% help=pins/analog-write weight=24
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
 * Set the Pulse-width modulation (PWM) period of the analog output. The period is in
 * **microseconds** or `1/1000` milliseconds.
 * If this pin is not configured as an analog output (using `analog write pin`), the operation has
 * no effect.
 * @param name analog pin to set period to
 * @param micros period in micro seconds. eg:20000
 */
//% help=pins/analog-set-period weight=23 blockGap=8
//% blockId=device_set_analog_period block="analog set period|pin %pin|to (µs)%period"
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
void analogSetPeriod(PwmPin name, int period) {
    PINOP(setAnalogPeriodUs(period));
}

/**
 * Write a value to the servo to control the rotation of the shaft. On a standard servo, this will
 * set the angle of the shaft (in degrees), moving the shaft to that orientation. On a continuous
 * rotation servo, this will set the speed of the servo (with ``0`` being full-speed in one
 * direction, ``180`` being full speed in the other, and a value near ``90`` being no movement).
 * @param name pin to write to
 * @param value angle or rotation speed, eg:180,90,0
 */
//% help=pins/servo-write weight=20
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
//% help=pins/servo-set-pulse weight=19
//% blockId=device_set_servo_pulse block="servo set pulse|pin %value|to (µs) %duration"
//% blockNamespace=pins
//% name.fieldEditor="gridpicker"
//% name.fieldOptions.width=220
//% name.fieldOptions.columns=4
void servoSetPulse(PwmPin name, int duration) {
    PINOP(setServoPulseUs(duration));
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
* Get the duration of the last pulse in microseconds. This function should be called from a
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

#define IR_MAX_MSG_SIZE 32
#define IR_COMPONENT_ID 0x2042
#define IR_TIMER_EVENT 0x1
#define IR_PACKET_EVENT 0x2
#define IR_MAX_PULSES (IR_MAX_MSG_SIZE * 18 + 10)

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

static int lookupInvHaming(int v) {
    int k = invHamming[v >> 1];
    if (v & 1) return (k & 0xf);
    else return (k >> 4);
}

static void decodeHamming(uint64_t r, uint8_t *dst) {
    int a0 = 0;
    int a1 = 0;
    int b0 = 0;
    int b1 = 0;
    int p = 0;

    for (int i = 0; i < 7; ++i) {
        a0 |= ((r >> p++) & 1) << i;
        b0 |= ((r >> p++) & 1) << i;
        a1 |= ((r >> p++) & 1) << i;
        b1 |= ((r >> p++) & 1) << i;
        p++; // stop bit
    }

    dst[0] = (lookupInvHaming(a0) << 4) | lookupInvHaming(a1);
    dst[1] = (lookupInvHaming(b0) << 4) | lookupInvHaming(b1);
}

static uint64_t encodeHamming(uint8_t a, uint8_t b) {
    int a0 = hamming[a >> 4];
    int a1 = hamming[a & 0xf];
    int b0 = hamming[b >> 4];
    int b1 = hamming[b & 0xf];
    uint64_t r = 0;
    int p = 0;
    for (int i = 0; i < 7; ++i) {
        r |= (uint64_t)((a0 >> i) & 1) << p++;
        r |= (uint64_t)((b0 >> i) & 1) << p++;
        r |= (uint64_t)((a1 >> i) & 1) << p++;
        r |= (uint64_t)((b1 >> i) & 1) << p++;

        // if there was at least a single 1, then stop bit is zero
        int stop = (r & 0xf) ? 0 : 1;
        r |= (uint64_t)stop << p++;
    }
    return r;
}

enum IrRecvState : uint8_t {
    IR_RECV_ERROR,
    IR_WAIT_START_GAP,
    IR_WAIT_DATA,
};

class BitVector {
    Segment data;
    uint32_t len;

    uint32_t get32(int idx) {
        return (uint32_t)data.get(idx >> 5);
    }
public:
    BitVector() {
        len = 0;
    }

    int get(int pos) {
        if (pos < 0 || pos >= len)
            return 0;
        return !!(get32(pos) & (1 << (pos & 31)));
    }
    uint32_t getBits(int pos, int num) {
        uint32_t res = get32(pos);
        int off = pos & 31;
        res >>= off;
        off = 32 - off;
        num -= off;
        if (num > 0) {
            res |= get32(pos + 32) << off;
        }
        if (num < 32)
            res &= (1U << num) - 1;
        return res;
    }
    void set(int pos, int v) {
        if (pos < 0 || pos >= len)
            return;
        auto curr = get32(pos);
        auto mask = 1 << (pos & 31);
        if (v)
            curr |= mask;
        else
            curr &= ~mask;
        data.set(pos >> 5, (TValue)curr);
    }
    void setLength(uint32_t newLength) {
        len = newLength;
        data.setLength((len + 31) >> 5);
    }
    void push(int v) {
        setLength(len + 1);
        set(len - 1, v);
    }
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
    int8_t databits;
    IrState state;
    uint64_t dataval; // Hamming-encoded
    uint64_t lastInt;
    uint64_t startTime;

    int16_t pulses[IR_MAX_PULSES + 1];
    uint16_t pulsePtr;

    IrRecvState recvState;
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
        // 0b10111...11 - it gets transmitted from LSB, so we get a bunch of ones followed by zero and one
        dataval = 0xbffffff;
        databits = 28;
        dataptr = 0;
        drift = 0;
        lastInt = 0;
        pin->setAnalogPeriodUs(1000/38); // 38kHz
        pin->setAnalogValue(333);
        pwmstate = 1;
        pin->setPwm(1);
        data = d;
        while (data) {
            fiber_sleep(5);
        }
        fiber_sleep(5);
    }

    void finish(int code) {
        //if (recvState == IR_RECV_ERROR)
        //    return;

#if IR_DEBUG
        drift = (int)(system_timer_current_time_us() - startTime);
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

    void addPulse(int v) {
        if (pulsePtr < IR_MAX_PULSES - 1) {
            pulses[pulsePtr++] = (int16_t)v;
        } else {
            finish(2);
        }
    }

    void adjustShift() {
        int16_t nums[IR_MAX_PULSES];
        int v = 0;
        int sum = 0;
        for (int i = 0; i < pulsePtr; i++) {
            if (pulses[i] < 0) v -= pulses[i];
            else v += pulses[i];
            int d = v % 250;
            if (v > 125)
                v -= 250;
            nums[i] = v;
            sum += v;
        }
        
        for (int i = 0; i < pulsePtr - 1; i++)
            for (int j = 0; j < pulsePtr - i - 1; j++) {
                if (nums[j] > nums[j + 1])
                    std::swap(nums[j], nums[j + 1]);
        
        int median = nums[pulsePtr / 2];
        pulses[0] -= median;

        DMESG("shift: n=%d avg=%d med=%d p=%d %d %d ...", 
            pulsePtr, sum / pulsePtr, median, pulses[0], pulses[1], pulses[2]);
    }

    void pulseGap(DeviceEvent ev) {
        if (ev.timestamp > 10000) {
            dbg.put(" BRK ");
            finish(11);
            return;
        }

        int tm = (int)ev.timestamp;
        
        dbg.putNum(tm);

        if (recvState == IR_WAIT_START_GAP) {
            pulsePtr = 0;
            addPulse(tm);
            recvState = IR_WAIT_DATA;
            dbg.put(" *** ");
            startTime = system_timer_current_time_us();
            return;
        }

        if (recvState == IR_WAIT_DATA) {
            addPulse(tm);
            return;
        }
    }

    int errorRate(int start, BitVector &bits) {
        int stops = 0;
        int errs = 0;
        for (int i = start; i < bits.size(); i += 5) {
            uint32_t v = bits.getBits(i, 5);
            if (v == 0x1f) stops++;
            else stops = 0;
            if (stops >= 3)
                break;
            if ((v & 0x10) && (v != 0x10))
                errs++;
        }
        return errs;
    }

    void decodeMsg() {
        adjustShift();

        BitVector bits;
        
        int pos = 125;
        for (int i = 0; i < pulsePtr; ++i) {
            int curr = pulses[i];
            int v = 0;
            if (curr < 0) {
                v = 1;
                curr = -curr;
            }
            pos -= curr;
            while (pos < 0) {
                bits.push(v);
                pos += 250;
            }
        }

        if (bits.size() < 70)
            return; // too short

        int start = 0;
        while (start < bits.size() && !bits.get(start))
            start++;
        start -= 3;
        if (start < 0) start = 0;
        int minErr = errorRate(start, bits);
        int minStart = start;
        for (int i = 0; i < 8; ++i) {
            int err = errorRate(start + i, bits);
            DMESG("err at %d = %d", i, err);
            if (err < minErr) {
                minStart = start + i;
                minErr = err;
            }
        }
        
        uint8_t buf[IR_MAX_MSG_SIZE];
        int ptr = 0;
        uint64_t mask = (((uint64_t)1 << 20) - 1) << 15;

        while (ptr < IR_MAX_MSG_SIZE) {
            auto p = start + 35 * (ptr / 2)
            uint64_t v = bits.getBits(p, 30) | ((uint64_t)bits.getBits(p + 30, 5) << 30);
            if ((v & mask) == mask)
                break;
            decodeHamming(v, buf + ptr);
            ptr += 2;
        }

        decrRC(outBuffer);
        outBuffer = pins::createBuffer(ptr);
        memcpy(outBuffer->payload, buf, ptr);
        finish(0);
        DeviceEvent evt(IR_COMPONENT_ID, IR_PACKET_EVENT);
    }

    void pulseMark(DeviceEvent ev) {
        if (ev.timestamp > 10000) {
            dbg.put(" -BRK ");
            finish(10);
            return;
        }

        int tm = (int)ev.timestamp;

        dbg.putNum(-tm);

        if (tm >= 16 * 250) {
            recvState = IR_WAIT_START_GAP;
            return;
        }

        if (recvState == IR_WAIT_DATA) {
            if (tm >= 10 * 250) {
                // finish
                addPulse(-(40 * 250)); // make sure we get all ones at the end
                decodeMsg();
            } else {
                addPulse(-tm);
            }
        }
    }

    Buffer getBuffer() {
        incrRC(outBuffer);
        return outBuffer;
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

        if (databits == 0) {
            if (dataptr > data->length + 10) {
                // done
            #if IR_DEBUG
                prevDataSize = data->length;
                memcpy(prevData, data->payload, prevDataSize);
            #endif
                decrRC(data);
                data = NULL;
                pin->setAnalogValue(0);
                pin->setPwm(1);
                return;
            } else if (dataptr >= data->length) {
                dataval = 0xfff;
                databits = 12;
                dataptr += 100;
            } else {
                dataval = encodeHamming(data->payload[dataptr], data->payload[dataptr + 1]);
                databits = 35;
                dataptr += 2;
            }
        }

        int curr = dataval & 1;
        if (curr != pwmstate) {
            pwmstate = curr;
            pin->setPwm(pwmstate);
        }
        dataval >>= 1;
        databits--;
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
void beep() {
    auto pin = lookupPin(PIN_IR_OUT);
    pin->setDigitalValue(0);
    pin->setAnalogPeriodUs(1000/38); // 38kHz
    pin->setAnalogValue(200);

    __disable_irq();
    while (1) {
        for (int i = 0; i < 30; ++i) {
            wait_us(750);
            pin->setPwm(1);
            wait_us(250);
            pin->setPwm(0);
        }
        wait_us(500000);
    }
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
