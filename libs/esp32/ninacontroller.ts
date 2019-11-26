namespace esp32 {
    // pylint: disable=bad-whitespace
    const _SET_NET_CMD = 0x10
    const _SET_PASSPHRASE_CMD = 0x11
    const _SET_DEBUG_CMD = 0x1A
    const _GET_TEMP_CMD = 0x1B
    const _GET_CONN_STATUS_CMD = 0x20
    const _GET_IPADDR_CMD = 0x21
    const _GET_MACADDR_CMD = 0x22
    const _GET_CURR_SSID_CMD = 0x23
    const _GET_CURR_RSSI_CMD = 0x25
    const _GET_CURR_ENCT_CMD = 0x26
    const _SCAN_NETWORKS = 0x27
    const _GET_SOCKET_CMD = 0x3F
    const _GET_STATE_TCP_CMD = 0x29
    const _DATA_SENT_TCP_CMD = 0x2A
    const _AVAIL_DATA_TCP_CMD = 0x2B
    const _GET_DATA_TCP_CMD = 0x2C
    const _START_CLIENT_TCP_CMD = 0x2D
    const _STOP_CLIENT_TCP_CMD = 0x2E
    const _GET_CLIENT_STATE_TCP_CMD = 0x2F
    const _DISCONNECT_CMD = 0x30
    const _GET_IDX_RSSI_CMD = 0x32
    const _GET_IDX_ENCT_CMD = 0x33
    const _REQ_HOST_BY_NAME_CMD = 0x34
    const _GET_HOST_BY_NAME_CMD = 0x35
    const _START_SCAN_NETWORKS = 0x36
    const _GET_FW_VERSION_CMD = 0x37
    const _PING_CMD = 0x3E
    const _SEND_DATA_TCP_CMD = 0x44
    const _GET_DATABUF_TCP_CMD = 0x45
    const _SET_ENT_IDENT_CMD = 0x4A
    const _SET_ENT_UNAME_CMD = 0x4B
    const _SET_ENT_PASSWD_CMD = 0x4C
    const _SET_ENT_ENABLE_CMD = 0x4F
    const _SET_PIN_MODE_CMD = 0x50
    const _SET_DIGITAL_WRITE_CMD = 0x51
    const _SET_ANALOG_WRITE_CMD = 0x52
    const _START_CMD = 0xE0
    const _END_CMD = 0xEE
    const _ERR_CMD = 0xEF
    const _REPLY_FLAG = 1 << 7
    const _CMD_FLAG = 0
    export const SOCKET_CLOSED = 0
    export const SOCKET_LISTEN = 1
    export const SOCKET_SYN_SENT = 2
    export const SOCKET_SYN_RCVD = 3
    export const SOCKET_ESTABLISHED = 4
    export const SOCKET_FIN_WAIT_1 = 5
    export const SOCKET_FIN_WAIT_2 = 6
    export const SOCKET_CLOSE_WAIT = 7
    export const SOCKET_CLOSING = 8
    export const SOCKET_LAST_ACK = 9
    export const SOCKET_TIME_WAIT = 10
    export const WL_NO_SHIELD = 0xFF
    export const WL_NO_MODULE = 0xFF
    export const WL_IDLE_STATUS = 0
    export const WL_NO_SSID_AVAIL = 1
    export const WL_SCAN_COMPLETED = 2
    export const WL_CONNECTED = 3
    export const WL_CONNECT_FAILED = 4
    export const WL_CONNECTION_LOST = 5
    export const WL_DISCONNECTED = 6
    export const WL_AP_LISTENING = 7
    export const WL_AP_CONNECTED = 8
    export const WL_AP_FAILED = 9


    function buffer1(ch: number) {
        const b = control.createBuffer(1)
        b[0] = ch
        return b
    }

    export class NinaController extends net.Controller {
        private _socknum_ll: Buffer[];
        private _locked: boolean;

        public wasConnected: boolean;

        constructor(
            private _spi: SPI,
            private _cs: DigitalInOutPin,
            private _busy: DigitalInOutPin,
            private _reset: DigitalInOutPin,
            private _gpio0: DigitalInOutPin = null
        ) {
            super();
            // if nothing connected, pretend the device is ready -
            // we'll check for timeout waiting for response instead
            this._busy.setPull(PinPullMode.PullDown);
            this._busy.digitalRead();
            this._socknum_ll = [buffer1(0)]
            this._spi.setFrequency(8000000);
            this.reset();
            this._locked = false;
        }

        /** 
         * Hard reset the ESP32 using the reset pin 
        */
        public reset(): void {
            if (this._gpio0)
                this._gpio0.digitalWrite(true);
            this._cs.digitalWrite(true)
            this._reset.digitalWrite(false)
            // reset
            pause(10)
            this._reset.digitalWrite(true)
            // wait for it to boot up
            pause(750)
            if (this._gpio0)
                this._gpio0.digitalRead();
            // make sure SPI gets initialized while the CS is up
            this.spiTransfer(control.createBuffer(1), null)
            net.log('reseted esp32')
        }

        private readByte(): number {
            const r = buffer1(0)
            this.spiTransfer(null, r)
            return r[0]
        }

        private checkData(desired: number, msg?: string): boolean {
            const r = this.readByte()
            if (r != desired)
                net.fail(`Expected ${desired} but got ${r}; ` + (msg || ""))
            return false;
        }

        /** Read a byte with a time-out, and if we get it, check that its what we expect */
        private waitSPIChar(desired: number): boolean {
            let times = control.millis()
            while (control.millis() - times < 100) {
                let r = this.readByte()
                if (r == _ERR_CMD) {
                    net.log("error response to command")
                    return false
                }

                if (r == desired) {
                    return true
                }
                //net.log(`read char ${r}, expected ${desired}`)
            }
            net.log("timed out waiting for SPI char")
            return false;
        }

        /**
         * Wait until the ready pin goes low
         */
        private waitForReady() {
            net.debug(`wait for ready ${this._busy.digitalRead()}`);
            if (this._busy.digitalRead()) {
                pauseUntil(() => !this._busy.digitalRead(), 10000);
                net.debug(`busy = ${this._busy.digitalRead()}`);
                // pause(1000)
            }
            if (this._busy.digitalRead()) {
                net.log("timed out waiting for ready")
                return false
            }

            return true
        }

        private _sendCommand(cmd: number, params?: Buffer[], param_len_16?: boolean) {
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
            packet[k++] = _START_CMD;
            packet[k++] = cmd & ~_REPLY_FLAG;
            packet[k++] = params.length;

            params.forEach(param => {
                if (param_len_16)
                    packet[k++] = (param.length >> 8) & 0xFF;
                packet[k++] = param.length & 0xFF;
                packet.write(k, param);
                k += param.length;
            })
            packet[k++] = _END_CMD;
            while (k < n)
                packet[k++] = 0xff;

            net.debug(`send cmd ${packet.toHex()}`)
            if (!this.waitForReady())
                return false
            this._cs.digitalWrite(false)
            this.spiTransfer(packet, null)
            this._cs.digitalWrite(true)
            net.debug(`send done`);
            return true
        }

        private spiTransfer(tx: Buffer, rx: Buffer) {
            if (!tx) tx = control.createBuffer(rx.length)
            if (!rx) rx = control.createBuffer(tx.length)
            this._spi.transfer(tx, rx);
        }

        private _waitResponseCmd(cmd: number, num_responses?: number, param_len_16?: boolean) {
            net.debug(`wait response cmd`);
            if (!this.waitForReady())
                return null

            this._cs.digitalWrite(false)

            let responses: Buffer[] = []
            if (!this.waitSPIChar(_START_CMD)) {
                this._cs.digitalWrite(true)
                return null
            }
            this.checkData(cmd | _REPLY_FLAG)
            if (num_responses !== undefined)
                this.checkData(num_responses, cmd + "")
            else
                num_responses = this.readByte();
            for (let num = 0; num < num_responses; ++num) {
                let param_len = this.readByte()
                if (param_len_16) {
                    param_len <<= 8
                    param_len |= this.readByte()
                }
                net.debug(`\tParameter #${num} length is ${param_len}`)
                const response = control.createBuffer(param_len);
                this.spiTransfer(null, response)
                responses.push(response);
            }
            this.checkData(_END_CMD);

            this._cs.digitalWrite(true)

            net.debug(`responses ${responses.length}`);
            return responses;
        }

        private lock() {
            while (this._locked) {
                pauseUntil(() => !this._locked)
            }
            this._locked = true
        }

        private unlock() {
            if (!this._locked)
                net.fail("not locked!")
            this._locked = false;
        }

        private sendCommandGetResponse(cmd: number, params?: Buffer[],
            reply_params = 1, sent_param_len_16 = false, recv_param_len_16 = false) {

            this.lock()
            this._sendCommand(cmd, params, sent_param_len_16)
            const resp = this._waitResponseCmd(cmd, reply_params, recv_param_len_16)
            this.unlock();
            return resp
        }

        get status(): number {
            const resp = this.sendCommandGetResponse(_GET_CONN_STATUS_CMD)
            if (!resp)
                return WL_NO_SHIELD
            net.debug(`status: ${resp[0][0]}`);
            // one byte response
            return resp[0][0];
        }

        /** A string of the firmware version on the ESP32 */
        get firmwareVersion(): string {
            let resp = this.sendCommandGetResponse(_GET_FW_VERSION_CMD)
            if (!resp)
                return "not connected"
            return resp[0].toString();
        }

        /** A bytearray containing the MAC address of the ESP32 */
        get MACaddress(): Buffer {
            let resp = this.sendCommandGetResponse(_GET_MACADDR_CMD, [hex`ff`])
            if (!resp)
                return null
            // for whatever reason, the mac adderss is backwards
            const res = control.createBuffer(6)
            for (let i = 0; i < 6; ++i)
                res[i] = resp[0][5 - i]
            return res
        }

        /** Begin a scan of visible access points. Follow up with a call
    to 'get_scan_networks' for response
*/
        private startScanNetworks(): void {
            let resp = this.sendCommandGetResponse(_START_SCAN_NETWORKS)
            if (resp[0][0] != 1) {
                net.fail("failed to start AP scan")
            }

        }

        /** The results of the latest SSID scan. Returns a list of dictionaries with
    'ssid', 'rssi' and 'encryption' entries, one for each AP found
*/
        private getScanNetworks(): net.AccessPoint[] {
            let names = this.sendCommandGetResponse(_SCAN_NETWORKS, undefined, undefined)
            // print("SSID names:", names)
            // pylint: disable=invalid-name
            let APs = []
            let i = 0
            for (let name of names) {
                let a_p = new net.AccessPoint(name.toString())
                let rssi = this.sendCommandGetResponse(_GET_IDX_RSSI_CMD, [buffer1(i)])[0]
                a_p.rssi = pins.unpackBuffer("<i", rssi)[0]
                let encr = this.sendCommandGetResponse(_GET_IDX_ENCT_CMD, [buffer1(1)])[0]
                a_p.encryption = encr[0]
                APs.push(a_p)
                i++
            }
            return APs
        }

        /** Scan for visible access points, returns a list of access point details.
     Returns a list of dictionaries with 'ssid', 'rssi' and 'encryption' entries,
     one for each AP found
    */
        public scanNetworks(): net.AccessPoint[] {
            this.startScanNetworks()
            // attempts
            for (let _ = 0; _ < 10; ++_) {
                pause(2000)
                // pylint: disable=invalid-name
                let APs = this.getScanNetworks()
                if (APs) {
                    for (const ap of APs)
                        net.debug(`  ${ap.ssid} => RSSI ${ap.rssi}`)
                    return APs
                }

            }
            return null
        }

        /** Tells the ESP32 to set the access point to the given ssid */
        public wifiSetNetwork(ssid: string): void {
            const ssidbuf = control.createBufferFromUTF8(ssid);
            let resp = this.sendCommandGetResponse(_SET_NET_CMD, [ssidbuf])
            if (resp[0][0] != 1) {
                net.fail("failed to set network")
            }

        }

        /** Sets the desired access point ssid and passphrase */
        public wifiSetPassphrase(ssid: string, passphrase: string): void {
            const ssidbuf = control.createBufferFromUTF8(ssid);
            const passphrasebuf = control.createBufferFromUTF8(passphrase);
            let resp = this.sendCommandGetResponse(_SET_PASSPHRASE_CMD, [ssidbuf, passphrasebuf])
            if (resp[0][0] != 1) {
                net.fail("failed to set passphrase")
            }
        }

        /** Sets the WPA2 Enterprise anonymous identity */
        public wifiSetEntidentity(ident: string): void {
            const ssidbuf = control.createBufferFromUTF8(ident);
            let resp = this.sendCommandGetResponse(_SET_ENT_IDENT_CMD, [ssidbuf])
            if (resp[0][0] != 1) {
                net.fail("failed to set enterprise anonymous identity")
            }

        }

        /** Sets the desired WPA2 Enterprise username */
        public wifiSetEntusername(username: string): void {
            const usernamebuf = control.createBufferFromUTF8(username);
            let resp = this.sendCommandGetResponse(_SET_ENT_UNAME_CMD, [usernamebuf])
            if (resp[0][0] != 1) {
                net.fail("failed to set enterprise username")
            }

        }

        /** Sets the desired WPA2 Enterprise password */
        public wifiSetEntpassword(password: string): void {
            const passwordbuf = control.createBufferFromUTF8(password);
            let resp = this.sendCommandGetResponse(_SET_ENT_PASSWD_CMD, [passwordbuf])
            if (resp[0][0] != 1) {
                net.fail("failed to set enterprise password")
            }

        }

        /** Enables WPA2 Enterprise mode */
        public wifiSetEntenable(): void {
            let resp = this.sendCommandGetResponse(_SET_ENT_ENABLE_CMD)
            if (resp[0][0] != 1) {
                net.fail("failed to enable enterprise mode")
            }

        }

        get ssidBuffer(): Buffer {
            let resp = this.sendCommandGetResponse(_GET_CURR_SSID_CMD, [hex`ff`])
            return resp[0]
        }

        get ssid(): string {
            const b = this.ssidBuffer;
            return b ? b.toString() : "";
        }

        get rssi(): number {
            let resp = this.sendCommandGetResponse(_GET_CURR_RSSI_CMD, [hex`ff`])
            return pins.unpackBuffer("<i", resp[0])[0]
        }

        get networkData(): any {
            let resp = this.sendCommandGetResponse(_GET_IPADDR_CMD, [hex`ff`])
            return resp[0]; //?
        }

        get ipAddress(): string {
            return this.networkData["ip_addr"]
        }

        get isConnected(): boolean {
            return this.status == WL_CONNECTED
        }

        get isIdle(): boolean {
            return this.status == WL_IDLE_STATUS;
        }

        /**
         * Uses RSSID and password in settings to connect to a compatible AP
         */
        public connect(): boolean {
            if (this.isConnected) return true;

            const wifis = net.knownAccessPoints();
            const ssids = Object.keys(wifis);
            const networks = this.scanNetworks()
                .filter(network => ssids.indexOf(network.ssid) > -1);
            // try connecting to known networks
            for(const network of networks) {
                if(this.connectAP(network.ssid, wifis[network.ssid]) == WL_CONNECTED)
                    return true;
            }

            // no compatible SSID
            net.log(`connection failed`)
            return false;
        }

        /** 
         * Connect to an access point with given name and password.
         * Will retry up to 10 times and return on success
        */
        private connectAP(ssid: string, password: string): number {
            net.log(`connect to ${ssid}`)
            if (password) {
                this.wifiSetPassphrase(ssid, password)
            } else {
                this.wifiSetNetwork(ssid)
            }

            // retries
            let stat;
            for (let _ = 0; _ < 10; ++_) {
                stat = this.status
                if (stat == WL_CONNECTED) {
                    this.wasConnected = true;
                    net.log("connected")
                    return stat;
                }
                pause(1000)
            }
            if ([WL_CONNECT_FAILED, WL_CONNECTION_LOST, WL_DISCONNECTED].indexOf(stat) >= 0) {
                net.log(`failed to connect to "${ssid}" (${stat})`)
            }

            if (stat == WL_NO_SSID_AVAIL) {
                net.log(`no such ssid: "${ssid}"`)
            }

            return stat;
        }

        /** 
         * Convert a hostname to a packed 4-byte IP address. Returns
    a 4 bytearray
    */
        public hostbyName(hostname: string): Buffer {
            if (!this.connect())
                return undefined;

            let resp = this.sendCommandGetResponse(_REQ_HOST_BY_NAME_CMD, [control.createBufferFromUTF8(hostname)])
            if (resp[0][0] != 1) {
                net.fail("failed to request hostname")
            }

            resp = this.sendCommandGetResponse(_GET_HOST_BY_NAME_CMD)
            return resp[0];
        }

        /** Ping a destination IP address or hostname, with a max time-to-live
    (ttl). Returns a millisecond timing value
    */
        public ping(dest: string, ttl: number = 250): number {
            if (!this.connect())
                return -1;

            // convert to IP address
            let ip = this.hostbyName(dest)

            // ttl must be between 0 and 255
            ttl = Math.max(0, Math.min(ttl | 0, 255))
            let resp = this.sendCommandGetResponse(_PING_CMD, [ip, buffer1(ttl)])
            return pins.unpackBuffer("<H", resp[0])[0];
        }

        /** Request a socket from the ESP32, will allocate and return a number that
    can then be passed to the other socket commands
    */
        public socket(): number {
            if (!this.connect())
                net.fail("can't connect");

            net.debug("*** Get socket")
            let resp0 = this.sendCommandGetResponse(_GET_SOCKET_CMD)
            let resp = resp0[0][0]
            if (resp == 255) {
                net.fail("no sockets available")
            }
            net.debug("Allocated socket #" + resp)
            return resp
        }

        /** Open a socket to a destination IP address or hostname
    using the ESP32's internal reference number. By default we use
    'conn_mode' TCP_MODE but can also use UDP_MODE or TLS_MODE
    (dest must be hostname for TLS_MODE!)
    */
        public socketOpen(socket_num: number, dest: Buffer | string, port: number, conn_mode = net.TCP_MODE): void {
            this._socknum_ll[0][0] = socket_num
            net.debug("*** Open socket: " + dest + ":" + port)

            let port_param = pins.packBuffer(">H", [port])
            let resp: Buffer[]
            // use the 5 arg version
            if (typeof dest == "string") {
                const dest2 = control.createBufferFromUTF8(dest)
                resp = this.sendCommandGetResponse(_START_CLIENT_TCP_CMD, [dest2, hex`00000000`, port_param, this._socknum_ll[0], buffer1(conn_mode)])
            } else {
                // ip address, use 4 arg vesion
                resp = this.sendCommandGetResponse(_START_CLIENT_TCP_CMD, [dest, port_param, this._socknum_ll[0], buffer1(conn_mode)])
            }

            if (resp[0][0] != 1) {
                net.fail("could not connect to remote server")
            }

        }

        /** Get the socket connection status, can be SOCKET_CLOSED, SOCKET_LISTEN,
    SOCKET_SYN_SENT, SOCKET_SYN_RCVD, SOCKET_ESTABLISHED, SOCKET_FIN_WAIT_1,
    SOCKET_FIN_WAIT_2, SOCKET_CLOSE_WAIT, SOCKET_CLOSING, SOCKET_LAST_ACK, or
    SOCKET_TIME_WAIT
    */
        public socketStatus(socket_num: number): number {
            this._socknum_ll[0][0] = socket_num
            let resp = this.sendCommandGetResponse(_GET_CLIENT_STATE_TCP_CMD, this._socknum_ll)
            return resp[0][0]
        }

        /** Test if a socket is connected to the destination, returns boolean true/false */
        public socket_connected(socket_num: number): boolean {
            return this.socketStatus(socket_num) == SOCKET_ESTABLISHED
        }

        /** Write the bytearray buffer to a socket */
        public socketWrite(socket_num: number, buffer: Buffer): void {
            net.debug("Writing:" + buffer.length)
            this._socknum_ll[0][0] = socket_num
            let resp = this.sendCommandGetResponse(_SEND_DATA_TCP_CMD, [this._socknum_ll[0], buffer], 1, true)
            let sent = resp[0].getNumber(NumberFormat.UInt16LE, 0)
            if (sent != buffer.length) {
                net.fail(`failed to send ${buffer.length} bytes (sent ${sent})`)
            }

            resp = this.sendCommandGetResponse(_DATA_SENT_TCP_CMD, this._socknum_ll)
            if (resp[0][0] != 1) {
                net.fail("failed to verify data sent")
            }

        }

        /** Determine how many bytes are waiting to be read on the socket */
        public socketAvailable(socket_num: number): number {
            this._socknum_ll[0][0] = socket_num
            let resp = this.sendCommandGetResponse(_AVAIL_DATA_TCP_CMD, this._socknum_ll)
            let reply = pins.unpackBuffer("<H", resp[0])[0]
            net.debug(`ESPSocket: ${reply} bytes available`)
            return reply
        }

        /** Read up to 'size' bytes from the socket number. Returns a bytearray */
        public socketRead(socket_num: number, size: number): Buffer {
            net.debug(`Reading ${size} bytes from ESP socket with status ${this.socketStatus(socket_num)}`)
            this._socknum_ll[0][0] = socket_num
            let resp = this.sendCommandGetResponse(_GET_DATABUF_TCP_CMD,
                [this._socknum_ll[0], pins.packBuffer("<H", [size])],
                1, true, true)
            net.debug(`buf >>${resp[0].toString()}<<`)
            return resp[0]
        }

        /** Open and verify we connected a socket to a destination IP address or hostname
    using the ESP32's internal reference number. By default we use
    'conn_mode' TCP_MODE but can also use UDP_MODE or TLS_MODE (dest must
    be hostname for TLS_MODE!)
    */
        public socketConnect(socket_num: number, dest: string | Buffer, port: number, conn_mode = net.TCP_MODE): boolean {
            net.debug("*** Socket connect mode " + conn_mode)
            this.socketOpen(socket_num, dest, port, conn_mode)
            let times = net.monotonic()
            // wait 3 seconds
            while (net.monotonic() - times < 3) {
                if (this.socket_connected(socket_num)) {
                    return true
                }

                pause(10)
            }
            net.fail("failed to establish connection")
            return false
        }

        /** Close a socket using the ESP32's internal reference number */
        public socketClose(socket_num: number): void {
            net.debug("*** Closing socket #" + socket_num)

            this._socknum_ll[0][0] = socket_num
            let resp = this.sendCommandGetResponse(_STOP_CLIENT_TCP_CMD, this._socknum_ll)
            if (resp[0][0] != 1) {
                net.fail("failed to close socket")
            }

        }

        /** Enable/disable debug mode on the ESP32. Debug messages will be
    written to the ESP32's UART.
    */
        public setESPdebug(enabled: boolean) {
            let resp = this.sendCommandGetResponse(_SET_DEBUG_CMD, [buffer1(enabled ? 1 : 0)])
            if (resp[0][0] != 1) {
                net.fail("failed to set debug mode")
            }
        }

        public getTemperature() {
            let resp = this.sendCommandGetResponse(_GET_TEMP_CMD, [])
            if (resp[0].length != 4) {
                net.fail("failed to get temp")
            }
            return resp[0].getNumber(NumberFormat.Float32LE, 0)
        }

        /** 
    Set the io mode for a GPIO pin.
    
    :param int pin: ESP32 GPIO pin to set.
    :param value: direction for pin, digitalio.Direction or integer (0=input, 1=output).
     
    */
        public setPinMode(pin: number, pin_mode: number): void {

            let resp = this.sendCommandGetResponse(_SET_PIN_MODE_CMD, [buffer1(pin), buffer1(pin_mode)])
            if (resp[0][0] != 1) {
                net.fail("failed to set pin mode")
            }

        }

        /** 
    Set the digital output value of pin.
    
    :param int pin: ESP32 GPIO pin to write to.
    :param bool value: Value for the pin.
     
    */
        public setDigitalWrite(pin: number, value: number): void {
            let resp = this.sendCommandGetResponse(_SET_DIGITAL_WRITE_CMD, [buffer1(pin), buffer1(value)])
            if (resp[0][0] != 1) {
                net.fail("failed to write to pin")
            }

        }

        /** 
    Set the analog output value of pin, using PWM.
    
    :param int pin: ESP32 GPIO pin to write to.
    :param float value: 0=off 1.0=full on
     
    */
        public setAnalogWrite(pin: number, analog_value: number) {
            let value = Math.trunc(255 * analog_value)
            let resp = this.sendCommandGetResponse(_SET_ANALOG_WRITE_CMD, [buffer1(pin), buffer1(value)])
            if (resp[0][0] != 1) {
                net.fail("failed to write to pin")
            }

        }
    }

    //% shim=esp32spi::flashDevice
    export function flashDevice() {
        return
    }
}