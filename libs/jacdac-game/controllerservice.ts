namespace jacdac {
    //% fixedInstances
    export class ControllerService extends Broadcast {
        constructor() {
            super("ctrl", jacdac.CONTROLLER_DEVICE_CLASS, 5);
            this.controlData[0] = JDControllerCommand.ControlServer;
        }

        private connectClient(address: number, serverAddress: number, receivedPlayerIndex: number): number {
            // search existing player index
            for (let i = 1; i < this.controlData.length; ++i)
                if (address == this.controlData[i]) {
                    if (!serverAddress)
                        this.sendPacket(this.controlData);
                    return i;
                }

            this.log(`new player ${toHex8(address)}`);
            const drivers = jacdac.drivers();
            const players = controller.players();
            const ids: number[] = [0, 0, 0, 0, 0]; // player 0 is not used
            players.forEach(p => ids[p.playerIndex] = 1);

            // did it move?
            // clean dead players
            for (let i = 1; i < this.controlData.length; ++i) {
                const ci = this.controlData[i];
                if (ci && !drivers.some(d => d.address == ci)) {
                    this.log(`del ${toHex8(this.controlData[i])} from ${i}`);
                    this.controlData[i] = 0;
                }
            }

            // add new player
            // try 2,3,4 first
            for (let i = 2; i < this.controlData.length; ++i) {
                // if slot is free and there is such a player
                if (this.controlData[i] == 0 && ids[i]) {
                    this.log(`client ${toHex8(address)} -> p${i}`);
                    this.controlData[i] = address;
                    return i;
                }
            }
            // try player 1
            if (this.controlData[1] == 0 && ids[1]) {
                this.log(`${toHex8(address)} -> ${1}`);
                this.controlData[1] = address;
                return 1;
            }

            // no slots available
            this.log(`no player for ${toHex8(address)}`);
            return -1;
        }

        handleControlPacket(pkt: Buffer) {
            const cp = new ControlPacket(pkt);
            const data = cp.data;
            return this.processPacket(cp.address, data);
        }

        handlePacket(pkt: Buffer) {
            const packet = new JDPacket(pkt);
            const data = packet.data;
            return this.processPacket(packet.address, data);
        }

        private processPacket(address: number, data: Buffer): boolean {
            const cmd: JDControllerCommand = data[0];
            switch (cmd) {
                case JDControllerCommand.ControlClient:
                    this.connectClient(address, data[1], data[2]);
                    return true;
                case JDControllerCommand.ClientButtons:
                    return this.processButtonsPacket(address, data);
                default:
                    return true;
            }
        }

        private processButtonsPacket(address: number, data: Buffer) {
            const playerIndex = this.connectClient(address, -1, 0);
            if (playerIndex < 0) {
                this.log(`no player for ${toHex8(address)}`);
                return false;
            }
            const player = controller.players().find(p => p.playerIndex == playerIndex);
            if (!player) {
                this.log(`no player ${player.playerIndex}`);
                return true;
            }
            const state = data[1];
            const btns = player.buttons;
            for (let i = 0; i < btns.length; ++i)
                btns[i].setPressed(!!(state & (1 << (i + 1))));
            return true;
        }

        sendState() {
            this.sendPacket(this.controlData);
        }
    }

    //% fixedInstance whenUsed block="controller service"
    export const controllerService = new ControllerService();

    scene.systemMenu.addEntry(
        () => "jacdac join game",
        () => { },
        false,
        () => {
            // stop server service
            jacdac.controllerService.stop();
            // remove game enterily
            game.popScene();
            // push empty game
            game.pushScene();
            // start client
            console.log(`connecting to server...`);
            jacdac.controllerClient.stateUpdateHandler = function () {
                jacdac.controllerClient.setIsPressed(JDControllerButton.A, controller.A.isPressed());
                jacdac.controllerClient.setIsPressed(JDControllerButton.B, controller.B.isPressed());
                jacdac.controllerClient.setIsPressed(JDControllerButton.Left, controller.left.isPressed());
                jacdac.controllerClient.setIsPressed(JDControllerButton.Up, controller.up.isPressed());
                jacdac.controllerClient.setIsPressed(JDControllerButton.Right, controller.right.isPressed());
                jacdac.controllerClient.setIsPressed(JDControllerButton.Down, controller.down.isPressed());
            }
            game.onPaint(() => {
                if (jacdac.controllerClient.isActive())
                    game.showDialog(
                        `connected`,
                        `player ${jacdac.controllerClient.playerIndex}`);
                else
                    game.showDialog(
                        `disconnected`,
                        `waiting for server`);
            });
            jacdac.controllerClient.start();
        }
    );

    // auto start server
    jacdac.controllerService.start();
    // TODO: fix control packages in broadcast mode
    game.onUpdateInterval(500, () => {
        if (jacdac.controllerService.isStarted)
            jacdac.controllerService.sendState();
    })
}