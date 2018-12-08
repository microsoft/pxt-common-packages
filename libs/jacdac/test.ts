game.consoleOverlay.setVisible(true);
namespace jacdac {
    const st = control.millis();
    export class TestService extends Service {
        constructor() {
            super("serv", 3000);
            this.start();
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const time = packet.data.getNumber(NumberFormat.Int32LE, 0);
            console.log(`time ${time}`);

            const t = control.millis() - st;
            const buf = control.createBuffer(4);
            buf.setNumber(NumberFormat.Int32LE, 0, t - time);
            this.sendPacket(buf);
            return true;
        }
    }
    export class TestClient extends Client {
        constructor() {
            super("client", 3000);
            this.start();
        }

        ping() {
            const buf = control.createBuffer(4);
            const t = control.millis() - st;
            console.log(`send time ${t}`);
            buf.setNumber(NumberFormat.Int32LE, 0, t);
            this.sendPacket(buf);
        }

        handlePacket(pkt: Buffer): boolean {
            const packet = new JDPacket(pkt);
            const time = packet.data.getNumber(NumberFormat.Int32LE, 0);
            console.log(`time ${time}`);
            return true;
        }
    }
}
const service = new jacdac.TestService();
const client = new jacdac.TestClient();
forever(() => {
    client.ping();
    pause(500);
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
})
