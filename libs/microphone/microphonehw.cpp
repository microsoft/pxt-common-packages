#include "pxt.h"
#include "dmac.h"
#include "LevelDetector.h"
#include "LevelDetectorSPL.h"

#ifdef NRF52_SERIES
#include "NRF52PDM.h"
#define PDMDevice NRF52PDM
#else
#include "SAMDPDM.h"
#define PDMDevice SAMD21PDM
#endif

namespace pxt {

class WMicrophone {
  public:
    PDMDevice microphone;
    LevelDetectorSPL level;
    WMicrophone()
        : microphone(*LOOKUP_PIN(MIC_DATA), *LOOKUP_PIN(MIC_CLOCK))
        , level(microphone.output, 95.0, 75.0, 9, 52, DEVICE_ID_MICROPHONE)
    {
        microphone.enable();
    }
};
SINGLETON(WMicrophone);


codal::LevelDetectorSPL* getMicrophoneLevel() {
    auto wmic = getWMicrophone();
    return wmic ? &(wmic->level) : NULL;
}

}
