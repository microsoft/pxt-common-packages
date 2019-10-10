# ESP32

Communication layer to a accessory ESP32 chip.

> Ported from Adafruit Circuit Python 
https://github.com/adafruit/Adafruit_CircuitPython_ESP32SPI.

## Configuration

### Nina-FW over SPI

The companion firmware is https://github.com/adafruit/nina-fw over SPI.

* ``PIN_WIFI_CS``, ESP32 CS pin mapping
* ``PIN_WIFI_BUSY``, ESP32 BUSY pin mapping
* ``PIN_WIFI_RESET``, ESP32 RESET pin mapping
* ``PIN_WIFI_GPIO0`` (optional), ESP32 GPIO0 pin mapping

The driver uses the default SPI pins. You can override this behavior by specifying these 3 keys.

* ``PIN_WIFI_MOSI`` (optional), dedicated SPI MOSI pin
* ``PIN_WIFI_MISO`` (optional), dedicated SPI MISO pin
* ``PIN_WIFI_SCK`` (optional), dedicated SPI SCK pin

### Expressif AT commands over serial

Not supported yet.

* ``PIN_WIFI_AT_RX``, ESP32 RX pin mapping
* ``PIN_WIFI_AT_TX``, ESP32 TX pin mapping

## Access Points and passwords

The module uses access points and password information stored in the device secrets. These secrets can be set programmatically using ``net.updateAccessPoint`` or via the menu items in Arcade (added via the ``net-game`` extension).

> *Friendly reminder:* Do not share .uf2 files or programs with secrets!!

## Example

```
//
// in arcade to configure your access point password,
// open the menu and go to the WiFi option (loaded from net-game lib)
// otherwise use net.updateAccessPoint(...)
//

// comment this outside of arcade
game.consoleOverlay.setVisible(true)

const wifi = net.instance();
// list aps
const aps = wifi.scanNetworks();
const pwds = net.knownAccessPoints();
console.log(`APs (${aps.length}`)
for(const ap of aps) {
    console.log(` ${ap.ssid} ${pwds[ap.ssid] !== undefined ? "(known)" : ""}`)
}

// connect and request
const r = net.get("https://makecode.com/api/md/arcade/about")
console.log(r.text)
```