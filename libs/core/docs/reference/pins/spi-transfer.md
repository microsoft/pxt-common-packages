# spi Transfer

Send a command over a SPI connection and receive a response.

```sig
pins.spiTransfer(null, null)
```

Command data in **Buffer** is sent to an SPI slave device. The format of the data in the command buffer depends on how the connected device expects to read it.

## Parameters

* **command**: a **Buffer** that contains the command data to send to the slave device.
* **response**: a **Buffer** that will receive the data for the response to **command**.

## Example
Send some text to show on an alphanumeric LCD display. The display is connected by SPI and the display command is `2`. The command buffer formatted for the display contains both the command and the text string ``Hello!``.


```typescript
let resBuff = pins.createBuffer(2)
let cmdBuff = pins.createBuffer(16)
let message = "Hello!"
cmdBuff.setUint8(0, 2)
for (let i = 0; i <= message.length - 1; i++) {
    cmdBuff.setUint8(i+1, message.charCodeAt(i))
}
pins.spiTransfer(cmdBuff, resBuff)
```

## See also

[spi write](/reference/pins/spi-write)
