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

#include "platform.h"

using namespace codal;

#include "pins.h"

#if CONFIG_ENABLED(DEVICE_USB)
#include "hf2.h"
#include "hf2dbg.h"
#if CONFIG_ENABLED(DEVICE_JOYSTICK)
#pragma message ( "HID Joystick enabled" )
#include "HIDJoystick.h"
#endif
#endif

namespace pxt {

#if CONFIG_ENABLED(DEVICE_USB)
extern CodalUSB usb;
extern HF2 hf2;
#if CONFIG_ENABLED(DEVICE_JOYSTICK)
extern USBHIDJoystick joystick;
#endif
#endif

// Utility functions
extern Event lastEvent;
extern CODAL_MBED::Timer devTimer;
extern MessageBus devMessageBus;
extern codal::CodalDevice device;
}

#define DEVICE_ID_BUTTON_SLIDE  3000
#define DEVICE_ID_MICROPHONE    3001
#define DEVICE_ID_FIRST_BUTTON 4000
#define DEVICE_ID_FIRST_TOUCHBUTTON 4100

#endif
