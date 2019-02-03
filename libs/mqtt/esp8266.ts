namespace net {
    // https://www.espressif.com/sites/default/files/documentation/4a-esp8266_at_instruction_set_en.pdf    

    export class ESP8266Modem extends ATModem {
        constructor(ser: serial.Serial) {
            super(ser);
            this.consolePrefix = "esp";
        }

        reset(): boolean {
            this.set("UART_DEF", [8, 1, 0, 0])
            this.exec("RST");
            pause(2000);
            this.firmwareInfo();
            return r.ok;
        }

        firmwareInfo() {
            const r = this.exec("GMR");
            return r.text();
        }

        setStationMode(): boolean {
            return this.set("CWMODE", [1]).ok;
        }

        connect(ssid: string, pwd: string, bssid?: string): boolean {
            return this.set("CWJAP", [ssid, pwd, bssid]).ok;
        }

        ipAddress() {
            const r = this.exec("CIFSR");
        }

        disconnect(): boolean {
            return this.exec("CWQAP").ok;
        }

        connectionStatus(): ATResponse {
            return this.exec("CIPSTATUS");
        }

        tcpSocket(ssl: boolean, ip: string, port: number, keepAlive?: number): ATResponse {
            const r = this.set("CIPSTART", [ssl ? "SSL" : "TCP", ip, port, keepAlive]);
            return r;
        }

        tcpClose() {
            this.exec("CIPCLOSE");
        }

        sendData(payload: string) {
            const n = payload.length;
            this.ser.writeLine(`AT+CIPSEND=${n}`);
            this.ser.writeString(`>`);
            this.ser.writeLine(payload);
            const r = this.readResponse();
        }
    }

    class ESP8266ATNet implements Net {
        public modem: ESP8266Modem;
        constructor(protocol: ESP8266Modem) {
            this.modem = protocol;
        }

        connect(ssl: boolean, host: string, port: number): Socket {
            return new ESP8266ATSocket(this.modem, ssl, host, port);
        }
    }

    class ESP8266ATSocket implements net.Socket {
        ssl: boolean;
        host: string;
        port: number;
        modem: ESP8266Modem;
        handlers: any;

        conn: ATResponse;

        constructor(modem: ESP8266Modem, ssl: boolean, host: string, port: number) {
            this.ssl = ssl;
            this.host = host;
            this.port = port;
            this.modem = modem;
            this.handlers = {};
        }

        open() {
            this.conn = this.modem.tcpSocket(this.ssl, this.host, this.port);
            if (this.conn.ok)
                this.raise("open");
            else
                this.raise("error");
        }

        send(data: string): void {
            this.modem.sendData(data);
        }

        close(): void {
            this.modem.tcpClose();
            this.raise("close");
        }

        private raise(ev: string) {
            const close = this.handlers[ev] as () => void;
            if (close) close();
        }

        onOpen(handler: () => void): void {
            this.handlers["open"] = handler;
        }

        onClose(handler: () => void): void {
            this.handlers["close"] = handler;
        }

        onError(handler: () => void): void {
            this.handlers["error"] = handler;
        }

        onMessage(handler: (data: string) => void): void {
            this.handlers["message"] = handler;
        }
    }
}