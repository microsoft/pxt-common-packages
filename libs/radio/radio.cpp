#include "pxt.h"

// micro:bit dal
#if defined(MICROBIT_H) 

#define CODAL_RADIO MicroBitRadio
#define DEVICE_OK MICROBIT_OK
#define DEVICE_NOT_SUPPORTED MICROBIT_NOT_SUPPORTED
#define CODAL_EVENT MicroBitEvent
#define CODAL_RADIO_MICROBIT_DAL 1

// any other NRF52 board
#elif defined(NRF52_SERIES)

#include "NRF52Radio.h"
#define CODAL_RADIO codal::NRF52Radio
#define CODAL_EVENT codal::Event

#endif

using namespace pxt;

#ifndef MICROBIT_RADIO_MAX_PACKET_SIZE
#define MICROBIT_RADIO_MAX_PACKET_SIZE          32
#endif

#ifndef DEVICE_RADIO_MAX_PACKET_SIZE
#define DEVICE_RADIO_MAX_PACKET_SIZE MICROBIT_RADIO_MAX_PACKET_SIZE
#endif

#ifndef MICROBIT_ID_RADIO
#define MICROBIT_ID_RADIO               29
#endif

#ifndef DEVICE_ID_RADIO
#define DEVICE_ID_RADIO MICROBIT_ID_RADIO
#endif

#ifndef MICROBIT_RADIO_EVT_DATAGRAM
#define MICROBIT_RADIO_EVT_DATAGRAM             1       // Event to signal that a new datagram has been received.
#endif

#ifndef DEVICE_RADIO_EVT_DATAGRAM
#define DEVICE_RADIO_EVT_DATAGRAM MICROBIT_RADIO_EVT_DATAGRAM
#endif

//% color=#E3008C weight=96 icon="\uf012"
namespace radio {
    
#if CODAL_RADIO_MICROBIT_DAL
    CODAL_RADIO* getRadio() {
        return &uBit.radio;
    }
#elif defined(CODAL_RADIO)
class RadioWrap {
    CODAL_RADIO radio;
    public:
        RadioWrap() 
            : radio()
        {}

    CODAL_RADIO* getRadio() {
        return &radio;
    }
};
SINGLETON(RadioWrap);
CODAL_RADIO* getRadio() {
    auto wrap = getRadioWrap();
    if (NULL != wrap)
        return wrap->getRadio();    
    return NULL;
}
#endif // #else

    bool radioEnabled = false;
    bool init = false;
    int radioEnable() {
#ifdef CODAL_RADIO
        auto radio = getRadio();
        if (NULL == radio) 
            return DEVICE_NOT_SUPPORTED;

        if (init && !radioEnabled) {
            //If radio was explicitly disabled from a call to off API
            //We don't want to enable it here. User needs to call on API first.
            return DEVICE_NOT_SUPPORTED;
        }

        int r = radio->enable();
        if (r != DEVICE_OK) {
            target_panic(43);
            return r;
        }
        if (!init) {
            getRadio()->setGroup(0); //Default group zero. This used to be pxt::programHash()
            getRadio()->setTransmitPower(6); // start with high power by default
            init = true;
        }
        radioEnabled = true;
        return r;
#else
        return DEVICE_NOT_SUPPORTED;
#endif
    }

    /**
    * Disables the radio for use as a multipoint sender/receiver.
    * Disabling radio will help conserve battery power when it is not in use.
    */
    //% help=radio/off
    void off() {
#ifdef CODAL_RADIO
        auto radio = getRadio();
        if (NULL == radio)
            return;

        int r = radio->disable();
        if (r != DEVICE_OK) {
            target_panic(43);
        } else {
            radioEnabled = false;
        }
#else
        return;
#endif
    }

    /**
    * Initialises the radio for use as a multipoint sender/receiver
    * Only useful when the radio.off() is used beforehand.
    */
    //% help=radio/on
    void on() {
#ifdef CODAL_RADIO
        auto radio = getRadio();
        if (NULL == radio)
            return;

        int r = radio->enable();
        if (r != DEVICE_OK) {
            target_panic(43);
        } else {
            radioEnabled = true;
        }
#else
        return;
#endif
    }

    /**
    * Sends an event over radio to neigboring devices
    */
    //% blockId=radioRaiseEvent block="radio raise event|from source %src=control_event_source_id|with value %value=control_event_value_id"
    //% blockExternalInputs=1
    //% advanced=true
    //% weight=1
    //% help=radio/raise-event
    void raiseEvent(int src, int value) {
#ifdef CODAL_RADIO        
        if (radioEnable() != DEVICE_OK) return;

        getRadio()->event.eventReceived(CODAL_EVENT(src, value, CREATE_ONLY));
#endif        
    }

    /**
     * Internal use only. Takes the next packet from the radio queue and returns its contents + RSSI in a Buffer.
     * @returns NULL if no packet available
     */
    //%
    Buffer readRawPacket() {
#ifdef CODAL_RADIO        
        if (radioEnable() != DEVICE_OK) return NULL;

        auto p = getRadio()->datagram.recv();
#if CODAL_RADIO_MICROBIT_DAL
        if (p == PacketBuffer::EmptyPacket)
            return NULL;
        int rssi = p.getRSSI();
        auto length = p.length();
        auto bytes = p.getBytes();
#else
        // TODO: RSSI support
        int rssi = -73;        
        auto length = p.length();
        auto bytes = p.getBytes();
        if (length == 0)
            return NULL;
#endif

        uint8_t buf[DEVICE_RADIO_MAX_PACKET_SIZE + sizeof(int)]; // packet length + rssi
        memset(buf, 0, sizeof(buf));
        memcpy(buf, bytes, length); // data
        memcpy(buf + DEVICE_RADIO_MAX_PACKET_SIZE, &rssi, sizeof(int)); // RSSi - assumes Int32LE layout
        return mkBuffer(buf, sizeof(buf));
#else
        return NULL;
#endif        
    }

    /**
     * Internal use only. Sends a raw packet through the radio (assumes RSSI appened to packet)
     */
    //% async
    void sendRawPacket(Buffer msg) {
#ifdef CODAL_RADIO        
        if (radioEnable() != DEVICE_OK || NULL == msg) return;

        // don't send RSSI data; and make sure no buffer underflow
        int len = msg->length - sizeof(int);
        if (len > 0)
            getRadio()->datagram.send(msg->data, len);
#endif            
    }

    /**
     * Used internally by the library.
     */
    //% help=radio/on-data-received
    //% weight=0
    //% blockId=radio_datagram_received_event block="radio on data received" blockGap=8
    //% deprecated=true blockHidden=1
    void onDataReceived(Action body) {
#ifdef CODAL_RADIO        
        if (radioEnable() != DEVICE_OK) return;

        registerWithDal(DEVICE_ID_RADIO, DEVICE_RADIO_EVT_DATAGRAM, body);
        getRadio()->datagram.recv(); // wake up read code
#endif       
    }

    /**
     * Sets the group id for radio communications. A micro:bit can only listen to one group ID at any time.
     * @param id the group id between ``0`` and ``255``, eg: 1
     */
    //% help=radio/set-group
    //% weight=100
    //% blockId=radio_set_group block="radio set group %ID"
    //% id.min=0 id.max=255
    //% group="Group"
    void setGroup(int id) {
#ifdef CODAL_RADIO        
        if (radioEnable() != DEVICE_OK) return;

        getRadio()->setGroup(id);
#endif       
    }

    /**
     * Change the output power level of the transmitter to the given value.
    * @param power a value in the range 0..7, where 0 is the lowest power and 7 is the highest. eg: 7
    */
    //% help=radio/set-transmit-power
    //% weight=9 blockGap=8
    //% blockId=radio_set_transmit_power block="radio set transmit power %power"
    //% power.min=0 power.max=7
    //% advanced=true
    void setTransmitPower(int power) {
#ifdef CODAL_RADIO        
        if (radioEnable() != DEVICE_OK) return;

        getRadio()->setTransmitPower(power);
#endif        
    }

    /**
    * Change the transmission and reception band of the radio to the given channel
    * @param band a frequency band in the range 0 - 83. Each step is 1MHz wide, based at 2400MHz.
    **/
    //% help=radio/set-frequency-band
    //% weight=8 blockGap=8
    //% blockId=radio_set_frequency_band block="radio set frequency band %band"
    //% band.min=0 band.max=83
    //% advanced=true
    void setFrequencyBand(int band) {
#ifdef CODAL_RADIO        
        if (radioEnable() != DEVICE_OK) return;
        getRadio()->setFrequencyBand(band);
#endif        
    }
}
