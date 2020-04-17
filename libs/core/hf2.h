#ifndef DEVICE_HF2_H
#define DEVICE_HF2_H

#if CONFIG_ENABLED(DEVICE_USB)

#include "HID.h"
#include "uf2hid.h"

// 260 bytes needed for biggest JD packets (with overheads)
#define HF2_BUF_SIZE 260

typedef struct {
    uint16_t size;
    uint8_t serial;
    union {
        uint8_t buf[HF2_BUF_SIZE];
        uint32_t buf32[HF2_BUF_SIZE / 4];
        uint16_t buf16[HF2_BUF_SIZE / 2];
        HF2_Command cmd;
        HF2_Response resp;
    };
} HF2_Buffer;

class HF2 : public CodalUSBInterface {
    void prepBuffer(uint8_t *buf);
    void pokeSend();
    void sendCore(uint8_t flag, uint32_t prepend, const void *data, int size);

    const uint8_t *dataToSend;
    volatile uint32_t dataToSendLength;
    uint32_t dataToSendPrepend;
    uint8_t dataToSendFlag;

    uint32_t lastExchange;

    bool gotSomePacket;
    bool ctrlWaiting;

  public:
    HF2_Buffer &pkt;

    bool allocateEP;
    bool useHID;

    int sendResponse(int size);
    int recv();
    int sendResponseWithData(const void *data, int size);
    int sendEvent(uint32_t evId, const void *data, int size);

    HF2(HF2_Buffer &pkt);
    virtual int endpointRequest();
    virtual int classRequest(UsbEndpointIn &ctrl, USBSetup &setup);
    virtual int stdRequest(UsbEndpointIn &ctrl, USBSetup &setup);
    virtual const InterfaceInfo *getInterfaceInfo();
    int sendSerial(const void *data, int size, int isError = 0);

    virtual bool enableWebUSB() { return !useHID; }
};

class DummyIface : public CodalUSBInterface {
  public:
    virtual const InterfaceInfo *getInterfaceInfo();
};

#endif

#endif
