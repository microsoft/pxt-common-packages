namespace jacdac {
    //% fixedInstances
    export class ControllerService extends Broadcast {
        promptedServers: string[];
        prompting: boolean;
        players: string[];

        constructor() {
            super("ctrl", jd_class.CONTROLLER);
            this.players = [];
            this.promptedServers = [];
            this.prompting = false;
        }

        private connectClient(address: string, serverAddress: string, receivedPlayerIndex: number): number {
            // fast path: check if player is current
            if (!!serverAddress
                && receivedPlayerIndex > 0
                && receivedPlayerIndex < this.players.length
                && address == this.players[receivedPlayerIndex]) {
                // player index and server address match
                return receivedPlayerIndex;
            }

            // search existing player index
            for (let i = 1; i < this.players.length; ++i)
                if (address == this.players[i]) {
                    if (!serverAddress)
                        this.sendState()
                    return i;
                }

            this.log(`new player ${(address)}`);
            const devices = jacdac.devices();
            const players = controller.players();
            const ids: number[] = [0, 0, 0, 0, 0]; // player 0 is not used
            players.forEach(p => ids[p.playerIndex] = 1);

            // did it move?
            // clean dead players
            for (let i = 1; i < this.players.length; ++i) {
                const ci = this.players[i];
                /*
                if (ci && !devices.some(d => d.device_address == ci)) {
                    this.log(`del ${toHex8(this.controlData[i])} from ${i}`);
                    this.controlData[i] = 0;
                    const p = players.find(p => p.playerIndex == i);
                    if (p) p.connected = false;
                }
                */
            }

            // add new player
            // try receivedPlayerIndex first
            if (receivedPlayerIndex
                && !this.players[receivedPlayerIndex]
                && ids[receivedPlayerIndex]) {
                this.log(`client ${(address)} -> p${receivedPlayerIndex}`);
                this.players[receivedPlayerIndex] = address;
                return receivedPlayerIndex;
            }

            // try other positions 2,3,4 first
            for (let i = 2; i < this.players.length; ++i) {
                // if slot is free and there is such a player
                if (!this.players[i] && ids[i]) {
                    this.log(`client ${(address)} -> p${i}`);
                    this.players[i] = address;
                    return i;
                }
            }
            // try player 1
            if (!this.players[1] && ids[1]) {
                this.log(`client ${(address)} -> ${1}`);
                this.players[1] = address;
                return 1;
            }

            // no slots available
            this.log(`no player for ${(address)}`);
            return -1;
        }

        handlePacket(packet: JDPacket): void {
            const address = packet.device_identifier
            const data = packet.data
            switch (packet.service_command) {
                case JDControllerCommand.ControlClient:
                    this.connectClient(address, data.slice(0, 8).toHex(), data[8]);
                    return
                case JDControllerCommand.ClientButtons:
                    return this.processClientButtons(address, data);
                case JDControllerCommand.ControlServer:
                    return this.processControlServer(address, data);
                default:
                    return
            }
        }

        private processControlServer(address: string, data: Buffer): void {
            // already prompting for another server
            if (this.prompting) return;
            // so there's another server on the bus,
            // if we haven't done so yet, prompt the user if he wants to join the game
            const device = jacdac.devices().find(d => d.deviceId == address);
            if (!device) // can't find any device at that address
                return;

            // check if prompted already
            if (this.promptedServers.indexOf(device.deviceId) >= 0)
                return;

            this.prompting = true;
            control.runInParallel(() => {
                const join = this.askJoin(device);
                if (join)
                    joinGame();
                this.prompting = false;
            });
        }

        private hasPlayers(): boolean {
            for (let i = 1; i < this.players.length; ++i)
                if (this.players[i]) return true;
            return false;
        }

        private askJoin(device: Device): boolean {
            game.eventContext(); // initialize the game
            control.pushEventContext();
            game.showDialog("Arcade Detected", "Join?", "A = OK, B = CANCEL");
            let answer: boolean = null;
            controller.A.onEvent(ControllerButtonEvent.Pressed, () => answer = true);
            controller.B.onEvent(ControllerButtonEvent.Pressed, () => answer = false);
            pauseUntil(() =>
                // user answered
                answer !== null
                // server got joined
                || this.hasPlayers()
                // other driver dissapeared
                || !jacdac.devices().find(d => d.deviceId == device.deviceId)
            );
            // wait until we have an answer or the service
            control.popEventContext();

            // cache user answer
            if (answer !== null)
                this.promptedServers.push(device.deviceId);

            // check that we haven't been join by then
            return !!answer
                && !this.hasPlayers()
                && !!jacdac.devices().find(d => d.deviceId == device.deviceId);
        }

        private processClientButtons(address: string, data: Buffer): void {
            const playerIndex = this.connectClient(address, null, 0);
            if (playerIndex < 0) {
                this.log(`no player for ${address}`);
                return;
            }
            const player = controller.players().find(p => p.playerIndex == playerIndex);
            if (!player) {
                this.log(`no player ${player.playerIndex}`);
                return;
            }
            const state = data[1];
            const btns = player.buttons;
            for (let i = 0; i < btns.length; ++i)
                btns[i].setPressed(!!(state & (1 << (i + 1))));
            return;
        }

        sendState() {
            const d = Buffer.create(this.players.length * 8)
            let i = 0
            for (let p of this.players) {
                if (p)
                    d.write(i, Buffer.fromHex(p))
                i += 8
            }
            this.sendReport(JDPacket.from(CMD_ADVERTISEMENT_DATA, d))
        }
    }

    //% fixedInstance whenUsed block="controller service"
    export const controllerService = new ControllerService();

    function joinGame() {
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
                    `connect jacdac`);
        });
        jacdac.controllerClient.start();
    }
    // auto start server
    // jacdac.controllerService.start();
    // // TODO: fix control packages in broadcast mode
    // control.runInParallel(function () {
    //     while (jacdac.controllerService.isStarted) {
    //         jacdac.controllerService.sendState();
    //         pause(500);
    //     }
    // })
}