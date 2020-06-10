#ifndef __JDLOW_H
#define __JDLOW_H

#include "jd_protocol.h"
#include <hw.h>

// this is timing overhead (in us) of starting transmission
// see set_tick_timer() for how to calibrate this
#ifndef JD_WR_OVERHEAD
#define JD_WR_OVERHEAD 8
#endif

#endif
