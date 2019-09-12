# Net

Networking abstractions and drivers

## WiFi module configuration

* ``PIN_WIFI_CS``, ESP32 CS pin mapping
* ``PIN_WIFI_BUSY``, ESP32 CS pin mapping
* ``PIN_WIFI_RESET``, ESP32 RESET pin mapping
* ``PIN_WIFI_GPIO0`` (optional), ESP32 GPIO0 pin mapping

The driver uses the default SPI pins. You can override this behavior by specifying these 3 keys.

* ``PIN_WIFI_MOSI`` (optional), dedicated SPI MOSI pin
* ``PIN_WIFI_MISO`` (optional), dedicated SPI MISO pin
* ``PIN_WIFI_SCK`` (optional), dedicated SPI SCK pin

## Access Points and passwords

The module uses access points and password information stored in the device secrets. These secrets can be set programmatically using ``net.updateAccessPoint`` or via the menu items in Arcade (added via the ``net-game`` extension).

> *Friendly reminder:* Do not share .uf2 files or programs with secrets!!