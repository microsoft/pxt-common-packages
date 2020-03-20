#include "jdlow.h"

// https://tools.ietf.org/html/draft-eastlake-fnv-14#section-3
uint32_t jd_hash_fnv1a(const void *data, unsigned len) {
    const uint8_t *d = (const uint8_t *)data;
    uint32_t h = 0x811c9dc5;
    while (len--)
        h = (h * 0x1000193) ^ *d++;
    return h;
}

static uint32_t seed;
void jd_seed_random(uint32_t s) {
    seed = (seed * 0x1000193) ^ s;
}

uint32_t jd_random() {
    if (seed == 0)
        jd_seed_random(13);

    // xorshift algorithm
    uint32_t x = seed;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    seed = x;
    return x;
}

// return v +/- 25% or so
uint32_t jd_random_around(uint32_t v) {
    uint32_t mask = 0xfffffff;
    while (mask > v)
        mask >>= 1;
    return (v - (mask >> 1)) + (jd_random() & mask);
}

// https://wiki.nicksoft.info/mcu:pic16:crc-16:home
uint16_t jd_crc16(const void *data, uint32_t size) {
    const uint8_t *ptr = (const uint8_t *)data;
    uint16_t crc = 0xffff;
    while (size--) {
        uint8_t data = *ptr++;
        uint8_t x = (crc >> 8) ^ data;
        x ^= x >> 4;
        crc = (crc << 8) ^ (x << 12) ^ (x << 5) ^ x;
    }
    return crc;
}

void jd_compute_crc(jd_frame_t *frame) {
    frame->crc = jd_crc16((uint8_t *)frame + 2, JD_FRAME_SIZE(frame) - 2);
}

int jd_shift_frame(jd_frame_t *frame) {
    int psize = frame->size;
    jd_packet_t *pkt = (jd_packet_t *)frame;
    int oldsz = pkt->service_size + 4;
    if (oldsz >= psize)
        return 0; // nothing to shift

    int ptr;
    if (frame->data[oldsz] == 0xff) {
        ptr = frame->data[oldsz + 1];
        if (ptr >= psize)
            return 0; // End-of-frame
        if (ptr <= oldsz) {
            DMESG("invalid super-frame");
            return 0; // don't let it go back, must be some corruption
        }
    } else {
        ptr = oldsz;
    }

    // assume the first one got the ACK sorted
    frame->flags &= ~JD_PACKET_FLAG_ACK_REQUESTED;

    uint8_t *src = &frame->data[ptr];
    int newsz = *src + 4;
    if (ptr + newsz > frame->size) {
        DMESG("invalid super-frame");
        return 0;
    }
    uint8_t *dst = frame->data;
    // don't trust memmove()
    for (int i = 0; i < newsz; ++i)
        *dst++ = *src++;
    // store ptr
    ptr += newsz;
    frame->data[newsz] = 0xff;
    frame->data[newsz + 1] = ptr;

    return 1;
}

void jd_reset_frame(jd_frame_t *frame) {
    frame->size = 0x00;
}

void *jd_push_in_frame(jd_frame_t *frame, unsigned service_num, unsigned service_cmd,
                       unsigned service_arg, unsigned service_size) {
    if ((service_num | service_cmd | service_arg) & ~0xff)
        jd_panic();
    uint8_t *dst = frame->data + frame->size;
    unsigned szLeft = (uint8_t *)frame + sizeof(*frame) - dst;
    if (service_size + 4 > szLeft)
        return NULL;
    *dst++ = service_size;
    *dst++ = service_num;
    *dst++ = service_cmd;
    *dst++ = service_arg;
    frame->size += service_size + 4;
    return dst;
}
