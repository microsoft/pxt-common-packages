#include "pxt.h"

namespace pins {
    static codal::I2C *i2c;

    static void initI2C() {
      if (i2c == NULL) {
        i2c = new codal::mbed::I2C(PIN(SDA), PIN(SCL));
      }
    }
  
      /**
     * Read `size` bytes from a 7-bit I2C `address`.
     */
    //%
    Buffer i2cReadBuffer(int address, int size, bool repeat = false)
    {
      initI2C();
      Buffer buf = createBuffer(size);
      int ok = i2c->read(address << 1, buf->data, size, repeat);
      if (!ok) {
        free(buf);
        buf = 0;
      }
      return buf;
    }

    /**
     * Write bytes to a 7-bit I2C `address`.
     */
    //%
    int i2cWriteBuffer(int address, Buffer buf, bool repeat = false)
    {
      initI2C();
      return i2c->write(address << 1, buf->data, buf->length, repeat);
    }
}