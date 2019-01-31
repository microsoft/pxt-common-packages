# LoRa (beta)

Package adds support LoRa. Adapted from https://github.com/ElectronicCats/pxt-lora/.

## Compatible Hardware

 * [Arduino MKR WAN 1300](https://store.arduino.cc/usa/mkr-wan-1300)

   * **NOTE:** Requires firmware v1.1.6 or later on the on-board Murata module. Please use the [MKRWANFWUpdate_standalone example](https://github.com/arduino-libraries/MKRWAN/blob/master/examples/MKRWANFWUpdate_standalone/MKRWANFWUpdate_standalone.ino) from latest [MKRWAN library](https://github.com/arduino-libraries/MKRWAN) release to update the firmware.


## Usage

The package adds support **LoRa** for [Arduino MKR1300](https://store.arduino.cc/usa/mkr-wan-1300).
 
An library for sending and receiving data using [LoRa](https://www.semtech.com/technology/lora) radios.

## Testing receive

Install arduino-lora library in arduino, and upload firmware to arduino mkr1300 for receiver data
https://github.com/sandeepmistry/arduino-LoRa/blob/master/examples/LoRaReceiver/LoRaReceiver.ino

Open monitor serial and wait data

## API

### send

Write Packet to send. Each packet can contain up to 255 bytes.

```block
lora.send("Hello")
```

### readVersion
Read Version of chip.

```block
let version = lora.readVersion()
```

### available()
Returns number of bytes available for reading.

```block
let data = 0
forever(function () {
    if (lora.available() < 0) {
        data = lora.read()
    }
})
```

### read 
Read the next byte from the packet.

```block
let data = lora.read()
```

### packetRssi() 
Returns the RSSI of the received packet. 

```block
rssi = lora.packetRssi()
```

### parsePacket 
Check if a packet has been received.  

```block
rssi = lora.parsePacket(0)
```

## Pins Used 

The following pins are used for LoRa:  

*  -``PA15``- LORA SPI - MOSI
*  -``PA12``- LORA SPI - MISO
*  -``PA13``- LORA SPI - SCK
*  -``PA14``- LORA SPI - CS
*  -``PB09``- LORA SPI - BOOT
*  -``PA27``- LORA SPI - RST

```package
lora
```

