namespace esp32spi {

    export class WiFiManager {
        esp: SPIController;
        debug: boolean;

        constructor(
            private ssid: string,
            private password: string,
            private statuspix: DigitalInOutPin = null,
            private attempts: number = 2
        ) {
            this.esp = SPIController.instance;
            this.debug = false
            this.pixelStatus(0)
        }

        private pixelStatus(color: number) {
            // TODO handle neopixels
        }

        /** 
         * Perform a hard reset on the ESP32 
        */
        public reset(): void {
            if (this.debug) {
                print("Resetting ESP32")
            }
            this.esp.reset()
        }

        /** 
         * Attempt to connect to WiFi using the current settings 
         **/
        public connect(): void {
            if (this.debug) {
                if (this.esp.status == esp32spi.WL_IDLE_STATUS) {
                    print("ESP32 found and in idle mode")
                }
                print(`Firmware vers. ${this.esp.firmwareVersion}`)
                print(`MAC addr: ${this.esp.MACaddress.toHex()}`)
                for (let access_pt of this.esp.scanNetworks()) {
                    print(`	${access_pt["ssid"]}		RSSI: ${access_pt["rssi"]}`)
                }
            }

            let failure_count = 0
            while (!this.esp.isConnected) {
                if (this.debug) {
                    print("Connecting to AP...")
                }
                this.pixelStatus(0xe00000)
                const stat = this.esp.connectAP(this.ssid, this.password)
                if (stat == esp32spi.WL_CONNECTED) {
                    failure_count = 0
                    this.pixelStatus(0x00e000)
                } else {
                    if (this.debug)
                        print(`Failed to connect ${stat}, retrying`)
                    failure_count += 1
                    if (failure_count >= this.attempts) {
                        failure_count = 0
                        this.reset()
                    }
                }
            }
        }

        /** 
    Pass the Get request to requests and update status LED
 
    :param str url: The URL to retrieve data from
    :param dict data: (Optional) Form data to submit
    :param dict json: (Optional) JSON data to submit. (Data must be None)
    :param dict header: (Optional) Header data to include
    :param bool stream: (Optional) Whether to stream the Response
    :return: The response from the request
    :rtype: Response
    
*/
        public get(url: string, options?: RequestOptions): Response {
            if (!this.esp.isConnected) {
                this.connect()
            }

            this.pixelStatus(0x0000e0)
            let return_val = esp32spi.get(url, options)
            this.pixelStatus(0)
            return return_val
        }

        /** 
    Pass the Post request to requests and update status LED
 
    :param str url: The URL to post data to
    :param dict data: (Optional) Form data to submit
    :param dict json: (Optional) JSON data to submit. (Data must be None)
    :param dict header: (Optional) Header data to include
    :param bool stream: (Optional) Whether to stream the Response
    :return: The response from the request
    :rtype: Response
    
*/
        public post(url: string, options?: RequestOptions): Response {
            if (!this.esp.isConnected) {
                this.connect()
            }

            this.pixelStatus(0x0000e0)
            if (this.debug)
                print(`post ${url}`);
            let return_val = esp32spi.post(url, options)
            this.pixelStatus(0)
            return return_val;
        }

        /** 
    Pass the put request to requests and update status LED
 
    :param str url: The URL to PUT data to
    :param dict data: (Optional) Form data to submit
    :param dict json: (Optional) JSON data to submit. (Data must be None)
    :param dict header: (Optional) Header data to include
    :param bool stream: (Optional) Whether to stream the Response
    :return: The response from the request
    :rtype: Response
    
*/
        public put(url: string, options?: RequestOptions): Response {
            if (!this.esp.isConnected) {
                this.connect()
            }

            this.pixelStatus(0x0000e0)
            let return_val = esp32spi.put(url, options)
            this.pixelStatus(0)
            return return_val
        }

        /** 
    Pass the patch request to requests and update status LED

    :param str url: The URL to PUT data to
    :param dict data: (Optional) Form data to submit
    :param dict json: (Optional) JSON data to submit. (Data must be None)
    :param dict header: (Optional) Header data to include
    :param bool stream: (Optional) Whether to stream the Response
    :return: The response from the request
    :rtype: Response
    
*/
        public patch(url: string, options?: RequestOptions): Response {
            if (!this.esp.isConnected) {
                this.connect()
            }

            this.pixelStatus(0x0000e0)
            let return_val = esp32spi.patch(url, options)
            this.pixelStatus(0)
            return return_val
        }

        /** 
    Pass the delete request to requests and update status LED
 
    :param str url: The URL to PUT data to
    :param dict data: (Optional) Form data to submit
    :param dict json: (Optional) JSON data to submit. (Data must be None)
    :param dict header: (Optional) Header data to include
    :param bool stream: (Optional) Whether to stream the Response
    :return: The response from the request
    :rtype: Response
    
*/
        public delete(url: string, options?: RequestOptions): Response {
            if (!this.esp.isConnected) {
                this.connect()
            }

            this.pixelStatus(0x0000e0)
            let return_val = esp32spi.del(url, options)
            this.pixelStatus(0)
            return return_val
        }

        /** 
    Pass the Ping request to the ESP32, update status LED, return response time

    :param str host: The hostname or IP address to ping
    :param int ttl: (Optional) The Time To Live in milliseconds for the packet (default=250)
    :return: The response time in milliseconds
    :rtype: int
    
*/
        public ping(host: string, ttl = 250): number {
            if (!this.esp.isConnected) {
                this.connect()
            }

            // TODO: (below) types not compatible: number[] and number; 
            this.pixelStatus(0x0000e0)
            let response_time = this.esp.ping(host)
            this.pixelStatus(0)
            return response_time
        }

        /** Returns a formatted local IP address, update status pixel. */
        public get ip_address(): string {
            if (!this.esp.isConnected) {
                this.connect()
            }

            this.pixelStatus(0x0000e0)
            this.pixelStatus(0)
            return this.esp.ipAddress;
        }

        /** Returns receiving signal strength indicator in dBm */
        public get signalStrength(): number {
            if (!this.esp.isConnected) {
                this.connect()
            }
            return this.esp.rssi;
        }
    }
}
