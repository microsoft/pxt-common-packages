#ifndef __PXT_H
#define __PXT_H

#include "pxtbase.h"

#include "CodalConfig.h"
#include "dmesg.h"
#include "ErrorNo.h"
#include "Timer.h"
#include "CodalCompat.h"
#include "CodalComponent.h"
#include "Event.h"
#include "NotifyEvents.h"
#include "MessageBus.h"
#include "CodalFiber.h"

using namespace codal;

namespace pxt {

// Utility functions
extern Event lastEvent;

} // namespace pxt

#define PXT_INTERNAL_KEY_UP 2050
#define PXT_INTERNAL_KEY_DOWN 2051


#undef PXT_MAIN
#define PXT_MAIN  /* nothing */

#endif
