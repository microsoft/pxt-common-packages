#include "pxt.h"
#include "devpins.h"

namespace pins {
    /**
     * Read `size` bytes from a 7-bit I2C `address`.
     */
    //%
    Buffer i2cReadBuffer(int address, int size, bool repeat = false)
    {
      Buffer buf = createBuffer(size);
      io->i2c.read(address << 1, (char*)buf->payload, size, repeat);
      return buf;
    }

    /**
     * Write bytes to a 7-bit I2C `address`.
     */
    //%
    void i2cWriteBuffer(int address, Buffer buf, bool repeat = false)
    {
      io->i2c.write(address << 1, (char*)buf->payload, buf->length, repeat);
    }
}