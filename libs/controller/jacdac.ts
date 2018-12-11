namespace jacdac {
    export class ControllerBroadcast extends Broadcast {
        states: JDPacket[];

        constructor() {
            super("ctrl", jacdac.CONTROLLER_DEVICE_CLASS);
            this.states = [];
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            for(let i = 0; i < this.states.length; ++i) {
                if (this.states[i].address == packet.address) {
                    this.states[i] = packet;
                    return true;
                }
            }
            this.states.push(packet);
            return true;
        }

        sendUpdate(dtms: number, btns: controller.Button[]) {
            const buf = control.createBuffer(1);
            let pressed = 0;
            btns.forEach(btn => pressed = pressed | ((btn.isPressed() ? 1 : 0) << btn.id));
            buf[0] = pressed;
            this.sendPacket(buf);
        }
    }

    //% whenUsed
    export const controllerBroadcast = new ControllerBroadcast();
}