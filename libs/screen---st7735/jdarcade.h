#ifndef __JDARCADE_H
#define __JDARCADE_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define JD_SERVICE_CLASS_DISPLAY 0x3218f7ff

#define JD_DISPLAY_FLAGS_COLUMN_MAJOR 0x00 // this is standard for small TFTs mounted landscape
#define JD_DISPLAY_FLAGS_ROW_MAJOR 0x01    // this is what's typical on desktop
// the actual resolution is 2x higher than reported; images will be up-scaled
#define JD_DISPLAY_FLAGS_RETINA 0x02

typedef struct {
    uint8_t flags;
    uint8_t bpp; // currently always 4
    // logical size
    uint16_t width;
    uint16_t height;
} jd_display_advertisement_data_t;

#define JD_DISPLAY_CMD_SET_WINDOW 0x81
#define JD_DISPLAY_CMD_PALETTE 0x82
#define JD_DISPLAY_CMD_PIXELS 0x83
#define JD_DISPLAY_CMD_SET_BRIGHTNESS 0x84

typedef struct {
    uint16_t x;
    uint16_t y;
    uint16_t width;
    uint16_t height;
} jd_display_set_window_t;

typedef struct {
    uint32_t palette[16];
} jd_display_palette_t;

typedef struct {
    uint32_t pixels[0];
} jd_display_pixels_t;

#define JD_SERVICE_CLASS_ARCADE_CONTROLS 0x21c35d83

#define JD_ARCADE_CONTROLS_BUTTON_LEFT 0x0001
#define JD_ARCADE_CONTROLS_BUTTON_UP 0x0002
#define JD_ARCADE_CONTROLS_BUTTON_RIGHT 0x0003
#define JD_ARCADE_CONTROLS_BUTTON_DOWN 0x0004
#define JD_ARCADE_CONTROLS_BUTTON_A 0x0005
#define JD_ARCADE_CONTROLS_BUTTON_B 0x0006
#define JD_ARCADE_CONTROLS_BUTTON_MENU 0x0007
#define JD_ARCADE_CONTROLS_BUTTON_MENU2 0x0008
#define JD_ARCADE_CONTROLS_BUTTON_RESET 0x0009
#define JD_ARCADE_CONTROLS_BUTTON_EXIT 0x000a

typedef struct {
    uint8_t flags;
    uint8_t numplayers;
    uint16_t buttons[0];
} jd_arcade_controls_advertisement_data_t;

typedef struct {
    uint16_t button;
    uint8_t player_index;
    uint8_t pressure; // for analog joysticks mostly, for digital inputs should be 0xff
} jd_arcade_controls_report_entry_t;

typedef struct {
    jd_arcade_controls_report_entry_t pressedButtons[0];
} jd_arcade_controls_report_t;

#ifdef __cplusplus
}
#endif

#endif
