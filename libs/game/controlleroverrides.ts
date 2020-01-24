namespace controller {
    //% fixedInstance whenUsed block="{id:controller}A"
    export const A = new Button(ControllerButton.A, DAL.CFG_PIN_BTN_A);
    //% fixedInstance whenUsed block="{id:controller}B"
    export const B = new Button(ControllerButton.B, DAL.CFG_PIN_BTN_B);
    //% fixedInstance whenUsed block="left"
    export const left = new Button(ControllerButton.Left, DAL.CFG_PIN_BTN_LEFT);
    //% fixedInstance whenUsed block="up"
    export const up = new Button(ControllerButton.Up, DAL.CFG_PIN_BTN_UP);
    //% fixedInstance whenUsed block="right"
    export const right = new Button(ControllerButton.Right, DAL.CFG_PIN_BTN_RIGHT);
    //% fixedInstance whenUsed block="down"
    export const down = new Button(ControllerButton.Down, DAL.CFG_PIN_BTN_DOWN);
    //% fixedInstance whenUsed block="menu"
    export const menu = new Button(7, DAL.CFG_PIN_BTN_MENU);

    //% fixedInstance whenUsed block="player 2"
    export const player2 = new Controller(2, undefined);
    //% fixedInstance whenUsed block="player 3"
    export const player3 = new Controller(3, undefined);
    //% fixedInstance whenUsed block="player 4"
    export const player4 = new Controller(4, undefined);
    //% fixedInstance whenUsed block="player 1"
    export const player1 = controller._player1();
}