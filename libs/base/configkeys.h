#ifndef __PXT_CONFIGKEYS_H
#define __PXT_CONFIGKEYS_H

// used by pins.cpp to mask off the pin name from any config
// lower 16 pins of value are the pin name
#define CFG_PIN_NAME_MSK 0x0000ffff
// upper 16 bits of value is any configuration of the pin.
#define CFG_PIN_CONFIG_MSK 0xffff0000

// begin optional pin configurations
#define CFG_PIN_CONFIG_ACTIVE_LO 0x10000


#define CFG_MAGIC0 0x1e9e10f1
#define CFG_MAGIC1 0x20227a79

// these define keys for getConfig() function
#define CFG_PIN_ACCELEROMETER_INT 1
#define CFG_PIN_ACCELEROMETER_SCL 2
#define CFG_PIN_ACCELEROMETER_SDA 3
#define CFG_PIN_BTN_A 4
#define CFG_PIN_BTN_B 5
#define CFG_PIN_BTN_SLIDE 6
#define CFG_PIN_DOTSTAR_CLOCK 7
#define CFG_PIN_DOTSTAR_DATA 8
#define CFG_PIN_FLASH_CS 9
#define CFG_PIN_FLASH_MISO 10
#define CFG_PIN_FLASH_MOSI 11
#define CFG_PIN_FLASH_SCK 12
#define CFG_PIN_LED 13
#define CFG_PIN_LIGHT 14
#define CFG_PIN_MICROPHONE 15
#define CFG_PIN_MIC_CLOCK 16
#define CFG_PIN_MIC_DATA 17
#define CFG_PIN_MISO 18
#define CFG_PIN_MOSI 19
// the preferred pin to drive an external neopixel strip
#define CFG_PIN_NEOPIXEL 20
#define CFG_PIN_RX 21
#define CFG_PIN_RXLED 22
#define CFG_PIN_SCK 23
#define CFG_PIN_SCL 24
#define CFG_PIN_SDA 25
#define CFG_PIN_SPEAKER_AMP 26
#define CFG_PIN_TEMPERATURE 27
#define CFG_PIN_TX 28
#define CFG_PIN_TXLED 29
#define CFG_PIN_IR_OUT 30
#define CFG_PIN_IR_IN 31
#define CFG_PIN_DISPLAY_SCK 32
#define CFG_PIN_DISPLAY_MISO 33
#define CFG_PIN_DISPLAY_MOSI 34
#define CFG_PIN_DISPLAY_CS 35
#define CFG_PIN_DISPLAY_DC 36
#define CFG_DISPLAY_WIDTH 37
#define CFG_DISPLAY_HEIGHT 38
#define CFG_DISPLAY_CFG0 39
#define CFG_DISPLAY_CFG1 40
#define CFG_DISPLAY_CFG2 41
#define CFG_DISPLAY_CFG3 42
#define CFG_PIN_DISPLAY_RST 43
#define CFG_PIN_DISPLAY_BL 44
#define CFG_PIN_SERVO_1 45
#define CFG_PIN_SERVO_2 46
#define CFG_PIN_BTN_LEFT 47
#define CFG_PIN_BTN_RIGHT 48
#define CFG_PIN_BTN_UP 49
#define CFG_PIN_BTN_DOWN 50
#define CFG_PIN_BTN_MENU 51
#define CFG_PIN_LED_R 52
#define CFG_PIN_LED_G 53
#define CFG_PIN_LED_B 54
#define CFG_PIN_LED1 55
#define CFG_PIN_LED2 56
#define CFG_PIN_LED3 57
#define CFG_PIN_LED4 58
#define CFG_SPEAKER_VOLUME 59

#define CFG_PIN_JACK_TX 60
#define CFG_PIN_JACK_SENSE 61
#define CFG_PIN_JACK_HPEN 62
#define CFG_PIN_JACK_BZEN 63
#define CFG_PIN_JACK_PWREN 64
#define CFG_PIN_JACK_SND 65
#define CFG_PIN_JACK_BUSLED 66
#define CFG_PIN_JACK_COMMLED 67

#define CFG_PIN_BTN_SOFT_RESET 69
#define CFG_ACCELEROMETER_TYPE 70
#define CFG_PIN_BTNMX_LATCH 71
#define CFG_PIN_BTNMX_CLOCK 72
#define CFG_PIN_BTNMX_DATA 73
#define CFG_PIN_BTN_MENU2 74
#define CFG_PIN_BATTSENSE 75
#define CFG_PIN_VIBRATION 76
#define CFG_PIN_PWREN 77
#define CFG_DISPLAY_TYPE 78

#define CFG_PIN_ROTARY_ENCODER_A 79
#define CFG_PIN_ROTARY_ENCODER_B 80

#define CFG_ACCELEROMETER_SPACE 81

#define CFG_PIN_WIFI_MOSI 82
#define CFG_PIN_WIFI_MISO 83
#define CFG_PIN_WIFI_SCK 84
#define CFG_PIN_WIFI_TX 85
#define CFG_PIN_WIFI_RX 86
#define CFG_PIN_WIFI_CS 87
#define CFG_PIN_WIFI_BUSY 88
#define CFG_PIN_WIFI_RESET 89
#define CFG_PIN_WIFI_GPIO0 90
#define CFG_PIN_WIFI_AT_TX 91
#define CFG_PIN_WIFI_AT_RX 92

#define CFG_PIN_USB_POWER 93

// default I2C address
#define ACCELEROMETER_TYPE_LIS3DH 0x32
#define ACCELEROMETER_TYPE_LIS3DH_ALT 0x30
#define ACCELEROMETER_TYPE_MMA8453 0x38
#define ACCELEROMETER_TYPE_FXOS8700 0x3C
#define ACCELEROMETER_TYPE_MMA8653 0x3A
#define ACCELEROMETER_TYPE_MSA300 0x4C
#define ACCELEROMETER_TYPE_MPU6050 0x68

#define DISPLAY_TYPE_ST7735 7735
#define DISPLAY_TYPE_ILI9341 9341
#define DISPLAY_TYPE_SMART 4242

#define CFG_PIN_A0 100
#define CFG_PIN_A1 101
#define CFG_PIN_A2 102
#define CFG_PIN_A3 103
#define CFG_PIN_A4 104
#define CFG_PIN_A5 105
#define CFG_PIN_A6 106
#define CFG_PIN_A7 107
#define CFG_PIN_A8 108
#define CFG_PIN_A9 109
#define CFG_PIN_A10 110
#define CFG_PIN_A11 111
#define CFG_PIN_A12 112
#define CFG_PIN_A13 113
#define CFG_PIN_A14 114
#define CFG_PIN_A15 115
#define CFG_PIN_A16 116
#define CFG_PIN_A17 117
#define CFG_PIN_A18 118
#define CFG_PIN_A19 119
#define CFG_PIN_A20 120
#define CFG_PIN_A21 121
#define CFG_PIN_A22 122
#define CFG_PIN_A23 123
#define CFG_PIN_A24 124
#define CFG_PIN_A25 125
#define CFG_PIN_A26 126
#define CFG_PIN_A27 127
#define CFG_PIN_A28 128
#define CFG_PIN_A29 129
#define CFG_PIN_A30 130
#define CFG_PIN_A31 131

#define CFG_PIN_D0 150
#define CFG_PIN_D1 151
#define CFG_PIN_D2 152
#define CFG_PIN_D3 153
#define CFG_PIN_D4 154
#define CFG_PIN_D5 155
#define CFG_PIN_D6 156
#define CFG_PIN_D7 157
#define CFG_PIN_D8 158
#define CFG_PIN_D9 159
#define CFG_PIN_D10 160
#define CFG_PIN_D11 161
#define CFG_PIN_D12 162
#define CFG_PIN_D13 163
#define CFG_PIN_D14 164
#define CFG_PIN_D15 165
#define CFG_PIN_D16 166
#define CFG_PIN_D17 167
#define CFG_PIN_D18 168
#define CFG_PIN_D19 169
#define CFG_PIN_D20 170
#define CFG_PIN_D21 171
#define CFG_PIN_D22 172
#define CFG_PIN_D23 173
#define CFG_PIN_D24 174
#define CFG_PIN_D25 175
#define CFG_PIN_D26 176
#define CFG_PIN_D27 177
#define CFG_PIN_D28 178
#define CFG_PIN_D29 179
#define CFG_PIN_D30 180
#define CFG_PIN_D31 181

#define CFG_NUM_NEOPIXELS 200
#define CFG_NUM_DOTSTARS 201
#define CFG_DEFAULT_BUTTON_MODE 202
#define CFG_SWD_ENABLED 203
#define CFG_FLASH_BYTES 204
#define CFG_RAM_BYTES 205
#define CFG_SYSTEM_HEAP_BYTES 206
#define CFG_LOW_MEM_SIMULATION_KB 207
#define CFG_BOOTLOADER_BOARD_ID 208
#define CFG_UF2_FAMILY 209
#define CFG_PINS_PORT_SIZE 210
#define CFG_BOOTLOADER_PROTECTION 211
#define CFG_POWER_DEEPSLEEP_TIMEOUT 212
#define CFG_ANALOG_BUTTON_THRESHOLD 213
#define CFG_CPU_MHZ 214
#define CFG_CONTROLLER_LIGHT_MAX_BRIGHTNESS 215
#define CFG_ANALOG_JOYSTICK_MIN 216
#define CFG_ANALOG_JOYSTICK_MAX 217
#define CFG_TIMERS_TO_USE 218
// configs to specify the onboard (built-in) dotstar or neopixel strips
// some boards have a combination of dotstar, neopixel strips like neotrellis
#define CFG_PIN_ONBOARD_DOTSTAR_CLOCK 219
#define CFG_PIN_ONBOARD_DOTSTAR_DATA 220
#define CFG_NUM_ONBOARD_DOTSTARS 221
#define CFG_PIN_ONBOARD_NEOPIXEL 222
#define CFG_NUM_ONBOARD_NEOPIXELS 223

#define CFG_MATRIX_KEYPAD_MESSAGE_ID 239
#define CFG_NUM_MATRIX_KEYPAD_ROWS 240
#define CFG_PIN_MATRIX_KEYPAD_ROW0 241
#define CFG_PIN_MATRIX_KEYPAD_ROW1 242
#define CFG_PIN_MATRIX_KEYPAD_ROW2 243
#define CFG_PIN_MATRIX_KEYPAD_ROW3 244
#define CFG_PIN_MATRIX_KEYPAD_ROW4 245
#define CFG_PIN_MATRIX_KEYPAD_ROW5 246
#define CFG_PIN_MATRIX_KEYPAD_ROW6 247
#define CFG_PIN_MATRIX_KEYPAD_ROW7 248
#define CFG_NUM_MATRIX_KEYPAD_COLS 250
#define CFG_PIN_MATRIX_KEYPAD_COL0 251
#define CFG_PIN_MATRIX_KEYPAD_COL1 252
#define CFG_PIN_MATRIX_KEYPAD_COL2 253
#define CFG_PIN_MATRIX_KEYPAD_COL3 254
#define CFG_PIN_MATRIX_KEYPAD_COL4 255
#define CFG_PIN_MATRIX_KEYPAD_COL5 256
#define CFG_PIN_MATRIX_KEYPAD_COL6 257
#define CFG_PIN_MATRIX_KEYPAD_COL7 258

#define CFG_PIN_B0 300
#define CFG_PIN_B1 301
#define CFG_PIN_B2 302
#define CFG_PIN_B3 303
#define CFG_PIN_B4 304
#define CFG_PIN_B5 305
#define CFG_PIN_B6 306
#define CFG_PIN_B7 307
#define CFG_PIN_B8 308
#define CFG_PIN_B9 309
#define CFG_PIN_B10 310
#define CFG_PIN_B11 311
#define CFG_PIN_B12 312
#define CFG_PIN_B13 313
#define CFG_PIN_B14 314
#define CFG_PIN_B15 315
#define CFG_PIN_B16 316
#define CFG_PIN_B17 317
#define CFG_PIN_B18 318
#define CFG_PIN_B19 319
#define CFG_PIN_B20 320
#define CFG_PIN_B21 321
#define CFG_PIN_B22 322
#define CFG_PIN_B23 323
#define CFG_PIN_B24 324
#define CFG_PIN_B25 325
#define CFG_PIN_B26 326
#define CFG_PIN_B27 327
#define CFG_PIN_B28 328
#define CFG_PIN_B29 329
#define CFG_PIN_B30 330
#define CFG_PIN_B31 331

#define CFG_PIN_C0 350
#define CFG_PIN_C1 351
#define CFG_PIN_C2 352
#define CFG_PIN_C3 353
#define CFG_PIN_C4 354
#define CFG_PIN_C5 355
#define CFG_PIN_C6 356
#define CFG_PIN_C7 357
#define CFG_PIN_C8 358
#define CFG_PIN_C9 359
#define CFG_PIN_C10 360
#define CFG_PIN_C11 361
#define CFG_PIN_C12 362
#define CFG_PIN_C13 363
#define CFG_PIN_C14 364
#define CFG_PIN_C15 365
#define CFG_PIN_C16 366
#define CFG_PIN_C17 367
#define CFG_PIN_C18 368
#define CFG_PIN_C19 369
#define CFG_PIN_C20 370
#define CFG_PIN_C21 371
#define CFG_PIN_C22 372
#define CFG_PIN_C23 373
#define CFG_PIN_C24 374
#define CFG_PIN_C25 375
#define CFG_PIN_C26 376
#define CFG_PIN_C27 377
#define CFG_PIN_C28 378
#define CFG_PIN_C29 379
#define CFG_PIN_C30 380
#define CFG_PIN_C31 381

#define CFG_PIN_P0 400
#define CFG_PIN_P1 401
#define CFG_PIN_P2 402
#define CFG_PIN_P3 403
#define CFG_PIN_P4 404
#define CFG_PIN_P5 405
#define CFG_PIN_P6 406
#define CFG_PIN_P7 407
#define CFG_PIN_P8 408
#define CFG_PIN_P9 409
#define CFG_PIN_P10 410
#define CFG_PIN_P11 411
#define CFG_PIN_P12 412
#define CFG_PIN_P13 413
#define CFG_PIN_P14 414
#define CFG_PIN_P15 415
#define CFG_PIN_P16 416
#define CFG_PIN_P17 417
#define CFG_PIN_P18 418
#define CFG_PIN_P19 419
#define CFG_PIN_P20 420
#define CFG_PIN_P21 421
#define CFG_PIN_P22 422
#define CFG_PIN_P23 423
#define CFG_PIN_P24 424
#define CFG_PIN_P25 425
#define CFG_PIN_P26 426
#define CFG_PIN_P27 427
#define CFG_PIN_P28 428
#define CFG_PIN_P29 429
#define CFG_PIN_P30 430
#define CFG_PIN_P31 431

#define CFG_PIN_LORA_MISO 1001
#define CFG_PIN_LORA_MOSI 1002
#define CFG_PIN_LORA_SCK 1003
#define CFG_PIN_LORA_CS 1004
#define CFG_PIN_LORA_BOOT 1005
#define CFG_PIN_LORA_RESET 1006
#define CFG_PIN_IRRXLED 1007
#define CFG_PIN_IRTXLED 1008
#define CFG_PIN_LCD_RESET 1009
#define CFG_PIN_LCD_ENABLE 1010
#define CFG_PIN_LCD_DATALINE4 1011
#define CFG_PIN_LCD_DATALINE5 1012
#define CFG_PIN_LCD_DATALINE6 1013
#define CFG_PIN_LCD_DATALINE7 1014
#define CFG_NUM_LCD_COLUMNS 1015
#define CFG_NUM_LCD_ROWS 1016

//RoboHAT MM1 pinout
#define CFG_PIN_RCC0 1017
#define CFG_PIN_RCC1 1018
#define CFG_PIN_RCC2 1019
#define CFG_PIN_RCC3 1020
#define CFG_PIN_RCC4 1021
#define CFG_PIN_RCC5 1022
#define CFG_PIN_RCC6 1023
#define CFG_PIN_RCC7 1024
#define CFG_PIN_SERVO0 1025
#define CFG_PIN_SERVO1 1026
#define CFG_PIN_SERVO2 1027
#define CFG_PIN_SERVO3 1028
#define CFG_PIN_SERVO4 1029
#define CFG_PIN_SERVO5 1030
#define CFG_PIN_SERVO6 1031
#define CFG_PIN_SERVO7 1032
#define CFG_PIN_SERVO8 1033
#define CFG_PIN_PI_TX 1034
#define CFG_PIN_PI_RX 1035
#define CFG_PIN_GPS_SDA 1036
#define CFG_PIN_GPS_SCL 1037
#define CFG_PIN_GPS_TX 1038
#define CFG_PIN_GPS_RX 1039
#define CFG_PIN_GROVE0 1040
#define CFG_PIN_GROVE1 1041
#define CFG_PIN_SS 1042

// Adafruit Grand Central M4
#define CFG_PIN_D33 = 183
#define CFG_PIN_D34 = 184
#define CFG_PIN_D35 = 185
#define CFG_PIN_D36 = 186
#define CFG_PIN_D37 = 187
#define CFG_PIN_D38 = 188
#define CFG_PIN_D39 = 189
#define CFG_PIN_D40 = 190
#define CFG_PIN_D41 = 191
#define CFG_PIN_D42 = 192
#define CFG_PIN_D43 = 193
#define CFG_PIN_D44 = 194
#define CFG_PIN_D45 = 195
#define CFG_PIN_D46 = 196
#define CFG_PIN_D47 = 197
#define CFG_PIN_D48 = 198
#define CFG_PIN_D49 = 199
#define CFG_PIN_D50 = 259
#define CFG_PIN_D51 = 260
#define CFG_PIN_D52 = 261
#define CFG_PIN_D53 = 262

#define CFG_PIN_TX1 = 263
#define CFG_PIN_TX2 = 264
#define CFG_PIN_TX3 = 265
#define CFG_PIN_RX1 = 266
#define CFG_PIN_RX2 = 267
#define CFG_PIN_RX3 = 268
#define CFG_PIN_SCL1 = 269
#define CFG_PIN_SDA1 = 270
#define CFG_PIN_PCC_D0 = 271
#define CFG_PIN_PCC_D1 = 272
#define CFG_PIN_PCC_D2= 273
#define CFG_PIN_PCC_D3 = 274
#define CFG_PIN_PCC_D4 = 275
#define CFG_PIN_PCC_D5 = 276
#define CFG_PIN_PCC_D6 = 277
#define CFG_PIN_PCC_D7 = 278
#define CFG_PIN_PCC_D8 = 279
#define CFG_PIN_PCC_D9 = 280
#define CFG_PIN_PCC_D10 = 281
#define CFG_PIN_PCC_D11 = 282
#define CFG_PIN_PCC_D12 = 283
#define CFG_PIN_PCC_D13 = 284
#define CFG_PIN_CC_DEN1  = 285
#define CFG_PIN_CC_DEN2 = 286
#define CFG_PIN_CC_CLK = 287
#define CFG_PIN_XCC_CLK = 288


#define CFG_PIN_JDPWR_PRE_SENSE 1100
#define CFG_PIN_JDPWR_GND_SENSE 1101
#define CFG_PIN_JDPWR_PULSE 1102
#define CFG_PIN_JDPWR_OVERLOAD_LED 1103
#define CFG_PIN_JDPWR_ENABLE 1104
#define CFG_PIN_JDPWR_FAULT 1105

#endif
