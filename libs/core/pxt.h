#ifndef __PXT_H
#define __PXT_H

#include "pxtbase.h"
#undef DMESG

#include "CodalConfig.h"
#include "CodalHeapAllocator.h"
#include "CodalDevice.h"
#include "CodalDmesg.h"
#include "ErrorNo.h"
#include "Timer.h"
#include "Matrix4.h"
#include "CodalCompat.h"
#include "CodalComponent.h"
#include "ManagedType.h"
#include "Event.h"
#include "NotifyEvents.h"
#include "Button.h"
#include "CodalFiber.h"
#include "MessageBus.h"
#include "CapTouchButton.h"
#include "Image.h"
#include "MbedTimer.h"
#include "MbedI2C.h"
#include "MbedPin.h"

using namespace codal;

#include "pins.h"
#include "hf2.h"
#include "hf2dbg.h"

#define PAGE_SIZE 256

namespace pxt {

extern CodalUSB usb;
extern HF2 hf2;

// Utility functions
extern Event lastEvent;
extern codal::mbed::Timer devTimer;
extern MessageBus devMessageBus;
extern codal::CodalDevice device;
}

#endif
