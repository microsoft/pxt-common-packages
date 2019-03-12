#include "pxt.h"
#include "pulse.h"

#define IR_TIMER_CHANNEL 0

// from samd21.cpp
void setTCC0(int enabled);

#ifdef SAMD21
void setTCC0(int enabled) {
    while (TCC0->STATUS.reg & TC_STATUS_SYNCBUSY)
        ;
    if (enabled)
        TCC0->CTRLA.reg |= TC_CTRLA_ENABLE;
    else
        TCC0->CTRLA.reg &= ~TC_CTRLA_ENABLE;
}
#endif

namespace network {

static const uint8_t hamming[16] = {
    0b0000000, 0b1110000, 0b1001100, 0b0111100, 0b0101010, 0b1011010, 0b1100110, 0b0010110,
    0b1101001, 0b0011001, 0b0100101, 0b1010101, 0b1000011, 0b0110011, 0b0001111, 0b1111111,
};

static const uint8_t invHamming[64] = {
    0x00, 0x0c, 0x0a, 0x7e, 0x09, 0x4e, 0x2e, 0xee, 0x09, 0x7d, 0x7b, 0x77, 0x99, 0x59, 0x39, 0x7e,
    0x0a, 0x4d, 0xaa, 0x6a, 0x48, 0x44, 0x3a, 0x4e, 0x1d, 0xdd, 0x3a, 0x7d, 0x39, 0x4d, 0x33, 0x3f,
    0x0c, 0xcc, 0x2b, 0x6c, 0x28, 0x5c, 0x22, 0x2e, 0x1b, 0x5c, 0xbb, 0x7b, 0x59, 0x55, 0x2b, 0x5f,
    0x18, 0x6c, 0x6a, 0x66, 0x88, 0x48, 0x28, 0x6f, 0x11, 0x1d, 0x1b, 0x6f, 0x18, 0x5f, 0x3f, 0xff};

static const uint8_t bitsToGap[4] = {1, 2, 4, 3};
static const uint8_t gapToBits[5] = {0b00, 0b00, 0b01, 0b11, 0b10};

static int lookupInvHaming(int v) {
    int k = invHamming[v >> 1];
    if (v & 1)
        return (k & 0xf);
    else
        return (k >> 4);
}

static void decodeHamming(uint32_t r, uint8_t *dst) {
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
    }

    dst[0] = (lookupInvHaming(a0) << 4) | lookupInvHaming(a1);
    dst[1] = (lookupInvHaming(b0) << 4) | lookupInvHaming(b1);
}

static void pushTwo(BitVector &bv, uint8_t a, uint8_t b) {
    int gap = bitsToGap[b * 2 + a];
    bv.push(1);
    while (gap--)
        bv.push(0);
}

static void encodeHamming(BitVector &bv, uint8_t a, uint8_t b) {
    int a0 = hamming[a >> 4];
    int a1 = hamming[a & 0xf];
    int b0 = hamming[b >> 4];
    int b1 = hamming[b & 0xf];
    for (int i = 0; i < 7; ++i) {
        pushTwo(bv, (a0 >> i) & 1, (b0 >> i) & 1);
        pushTwo(bv, (a1 >> i) & 1, (b1 >> i) & 1);
    }
}

uint16_t crc16ccit(uint8_t *data, uint32_t len) {
    uint16_t crc = 0xffff;

    while (len--) {
        crc ^= (*data++ << 8);
        for (int i = 0; i < 8; ++i) {
            if (crc & 0x8000)
                crc = crc << 1 ^ 0x1021;
            else
                crc = crc << 1;
        }
    }

    return crc;
}

static PulseBase* instance = NULL;

static void timer_irq(uint16_t channels)
{
    if (instance)
        instance->timerIRQ(channels);
}

PulseBase::PulseBase(uint16_t id, int pinOut, int pinIn, LowLevelTimer* t) {
    this->id = id;
    this->timer = t;

    instance = this;

    recvState = PULSE_RECV_ERROR;
    sending = false;
    outBuffer = NULL;
    pin = lookupPin(pinOut);
    if (pin) {
        pin->setDigitalValue(0);

        inpin = lookupPin(pinIn);

        devMessageBus.listen(id, PULSE_PACKET_END_EVENT, this, &PulseBase::packetEnd);
    }

    timer->setIRQPriority(0);
    timer->setIRQ(timer_irq);
    timer->setBitMode(BitMode16);
    timer->enable();
}

void PulseBase::setupGapEvents() {
    devMessageBus.listen(inpin->id, DEVICE_PIN_EVT_PULSE_HI, this, &PulseBase::pulseGap,
                         MESSAGE_BUS_LISTENER_IMMEDIATE);
    devMessageBus.listen(inpin->id, DEVICE_PIN_EVT_PULSE_LO, this, &PulseBase::pulseMark,
                         MESSAGE_BUS_LISTENER_IMMEDIATE);
    listen();
}

void PulseBase::listen() {
    inpin->getDigitalValue();
    inpin->eventOn(DEVICE_PIN_EVENT_ON_PULSE);
}

void PulseBase::setupPWM() {
    pin->setAnalogPeriodUs(1000 / 38); // 38kHz
    pin->setAnalogValue(333);
    setPWM(1);
}

void PulseBase::setPWM(int enabled) {
    setTCC0(enabled);
    pwmstate = enabled;
}

void PulseBase::finishPWM() {
    pin->setAnalogValue(0);
    setPWM(1);
}

void PulseBase::send(Buffer d) {
    if (sending)
        return; // error code?

    if (d->length > PULSE_MAX_MSG_SIZE - 2 || (d->length & 1))
        return; // error code?

    encodedMsg.setLength(0);
    for (int i = 0; i < 25; ++i)
        encodedMsg.push(1);

    for (int i = 0; i < 8; ++i)
        encodedMsg.push(0);

    for (int i = 0; i < d->length; i += 2) {
        encodeHamming(encodedMsg, d->data[i], d->data[i + 1]);
    }

    uint16_t crc = crc16ccit(d->data, d->length);
    encodeHamming(encodedMsg, crc & 0xff, crc >> 8);

    for (int i = 0; i < 15; ++i)
        encodedMsg.push(1);

    auto gap = system_timer_current_time_us() - lastSendTime;

    // we require 200ms between sends
    if (gap < 200000) {
        gap = (200000 - gap) / 1000;
        fiber_sleep(gap);
    }

    while (isReceiving())
        fiber_sleep(10);

    // encodedMsg.print();

    sending = true;
    sendStartTime = 0;
    setupPWM();

    sendPtr = 0;

    lastSendTime = system_timer_current_time_us();

    timer->setCompare(IR_TIMER_CHANNEL, timer->captureCounter() + PULSE_PULSE_LEN);

    while (sending) {
        fiber_sleep(10);
    }
    fiber_sleep(5);
}

void PulseBase::timerIRQ(uint16_t)
{
    process();
}

void PulseBase::finish(int code) {
    if (recvState == PULSE_RECV_ERROR)
        return;

    if (code == 0) {
        Event evt(id, PULSE_PACKET_END_EVENT);
    } else {
        Event evt(id, PULSE_PACKET_ERROR_EVENT);
        PULSE_DMESG("IR ERROR %d [%s]", code, dbg.get());
    }
    dbg.get();
    recvState = PULSE_RECV_ERROR;
}

void PulseBase::addPulse(int v) {
    if (this->pulsePtr < PULSE_MAX_PULSES - 1) {
        pulses[this->pulsePtr++] = (int16_t)v;
    } else {
        finish(2);
    }
}

int PulseBase::adjustShift() {
    int pulseLen = (pulses[0] - pulses[1]) / 9;
    PULSE_DMESG("prev: %d %d %d %d %d %d %d %d %d %d", pulses[0], pulses[1], pulses[2], pulses[3],
                pulses[4], pulses[5], pulses[6], pulses[7], pulses[8], pulses[9], pulses[10],
                pulses[11]);
    return pulseLen;
}

void PulseBase::pulseGap(Event ev) {
    if (sending)
        return;

    if (ev.timestamp > 10000) {
        dbg.put(" BRK ");
        finish(11);
        return;
    }

    int tm = (int)ev.timestamp;

    dbg.putNum(tm);

    if (recvState == PULSE_WAIT_START_GAP) {
        pulsePtr = 0;
        startTime = system_timer_current_time_us() - tm;
        addPulse(tm);
        recvState = PULSE_WAIT_DATA;
        dbg.put(" *** ");
        return;
    }

    if (recvState == PULSE_WAIT_DATA) {
        addPulse(tm);
        return;
    }
}

void PulseBase::packetEnd(Event) {
    if (pulsePtr < 5)
        return;

    int pulseLen = adjustShift();
    int numBits = 0;
    uint32_t r = 0;
    uint8_t buf[PULSE_MAX_MSG_SIZE];
    int ptr = 0;

    for (int i = 2; i < pulsePtr; ++i) {
        if (pulses[i] > 0) {
            int len = (pulses[i] + pulseLen / 2) / pulseLen;
            if (len > 4)
                len = 4;
            r |= (uint32_t)gapToBits[len] << numBits;
            numBits += 2;
            if (numBits == 28) {
                decodeHamming(r, buf + ptr);
                numBits = 0;
                r = 0;
                ptr += 2;
            }
        }
    }

    pulsePtr = 0;

    if (numBits != 0) {
        Event evt(id, PULSE_PACKET_ERROR_EVENT);
        PULSE_DMESG("left over bits: %d", numBits);
        return;
    }

    if (ptr < 4) {
        Event evt(id, PULSE_PACKET_ERROR_EVENT);
        PULSE_DMESG("too short: %d", ptr);
        return; // too short
    }

    ptr -= 2;
    uint16_t crc = crc16ccit(buf, ptr);
    uint16_t pktCrc = (buf[ptr + 1] << 8) | buf[ptr];

    if (!outBuffer)
        registerGC((TValue*)&outBuffer);
    decrRC(outBuffer);
    outBuffer = pins::createBuffer(ptr);
    memcpy(outBuffer->data, buf, ptr);
    if (crc != pktCrc)
        PULSE_DMESG("crc fail: %x %x len=%d", crc, pktCrc, pulseLen);
    Event evt(id, crc == pktCrc ? PULSE_PACKET_EVENT : PULSE_PACKET_ERROR_EVENT);
}

void PulseBase::pulseMark(Event ev) {
    if (sending)
        return;

    if (ev.timestamp > 10000) {
        dbg.put(" -BRK ");
        finish(10);
        return;
    }

    int tm = (int)ev.timestamp;

    dbg.putNum(-tm);

    lastMarkTime = system_timer_current_time_us();

    if (tm >= 20 * PULSE_PULSE_LEN) {
        recvState = PULSE_WAIT_START_GAP;
        return;
    }

    if (recvState == PULSE_WAIT_DATA) {
        if (tm >= 12 * PULSE_PULSE_LEN) {
            // finish
            addPulse(-(40 * PULSE_PULSE_LEN)); // make sure we get all ones at the end
            finish(0);
        } else {
            addPulse(-tm);
        }
    }
}

bool PulseBase::isReceiving() {
    auto now = system_timer_current_time_us();
    // inpin low means mark
    if (inpin->getDigitalValue() == 0 || now - lastMarkTime < 10000) {
        return true;
    }
    return false;
}

Buffer PulseBase::getBuffer() {
    incrRC(outBuffer);
    return outBuffer;
}

void PulseBase::process() {
    // DMESG("PROC");
    if (!sending)
        return;

    auto now = system_timer_current_time_us();
    if (sendStartTime == 0)
        sendStartTime = now - (PULSE_PULSE_LEN / 2);

    auto encodedMsgPtr = (int)(now - sendStartTime) / PULSE_PULSE_LEN;

    encodedMsgPtr = sendPtr++;

    if (encodedMsgPtr >= encodedMsg.size()) {
        encodedMsg.setLength(0);
        finishPWM();

        sending = false;
        return;
    }

    timer->offsetCompare(IR_TIMER_CHANNEL, PULSE_PULSE_LEN);

    int curr = encodedMsg.get(encodedMsgPtr);
    if (curr != pwmstate)
        setPWM(curr);
}
}
