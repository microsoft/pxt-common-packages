#include "pxt.h"
#include "serial-target.h"

namespace SerialDeviceMethods {
/**
 * Sets the size of the RX buffer in bytes
 */
//%
void setRxBufferSize(SerialDevice device, uint8_t size) {
    device->setRxBufferSize(size);
}

/**
 * Sets the size of the TX buffer in bytes
 */
//%
void setTxBufferSize(SerialDevice device, uint8_t size) {
    device->setTxBufferSize(size);
}

/**
Set the baud rate of the serial port
*/
//%
void setBaudRate(SerialDevice device, BaudRate rate) {
    device->setBaudRate((int)rate);
}

/**
 * Reads a single byte from the serial receive buffer. Negative if error, 0 if no data.
 */
//%
int read(SerialDevice device) {
    return device->read();
}

/**
 * Read the buffered received data as a buffer
 */
//%
Buffer readBuffer(SerialDevice device) {
    return device->readBuffer();
}

/**
 * Send a buffer across the serial connection.
 */
//%
void writeBuffer(SerialDevice device, Buffer buffer) {
    device->writeBuffer(buffer);
}

/**
 * Register code when a serial event occurs
 */
//%
void onEvent(SerialDevice device, SerialEvent event, Action handler) {
    device->onEvent(event, handler);
}

/**
 * Registers code when a delimiter is received
 **/
//%
void onDelimiterReceived(SerialDevice device, Delimiters delimiter, Action handler) {
    device->onDelimiterReceived(delimiter, handler);
}
} // namespace SerialDeviceMethods
