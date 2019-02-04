#include "pxt.h"
#include "ErrorNo.h"
#include <vector>
using namespace std;

namespace pins {

class CodalI2CProxy {
private:
  DevicePin* sda;
  DevicePin* scl;
  CODAL_I2C i2c;
public:
  CodalI2CProxy(DevicePin* _sda, DevicePin* _scl)
    : sda(_sda)
    , scl(_scl)
    , i2c(*_sda, *_scl) {

    }
  
  bool matchPins(DevicePin* sda, DevicePin* sck) {
      return this->sda == sda && this->sck == sck;
  }

  Buffer readBuffer(int address, int size, bool repeat = false)
  {
    Buffer buf = mkBuffer(NULL, size);
    int status = this->i2c->read(address << 1, buf->data, size, repeat);
    if (status != ErrorCode::DEVICE_OK) {
      decrRC(buf);
      buf = 0;
    }
    return buf;
  }

  int writeBuffer(int address, Buffer buf, bool repeat = false)
  {
    return this->i2c->write(address << 1, buf->data, buf->length, repeat);
  }
}

typedef CodalI2CProxy* I2C;

namespace I2CMethods {
/**
  * Read `size` bytes from a 7-bit I2C `address`.
  */
//%
Buffer readBuffer(I2C i2c, int address, int size, bool repeat = false)
{
  return i2c->readBuffer(address, size, repeat);
}

/**
  * Write bytes to a 7-bit I2C `address`.
  */
//%
int writeBuffer(I2C i2c, int address, Buffer buf, bool repeat = false)
{
  return i2c->writeBuffer(address, buf, repeat);
}

}

namespace pins {
static vector<I2C> i2cs;
/**
* Opens a Serial communication driver
*/
//%
I2C createI2C(DigitalInOutPin sda, DigitalInOutPin scl) {
  // lookup existing devices
  for (auto dev : i2cs) {
    if (dev->matchPins(tx, rx))
      return dev;
  }

  // allocate new one
  auto ser = new CodalI2CProxy(sda, scl);
  i2cs.push_back(ser);
  return ser;
}


static CODAL_I2C *_i2c;
/**
* Gets the default I2C device
*/
//%
I2C i2c() {
  if (NULL == _i2c)
    _i2c = createI2C(LOOKUP_PIN(SDA), LOOKUP_PIN(SCL));
  return _i2c;
}
}