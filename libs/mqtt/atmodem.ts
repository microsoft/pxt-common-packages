namespace net {
    export class ATResponse {
        lines: string[];
        error: boolean;
        constructor() {
            this.lines = [];
            this.error = false;
        }

        get ok(): boolean {
            return !this.error;
        }

        text(): string {
            return this.lines.join(', ');
        }

        toString() {
            return this.error ? `error` : `ok`;
        }
    }

    export class ATModem {
        public consolePriority = ConsolePriority.Silent;
        public consolePrefix = "at";
        protected ser: serial.Serial;
        constructor(ser: serial.Serial) {
            this.ser = ser;
            this.ser.serialDevice.setRxBufferSize(254);
        }

        private log(msg: string) {
            console.add(this.consolePriority, `${this.consolePrefix}> ${msg}`);
        }

        protected DATA_PREFIX = "+IPD,";
        private readLine(): string {
            let l: string;
            do {
                l = this.ser.readLine();
                if (l && l.substr(0, this.DATA_PREFIX.length) == this.DATA_PREFIX) {
                    this.handlePayload(l);
                    l = undefined;
                }
            } while (!l);
            return l;
        }

        private handlePayload(msg: string) {
            // +IPD,n:xxxxxxxxxx
            const icol = msg.indexOf(':', this.DATA_PREFIX.length);
            const n = parseInt(msg.substr(this.DATA_PREFIX.length, icol - this.DATA_PREFIX.length));
            let data = msg.substr(icol + 1);
            if (data.length > n)
                data = data.substr(0, n);

            if (data.length == n)
                this.handleData(data);
        }

        protected handleData(data: string) {

        }

        private command(msg: string): ATResponse {
            this.log(msg);
            this.ser.writeLine(msg);
            return this.readResponse();
        }

        protected readResponse(): ATResponse {
            const r = new ATResponse();
            do {
                const l = this.readLine();
                if (l == "OK") break;
                else if (l == "ERROR") {
                    r.error = true;
                    break;
                } else if (l)
                    r.lines.push(l);
            } while (true);

            this.log(`-> ${r.toString()}`)
            return r;
        }

        test(command: string) {
            const msg = `AT+${command}=?`;
            return this.command(msg);
        }

        query(command: string) {
            const msg = `AT+${command}?`;
            return this.command(msg);
        }

        set(command: string, args: (number | string)[]) {
            const a = args
                .map(v => v instanceof number ? v.toString() : `"${(v as string).replace(',', "\\,").replace('"', `\\"`)}`)
                .join(',');
            const msg = `AT+${command}=${}`;
            return this.command(msg);
        }

        exec(command: string) {
            const msg = `AT+${command}`;
            return this.command(msg);
        }
    }
}