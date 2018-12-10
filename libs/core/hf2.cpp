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

//#define LOG DMESG
#define LOG(...) ((void)0)

static volatile bool resume = false;

using namespace codal;

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

static const InterfaceInfo ifaceInfo = {
    &reportDesc,
    sizeof(reportDesc),
    1,
    {
        2,    // numEndpoints
        0x03, /// class code - HID
        0x00, // subclass
        0x00, // protocol
        0x00, //
        0x00, //
    },
    {USB_EP_TYPE_INTERRUPT, 1},
    {USB_EP_TYPE_INTERRUPT, 1},
};

int HF2::stdRequest(UsbEndpointIn &ctrl, USBSetup &setup)
{
    if (setup.bRequest == USB_REQ_GET_DESCRIPTOR)
    {
        if (setup.wValueH == 0x21)
        {
            InterfaceDescriptor tmp;
            fillInterfaceInfo(&tmp);
            return ctrl.write(&tmp, sizeof(tmp));
        }
        else if (setup.wValueH == 0x22)
        {
            return ctrl.write(hidDescriptor, sizeof(hidDescriptor));
        }
    }
    return DEVICE_NOT_SUPPORTED;
}

const InterfaceInfo *HF2::getInterfaceInfo()
{
    return &ifaceInfo;
}

int HF2::sendSerial(const void *data, int size, int isError)
{
    if (!gotSomePacket) return DEVICE_OK;
    return send(data, size, isError ? HF2_FLAG_SERIAL_ERR : HF2_FLAG_SERIAL_OUT);
}

// Recieve HF2 message
// Does not block. Will store intermediate data in pkt.
// `serial` flag is cleared if we got a command message.
int HF2::recv() {
    uint8_t buf[64];
    int len = out->read(buf, sizeof(buf));
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

// Send HF2 message.
// Use command message when flag == HF2_FLAG_CMDPKT_LAST
// Use serial stdout for HF2_FLAG_SERIAL_OUT and stderr for HF2_FLAG_SERIAL_ERR.
int HF2::send(const void *data, int size, int flag0) {
    uint8_t buf[64];
    const uint8_t *ptr = (const uint8_t *)data;

    if (!CodalUSB::usbInstance->isInitialised())
        return -1;

    for (;;) {
        int s = 63;
        int flag = flag0;
        if (size <= 63) {
            s = size;
        } else {
            if (flag == HF2_FLAG_CMDPKT_LAST)
                flag = HF2_FLAG_CMDPKT_BODY;
        }
        buf[0] = flag | s;
        memcpy(buf + 1, ptr, s);
        if (in->write(buf, sizeof(buf)) < 0)
            return -1;
        ptr += s;
        size -= s;
        if (!size)
            break;
    }
    return 0;
}

int HF2::sendResponse(int size) {
    return send(pkt.buf, 4 + size, HF2_FLAG_CMDPKT_LAST);
}

int HF2::sendResponseWithData(const void *data, int size) {
    int res;

    DMESG("HF2 send len=%d", size);
        
    if (size <= (int)sizeof(pkt.buf) - 4) {
        __disable_irq();
        memcpy(pkt.resp.data8, data, size);
        __enable_irq();
        res = sendResponse(size);
    } else {
        __disable_irq();
        send(pkt.buf, 4, HF2_FLAG_CMDPKT_BODY);
        res = send(data, size, HF2_FLAG_CMDPKT_LAST);
        __enable_irq();
    }

    DMESG("HF2 send DONE len=%d", size);

    return res;
}

static void copy_words(void *dst0, const void *src0, uint32_t n_words) {
    uint32_t *dst = (uint32_t *)dst0;
    const uint32_t *src = (const uint32_t *)src0;
    while (n_words--)
        *dst++ = *src++;
}

#ifndef QUICK_BOOT
#define DBL_TAP_PTR ((volatile uint32_t *)(HMCRAMC0_ADDR + HMCRAMC0_SIZE - 4))
#define DBL_TAP_MAGIC_QUICK_BOOT 0xf02669ef
#define QUICK_BOOT(v) *DBL_TAP_PTR = v ? DBL_TAP_MAGIC_QUICK_BOOT : 0
#endif

int HF2::endpointRequest()
{
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

    gotSomePacket = true;

    switch (cmdId) {
    case HF2_CMD_INFO:
        return sendResponseWithData(uf2_info(), strlen(uf2_info()));

    case HF2_CMD_BININFO:
        resp->bininfo.mode = HF2_MODE_USERSPACE;
        resp->bininfo.flash_page_size = 0;
        resp->bininfo.flash_num_pages = 0;
        resp->bininfo.max_message_size = sizeof(pkt.buf);
        return sendResponse(sizeof(resp->bininfo));

    case HF2_DBG_RESTART:
        *HF2_DBG_MAGIC_PTR = HF2_DBG_MAGIC_START;
        target_reset();
        break;

    case HF2_CMD_RESET_INTO_APP:
        QUICK_BOOT(1);
        // fall-through
    case HF2_CMD_RESET_INTO_BOOTLOADER:
        target_reset();
        break;

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

    default:
        // command not understood
        resp->status16 = HF2_STATUS_INVALID_CMD;
        break;
    }

    return sendResponse(0);
}

HF2::HF2(HF2_Buffer &p) : USBHID(), pkt(p), gotSomePacket(false) {}

//
//
// WebUSB
//
//

WebHF2::WebHF2(HF2_Buffer &p) : HF2(p) {}

static const InterfaceInfo ifaceInfoWeb = {
    NULL,
    0,
    1,
    {
        2,    // numEndpoints
        0xff, /// class code - HID
        42, // subclass
        0x01, // protocol
        0x00, //
        0x00, //
    },
    {USB_EP_TYPE_INTERRUPT, 1},
    {USB_EP_TYPE_INTERRUPT, 1},
};

const InterfaceInfo *WebHF2::getInterfaceInfo()
{
    return &ifaceInfoWeb;
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
        webhf2.pkt.resp.eventId = HF2_EV_DBG_PAUSED;
        webhf2.sendResponseWithData(&pausedData, sizeof(pausedData));
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