namespace wifi {
    export interface AccessPoint {
        rssi: number;
        encryption: number;
    }

    const SET_NET_CMD = 0x10
    const SET_PASSPHRASE_CMD = 0x11
    const GET_CONN_STATUS_CMD = 0x20
    const GET_IPADDR_CMD = 0x21
    const GET_MACADDR_CMD = 0x22
    const GET_CURR_SSID_CMD = 0x23
    const GET_CURR_RSSI_CMD = 0x25
    const GET_CURR_ENCT_CMD = 0x26
    const SCAN_NETWORKS = 0x27
    const GET_SOCKET_CMD = 0x3F
    const GET_STATE_TCP_CMD = 0x29
    const DATA_SENT_TCP_CMD = 0x2A
    const AVAIL_DATA_TCP_CMD = 0x2B
    const GET_DATA_TCP_CMD = 0x2C
    const START_CLIENT_TCP_CMD = 0x2D
    const STOP_CLIENT_TCP_CMD = 0x2E
    const GET_CLIENT_STATE_TCP_CMD = 0x2F
    const DISCONNECT_CMD = 0x30
    const GET_IDX_RSSI_CMD = 0x32
    const GET_IDX_ENCT_CMD = 0x33
    const REQ_HOST_BY_NAME_CMD = 0x34
    const GET_HOST_BY_NAME_CMD = 0x35
    const START_SCAN_NETWORKS = 0x36
    const GET_FW_VERSION_CMD = 0x37
    const PING_CMD = 0x3E
    const SEND_DATA_TCP_CMD = 0x44
    const GET_DATABUF_TCP_CMD = 0x45
    const START_CMD = 0xE0
    const END_CMD = 0xEE
    const ERR_CMD = 0xEF
    const REPLY_FLAG = 1 << 7
    const CMD_FLAG = 0
    const WL_NO_SHIELD = 0xFF
    const WL_NO_MODULE = 0xFF
    const WL_IDLE_STATUS = 0
    const WL_NO_SSID_AVAIL = 1
    const WL_SCAN_COMPLETED = 2
    const WL_CONNECTED = 3
    const SOCKET_CLOSED = 0
    const SOCKET_LISTEN = 1
    const SOCKET_SYN_SENT = 2
    const SOCKET_SYN_RCVD = 3
    const SOCKET_ESTABLISHED = 4
    const SOCKET_FIN_WAIT_1 = 5
    const SOCKET_FIN_WAIT_2 = 6
    const SOCKET_CLOSE_WAIT = 7
    const SOCKET_CLOSING = 8
    const SOCKET_LAST_ACK = 9
    const SOCKET_TIME_WAIT = 10
    const TCP_MODE = 0
    const UDP_MODE = 1
    const TLS_MODE = 2

    export class ESPSPIControl {
        _gpio0: DigitalInOutPin;
        _debug: boolean;
        _cs: DigitalInOutPin;
        _ready: DigitalInOutPin;
        _reset: DigitalInOutPin;
        _spi: SPI;
        _sbuf: Buffer;

        constructor() {
            this._sbuf = control.createBuffer(1);
        }

        private log(priority: number, msg: string) {
            console.log(msg);
        }

        public reset(): void {
            this._gpio0.digitalRead();
            this.log(0, "reset ESP32")

            // not bootload mode
            this._gpio0.digitalWrite(true);
            this._cs.digitalWrite(true);
            this._reset.digitalWrite(false);
            // reset
            pause(10);
            this._reset.digitalWrite(true);
            // wait for it to boot up
            pause(750);
            this._gpio0.digitalRead();
        }

        private wait_for_ready() {
            pauseUntil(() => this._ready.digitalRead(), 10000);
        }

        private readByte(): number {
            this._spi.transfer(undefined, this._sbuf);
            return this._sbuf[0]
        }

        private checkData(desired: number): boolean {
            const r = this.readByte()
            if (r != desired)
                control.fail(`Expected ${desired} but got ${r}`)
            return false;
        }

        private send_command(cmd: number,
            params: Buffer[] = undefined,
            param_len_16 = false) {

            params = params || [];

            // compute buffer size
            let n = 3; // START_CMD, cmd, length
            params.forEach(param => {
                n += 1 + (param_len_16 ? 1 : 0) + param.length;
            })
            n += 1; // END_CMD
            // padding
            while (n % 4) n++;

            const packet = control.createBuffer(n);
            let k = 0;
            packet[k++] = START_CMD;
            packet[k++] = cmd & ~REPLY_FLAG;
            packet[k++] = params.length;

            params.forEach(param => {
                if (param_len_16)
                    packet[k++] = (param.length >> 8) & 0xFF;
                packet[k++] = param.length & 0xFF;
                packet.write(k, param);
                k += param.length;
            })
            packet[k++] = END_CMD;
            while (k < n)
                packet[k++] = 0xff;

            this.wait_for_ready();
            this._spi.transfer(packet, undefined);
        }

        private wait_response_cmd(cmd: number, num_responses: number = undefined, param_len_16 = false) {
            this.wait_for_ready();

            let responses: Buffer[] = []
            this._spi.wait_spi_char(START_CMD);
            this.checkData(cmd | REPLY_FLAG)
            if (num_responses !== undefined)
                this.checkData(num_responses)
            else
                num_responses = this.readByte();
            for (let num = 0; num < num_responses; ++num) {
                let param_len = this.readByte()
                if (param_len_16) {
                    param_len <<= 8
                    param_len |= this.readByte()
                }
                this.log(1, `\tParameter #${num} length is ${param_len}`)
                let response = control.createBuffer(param_len);
                this._spi.transfer(undefined, response);
                responses.push(response);
            }
            this.checkData(END_CMD);
            this.log(1, `responses ${responses.length}`);
            return responses
        }

        private send_command_get_response(cmd: number, params: Buffer[] = undefined,
            reply_params = 1, sent_param_len_16 = false,
            recv_param_len_16 = false) {
            this.send_command(cmd, params, sent_param_len_16)
            return this.wait_response_cmd(cmd, reply_params, recv_param_len_16)
        }

        get status(): number {
            const resp = this.send_command_get_response(GET_CONN_STATUS_CMD)
            this.log(0, `Status: ${resp[0][0]}`);

            // one byte response
            return resp[0][0];
        }

        get firmwareVersion(): string {
            let resp = this.send_command_get_response(GET_FW_VERSION_CMD)
            return resp[0].toString();
        }

        get MACAddress(): string {
            let resp = this.send_command_get_response(GET_MACADDR_CMD, [hex`ff`])
            return resp[0].toString();
        }

        public startScanNetworks(): void {
            let resp = this.send_command_get_response(START_SCAN_NETWORKS)
            if (resp[0][0] != 1) {
                control.fail("Failed to start AP scan")
            }

        }

        private getScanNetworks(): AccessPoint[] {
            this.send_command(SCAN_NETWORKS)
            let names = this.wait_response_cmd(SCAN_NETWORKS)
            this.log(2, `SSID names:${names}`)
            let APs = []
            for ([let i, let name] of enumerate(names)) {
                const AP = { TODO: Dict }
                let rssiMsg = this.send_command_get_response(GET_IDX_RSSI_CMD, [[i]])[0]
                const rssi = struct.unpack("<i", rssi)[0]
                let encr = this.send_command_get_response(GET_IDX_ENCT_CMD, [[i]])[0]
                const encryption = encr[0]
                APs.push({ rssi: rssi; encryption: encryption });
            }
            return APs;
        }

        public scanNetworks(): AccessPoint[] {
            this.startScanNetworks()
            let APs: AccessPoint[];
            // attempts
            for (let _ = 0; _ < 10; ++_) {
                pause(2000)
                APs = this.getScanNetworks()
                if (APs.length) {
                    break
                }

            }
            return APs
        }

        public wifiSetNetwork(ssid: string): void {
            const ssidbuf = control.createBufferFromUTF8(ssid);
            let resp = this.send_command_get_response(SET_NET_CMD, [ssidbuf])
            if (resp[0][0] != 1) {
                control.fail("Failed to set network")
            }
        }

        public wifiSetPassphrase(ssid: string, passphrase: string): void {
            const ssidbuf = control.createBufferFromUTF8(ssid);
            const passphrasebuf = control.createBufferFromUTF8(passphrase);
            let resp = this.send_command_get_response(SET_PASSPHRASE_CMD, [ssidbuf, passphrasebuf])
            if (resp[0][0] != 1) {
                control.fail("Failed to set passphrase")
            }

        }

        get ssid(): Buffer {
            let resp = this.send_command_get_response(GET_CURR_SSID_CMD, [hex`ff`])
            return resp[0]
        }

        get rssi(): number {
            let resp = this.send_command_get_response(GET_CURR_RSSI_CMD, [hex`ff`])
            return pins.unpackBuffer("<i", resp[0])[0]
        }

        get networkData(): any {
            let resp = this.send_command_get_response(GET_IPADDR_CMD, [hex`ff`])
            return resp[0];
        }

        get ipAddress(): string {
            return this.networkData["ip_addr"]
        }

        get isConnected(): boolean {
            return this.status == WL_CONNECTED
        }

        public connectAP(ssid: string, password: string): void {
            if (password) {
                this.wifiSetPassphrase(ssid, password)
            } else {
                this.wifiSetNetwork(ssid)
            }

            // retries
            for (let i = 0; i < 10; ++i) {
                let stat = this.status
                if (stat == WL_CONNECTED) {
                    return;
                }

                pause(1000)
            }
            console.log("connection error");
        }

        public hostByName(hostname: string): Buffer {
            let resp = this.send_command_get_response(REQ_HOST_BY_NAME_CMD, [control.createBufferFromUTF8(hostname)])
            if (resp[0][0] != 1) {
                control.fail("Failed to request hostname")
            }

            resp = this.send_command_get_response(GET_HOST_BY_NAME_CMD)
            return resp[0];
        }

        public ping(dest: string, ttl: number = 250): number {
            // convert to IP address
            let ip = this.hostByName(dest)

            // ttl must be between 0 and 255
            ttl = Math.max(0, Math.min(ttl | 0, 255))
            let resp = this.send_command_get_response(PING_CMD, [ip, [ttl]])
            return struct.unpack("<H", resp[0])[0]
        }

        public get_socket(): number {
            let resp = this.send_command_get_response(GET_SOCKET_CMD)
            let r = resp[0][0]
            if (r == 255) {
                control.fail("No sockets available")
            }
            this.log(0, `new socket ${r}`)
            return r;
        }

        public socketOpen(socket_num: number, dest: Buffer, port: number, conn_mode: number = TCP_MODE): void {
            let port_param = pins.packBuffer(">H", [port])
            // use the 5 arg version
            //if (isinstance(dest, str)) {
            //      dest = pins.createBufferFromArray(dest, "utf-8")
            let resp = this.send_command_get_response(START_CLIENT_TCP_CMD, [dest, hex`00000000`, port_param, [socket_num], [conn_mode]])
            //      } else {
            // ip address, use 4 arg vesion
            //            resp = this.send_command_get_response(START_CLIENT_TCP_CMD, [dest, port_param, [socket_num], [conn_mode]])
            //    }

            if (resp[0][0] != 1) {
                control.fail("Could not connect to remote server")
            }

        }

        public socketStatus(socket_num: number): number {
            const so = control.createBufferFromArray([socket_num]);
            let resp = this.send_command_get_response(GET_CLIENT_STATE_TCP_CMD, [so])
            return resp[0][0]
        }

        public socketConnected(socket_num: number): boolean {
            return this.socketStatus(socket_num) == SOCKET_ESTABLISHED
        }

        public socketWrite(socket_num: number, buffer: Buffer): void {
            const so = control.createBufferFromArray([socket_num]);
            let resp = this.send_command_get_response(SEND_DATA_TCP_CMD, [so, buffer])
            let sent = resp[0][0]
            if (sent != buffer.length) {
                control.fail(`Failed to send ${buffer.length} bytes (sent ${sent})`)
            }

            resp = this.send_command_get_response(DATA_SENT_TCP_CMD, [so])
            if (resp[0][0] != 1) {
                control.fail("Failed to verify data sent")
            }

        }

        public socketAvailable(socket_num: number): boolean {
            const so = control.createBufferFromArray([socket_num]);
            let resp = this.send_command_get_response(AVAIL_DATA_TCP_CMD, [so])
            return struct.unpack("<H", resp[0])[0]
        }

        public socketRead(socket_num: number, size: number): Buffer {
            const so = control.createBufferFromArray([socket_num]);
            const si = control.createBufferFromArray([size]);
            let resp = this.send_command_get_response(GET_DATABUF_TCP_CMD, [so, si])
            return resp[0]
        }

        public socketConnect(socket_num: number, dest: Buffer, port: number, conn_mode: number = TCP_MODE): boolean {
            this.socketOpen(socket_num, dest, port, conn_mode)
            pauseUntil(() => this.socketConnected(socket_num), 3000);
            if (!this.socketConnected(socket_num))
                control.fail("Failed to establish connection")
        }

        public socketClose(socket_num: number): void {
            const so = control.createBufferFromArray([socket_num]);
            let resp = this.send_command_get_response(STOP_CLIENT_TCP_CMD, [so])
            if (resp[0][0] != 1) {
                control.fail("Failed to close socket")
            }
        }
    }

}
