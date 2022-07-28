#include "pxt.h"

#if CONFIG_ENABLED(DEVICE_USB)
#ifndef USB_HANDOVER
#define USB_HANDOVER 1
#endif

#if USB_HANDOVER
#define UF2_DEFINE_HANDOVER 1
#endif

#include "uf2format.h"

static void *stackCopy;
static uint32_t stackSize;

//#define LOG DMESG
#define LOG(...) ((void)0)

static volatile bool resume = false;

using namespace codal;

#ifdef HF2_HID
static const char hidDescriptor[] = {
    0x06, 0x97, 0xFF, // usage page vendor 0x97 (usage 0xff97 0x0001)
    0x09, 0x01,       // usage 1
    0xA1, 0x01,       // collection - application
    0x15, 0x00,       // logical min 0
    0x26, 0xFF, 0x00, // logical max 255
    0x75, 8,          // report size 8
    0x95, 64,         // report count 64
    0x09, 0x01,       // usage 1
    0x81, 0x02,       // input: data, variable, absolute
    0x95, 64,         // report count 64
    0x09, 0x01,       // usage 1
    0x91, 0x02,       // output: data, variable, absolute
    0x95, 1,          // report count 1
    0x09, 0x01,       // usage 1
    0xB1, 0x02,       // feature: data, variable, absolute
    0xC0,             // end
};

static const HIDReportDescriptor reportDesc = {
    9,
    0x21,                  // HID
    0x100,                 // hidbcd 1.00
    0x00,                  // country code
    0x01,                  // num desc
    0x22,                  // report desc type
    sizeof(hidDescriptor), // size of 0x22
};

static const InterfaceInfo ifaceInfoHID = {
    &reportDesc,
    sizeof(reportDesc),
    1,
    {
        2,    // numEndpoints
        0x03, /// class code - HID
        0x00, // subclass
        0x00, // protocol
        0x02, // string
        0x00, // alt
    },
    {USB_EP_TYPE_INTERRUPT, 1},
    {USB_EP_TYPE_INTERRUPT, 1},
};
#endif

static const InterfaceInfo ifaceInfoEP = {
    NULL,
    0,
    2,
    {
        2,    // numEndpoints
        0xff, /// class code - vendor-specific
        42,   // subclass
        1,    // protocol
        0x02, // string
        0x00, // alt
    },
    {USB_EP_TYPE_BULK, 0},
    {USB_EP_TYPE_BULK, 0},
};

int HF2::stdRequest(UsbEndpointIn &ctrl, USBSetup &setup) {
#ifdef HF2_HID
    if (!useHID)
        return DEVICE_NOT_SUPPORTED;
    if (setup.bRequest == USB_REQ_GET_DESCRIPTOR) {
        if (setup.wValueH == 0x21) {
            InterfaceDescriptor tmp;
            fillInterfaceInfo(&tmp);
            return ctrl.write(&tmp, sizeof(tmp));
        } else if (setup.wValueH == 0x22) {
            return ctrl.write(hidDescriptor, sizeof(hidDescriptor));
        }
    }
#endif
    return DEVICE_NOT_SUPPORTED;
}

#define HF2_FLAG_EVENT 0x01

REAL_TIME_FUNC
void HF2::sendBuffer(uint8_t flag, const void *data, unsigned size, uint32_t prepend) {
    if (!CodalUSB::usbInstance->isInitialised())
        return;

#ifdef USB_EP_FLAG_ASYNC
    // drop non-responses if too much stuff queued up
    if (flag != HF2_FLAG_CMDPKT_LAST && pendingWriteSize > 1000)
        return;
#endif

    if (flag == HF2_FLAG_EVENT)
        flag = HF2_FLAG_CMDPKT_LAST;

    if (prepend + 1)
        size += 4;

#ifdef USB_EP_FLAG_ASYNC
    HF2_PendingWrite *e = (HF2_PendingWrite *)malloc(sizeof(HF2_PendingWrite) + size);
    e->size = size;
    e->flag = flag;
    e->next = NULL;
    uint8_t *dst = e->data;
    if (prepend + 1) {
        memcpy(dst, &prepend, 4);
        dst += 4;
        size -= 4;
    }
    memcpy(dst, data, size);

    target_disable_irq();
    auto p = this->pendingWrite;
    if (!p)
        this->pendingWrite = e;
    else {
        while (p->next)
            p = p->next;
        p->next = e;
    }
    this->pendingWriteSize += 16 + e->size;
    target_enable_irq();

    pokeSend();
#else
    uint32_t buf[64 / 4]; // aligned

    target_disable_irq();
    while (size > 0) {
        memset(buf + 1, 0, 60);
        int s = 63;
        if (size <= 63) {
            s = size;
            buf[0] = flag;
        } else {
            buf[0] = flag == HF2_FLAG_CMDPKT_LAST ? HF2_FLAG_CMDPKT_BODY : flag;
        }
        buf[0] |= s;
        uint8_t *dst = (uint8_t *)buf;
        dst++;
        if (prepend + 1) {
            memcpy(dst, &prepend, 4);
            prepend = -1;
            dst += 4;
            s -= 4;
            size -= 4;
        }
        memcpy(dst, data, s);
        data = (const uint8_t *)data + s;
        size -= s;

        in->write(buf, sizeof(buf));
    }
    target_enable_irq();
#endif
}

const InterfaceInfo *HF2::getInterfaceInfo() {
#ifdef HF2_HID
    if (useHID)
        return &ifaceInfoHID;
#endif
    return &ifaceInfoEP;
}

int HF2::sendEvent(uint32_t evId, const void *data, int size) {
    sendBuffer(HF2_FLAG_EVENT, data, size, evId);
    return 0;
}

int HF2::sendSerial(const void *data, int size, int isError) {
    if (!gotSomePacket)
        return DEVICE_OK;

    sendBuffer(isError ? HF2_FLAG_SERIAL_ERR : HF2_FLAG_SERIAL_OUT, data, size);

    return 0;
}

// Receive HF2 message
// Does not block. Will store intermediate data in pkt.
// `serial` flag is cleared if we got a command message.
int HF2::recv() {
    uint8_t buf[64];

    int len = out->read(buf, sizeof(buf));
    // DMESG("HF2 read: %d", len);

    if (len <= 0)
        return len;

    uint8_t tag = buf[0];
    // serial packets not allowed when in middle of command packet
    usb_assert(pkt.size == 0 || !(tag & HF2_FLAG_SERIAL_OUT));
    int size = tag & HF2_SIZE_MASK;
    usb_assert(pkt.size + size <= (int)sizeof(pkt.buf));
    memcpy(pkt.buf + pkt.size, buf + 1, size);
    pkt.size += size;
    tag &= HF2_FLAG_MASK;
    if (tag != HF2_FLAG_CMDPKT_BODY) {
        if (tag == HF2_FLAG_CMDPKT_LAST)
            pkt.serial = 0;
        else if (tag == HF2_FLAG_SERIAL_OUT)
            pkt.serial = 1;
        else
            pkt.serial = 2;
        int sz = pkt.size;
        pkt.size = 0;
        return sz;
    }
    return 0;
}

int HF2::sendResponse(int size) {
    sendBuffer(HF2_FLAG_CMDPKT_LAST, pkt.buf, 4 + size);
    return 0;
}

int HF2::sendResponseWithData(const void *data, int size) {
    if (size <= (int)sizeof(pkt.buf) - 4) {
        memcpy(pkt.resp.data8, data, size);
        return sendResponse(size);
    } else {
        sendBuffer(HF2_FLAG_CMDPKT_LAST, data, size, pkt.resp.eventId);
        return 0;
    }
}

static void copy_words(void *dst0, const void *src0, uint32_t n_words) {
    uint32_t *dst = (uint32_t *)dst0;
    const uint32_t *src = (const uint32_t *)src0;
    while (n_words--)
        *dst++ = *src++;
}

#ifndef QUICK_BOOT
#ifdef SAMD21
#define DBL_TAP_PTR ((volatile uint32_t *)(HMCRAMC0_ADDR + HMCRAMC0_SIZE - 4))
#endif
#ifdef SAMD51
#define DBL_TAP_PTR ((volatile uint32_t *)(HSRAM_ADDR + HSRAM_SIZE - 4))
#endif
#if defined(NRF52840) || defined(NRF52833)
#define DBL_TAP_PTR ((volatile uint32_t *)0x20007F7C)
#endif
#ifdef DBL_TAP_PTR
#define DBL_TAP_MAGIC_QUICK_BOOT 0xf02669ef
#define QUICK_BOOT(v) *DBL_TAP_PTR = v ? DBL_TAP_MAGIC_QUICK_BOOT : 0
#endif
#endif

static HF2 *jdLogger;
static void jdLog(const uint8_t *frame) {
    jdLogger->sendEvent(HF2_EV_JDS_PACKET, frame, frame[2] + 12);
}

void HF2::pokeSend() {
#ifdef USB_EP_FLAG_ASYNC
    target_disable_irq();
    while (pendingWrite && in->canWrite()) {
        in->flags |= USB_EP_FLAG_ASYNC;

        int size = pendingWrite->size - pendingWritePtr;
        usb_assert(size > 0);
        uint32_t buf[64 / 4] = {0};

        int s = 63;
        if (size <= 63) {
            s = size;
            buf[0] = pendingWrite->flag;
        } else {
            buf[0] = pendingWrite->flag == HF2_FLAG_CMDPKT_LAST ? HF2_FLAG_CMDPKT_BODY
                                                                : pendingWrite->flag;
        }
        buf[0] |= s;
        uint8_t *dst = (uint8_t *)buf;
        dst++;
        memcpy(dst, pendingWrite->data + pendingWritePtr, s);

        int r = in->write(buf, sizeof(buf));
        if (r == 0) {
            if (s == size) {
                pendingWritePtr = 0;
                pendingWriteSize -= 16 + pendingWrite->size;
                HF2_PendingWrite *n = pendingWrite->next;
                free(pendingWrite);
                pendingWrite = n;
            } else {
                pendingWritePtr += s;
            }
        }
    }
    target_enable_irq();
#endif
}

int HF2::endpointRequest() {
#ifdef USB_EP_FLAG_ASYNC
    pokeSend();
#endif

    int sz = recv();

    if (!sz)
        return 0;

    uint32_t tmp;

    if (pkt.serial) {
        // TODO raise some event?
        return 0;
    }

    LOG("HF2 sz=%d CMD=%x", sz, pkt.buf32[0]);

    // one has to be careful dealing with these, as they share memory
    HF2_Command *cmd = &pkt.cmd;
    HF2_Response *resp = &pkt.resp;

    uint32_t cmdId = cmd->command_id;
    resp->tag = cmd->tag;
    resp->status16 = HF2_STATUS_OK;

#define checkDataSize(str, add) usb_assert(sz == 8 + (int)sizeof(cmd->str) + (int)(add))

    lastExchange = current_time_ms();
    gotSomePacket = true;

    switch (cmdId) {
    case HF2_CMD_INFO:
        return sendResponseWithData(uf2_info(), strlen(uf2_info()));

    case HF2_CMD_BININFO:
        resp->bininfo.mode = HF2_MODE_USERSPACE;
        resp->bininfo.flash_page_size = 0;
        resp->bininfo.flash_num_pages = 0;
        resp->bininfo.max_message_size = sizeof(pkt.buf);
        resp->bininfo.uf2_family = PXT_UF2_FAMILY;
        return sendResponse(sizeof(resp->bininfo));

    case HF2_DBG_RESTART:
        *HF2_DBG_MAGIC_PTR = HF2_DBG_MAGIC_START;
        target_reset();
        break;

#ifdef QUICK_BOOT
    case HF2_CMD_RESET_INTO_APP:
        QUICK_BOOT(1);
        NVIC_SystemReset();
        break;
    case HF2_CMD_RESET_INTO_BOOTLOADER:
        QUICK_BOOT(0);
        NVIC_SystemReset();
        break;
#else
    case HF2_CMD_RESET_INTO_APP:
        NVIC_SystemReset();
        break;
    // reset into bootloader not supported
#endif

#if USB_HANDOVER
    case HF2_CMD_START_FLASH:
        sendResponse(0);
        hf2_handover(in->ep);
        usb_assert(0); // should not be reached
        break;
#endif

    case HF2_CMD_WRITE_WORDS:
        checkDataSize(write_words, cmd->write_words.num_words << 2);
        copy_words((void *)cmd->write_words.target_addr, cmd->write_words.words,
                   cmd->write_words.num_words);
        break;

    case HF2_CMD_READ_WORDS:
        checkDataSize(read_words, 0);
        tmp = cmd->read_words.num_words;
        usb_assert(tmp <= sizeof(pkt.buf) / 4 - 1);
        copy_words(resp->data32, (void *)cmd->read_words.target_addr, tmp);
        return sendResponse(tmp << 2);

    case HF2_CMD_DMESG:
#if DEVICE_DMESG_BUFFER_SIZE > 0
        return sendResponseWithData(codalLogStore.buffer, codalLogStore.ptr);
#else
        break;
#endif

    case HF2_DBG_GET_GLOBAL_STATE: {
        HF2_GLOBAL_STATE_Result gstate = {
            .num_globals = (uint32_t)getNumGlobals(), //
            .globals_addr = (uint32_t)globals,
        };
        return sendResponseWithData(&gstate, sizeof(gstate));
    }

    case HF2_DBG_RESUME:
        globals[0] = (TValue)cmd->data32[0];
        resume = true;
        return sendResponse(0);

    case HF2_DBG_GET_STACK:
        return sendResponseWithData(stackCopy, stackSize);

    case HF2_CMD_JDS_CONFIG:
        if (cmd->data8[0]) {
            jdLogger = this;
            pxt::logJDFrame = jdLog;
        } else {
            pxt::logJDFrame = NULL;
        }
        return sendResponse(0);

    case HF2_CMD_JDS_SEND:
        if (pxt::sendJDFrame) {
            pxt::sendJDFrame(cmd->data8);
            return sendResponse(0);
        } else {
            resp->status16 = HF2_STATUS_INVALID_STATE;
            return sendResponse(0);
        }

    default:
        // command not understood
        resp->status16 = HF2_STATUS_INVALID_CMD;
        break;
    }

    return sendResponse(0);
}

HF2::HF2(HF2_Buffer &p) : gotSomePacket(false), ctrlWaiting(false), pkt(p), useHID(false) {
    lastExchange = 0;
#ifdef USB_EP_FLAG_ASYNC
    pendingWrite = NULL;
    pendingWriteSize = 0;
    pendingWritePtr = 0;
#endif
}

static const InterfaceInfo dummyIfaceInfo = {
    NULL,
    0,
    0,
    {
        0,    // numEndpoints
        0xff, /// class code - vendor-specific
        0xff, // subclass
        0xff, // protocol
        0x00, // string
        0x00, // alt
    },
    {0, 0},
    {0, 0},
};

const InterfaceInfo *DummyIface::getInterfaceInfo() {
    return &dummyIfaceInfo;
}

//
//
// Debugger
//
//

struct ExceptionContext {
    uint32_t excReturn; // 0xFFFFFFF9
    uint32_t r0;
    uint32_t r1;
    uint32_t r2;
    uint32_t r3;
    uint32_t r12;
    uint32_t lr;
    uint32_t faultInstrAddr;
    uint32_t psr;
};

struct Paused_Data {
    uint32_t pc;
};
static Paused_Data pausedData;

void bkptPaused() {

// waiting for https://github.com/lancaster-university/codal/pull/14
#ifdef DEVICE_GROUP_ID_USER
    // the loop below counts as "system" task, and we don't want to pause ourselves
    fiber_set_group(DEVICE_GROUP_ID_SYSTEM);
    // pause everyone else
    fiber_pause_group(DEVICE_GROUP_ID_USER);
#endif

    while (!resume) {
        // DMESG("BKPT");
        hf2.pkt.resp.eventId = HF2_EV_DBG_PAUSED;
        hf2.sendResponseWithData(&pausedData, sizeof(pausedData));
        // TODO use an event
        for (int i = 0; i < 20; ++i) {
            if (resume)
                break;
            fiber_sleep(50);
        }
    }

    if (stackCopy) {
        xfree(stackCopy);
        stackCopy = NULL;
    }

#ifdef DEVICE_GROUP_ID_USER
    fiber_resume_group(DEVICE_GROUP_ID_USER);
    // go back to user mode
    fiber_set_group(DEVICE_GROUP_ID_USER);
#endif

    resume = false;
}

extern "C" void handleHardFault(ExceptionContext *ectx) {
    auto instr = (uint16_t *)ectx->faultInstrAddr;

    DMESG("FLT %p", instr);

    if (ectx->faultInstrAddr & 0x80000000) {
        ectx->faultInstrAddr &= ~0x80000000;
        // switch to step-over mode
        globals[0] = (TValue)3;
        return;
    }

    DMESG("BB %p %p %p lr=%p r0=%p", instr[-1], instr[0], instr[1], ectx->lr, ectx->r0);

    if (instr[0] == 0x6840) {
        // ldr r0, [r0, #4] -- entry breakpoint
        ectx->faultInstrAddr += 2;
        // we're being ask for step-over mode
        if (ectx->r0 == 3) {
            // switch to debugger-attached-no-stepping mode
            globals[0] = (TValue)0;
            ectx->lr |= 0x80000000;
        }
        return;
    }

    if (instr[0] == 0x6800) {
        // ldr r0, [r0, #0]
        ectx->lr = ectx->faultInstrAddr + 3; // next instruction + thumb mode
        pausedData.pc = ectx->faultInstrAddr + 2;
        void *ssp = (void *)(ectx + 1);
        stackSize = DEVICE_STACK_BASE - (uint32_t)ssp;
        if (stackCopy)
            xfree(stackCopy);
        stackCopy = xmalloc(stackSize);
        memcpy(stackCopy, ssp, stackSize);
        ectx->faultInstrAddr = ((uint32_t)(&bkptPaused) & (~1U));
        return;
    }

    while (1) {
    }
}

extern "C" void HardFault_Handler(void) {
    asm("push {lr}; mov r0, sp; bl handleHardFault; pop {pc}");
}

#endif