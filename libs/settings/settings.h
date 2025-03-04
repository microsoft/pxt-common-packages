// override for settings size

#if defined(SAMD21)
#define SETTINGS_SIZE (2 * 1024)
#else
#define SETTINGS_SIZE (32 * 1024)
#endif
