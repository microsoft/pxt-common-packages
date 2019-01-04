#ifndef DEVICE_HF2_H
#define DEVICE_HF2_H

#if CONFIG_ENABLED(DEVICE_USB)

#include "HID.h"
#include "uf2hid.h"

#define HF2_BUF_SIZE 256

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

    const uint8_t *dataToSend;
    volatile uint32_t dataToSendLength;
    bool dataToSendPrepend;
    uint8_t dataToSendFlag;

    bool gotSomePacket;
    bool ctrlWaiting;

  public:
    HF2_Buffer &pkt;

    bool allocateEP;

    int sendResponse(int size);
    int recv();
    int sendResponseWithData(const void *data, int size);

    HF2(HF2_Buffer &pkt);
    virtual int endpointRequest();
    virtual int classRequest(UsbEndpointIn &ctrl, USBSetup &setup);
    virtual const InterfaceInfo *getInterfaceInfo();
    int sendSerial(const void *data, int size, int isError = 0);

    virtual bool enableWebUSB() { return true; }
};

#endif

#endif
