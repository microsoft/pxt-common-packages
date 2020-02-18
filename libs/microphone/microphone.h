#ifndef PXT_MICROPHONE_H
#define PXT_MICROPHONE_H

#include "pxt.h"

#ifndef CODAL_LEVEL_DETECTOR_SPL

#include "LevelDetector.h"
#include "LevelDetectorSPL.h"
#define CODAL_LEVEL_DETECTOR_SPL codal::LevelDetectorSPL

#endif

namespace pxt {
    CODAL_LEVEL_DETECTOR_SPL* getMicrophoneLevel();
}

#endif
