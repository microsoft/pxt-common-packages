#pragma once

#include "pxt.h"
#include "esp_log.h"

namespace pxt {
// nothing here yet
} // namespace pxt

namespace _wifi {
    enum class WifiEvent {
        //%
        ScanDone = 1,
        //%
        GotIP = 2,
        //%
        Disconnected = 3,
        //%
        AccessPointCredentialsAvailable = 4,
        //%
        LoginServerStarted = 5,
    };

    int eventID();
    void startHttpServer(const char* hostName);
}