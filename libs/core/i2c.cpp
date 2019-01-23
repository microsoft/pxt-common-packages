#include "pxt.h"
#include "ErrorNo.h"

namespace pins {
    static CODAL_I2C *i2c;

    static void initI2C() {
      if (NULL == i2c) {
        i2c = new CODAL_I2C(*LOOKUP_PIN(SDA), *LOOKUP_PIN(SCL));
      }
    }

    CODAL_I2C *getI2C() {
      initI2C();
      return i2c;
    }

      /**
     * Read `size` bytes from a 7-bit I2C `address`.
     */
    //%
    Buffer i2cReadBuffer(int address, int size, bool repeat = false)
    {
      initI2C();
      Buffer buf = mkBuffer(NULL, size);
      int status = i2c->read(address << 1, buf->data, size, repeat);
      if (status != ErrorCode::DEVICE_OK) {
        decrRC(buf);
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