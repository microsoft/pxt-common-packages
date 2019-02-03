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
        public onEvent: (msg: string) => void;
        private ser: serial.Serial;
        constructor(ser: serial.Serial) {
            this.ser = ser;
            this.ser.serialDevice.setRxBufferSize(254);
        }

        private log(msg: string) {
            console.add(this.consolePriority, `${this.consolePrefix}> ${msg}`);
        }

        private readLine(): string {
            const prefix = "+IPD";
            let l : string;
            do {
                l = this.ser.readLine();
                // +IPD,n:xxxxxxxxxx	
                if (l && l.substr(0, prefix.length) == prefix) {
                    if (this.onEvent)
                        this.onEvent(l);
                    l = undefined;
                }
            } while (!l);
            return l;
        }

        private readResponse(msg: string): ATResponse {
            this.log(msg);
            this.ser.writeLine(msg);
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
            return this.readResponse(msg);
        }

        query(command: string) {
            const msg = `AT+${command}?`;
            return this.readResponse(msg);
        }

        set(command: string, args: (number | string)[]) {
            const a = args
                .map(v => v instanceof number ? v.toString() : `"${(v as string).replace(',', "\\,").replace('"', `\\"`)}`)
                .join(',');
            const msg = `AT+${command}=${}`;
            return this.readResponse(msg);
        }

        exec(command: string) {
            const msg = `AT+${command}`;
            return this.readResponse(msg);
        }
    }
}