#include "pxt.h"
#include "pulse.h"

// from samd21.cpp
void NVIC_Setup();
void setPeriodicCallback(uint32_t usec, void *data, void (*callback)(void *));
void clearPeriodicCallback();
void setTCC0(int enabled);

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

static int lookupInvHaming(int v) {
    int k = invHamming[v >> 1];
    if (v & 1)
        return (k & 0xf);
    else
        return (k >> 4);
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

static void encodeHamming(BitVector &bv, uint8_t a, uint8_t b) {
    int a0 = hamming[a >> 4];
    int a1 = hamming[a & 0xf];
    int b0 = hamming[b >> 4];
    int b1 = hamming[b & 0xf];
    for (int i = 0; i < 7; ++i) {
        bv.push((a0 >> i) & 1);
        bv.push((b0 >> i) & 1);
        bv.push((a1 >> i) & 1);
        bv.push((b1 >> i) & 1);

        int last = bv.getBits(bv.size() - 4, 4);
        // if there was at least a single 1, then stop bit is zero
        if (last == 0)
            bv.push(1);
        else
            bv.push(0);
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

PulseBase::PulseBase(uint16_t id, int pinOut, int pinIn) {
    NVIC_Setup();
    this->id = id;

    recvState = PULSE_RECV_ERROR;
    sending = false;
    outBuffer = NULL;
    pin = lookupPin(pinOut);
    if (pin) {
        pin->setDigitalValue(0);

        inpin = lookupPin(pinIn);

        devMessageBus.listen(id, PULSE_PACKET_END_EVENT, this, &PulseBase::packetEnd);
    }
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

void  PulseBase::setPWM(int enabled) {
    // pin->setPwm(enabled);
    setTCC0(enabled);
    pwmstate = enabled;
}

void  PulseBase::finishPWM() {
    pin->setAnalogValue(0);
    setPWM(1);
}

void  PulseBase::send(Buffer d) {
    if (sending)
        return; // error code?

    if (d->length > PULSE_MAX_MSG_SIZE - 2 || (d->length & 1))
        return; // error code?

    encodedMsg.setLength(0);
    for (int i = 0; i < 25; ++i)
        encodedMsg.push(1);
    encodedMsg.push(0);
    encodedMsg.push(0);
    encodedMsg.push(1);
    encodedMsg.push(1);
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

    while (isReciving())
        fiber_sleep(10);
    lastSendTime = system_timer_current_time_us();

    // encodedMsg.print();

    sending = true;
    sendStartTime = 0;
    setupPWM();

    setPeriodicCallback(PULSE_PULSE_LEN, this, (void (*)(void *)) & PulseBase::process);
    while (sending) {
        fiber_sleep(10);
    }
    fiber_sleep(5);
}

void  PulseBase::finish(int code) {
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

void  PulseBase::adjustShift() {
    int16_t nums[PULSE_MAX_PULSES];
    int v = 0;
    int sum = 0;
    for (int i = 0; i < pulsePtr; i++) {
        if (pulses[i] < 0)
            v -= pulses[i];
        else
            v += pulses[i];
        int d = v % PULSE_PULSE_LEN;
        if (d > PULSE_PULSE_LEN / 2)
            d -= PULSE_PULSE_LEN;
        nums[i] = d;
        sum += d;
    }

    for (int i = 0; i < pulsePtr - 1; i++)
        for (int j = 0; j < pulsePtr - i - 1; j++) {
            if (nums[j] > nums[j + 1])
                swap(nums[j], nums[j + 1]);
        }

    int median = nums[pulsePtr / 2];
    pulses[0] -= median;

    // PULSE_DMESG("shift: n=%d avg=%d med=%d p=%d %d %d ...", pulsePtr, sum / pulsePtr, median,
    //          pulses[0], pulses[1], pulses[2]);
}

void  PulseBase::pulseGap(Event ev) {
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
        addPulse(tm);
        recvState = PULSE_WAIT_DATA;
        dbg.put(" *** ");
        startTime = system_timer_current_time_us();
        return;
    }

    if (recvState == PULSE_WAIT_DATA) {
        addPulse(tm);
        return;
    }
}

int PulseBase::errorRate(int start, BitVector &bits) {
    int stops = 0;
    int errs = 0;
    for (int i = start; i < bits.size(); i += 5) {
        uint32_t v = bits.getBits(i, 5);
        if (v == 0x1f)
            stops++;
        else
            stops = 0;
        if (stops >= 3)
            break;
        if ((v & 0x10) && (v != 0x10))
            errs++;
    }
    return errs;
}

void PulseBase::packetEnd(Event) {
    if (pulsePtr < 5)
        return;

    adjustShift();

    BitVector bits;

    int pos = PULSE_PULSE_LEN / 2;
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
            pos += PULSE_PULSE_LEN;
        }
    }
    // bits.print();

    pulsePtr = 0;

    if (bits.size() < 70) {
        Event evt(id, PULSE_PACKET_ERROR_EVENT);
        return; // too short
    }

    int start = 0;
    while (start < bits.size() && !bits.get(start))
        start++;
    start += 2;

    // adjust message start, depending on parity error rate around it
    int err = errorRate(start, bits) - 2; // give it some boost
    int err0 = errorRate(start - 1, bits);
    int err1 = errorRate(start + 1, bits);
    if (err0 < err1 && err0 < err) {
        start--;
        PULSE_DMESG("sync back");
    } else if (err1 < err) {
        start++;
        PULSE_DMESG("sync fwd");
    }

    uint8_t buf[PULSE_MAX_MSG_SIZE];
    int ptr = 0;
    uint64_t mask = (((uint64_t)1 << 20) - 1) << 15;

    while (ptr < PULSE_MAX_MSG_SIZE) {
        auto p = start + 35 * (ptr / 2);
        uint64_t v = bits.getBits(p, 30) | ((uint64_t)bits.getBits(p + 30, 5) << 30);
        if ((v & mask) == mask)
            break;
        decodeHamming(v, buf + ptr);
        ptr += 2;
    }

    ptr -= 2;
    uint16_t crc = crc16ccit(buf, ptr);
    uint16_t pktCrc = (buf[ptr + 1] << 8) | buf[ptr];

#if 0
    BitVector bits2;
    bits2.push(0);
    bits2.push(0);
    bits2.push(1);
    bits2.push(1);
    uint8_t v = buf[0];
    for (int i = 0; i < ptr; i += 2) {
        uint8_t v2 = v * 13;
        encodeHamming(bits2, v, v2);
        v = v2 * 13;
    }
    bits2.push(1);
    bits2.push(1);
    for (int i = 0; i < bits2.size(); ++i) {
        bits2.set(i, bits.get(i) != bits2.get(i));
    }
    bits2.print();
#endif

    decrRC(outBuffer);
    outBuffer = pins::createBuffer(ptr);
    memcpy(outBuffer->data, buf, ptr);
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

bool PulseBase::isReciving() {
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
    if (!sending)
        return;

    auto now = system_timer_current_time_us();
    if (sendStartTime == 0)
        sendStartTime = now - (PULSE_PULSE_LEN / 2);

    auto encodedMsgPtr = (int)(now - sendStartTime) / PULSE_PULSE_LEN;

    if (encodedMsgPtr >= encodedMsg.size()) {
        encodedMsg.setLength(0);
        finishPWM();
        clearPeriodicCallback();
        sending = false;
        return;
    }

    int curr = encodedMsg.get(encodedMsgPtr);
    if (curr != pwmstate)
        setPWM(curr);
}

}
