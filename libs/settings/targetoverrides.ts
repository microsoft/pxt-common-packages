// override this if you want smaller settings
namespace config {
    export const SETTINGS_SIZE_DEFL = (32*1024)
    // export const SETTINGS_SIZE_DEFL = (2*1024)  // for SAMD21
    // NRF flash page size is 4096, so must be multiple of 4096 on NRF
}
