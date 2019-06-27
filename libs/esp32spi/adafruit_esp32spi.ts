function print(msg: string) {
    console.log(msg);
}
namespace time {
    export function monotonic(): number {
        return control.millis() / 1000.0;
    }
}

namespace esp32spi {
    export interface AccessPoint {
        ssid: string;
        rssi: number;
        encryption: number;
    }

    // pylint: disable=bad-whitespace
    const _SET_NET_CMD = 0x10
    const _SET_PASSPHRASE_CMD = 0x11
    const _SET_DEBUG_CMD = 0x1A
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
        const b = control.createBuffer(ch)
        b[0] = ch
        return b
    }

    export class ESP_SPIcontrol {
        _spi: SPI;
        _debug: number;
        _gpio0: DigitalInOutPin;
        _cs: DigitalInOutPin;
        _ready: DigitalInOutPin;
        _reset: DigitalInOutPin;
        _socknum_ll: any; /** TODO: type **/

        static instance: ESP_SPIcontrol;

        static TCP_MODE = 0
        static UDP_MODE = 1
        static TLS_MODE = 2

        constructor() {
        }

        private log(priority: number, msg: string) {
            console.log(msg);
        }

        public reset(): void {
            /** Hard reset the ESP32 using the reset pin */
            if (this._debug) {
                print("Reset ESP32")
            }

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
        }


        // we're ready!
        // pylint: disable=too-many-branches

        // header + end byte
        // parameter
        // size byte
        // 2 of em here!
        // we may need more space
        // handle parameters here
        // %d is %d bytes long" % (i, len(param)))
        // wait up to 1000ms
        // ok ready to send!
        // pylint: disable=no-member
        // pylint: disable=too-many-branches
        private _read_byte(): number {
            return this._spi.write(0)
        }

        private checkData(desired: number): boolean {
            const r = this._read_byte()
            if (r != desired)
                control.fail(`Expected ${desired} but got ${r}`)
            return false;
        }

        private wait_spi_char(desired: number): boolean {
            /** Read a byte with a time-out, and if we get it, check that its what we expect */
            let times = time.monotonic()
            while (time.monotonic() - times < 0.1) {
                let r = this._read_byte()
                if (r == _ERR_CMD) {
                    control.fail("Error response to command")
                }

                if (r == desired) {
                    return true
                }
            }
            control.fail("Timed out waiting for SPI char")
            return false;
        }

        private _wait_for_ready() {
            pauseUntil(() => this._ready.digitalRead(), 10000);
        }

        private _send_command(cmd: number,
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

            this._wait_for_ready();
            const dummy = control.createBuffer(packet.length)
            this._spi.transfer(packet, dummy);
        }

        private _wait_response_cmd(cmd: number, num_responses: number = undefined, param_len_16 = false) {
            this._wait_for_ready();

            let responses: Buffer[] = []
            this.wait_spi_char(_START_CMD);
            this.checkData(cmd | _REPLY_FLAG)
            if (num_responses !== undefined)
                this.checkData(num_responses)
            else
                num_responses = this._read_byte();
            for (let num = 0; num < num_responses; ++num) {
                let param_len = this._read_byte()
                if (param_len_16) {
                    param_len <<= 8
                    param_len |= this._read_byte()
                }
                this.log(1, `\tParameter #${num} length is ${param_len}`)
                const response = control.createBuffer(param_len);
                const dummy = control.createBuffer(param_len);
                this._spi.transfer(dummy, response);
                responses.push(response);
            }
            this.checkData(_END_CMD);
            this.log(1, `responses ${responses.length}`);
            return responses
        }

        private _send_command_get_response(cmd: number, params: Buffer[] = undefined,
            reply_params = 1, sent_param_len_16 = false,
            recv_param_len_16 = false) {
            this._send_command(cmd, params, sent_param_len_16)
            return this._wait_response_cmd(cmd, reply_params, recv_param_len_16)
        }

        get status(): number {
            const resp = this._send_command_get_response(_GET_CONN_STATUS_CMD)
            this.log(0, `Status: ${resp[0][0]}`);

            // one byte response
            return resp[0][0];
        }

        /** A string of the firmware version on the ESP32 */
        get firmware_version(): string {
            if (this._debug) {
                print("Firmware version")
            }

            let resp = this._send_command_get_response(_GET_FW_VERSION_CMD)
            return resp[0].toString();
        }

        /** A bytearray containing the MAC address of the ESP32 */
        get MAC_address(): Buffer {
            // pylint: disable=invalid-name
            if (this._debug) {
                print("MAC address")
            }

            let resp = this._send_command_get_response(_GET_MACADDR_CMD, [hex`ff`])
            return resp[0]
        }

        /** Begin a scan of visible access points. Follow up with a call
    to 'get_scan_networks' for response
*/
        private start_scan_networks(): void {
            if (this._debug) {
                print("Start scan")
            }

            let resp = this._send_command_get_response(_START_SCAN_NETWORKS)
            if (resp[0][0] != 1) {
                control.fail("Failed to start AP scan")
            }

        }

        /** The results of the latest SSID scan. Returns a list of dictionaries with
    'ssid', 'rssi' and 'encryption' entries, one for each AP found
*/
        private get_scan_networks(): AccessPoint[] {
            this._send_command(_SCAN_NETWORKS)
            let names = this._wait_response_cmd(_SCAN_NETWORKS)
            // print("SSID names:", names)
            // pylint: disable=invalid-name
            let APs = []
            let i = 0
            for (let name of names) {
                let a_p = {
                    ssid: name.toString(),
                    rssi: 0,
                    encryption: 0
                }
                let rssi = this._send_command_get_response(_GET_IDX_RSSI_CMD, [buffer1(i)])[0]
                a_p["rssi"] = pins.unpackBuffer("<i", rssi)[0]
                let encr = this._send_command_get_response(_GET_IDX_ENCT_CMD, [buffer1(1)])[0]
                a_p["encryption"] = encr[0]
                APs.push(a_p)
                i++
            }
            return APs
        }

        /** Scan for visible access points, returns a list of access point details.
     Returns a list of dictionaries with 'ssid', 'rssi' and 'encryption' entries,
     one for each AP found
    */
        public scan_networks(): AccessPoint[] {
            this.start_scan_networks()
            // attempts
            for (let _ = 0; _ < 10; ++_) {
                pause(2000)
                // pylint: disable=invalid-name
                let APs = this.get_scan_networks()
                if (APs) {
                    return APs
                }

            }
            return null
        }

        /** Tells the ESP32 to set the access point to the given ssid */
        public wifi_set_network(ssid: string): void {
            const ssidbuf = control.createBufferFromUTF8(ssid);
            let resp = this._send_command_get_response(_SET_NET_CMD, [ssidbuf])
            if (resp[0][0] != 1) {
                control.fail("Failed to set network")
            }

        }

        /** Sets the desired access point ssid and passphrase */
        public wifi_set_passphrase(ssid: string, passphrase: string): void {
            const ssidbuf = control.createBufferFromUTF8(ssid);
            const passphrasebuf = control.createBufferFromUTF8(passphrase);
            let resp = this._send_command_get_response(_SET_PASSPHRASE_CMD, [ssidbuf, passphrasebuf])
            if (resp[0][0] != 1) {
                control.fail("Failed to set passphrase")
            }
        }

        /** Sets the WPA2 Enterprise anonymous identity */
        public wifi_set_entidentity(ident: string): void {
            const ssidbuf = control.createBufferFromUTF8(ident);
            let resp = this._send_command_get_response(_SET_ENT_IDENT_CMD, [ssidbuf])
            if (resp[0][0] != 1) {
                control.fail("Failed to set enterprise anonymous identity")
            }

        }

        /** Sets the desired WPA2 Enterprise username */
        public wifi_set_entusername(username: string): void {
            const usernamebuf = control.createBufferFromUTF8(username);
            let resp = this._send_command_get_response(_SET_ENT_UNAME_CMD, [usernamebuf])
            if (resp[0][0] != 1) {
                control.fail("Failed to set enterprise username")
            }

        }

        /** Sets the desired WPA2 Enterprise password */
        public wifi_set_entpassword(password: string): void {
            const passwordbuf = control.createBufferFromUTF8(password);
            let resp = this._send_command_get_response(_SET_ENT_PASSWD_CMD, [passwordbuf])
            if (resp[0][0] != 1) {
                control.fail("Failed to set enterprise password")
            }

        }

        /** Enables WPA2 Enterprise mode */
        public wifi_set_entenable(): void {
            let resp = this._send_command_get_response(_SET_ENT_ENABLE_CMD)
            if (resp[0][0] != 1) {
                control.fail("Failed to enable enterprise mode")
            }

        }


        get ssid(): Buffer {
            let resp = this._send_command_get_response(_GET_CURR_SSID_CMD, [hex`ff`])
            return resp[0]
        }

        get rssi(): number {
            let resp = this._send_command_get_response(_GET_CURR_RSSI_CMD, [hex`ff`])
            return pins.unpackBuffer("<i", resp[0])[0]
        }

        get networkData(): any {
            let resp = this._send_command_get_response(_GET_IPADDR_CMD, [hex`ff`])
            return resp[0]; //?
        }

        get ipAddress(): string {
            return this.networkData["ip_addr"]
        }

        get isConnected(): boolean {
            return this.status == WL_CONNECTED
        }

        /** Connect to an access point using a secrets dictionary
    that contains a 'ssid' and 'password' entry
    */
        public connect(secrets: any): void {
            this.connect_AP(secrets["ssid"], secrets["password"])
        }

        /** Connect to an access point with given name and password.
    Will retry up to 10 times and return on success or raise
    an exception on failure
    */
        public connect_AP(ssid: string, password: string): number {
            if (this._debug) {
                print(`Connect to AP ${ssid} ${password}`)
            }

            if (password) {
                this.wifi_set_passphrase(ssid, password)
            } else {
                this.wifi_set_network(ssid)
            }

            // retries
            let stat;
            for (let _ = 0; _ < 10; ++_) {
                stat = this.status
                if (stat == WL_CONNECTED) {
                    return stat;
                }

                pause(1000)
            }
            if ([WL_CONNECT_FAILED, WL_CONNECTION_LOST, WL_DISCONNECTED].indexOf(stat) >= 0) {
                control.fail(`RuntimeError("Failed to connect to ssid", ssid)`)
            }

            if (stat == WL_NO_SSID_AVAIL) {
                control.fail(`RuntimeError("No such ssid", ssid)`)
            }

            control.fail(`Unknown error ${stat}`)
            return stat;
        }

        /** Convert a hostname to a packed 4-byte IP address. Returns
    a 4 bytearray
    */
        public get_host_by_name(hostname: string): Buffer {
            let resp = this._send_command_get_response(_REQ_HOST_BY_NAME_CMD, [control.createBufferFromUTF8(hostname)])
            if (resp[0][0] != 1) {
                control.fail("Failed to request hostname")
            }

            resp = this._send_command_get_response(_GET_HOST_BY_NAME_CMD)
            return resp[0];
        }

        /** Ping a destination IP address or hostname, with a max time-to-live
    (ttl). Returns a millisecond timing value
    */
        public ping(dest: string, ttl: number = 250): number {
            // convert to IP address
            let ip = this.get_host_by_name(dest)

            // ttl must be between 0 and 255
            ttl = Math.max(0, Math.min(ttl | 0, 255))
            let resp = this._send_command_get_response(_PING_CMD, [ip, buffer1(ttl)])
            return pins.unpackBuffer("<H", resp[0])[0];
        }

        public get_socket(): number {
            /** Request a socket from the ESP32, will allocate and return a number that
        can then be passed to the other socket commands
        */
            if (this._debug) {
                print("*** Get socket")
            }

            let resp0 = this._send_command_get_response(_GET_SOCKET_CMD)
            let resp = resp0[0][0]
            if (resp == 255) {
                control.fail("No sockets available")
            }

            if (this._debug) {
                // %d" % resp)
                print("Allocated socket #" + resp)
            }

            return resp
        }

        /** Open a socket to a destination IP address or hostname
    using the ESP32's internal reference number. By default we use
    'conn_mode' TCP_MODE but can also use UDP_MODE or TLS_MODE
    (dest must be hostname for TLS_MODE!)
    */
        public socket_open(socket_num: number, dest: Buffer | string, port: number, conn_mode = ESP_SPIcontrol.TCP_MODE): void {
            this._socknum_ll[0][0] = socket_num
            if (this._debug) {
                print("*** Open socket")
            }

            let port_param = pins.packBuffer(">H", [port])
            let resp: Buffer[]
            // use the 5 arg version
            if (typeof dest == "string") {
                const dest2 = control.createBufferFromUTF8(dest)
                resp = this._send_command_get_response(_START_CLIENT_TCP_CMD, [dest2, hex`00000000`, port_param, this._socknum_ll[0], [conn_mode]])
            } else {
                // ip address, use 4 arg vesion
                resp = this._send_command_get_response(_START_CLIENT_TCP_CMD, [dest, port_param, this._socknum_ll[0], [conn_mode]])
            }

            if (resp[0][0] != 1) {
                control.fail("Could not connect to remote server")
            }

        }

        public socket_status(socket_num: number): number {
            /** Get the socket connection status, can be SOCKET_CLOSED, SOCKET_LISTEN,
        SOCKET_SYN_SENT, SOCKET_SYN_RCVD, SOCKET_ESTABLISHED, SOCKET_FIN_WAIT_1,
        SOCKET_FIN_WAIT_2, SOCKET_CLOSE_WAIT, SOCKET_CLOSING, SOCKET_LAST_ACK, or
        SOCKET_TIME_WAIT
        */
            this._socknum_ll[0][0] = socket_num
            let resp = this._send_command_get_response(_GET_CLIENT_STATE_TCP_CMD, this._socknum_ll)
            return resp[0][0]
        }

        public socket_connected(socket_num: number): boolean {
            /** Test if a socket is connected to the destination, returns boolean true/false */
            return this.socket_status(socket_num) == SOCKET_ESTABLISHED
        }

        public socket_write(socket_num: number, buffer: Buffer): void {
            /** Write the bytearray buffer to a socket */
            if (this._debug) {
                print("Writing:" + buffer.length)
            }

            this._socknum_ll[0][0] = socket_num
            let resp = this._send_command_get_response(_SEND_DATA_TCP_CMD, [this._socknum_ll[0], buffer])
            let sent = resp[0][0]
            if (sent != buffer.length) {
                control.fail(`Failed to send ${buffer.length} bytes (sent ${sent})`)
            }

            resp = this._send_command_get_response(_DATA_SENT_TCP_CMD, this._socknum_ll)
            if (resp[0][0] != 1) {
                control.fail("Failed to verify data sent")
            }

        }

        public socket_available(socket_num: number): number {
            /** Determine how many bytes are waiting to be read on the socket */
            this._socknum_ll[0][0] = socket_num
            let resp = this._send_command_get_response(_AVAIL_DATA_TCP_CMD, this._socknum_ll)
            let reply = pins.unpackBuffer("<H", resp[0])[0]
            if (this._debug) {
                print(`ESPSocket: ${reply} bytes available`)
            }

            return reply
        }

        public socket_read(socket_num: number, size: number): Buffer {
            /** Read up to 'size' bytes from the socket number. Returns a bytearray */
            if (this._debug) {
                print(`Reading ${size} bytes from ESP socket with status ${this.socket_status(socket_num)}`)
            }

            this._socknum_ll[0][0] = socket_num
            let resp = this._send_command_get_response(_GET_DATABUF_TCP_CMD, [this._socknum_ll[0], [size & 0xFF, size >> 8 & 0xFF]])
            return resp[0]
        }

        public socket_connect(socket_num: number, dest: Buffer, port: number, conn_mode = ESP_SPIcontrol.TCP_MODE): boolean {
            /** Open and verify we connected a socket to a destination IP address or hostname
        using the ESP32's internal reference number. By default we use
        'conn_mode' TCP_MODE but can also use UDP_MODE or TLS_MODE (dest must
        be hostname for TLS_MODE!)
        */
            if (this._debug) {
                print("*** Socket connect mode " + conn_mode)
            }

            this.socket_open(socket_num, dest, port, conn_mode)
            let times = time.monotonic()
            // wait 3 seconds
            while (time.monotonic() - times < 3) {
                if (this.socket_connected(socket_num)) {
                    return true
                }

                pause(10)
            }
            control.fail("Failed to establish connection")
            return false
        }

        public socket_close(socket_num: number): void {
            /** Close a socket using the ESP32's internal reference number */
            if (this._debug) {
                // %d" % socket_num)
                print("*** Closing socket #" + socket_num)
            }

            this._socknum_ll[0][0] = socket_num
            let resp = this._send_command_get_response(_STOP_CLIENT_TCP_CMD, this._socknum_ll)
            if (resp[0][0] != 1) {
                control.fail("Failed to close socket")
            }

        }

        public set_esp_debug(enabled: boolean) {
            /** Enable/disable debug mode on the ESP32. Debug messages will be
        written to the ESP32's UART.
        */
            let resp = this._send_command_get_response(_SET_DEBUG_CMD, [buffer1(enabled ? 1 : 0)])
            if (resp[0][0] != 1) {
                control.fail("Failed to set debug mode")
            }
        }

        /** 
    Set the io mode for a GPIO pin.
    
    :param int pin: ESP32 GPIO pin to set.
    :param value: direction for pin, digitalio.Direction or integer (0=input, 1=output).
     
    */
        public set_pin_mode(pin: number, pin_mode: number): void {

            let resp = this._send_command_get_response(_SET_PIN_MODE_CMD, [buffer1(pin), buffer1(pin_mode)])
            if (resp[0][0] != 1) {
                control.fail("Failed to set pin mode")
            }

        }

        public set_digital_write(pin: number, value: number): void {
            /** 
        Set the digital output value of pin.
        
        :param int pin: ESP32 GPIO pin to write to.
        :param bool value: Value for the pin.
         
        */
            let resp = this._send_command_get_response(_SET_DIGITAL_WRITE_CMD, [buffer1(pin), buffer1(value)])
            if (resp[0][0] != 1) {
                control.fail("Failed to write to pin")
            }

        }

        public set_analog_write(pin: number, analog_value: number) {
            /** 
        Set the analog output value of pin, using PWM.
        
        :param int pin: ESP32 GPIO pin to write to.
        :param float value: 0=off 1.0=full on
         
        */
            let value = Math.trunc(255 * analog_value)
            let resp = this._send_command_get_response(_SET_ANALOG_WRITE_CMD, [buffer1(pin), buffer1(value)])
            if (resp[0][0] != 1) {
                control.fail("Failed to write to pin")
            }

        }
    }
}