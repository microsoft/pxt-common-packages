#ifndef DEVICE_HF2_H
#define DEVICE_HF2_H

#include "HID.h"
#include "uf2hid.h"

#define HF2_BUF_SIZE 256

typedef struct
{
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

class HF2 : public USBHID
{
    HF2_Buffer pkt;
    int sendResponse(int size);
    int send(const void *data, int size, int flag);
    int recv();
    int sendResponseWithData(const void *data, int size);

public:
    HF2();
    virtual int endpointRequest();
    virtual int stdRequest(UsbEndpointIn &ctrl, USBSetup& setup);
    virtual const InterfaceInfo *getInterfaceInfo();

    int sendSerial(const void *data, int size, int isError = 0);
};

#endif
