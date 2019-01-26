namespace net {
    export let logPriority = ConsolePriority.Silent;
    function log(msg: string) {
        console.add(logPriority, `wifi: ` + msg);
    }

    export interface UART {
        write(buffer: Buffer): void;
        readLine(): Buffer;
    }

    export const enum APSecurity {
        Open = 1,
        WPAWPA2Personal = 2,
        WEP = 3,
        WAPEnterprise = 4
    }

    export const enum ATResponseStatus {
        Unknown,
        Ok,
        Error,
        Event
    }

    export class ATProtocol {
        public uart: UART;
        private _info: string;

        constructor(uart: UART) {
            this.uart = uart;
        }

        get info() {
            return this._info;
        }

        public start(): boolean {
            if (!this._info) {
                this.uart.write(hex`11111111`);
                const r = this.read("AT");
                switch (r.status) {
                    case ATResponseStatus.Ok:
                        this._info = r.data;
                        log(`started`);
                        break;
                    case ATResponseStatus.Error:
                        this._info = undefined;
                        log(`error: ${r.errorCode}`);
                        break;
                }
            }
            return !!this._info;
        }

        private write(cmd: string, args?: string[]) {
            this.start(); // ensure started

            let msg = `AT`;
            if (cmd)
                msg += `+${cmd}`;
            if (args) {
                while (args.length && args[args.length - 1] === undefined)
                    args.pop(); // pop optional arguments
                if (args.length > 0)
                    msg += `=${args.join(',')}`;
            }
            msg += "\r\n";
            log(`->${msg}`);
            this.uart.write(control.createBufferFromUTF8(msg));
        }

        private read(command: string, eventHandler?: (r: ATResponse) => void): ATResponse {
            let r: ATResponse;
            while (!r) {
                const msg = this.uart.readLine().toString();
                log(`<-${msg}`);
                r = new ATResponse(msg);
                // is this for this command?
                if (command != r.command) {
                    log(`error, received ${r.command}, expected ${command}`);
                    return new ATResponse(`+ERROR+${command}=-1`);
                }
                // queue events
                if (r.status == ATResponseStatus.Event) {
                    if (eventHandler)
                        eventHandler(r);
                    r = undefined;
                    continue;  // keep reading
                }
            }
            return r;
        }

        private exec(command: string, args?: string[], eventHandler?: (r: ATResponse) => void): ATResponse {
            this.write(command, args);
            return this.read(command, eventHandler);
        }

        ipAddress(): { ip: string, subnet?: string, gateway?: string } {
            const v = this.exec("GETIP").returnValues;
            return {
                ip: v[0],
                subnet: v[1],
                gateway: v[2]
            }
        }

        macAddress(): string {
            return this.exec("GETMAC").data;
        }

        rssi(): number {
            return parseFloat(this.exec("RSSI").data);
        }

        ping(host: string, ttl: number = 0) {
            this.exec("PING", [host, ttl.toString()], ev => log(ev.data)); // handle events
        }

        connect(ssid: string, security: APSecurity, indexOrUserName?: string, key?: string, channel?: string) {
            const r = this.exec("CONN", [ssid, security.toString(), indexOrUserName, key, channel]);
        }

        connectDefault() {
            const r = this.exec("DEFCONN");
        }

        mode(): string {
            return this.exec("MODE").data;
        }

        dismode() {
            this.exec("DISMODE");
        }

        tcpClientSocket(remoteIp: string, remotePort: number, ssl: boolean, autoRecv: boolean): string {
            const r = this.exec("TCPCLI", [remoteIp, remotePort.toString(), ssl ? "1" : "0", autoRecv ? "1" : "0"]);
            return r.data;
        }

        sendData(socketHandler: string, data: string): ATResponse {
            let length = data.length;
            let l = "";
            for (let i = 0; i < 4; ++i) {
                const d = length % 10;
                l = d + l;
                length = ((length - d) / 10) | 0;
            }
            const msg = `\1S${socketHandler}${l}${data}\r\n`;
            this.uart.write(control.createBufferFromUTF8(msg));
            const rmsg = this.uart.readLine().toString();
            const r = new ATResponse(rmsg);
            return r;
        }
    }

    export class ATResponse {
        private msg: string;
        constructor(msg: string) {
            this.msg = msg;
        }

        get ok() {
            return this.msg.indexOf("+OK+") == 0;
        }

        get status(): ATResponseStatus {
            const i = this.msg.indexOf('+', 1);
            const st = this.msg.substr(1, i - 1);
            switch (st) {
                case "OK": return ATResponseStatus.Ok;
                case "ERROR": return ATResponseStatus.Error;
                case "EVT": return ATResponseStatus.Event;
                default: return ATResponseStatus.Unknown;
            }
        }

        get command(): string {
            const start = this.msg.indexOf('+', 1);
            const end = this.msg.indexOf('=', start);
            if (end < 0) return this.msg.substr(start);
            else return this.msg.substr(start, end - start);
        }

        get errorCode(): number {
            const i = this.msg.indexOf(':');
            if (i < 0) return 0;
            else return parseInt(this.msg.substr(i + 1));
        }

        get data(): string {
            if (!this.ok) return "";
            const i = this.msg.indexOf('=');
            if (i < 0) return '';
            else return this.msg.substr(i + 1);
        }

        get returnValues(): string[] {
            if (!this.ok) return [];
            return this.data.split(',');
        }
    }

    class ATNet implements Net {
        public protocol: ATProtocol;
        constructor(protocol: ATProtocol) {
            this.protocol = protocol;
            this.protocol.start();
        }

        connect(host: string, port: number): Socket {
            const id = this.protocol.tcpClientSocket(host, port, true, true);
            if (!id) return undefined;
            return new ATSocket(this.protocol, id);
        }
    }

    class ATSocket implements net.Socket {
        public protocol: ATProtocol;
        public socketHandler: string;
        constructor(protocol: ATProtocol, socketHandler: string) {
            this.protocol = protocol;
            this.socketHandler = socketHandler;
        }

        send(data: string): void {
            this.protocol.sendData(this.socketHandler, data);
        }

        close(): void {

        }

        onOpen(handler: () => void): void {

        }

        onClose(handler: () => void): void {

        }

        onError(handler: () => void): void {

        }

        onMessage(handler: (data: string) => void): void {

        }
    }
}