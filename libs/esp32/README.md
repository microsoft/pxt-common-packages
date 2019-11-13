# ESP32

Communication layer to a accessory ESP32 chip.

> Ported from Adafruit Circuit Python 
https://github.com/adafruit/Adafruit_CircuitPython_ESP32SPI.

## Configuration

### Nina-FW over SPI

The companion firmware is https://github.com/adafruit/nina-fw over SPI.
The pins of the main board need to be configured either in the bootloader or using `namespace userconfig { ... }`.
The ESP32 pins are listed next to each key below (the number in parenthesis is the pin number on WROOM-32 module).

* ``PIN_WIFI_CS``, ESP32 CS pin mapping, IO5 (29)
* ``PIN_WIFI_BUSY``, ESP32 BUSY pin mapping, IO33 (9)
* ``PIN_WIFI_RESET``, ESP32 RESET pin mapping, EN (3)
* ``PIN_WIFI_GPIO0`` (optional), ESP32 GPIO0 pin mapping, IO0 (25)

The driver uses the default SPI pins. You can override this behavior by specifying these 3 keys.

* ``PIN_WIFI_MOSI`` (optional), dedicated SPI MOSI pin, IO14 (13)
* ``PIN_WIFI_MISO`` (optional), dedicated SPI MISO pin, IO23 (37)
* ``PIN_WIFI_SCK`` (optional), dedicated SPI SCK pin, IO18 (30)

### Expressif AT commands over serial

Not supported yet.

* ``PIN_WIFI_AT_RX``, ESP32 RX pin mapping
* ``PIN_WIFI_AT_TX``, ESP32 TX pin mapping

## Access Points and passwords

The module uses access points and password information stored in the device secrets. These secrets can be set programmatically using ``net.updateAccessPoint`` or via the menu items in Arcade (added via the ``net-game`` extension).

> *Friendly reminder:* Do not share .uf2 files or programs with secrets!!

## Example

See net package readme.