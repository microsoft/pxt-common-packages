function print(msg: string) {
    console.log(msg);
}

namespace esp32spi {
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

    export class ESP_SPIcontrol {
        _debug: boolean;
        _gpio0: DigitalInOutPin;
        _cs: DigitalInOutPin;
        _reset: DigitalInOutPin;
        _pbuf: Buffer;
        _socknum_ll: any; /** TODO: type **/

        static instance: ESP_SPIcontrol;

        static TCP_MODE = 0
        static UDP_MODE = 1
        static TLS_MODE = 2

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
        private _read_byte(spi: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Read one byte from SPI */
        spi.readinto(this._pbuf)
        if (this._debug >= 3) {
            print("\t\tRead:", hex(this._pbuf[0]))
        }

        return this._pbuf[0]
    }
        
        private _read_bytes(spi: any; /** TODO: type **/, buffer: any; /** TODO: type **/, start: number = 0, end: number = null): any; /** TODO: type **/ {
        /** Read many bytes from SPI */
        if (!end) {
            end = buffer.length
        }

        spi.readinto(buffer, { start: start, end: end })
        if (this._debug >= 3) {
            print("\t\tRead:", { TODO: ListComp })
        }

    }
        
        private _wait_spi_char(spi: any; /** TODO: type **/, desired: any; /** TODO: type **/): boolean {
        /** Read a byte with a time-out, and if we get it, check that its what we expect */
        let times = time.monotonic()
        while (time.monotonic() - times < 0.1) {
            let r = this._read_byte(spi)
            if (r == _ERR_CMD) {
                control.fail("Error response to command")
            }

            if (r == desired) {
                return true
            }

        }
        control.fail("Timed out waiting for SPI char")
    }
        
        private _check_data(spi: any; /** TODO: type **/, desired: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Read a byte and verify its the value we want */
        let r = this._read_byte(spi)
        if (r != desired) {
            control.fail(`Expected ${desired} but got ${r}`)
        }

    }


    // wait up to 1000ms
    // ok ready to send!
    // %d length is %d" % (num, param_len))

    get status(): any; /** TODO: type **/ {
        /** The status of the ESP32 WiFi core. Can be WL_NO_SHIELD or WL_NO_MODULE
    (not found), WL_IDLE_STATUS, WL_NO_SSID_AVAIL, WL_SCAN_COMPLETED,
    WL_CONNECTED, WL_CONNECT_FAILED, WL_CONNECTION_LOST, WL_DISCONNECTED,
    WL_AP_LISTENING, WL_AP_CONNECTED, WL_AP_FAILED
*/
        if (this._debug) {
            print("Connection status")
        }

        let resp = this._send_command_get_response(_GET_CONN_STATUS_CMD)
        if (this._debug) {
            print("Conn status:", resp[0][0])
        }

        // one byte response
        return resp[0][0]
    }

    get firmware_version(): any; /** TODO: type **/ {
        /** A string of the firmware version on the ESP32 */
        if (this._debug) {
            print("Firmware version")
        }

        let resp = this._send_command_get_response(_GET_FW_VERSION_CMD)
        return resp[0]
    }

    get MAC_address(): any; /** TODO: type **/ {
        // pylint: disable=invalid-name
        /** A bytearray containing the MAC address of the ESP32 */
        if (this._debug) {
            print("MAC address")
        }

        let resp = this._send_command_get_response(_GET_MACADDR_CMD, [hex`ff`])
        return resp[0]
    }
        
        public start_scan_networks(): any; /** TODO: type **/ {
        /** Begin a scan of visible access points. Follow up with a call
    to 'get_scan_networks' for response
*/
        if (this._debug) {
            print("Start scan")
        }

        let resp = this._send_command_get_response(_START_SCAN_NETWORKS)
        if (resp[0][0] != 1) {
            control.fail("Failed to start AP scan")
        }

    }
        
        public get_scan_networks(): any; /** TODO: type **/ {
        /** The results of the latest SSID scan. Returns a list of dictionaries with
    'ssid', 'rssi' and 'encryption' entries, one for each AP found
*/
        this._send_command(_SCAN_NETWORKS)
        let names = this._wait_response_cmd(_SCAN_NETWORKS)
        // print("SSID names:", names)
        // pylint: disable=invalid-name
        let APs = []
        for ([let i, let name] of enumerate(names)) {
            let a_p = { TODO: Dict }
            let rssi = this._send_command_get_response(_GET_IDX_RSSI_CMD, [[i]])[0]
            a_p["rssi"] = struct.unpack("<i", rssi)[0]
            let encr = this._send_command_get_response(_GET_IDX_ENCT_CMD, [[i]])[0]
            a_p["encryption"] = encr[0]
            APs.push(a_p)
        }
        return APs
    }

            /** Scan for visible access points, returns a list of access point details.
         Returns a list of dictionaries with 'ssid', 'rssi' and 'encryption' entries,
         one for each AP found
        */
        public scan_networks(): any; /** TODO: type **/ {
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
        
        public wifi_set_network(ssid: Buffer): any; /** TODO: type **/ {
        /** Tells the ESP32 to set the access point to the given ssid */
        let resp = this._send_command_get_response(_SET_NET_CMD, [ssid])
        if (resp[0][0] != 1) {
            control.fail("Failed to set network")
        }

    }
        
        public wifi_set_passphrase(ssid: Buffer, passphrase: Buffer): any; /** TODO: type **/ {
        /** Sets the desired access point ssid and passphrase */
        let resp = this._send_command_get_response(_SET_PASSPHRASE_CMD, [ssid, passphrase])
        if (resp[0][0] != 1) {
            control.fail("Failed to set passphrase")
        }

    }
        
        public wifi_set_entidentity(ident: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Sets the WPA2 Enterprise anonymous identity */
        let resp = this._send_command_get_response(_SET_ENT_IDENT_CMD, [ident])
        if (resp[0][0] != 1) {
            control.fail("Failed to set enterprise anonymous identity")
        }

    }
        
        public wifi_set_entusername(username: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Sets the desired WPA2 Enterprise username */
        let resp = this._send_command_get_response(_SET_ENT_UNAME_CMD, [username])
        if (resp[0][0] != 1) {
            control.fail("Failed to set enterprise username")
        }

    }
        
        public wifi_set_entpassword(password: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Sets the desired WPA2 Enterprise password */
        let resp = this._send_command_get_response(_SET_ENT_PASSWD_CMD, [password])
        if (resp[0][0] != 1) {
            control.fail("Failed to set enterprise password")
        }

    }
        
        public wifi_set_entenable(): any; /** TODO: type **/ {
        /** Enables WPA2 Enterprise mode */
        let resp = this._send_command_get_response(_SET_ENT_ENABLE_CMD)
        if (resp[0][0] != 1) {
            control.fail("Failed to enable enterprise mode")
        }

    }

    get ssid(): any; /** TODO: type **/ {
        /** The name of the access point we're connected to */
        let resp = this._send_command_get_response(_GET_CURR_SSID_CMD, [hex`ff`])
        return resp[0]
    }

    get rssi(): any; /** TODO: type **/ {
        /** The receiving signal strength indicator for the access point we're
    connected to
*/
        let resp = this._send_command_get_response(_GET_CURR_RSSI_CMD, [hex`ff`])
        return struct.unpack("<i", resp[0])[0]
    }

    get network_data(): any; /** TODO: type **/ {
        /** A dictionary containing current connection details such as the 'ip_addr',
    'netmask' and 'gateway'
*/
        let resp = this._send_command_get_response(_GET_IPADDR_CMD, [hex`ff`])
        return { TODO: Dict }
    }

    get ip_address(): any; /** TODO: type **/ {
        /** Our local IP address */
        return this.network_data["ip_addr"]
    }

    get is_connected(): boolean {
        /** Whether the ESP32 is connected to an access point */
        try {
            return this.status == WL_CONNECTED
        }
        catch (_/* instanceof RuntimeError */) {
            this.reset()
            return false
        }

    }
        
        public connect(secrets: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Connect to an access point using a secrets dictionary
    that contains a 'ssid' and 'password' entry
*/
        this.connect_AP(secrets["ssid"], secrets["password"])
    }

        // pylint: disable=invalid-name
        public connect_AP(ssid: Buffer, password: Buffer): any; /** TODO: type **/ {
        /** Connect to an access point with given name and password.
    Will retry up to 10 times and return on success or raise
    an exception on failure
*/
        if (this._debug) {
            print("Connect to AP", ssid, password)
        }

        if (isinstance(ssid, str)) {
            ssid = pins.createBufferFromArray(ssid, "utf-8")
        }

        if (password) {
            if (isinstance(password, str)) {
                password = pins.createBufferFromArray(password, "utf-8")
            }

            this.wifi_set_passphrase(ssid, password)
        } else {
            this.wifi_set_network(ssid)
        }

        // retries
        for (let _ = 0; _ < 10; ++_) {
            let stat = this.status
            if (stat == WL_CONNECTED) {
                return stat
            }

            pause(1000)
        }
        if ([WL_CONNECT_FAILED, WL_CONNECTION_LOST, WL_DISCONNECTED].indexOf(stat) >= 0) {
            control.fail(`RuntimeError("Failed to connect to ssid", ssid)`)
        }

        if (stat == WL_NO_SSID_AVAIL) {
            control.fail(`RuntimeError("No such ssid", ssid)`)
        }

        control.fail("Unknown error 0x%02X" % stat)
    }

        // pylint: disable=no-self-use, invalid-name
        public pretty_ip(ip: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Converts a bytearray IP address to a dotted-quad string for printing */
        return `${ip[0]}.${ip[1]}.${ip[2]}.${ip[3]}`
    }

        // pylint: disable=no-self-use, invalid-name
        public unpretty_ip(ip: any; /** TODO: type **/): Buffer {
        /** Converts a dotted-quad string to a bytearray IP address */
        let octets = { TODO: ListComp }
        return pins.createBufferFromArray(octets)
    }
        
        public get_host_by_name(hostname: Buffer): Buffer {
        /** Convert a hostname to a packed 4-byte IP address. Returns
    a 4 bytearray
*/
        if (this._debug) {
            print("*** Get host by name")
        }

        if (isinstance(hostname, str)) {
            hostname = pins.createBufferFromArray(hostname, "utf-8")
        }

        let resp = this._send_command_get_response(_REQ_HOST_BY_NAME_CMD, [hostname])
        if (resp[0][0] != 1) {
            control.fail("Failed to request hostname")
        }

        resp = this._send_command_get_response(_GET_HOST_BY_NAME_CMD)
        return resp[0]
    }
        
        public ping(dest: Buffer, ttl: number = 250): any; /** TODO: type **/ {
        /** Ping a destination IP address or hostname, with a max time-to-live
    (ttl). Returns a millisecond timing value
*/
        // convert to IP address
        if (isinstance(dest, str)) {
            dest = this.get_host_by_name(dest)
        }

        // ttl must be between 0 and 255
        ttl = Math.max(0, Math.min(ttl, 255))
        let resp = this._send_command_get_response(_PING_CMD, [dest, [ttl]])
        return struct.unpack("<H", resp[0])[0]
    }
        
        public get_socket(): any; /** TODO: type **/ {
        /** Request a socket from the ESP32, will allocate and return a number that
    can then be passed to the other socket commands
*/
        if (this._debug) {
            print("*** Get socket")
        }

        let resp = this._send_command_get_response(_GET_SOCKET_CMD)
        resp = resp[0][0]
        if (resp == 255) {
            control.fail("No sockets available")
        }

        if (this._debug) {
            // %d" % resp)
            print("Allocated socket #%d" % resp)
        }

        return resp
    }
        
        public socket_open(socket_num: any; /** TODO: type **/, dest: Buffer, port: any; /** TODO: type **/, conn_mode: any; /** TODO: type **/ = TCP_MODE): any; /** TODO: type **/ {
        /** Open a socket to a destination IP address or hostname
    using the ESP32's internal reference number. By default we use
    'conn_mode' TCP_MODE but can also use UDP_MODE or TLS_MODE
    (dest must be hostname for TLS_MODE!)
*/
        this._socknum_ll[0][0] = socket_num
        if (this._debug) {
            print("*** Open socket")
        }

        let port_param = struct.pack(">H", port)
        // use the 5 arg version
        if (isinstance(dest, str)) {
            dest = pins.createBufferFromArray(dest, "utf-8")
            let resp = this._send_command_get_response(_START_CLIENT_TCP_CMD, [dest, hex`00000000`, port_param, this._socknum_ll[0], [conn_mode]])
        } else {
            // ip address, use 4 arg vesion
            resp = this._send_command_get_response(_START_CLIENT_TCP_CMD, [dest, port_param, this._socknum_ll[0], [conn_mode]])
        }

        if (resp[0][0] != 1) {
            control.fail("Could not connect to remote server")
        }

    }
        
        public socket_status(socket_num: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Get the socket connection status, can be SOCKET_CLOSED, SOCKET_LISTEN,
    SOCKET_SYN_SENT, SOCKET_SYN_RCVD, SOCKET_ESTABLISHED, SOCKET_FIN_WAIT_1,
    SOCKET_FIN_WAIT_2, SOCKET_CLOSE_WAIT, SOCKET_CLOSING, SOCKET_LAST_ACK, or
    SOCKET_TIME_WAIT
*/
        this._socknum_ll[0][0] = socket_num
        let resp = this._send_command_get_response(_GET_CLIENT_STATE_TCP_CMD, this._socknum_ll)
        return resp[0][0]
    }
        
        public socket_connected(socket_num: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Test if a socket is connected to the destination, returns boolean true/false */
        return this.socket_status(socket_num) == SOCKET_ESTABLISHED
    }
        
        public socket_write(socket_num: any; /** TODO: type **/, buffer: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Write the bytearray buffer to a socket */
        if (this._debug) {
            print("Writing:", buffer)
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
        
        public socket_available(socket_num: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Determine how many bytes are waiting to be read on the socket */
        this._socknum_ll[0][0] = socket_num
        let resp = this._send_command_get_response(_AVAIL_DATA_TCP_CMD, this._socknum_ll)
        let reply = struct.unpack("<H", resp[0])[0]
        if (this._debug) {
            print("ESPSocket: %d bytes available" % reply)
        }

        return reply
    }
        
        public socket_read(socket_num: any; /** TODO: type **/, size: number): Buffer {
        /** Read up to 'size' bytes from the socket number. Returns a bytearray */
        if (this._debug) {
            print(`Reading ${size} bytes from ESP socket with status ${this.socket_status(socket_num)}`)
        }

        this._socknum_ll[0][0] = socket_num
        let resp = this._send_command_get_response(_GET_DATABUF_TCP_CMD, [this._socknum_ll[0], [size & 0xFF, size >> 8 & 0xFF]])
        return pins.createBufferFromArray(resp[0])
    }
        
        public socket_connect(socket_num: any; /** TODO: type **/, dest: Buffer, port: any; /** TODO: type **/, conn_mode: any; /** TODO: type **/ = TCP_MODE): boolean {
        /** Open and verify we connected a socket to a destination IP address or hostname
    using the ESP32's internal reference number. By default we use
    'conn_mode' TCP_MODE but can also use UDP_MODE or TLS_MODE (dest must
    be hostname for TLS_MODE!)
*/
        if (this._debug) {
            print("*** Socket connect mode", conn_mode)
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
    }
        
        public socket_close(socket_num: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Close a socket using the ESP32's internal reference number */
        if (this._debug) {
            // %d" % socket_num)
            print("*** Closing socket #%d" % socket_num)
        }

        this._socknum_ll[0][0] = socket_num
        let resp = this._send_command_get_response(_STOP_CLIENT_TCP_CMD, this._socknum_ll)
        if (resp[0][0] != 1) {
            control.fail("Failed to close socket")
        }

    }
        
        public set_esp_debug(enabled: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** Enable/disable debug mode on the ESP32. Debug messages will be
    written to the ESP32's UART.
*/
        let resp = this._send_command_get_response(_SET_DEBUG_CMD, [[!!(enabled)]])
        if (resp[0][0] != 1) {
            control.fail("Failed to set debug mode")
        }

    }
        
        public set_pin_mode(pin: any; /** TODO: type **/, mode: number): any; /** TODO: type **/ {
        /** 
    Set the io mode for a GPIO pin.

    :param int pin: ESP32 GPIO pin to set.
    :param value: direction for pin, digitalio.Direction or integer (0=input, 1=output).
    
*/
        if (mode == digitalio.Direction.OUTPUT) {
            let pin_mode = 1
        } else if (mode == digitalio.Direction.INPUT) {
            pin_mode = 0
        } else {
            pin_mode = mode
        }

        let resp = this._send_command_get_response(_SET_PIN_MODE_CMD, [[pin], [pin_mode]])
        if (resp[0][0] != 1) {
            control.fail("Failed to set pin mode")
        }

    }
        
        public set_digital_write(pin: any; /** TODO: type **/, value: any; /** TODO: type **/): any; /** TODO: type **/ {
        /** 
    Set the digital output value of pin.

    :param int pin: ESP32 GPIO pin to write to.
    :param bool value: Value for the pin.
    
*/
        let resp = this._send_command_get_response(_SET_DIGITAL_WRITE_CMD, [[pin], [value]])
        if (resp[0][0] != 1) {
            control.fail("Failed to write to pin")
        }

    }
        
        public set_analog_write(pin: any; /** TODO: type **/, analog_value: number): any; /** TODO: type **/ {
        /** 
    Set the analog output value of pin, using PWM.

    :param int pin: ESP32 GPIO pin to write to.
    :param float value: 0=off 1.0=full on
    
*/
        let value = Math.trunc(255 * analog_value)
        let resp = this._send_command_get_response(_SET_ANALOG_WRITE_CMD, [[pin], [value]])
        if (resp[0][0] != 1) {
            control.fail("Failed to write to pin")
        }

    }

}
