namespace jacdac {
    export class ConsoleClient extends Client {
        minPriority = JDConsolePriority.Silent;

        onMessageReceived: (priority: number, dev: Device, message: string) => void;

        constructor() {
            super("conc", jd_class.LOGGER, null);
            this.broadcast = true
            this.minPriority = JDConsolePriority.Silent; // drop all packets by default
            onAnnounce(() => {
                // on every announce, if we're listening to anything, tell
                // everyone to log
                if (this.minPriority < JDConsolePriority.Silent)
                    JDPacket.packed(JDConsoleCommand.SetMinPriority, "i", [this.minPriority])
                        .sendAsMultiCommand(this.serviceClass)
            })
        }

        handlePacket(packet: JDPacket) {
            let pri = packet.service_command - JDConsoleCommand.MessageDbg
            if (0 <= pri && pri <= JDConsolePriority.Silent) {
                if (pri < this.minPriority)
                    return;

                // send message to console
                const deviceName = this.currentDevice.toString();
                const innerMsg = packet.data.toString()
                // the initial ':' is used as marker to avoid infinite console repeat
                const msg = `:${deviceName}> ${innerMsg}`;
                switch (pri) {
                    case JDConsolePriority.Debug: console.debug(msg); break;
                    case JDConsolePriority.Log: console.log(msg); break;
                    case JDConsolePriority.Warning: console.warn(msg); break;
                    case JDConsolePriority.Error: console.error(msg); break;
                }
                if (this.onMessageReceived)
                    this.onMessageReceived(pri, this.currentDevice, innerMsg);

            }
        }

    }

}