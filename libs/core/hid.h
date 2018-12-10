#ifndef __PXT_HID_H
#define __PXT_HID_H

#include "pxt.h"

enum class KeyboardMediaKey
{
    //% block="mute"
    Mute,
    //% block="volume up"
    VolumeUp,
    //% block="volume down"
    VolumeDown,
    //% block="play pause"
    PlayPause,
    //% block="stop"
    Stop,
    //% block="previous track"
    PreviousTrack,
    //% block="next track"
    NextTrack,
    //% block="mail"
    Mail,
    //% block="calculator"
    Calculator,
    //% block="web search"
    WebSearch,
    //% block="web home"
    WebHome,
    //% block="web favourites"
    WebFavourites,
    //% block="web refresh"
    WebRefresh,
    //% block="web stop"
    WebStop,
    //% block="web forward"
    WebForward,
    //% block="web back"
    WebBack
};

enum class KeyboardFunctionKey
{
    //% block="F1"
    F1Key,  
    //% block="F2"
    F2Key,
    //% block="F3"
    F3Key,
    //% block="F4"
    F4Key, 
    //% block="F5"
    F5Key,
    //% block="F6"
    F6Key,
    //% block="F7"
    F7Key,
    //% block="F8"
    F8Key,
    //% block="F9"
    F9Key,
    //% block="F0"
    F10Key,
    //% block="F11"
    F11Key,
    //% block="F12"
    F12Key,

    //% block="print screen"
    PrintScreen,
    //% block="scroll lock"
    ScrollLock,
    //% block="pause"
    Pause,
    //% block="insert"
    Insert,
    //% block="home"
    Home,
    //% block="page up"
    PageUp,
    //% block="delete"
    DeleteForward,
    //% block="end"
    End,
    //% block="page down"
    PageDown,

    //% block="right arrow"
    RightArrow,
    //% block="left arrow"
    LeftArrow,
    //% block="down arrow"
    DownArrow,
    //% block="up arrow"
    UpArrow,
};

enum class KeyboardKeyEvent {
    //% block="press"
    Press,
    //% block="up"
    Up,
    //% block="down"
    Down
};

#endif