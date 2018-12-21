namespace controller {
    //% fixedInstance whenUsed block="A"
    export const A = new Button(ControllerButton.A, -1);
    //% fixedInstance whenUsed block="B"
    export const B = new Button(ControllerButton.B, -1);
    //% fixedInstance whenUsed block="left"
    export const left = new Button(ControllerButton.Left, -1);
    //% fixedInstance whenUsed block="up"
    export const up = new Button(ControllerButton.Up, -1);
    //% fixedInstance whenUsed block="right"
    export const right = new Button(ControllerButton.Right, -1);
    //% fixedInstance whenUsed block="down"
    export const down = new Button(ControllerButton.Down, -1);
    //% fixedInstance whenUsed block="menu"
    export const menu = new Button(6, -1);

    //% fixedInstance whenUsed block="player 2"
    export const controller2 = new Controller(8, undefined);
    //% fixedInstance whenUsed block="player 3"
    export const controller3 = new Controller(16, undefined);
    //% fixedInstance whenUsed block="player 4"
    export const controller4 = new Controller(24, undefined);
    //% fixedInstance whenUsed block="player 1"
    export const controller1 = new Controller(-1, [left, up, right, down, A, B, menu]);
}