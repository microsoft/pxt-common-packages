#include "pxt.h"
#include "ErrorNo.h"

namespace pins {

class CodalI2CProxy {
private:
  DevicePin* sda;
  DevicePin* scl;
  CODAL_I2C i2c;
public:
  CodalI2CProxy* next;
public:
  CodalI2CProxy(DevicePin* _sda, DevicePin* _scl)
    : sda(_sda)
    , scl(_scl)
    , i2c(*_sda, *_scl) 
    , next(NULL)
  {

  }

  CODAL_I2C* getI2C() {
    return &(this->i2c);
  }
  
  bool matchPins(DevicePin* sda, DevicePin* scl) {
      return this->sda == sda && this->scl == scl;
  }

  Buffer readBuffer(int address, int size, bool repeat = false)
  {
    Buffer buf = mkBuffer(NULL, size);
    int status = this->i2c.read(address << 1, buf->data, size, repeat);
    if (status != ErrorCode::DEVICE_OK) {
      decrRC(buf);
      buf = 0;
    }
    return buf;
  }

  int writeBuffer(int address, Buffer buf, bool repeat = false)
  {
    return this->i2c.write(address << 1, buf->data, buf->length, repeat);
  }
};

}

namespace I2CMethods {
/**
  * Read `size` bytes from a 7-bit I2C `address`.
  */
//%
Buffer readBuffer(I2C_ i2c, int address, int size, bool repeat = false)
{
  return i2c->readBuffer(address, size, repeat);
}

/**
  * Write bytes to a 7-bit I2C `address`.
  */
//%
int writeBuffer(I2C_ i2c, int address, Buffer buf, bool repeat = false)
{
  return i2c->writeBuffer(address, buf, repeat);
}

}

namespace pins {

static I2C_ i2cs(NULL);
/**
* Opens a Serial communication driver
*/
//% help=pins/create-i2c
//% parts=i2c
I2C_ createI2C(DigitalInOutPin sda, DigitalInOutPin scl) {
  // lookup existing devices
  auto dev = i2cs;
  while(dev) {
    if (dev->matchPins(sda, scl))
      return dev;
    dev = dev->next;
  }
  // allocate new one
  auto ser = new CodalI2CProxy(sda, scl);
  // push in list
  ser->next = i2cs;
  i2cs = ser;
  return ser;
}


static I2C_ _i2c;
/**
* Gets the default I2C device
*/
//%
I2C_ i2c() {
  if (NULL == _i2c) {
    _i2c = createI2C(LOOKUP_PIN(SDA), LOOKUP_PIN(SCL));
  }
  return _i2c;
}

CODAL_I2C *getI2C() {
  return i2c()->getI2C();
}

}
