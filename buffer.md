# Buffer in MakeCode

## What is a Buffer?

A **Buffer** is a contiguous array of bytes.  
It is used to store binary data compactly, such as sensor readings, binary commands, or messages for I²C/SPI/serial/radio.  
The difference between buffers and arrays are for storage. What I mean is buffers are meant for raw memory which means unprocessed memory information.
But for arrays, they are high level storage meant for unprocessed, original information.

Buffers let you read/write numbers of various sizes and formats efficiently, instead of using `number[]` or strings.  

---

## Creating a Buffer

Use `pins.createBuffer(size)` to create a buffer of a specific length:

```ts
let buf = pins.createBuffer(16) // 16 bytes
