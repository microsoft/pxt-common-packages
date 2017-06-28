#include "pxtbase.h"

// keep in sync with github/pxt/pxtsim/libgeneric.ts
enum class NumberFormat {
    Int8LE = 1,
    UInt8LE,
    Int16LE,
    UInt16LE,
    Int32LE,
    Int8BE,
    UInt8BE,
    Int16BE,
    UInt16BE,
    Int32BE,

    UInt32LE,
    UInt32BE,
    Float32LE,
    Float64LE,
    Float32BE,
    Float64BE,
};

//% indexerGet=BufferMethods::getByte indexerSet=BufferMethods::setByte
namespace BufferMethods {
//%
int getByte(Buffer buf, int off) {
    return max(ManagedBuffer(buf).getByte(off), 0);
}

//%
void setByte(Buffer buf, int off, int v) {
    ManagedBuffer(buf).setByte(off, v);
}

//%
uint8_t *getBytes(Buffer buf) {
    return buf->payload;
}

/**
 * Write a number in specified format in the buffer.
 */
//%
void setNumber(Buffer buf, NumberFormat format, int offset, TNumber value) {
    int8_t i8;
    uint8_t u8;
    int16_t i16;
    uint16_t u16;
    int32_t i32;
    uint32_t u32;
    float f32;
    double f64;

    ManagedBuffer b(buf);

// Assume little endian
#define WRITEBYTES(isz, swap, toInt)                                                               \
    isz = toInt(value);                                                                            \
    b.writeBytes(offset, (uint8_t *)&isz, sizeof(isz), swap);                                      \
    break

    switch (format) {
    case NumberFormat::Int8LE:
        WRITEBYTES(i8, false, toInt);
    case NumberFormat::UInt8LE:
        WRITEBYTES(u8, false, toInt);
    case NumberFormat::Int16LE:
        WRITEBYTES(i16, false, toInt);
    case NumberFormat::UInt16LE:
        WRITEBYTES(u16, false, toInt);
    case NumberFormat::Int32LE:
        WRITEBYTES(i32, false, toInt);
    case NumberFormat::UInt32LE:
        WRITEBYTES(u32, false, toUInt);

    case NumberFormat::Int8BE:
        WRITEBYTES(i8, true, toInt);
    case NumberFormat::UInt8BE:
        WRITEBYTES(u8, true, toInt);
    case NumberFormat::Int16BE:
        WRITEBYTES(i16, true, toInt);
    case NumberFormat::UInt16BE:
        WRITEBYTES(u16, true, toInt);
    case NumberFormat::Int32BE:
        WRITEBYTES(i32, true, toInt);
    case NumberFormat::UInt32BE:
        WRITEBYTES(u32, true, toUInt);

    case NumberFormat::Float32LE:
        WRITEBYTES(f32, false, toFloat);
    case NumberFormat::Float32BE:
        WRITEBYTES(f32, true, toFloat);
    case NumberFormat::Float64LE:
        WRITEBYTES(f64, false, toDouble);
    case NumberFormat::Float64BE:
        WRITEBYTES(f64, true, toDouble);
    }
}

/**
 * Read a number in specified format from the buffer.
 */
//%
TNumber getNumber(Buffer buf, NumberFormat format, int offset) {
    int8_t i8;
    uint8_t u8;
    int16_t i16;
    uint16_t u16;
    int32_t i32;
    uint32_t u32;
    float f32;
    double f64;

    ManagedBuffer b(buf);

// Assume little endian
#define READBYTES(isz, swap, conv)                                                                 \
    b.readBytes((uint8_t *)&isz, offset, sizeof(isz), swap);                                       \
    return conv(isz)

    switch (format) {
    case NumberFormat::Int8LE:
        READBYTES(i8, false, fromInt);
    case NumberFormat::UInt8LE:
        READBYTES(u8, false, fromInt);
    case NumberFormat::Int16LE:
        READBYTES(i16, false, fromInt);
    case NumberFormat::UInt16LE:
        READBYTES(u16, false, fromInt);
    case NumberFormat::Int32LE:
        READBYTES(i32, false, fromInt);
    case NumberFormat::UInt32LE:
        READBYTES(u32, false, fromUInt);

    case NumberFormat::Int8BE:
        READBYTES(i8, true, fromInt);
    case NumberFormat::UInt8BE:
        READBYTES(u8, true, fromInt);
    case NumberFormat::Int16BE:
        READBYTES(i16, true, fromInt);
    case NumberFormat::UInt16BE:
        READBYTES(u16, true, fromInt);
    case NumberFormat::Int32BE:
        READBYTES(i32, true, fromInt);
    case NumberFormat::UInt32BE:
        READBYTES(u32, true, fromUInt);

    case NumberFormat::Float32LE:
        READBYTES(f32, false, fromFloat);
    case NumberFormat::Float32BE:
        READBYTES(f32, true, fromFloat);
    case NumberFormat::Float64LE:
        READBYTES(f64, false, fromDouble);
    case NumberFormat::Float64BE:
        READBYTES(f64, true, fromDouble);
    }

    return 0;
}

/** Returns the length of a Buffer object. */
//% property
int length(Buffer s) {
    return s->length;
}

/**
 * Fill (a fragment) of the buffer with given value.
 */
//%
void fill(Buffer buf, int value, int offset = 0, int length = -1) {
    ManagedBuffer(buf).fill(value, offset, length);
}

/**
 * Return a copy of a fragment of a buffer.
 */
//%
Buffer slice(Buffer buf, int offset = 0, int length = -1) {
    return ManagedBuffer(buf).slice(offset, length).leakData();
}

/**
 * Shift buffer left in place, with zero padding.
 * @param offset number of bytes to shift; use negative value to shift right
 * @param start start offset in buffer. Default is 0.
 * @param length number of elements in buffer. If negative, length is set as the buffer length minus
 * start. eg: -1
 */
//%
void shift(Buffer buf, int offset, int start = 0, int length = -1) {
    ManagedBuffer(buf).shift(offset, start, length);
}

/**
 * Rotate buffer left in place.
 * @param offset number of bytes to shift; use negative value to shift right
 * @param start start offset in buffer. Default is 0.
 * @param length number of elements in buffer. If negative, length is set as the buffer length minus
 * start. eg: -1
 */
//%
void rotate(Buffer buf, int offset, int start = 0, int length = -1) {
    ManagedBuffer(buf).rotate(offset, start, length);
}

// int readBytes(uint8_t *dst, int offset, int length, bool swapBytes = false) const;
// int writeBytes(int dstOffset, uint8_t *src, int length, bool swapBytes = false);

/**
 * Write contents of `src` at `dstOffset` in current buffer.
 */
//%
void write(Buffer buf, int dstOffset, Buffer src) {
    // Not supported, we only do up to 4 args :/
    // void write(Buffer buf, int dstOffset, Buffer src, int srcOffset = 0, int length = -1)
    ManagedBuffer(buf).writeBuffer(dstOffset, ManagedBuffer(src), 0, -1);
}
}
