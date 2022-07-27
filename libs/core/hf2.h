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

struct HF2_PendingWrite {
    HF2_PendingWrite *next;
    uint16_t size;
    uint8_t flag;
    uint8_t _reserved;
    uint8_t data[0];
};

class HF2 : public CodalUSBInterface {
    bool gotSomePacket;
    bool ctrlWaiting;
    uint32_t lastExchange;

#ifdef USB_EP_FLAG_ASYNC
    HF2_PendingWrite *pendingWrite;
    int pendingWriteSize;
    int pendingWritePtr;
#endif

  public:
    HF2_Buffer &pkt;

    bool useHID;

    int sendResponse(int size);
    int recv();
    int sendResponseWithData(const void *data, int size);
    int sendEvent(uint32_t evId, const void *data, int size);
    void sendBuffer(uint8_t flag, const void *data, unsigned size, uint32_t prepend = -1);
    void pokeSend();

    HF2(HF2_Buffer &pkt);
    virtual int endpointRequest();
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
