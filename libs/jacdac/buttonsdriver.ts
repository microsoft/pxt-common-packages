namespace jacdac {
    const BUTTONS_DRIVER_CLASS = 42;

    enum ButtonsDriverCommand {
    }

    export class TouchButtonsDriver extends JacDacPairableDriver {
        private _buttons: TouchButton[];
        constructor(buttons?: TouchButton[]) {
            super(!!buttons, BUTTONS_DRIVER_CLASS);
            this._buttons = buttons;
        }

        protected handleHostPacket(packet: JDPacket): boolean {
            const command = <ButtonsDriverCommand>packet.getNumber(NumberFormat.UInt16LE, 0);

            return true;
        }
    }
}