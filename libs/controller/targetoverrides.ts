namespace controller {
    //% fixedInstance whenUsed block="player 2"
    export const player2 = new Controller(8);
    //% fixedInstance whenUsed block="player 1"
    export const player1 = new Controller(1);
    //% fixedInstance whenUsed block="player 3"
    export const player3 = new Controller(16);
    //% fixedInstance whenUsed block="player 4"
    export const player4 = new Controller(24);

    //% fixedInstance whenUsed block="left"
    export const left = controller.player1.left;
    //% fixedInstance whenUsed block="up"
    export const up = controller.player1.up;
    //% fixedInstance whenUsed block="right"
    export const right = controller.player1.right;
    //% fixedInstance whenUsed block="down"
    export const down = controller.player1.down;
    //% fixedInstance whenUsed block="A"
    export const A = controller.player1.A;
    //% fixedInstance whenUsed block="B"
    export const B = controller.player1.B;
    //% fixedInstance whenUsed block="menu"
    export const menu = controller.player1.menu;
}