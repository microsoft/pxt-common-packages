#ifndef CABLE_BITVECTOR_H
#define CABLE_BITVECTOR_H

class BitVector {
    Segment data;
    int len;

    uint32_t get32(int idx) { return (uint32_t)data.get(idx >> 5); }

  public:
    BitVector() { len = 0; }
    ~BitVector() { data.destroy(); }

    int size() { return len; }

    void print() {
        char buf[size() + 1];
        for (int i = 0; i < size(); ++i)
            buf[i] = get(i) ? '#' : '.';
        buf[size()] = 0;
        DMESG("bits: %s", buf);
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
        if (num > off) {
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

#endif