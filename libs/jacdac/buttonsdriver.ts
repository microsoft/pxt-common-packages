namespace jacdac {
    const BUTTONS_DRIVER_CLASS = 42;

    enum ButtonsDriverCommand {
    }

    export class TouchButtonsDriver extends JacDacStreamingPairableDriver {
        private _buttons: TouchButton[];
        constructor(buttons?: TouchButton[]) {
            super(!!buttons, BUTTONS_DRIVER_CLASS);
            this._buttons = buttons;
        }

        protected handleHostPacket(packet: JDPacket): boolean {
            const command = <ButtonsDriverCommand>packet.getNumber(NumberFormat.UInt16LE, 0);

            this.startStreaming();

            return true;
        }

        protected streamTick() {
            // read button state and send over
            const pkt = control.createBuffer(1 + this._buttons.length);
            pkt.setNumber(NumberFormat.UInt8LE, 0, 1);
            for(let i = 0; i < this._buttons.length; ++i)
                pkt.setNumber(NumberFormat.UInt8LE, i + 1, this._buttons[i].value());
            this.sendPacket(pkt);
            return true;
        }
    }
}