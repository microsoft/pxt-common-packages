namespace esp32spi {
    export class ESPSPI_WiFiManager {
        _esp: ESP_SPIcontrol; /** TODO: type **/
        debug: boolean;
        ssid: string; /** TODO: type **/
        password: string; /** TODO: type **/
        attempts: number
        statuspix: DigitalInOutPin; /** TODO: type **/
        /** 
    :param ESP_SPIcontrol esp: The ESP object we are using
    :param dict secrets: The WiFi and Adafruit IO secrets dict (See examples)
    :param status_pixel: (Optional) The pixel device - A NeoPixel, DotStar,
        or RGB LED (default=None)
    :type status_pixel: NeoPixel, DotStar, or RGB LED
    :param int attempts: (Optional) Failed attempts before resetting the ESP32 (default=2)
    
*/
        constructor(secrets: any, status_pixel: DigitalInOutPin = null, attempts: number = 2) {
            // Read the settings
            this._esp = ESP_SPIcontrol.instance;
            this.debug = false
            this.ssid = secrets["ssid"]
            this.password = secrets["password"]
            this.attempts = attempts
            this.statuspix = status_pixel
            this.pixel_status(0)
        }

        public reset(): void {
        /** Perform a hard reset on the ESP32 */
        if (this.debug) {
            print("Resetting ESP32")
        }

        this._esp.reset()
    }
        
        public connect(): void {
        /** Attempt to connect to WiFi using the current settings */
        if (this.debug) {
            if (this._esp.status == esp32spi.WL_IDLE_STATUS) {
                print("ESP32 found and in idle mode")
            }

            print("Firmware vers.", this._esp.firmware_version)
            print("MAC addr:", { TODO: ListComp })
            for (let access_pt of this._esp.scan_networks()) {
                print(`	${str(access_pt["ssid"], "utf-8")}		RSSI: ${access_pt["rssi"]}`)
            }
        }

        let failure_count = 0
        while (!this._esp.is_connected) {
            try {
                if (this.debug) {
                    print("Connecting to AP...")
                }

                // TODO: (below) types not compatible: number[] and number; 
                this.pixel_status([100, 0, 0])
                this._esp.connect_AP(pins.createBufferFromArray(this.ssid, "utf-8"), pins.createBufferFromArray(this.password, "utf-8"))
                failure_count = 0
                // TODO: (below) types not compatible: number[] and number; 
                this.pixel_status([0, 100, 0])
            }
            catch (error/* instanceof [ValueError, RuntimeError] */) {
                print(`Failed to connect, retrying
`, error)
                failure_count += 1
                if (failure_count >= this.attempts) {
                    failure_count = 0
                    this.reset()
                }

                break
            }

        }
    }
        
        public get(url: any; /** TODO: type **/, TODO ** kw): any; /** TODO: type **/ {
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
        if (!this._esp.is_connected) {
            this.connect()
        }

        // TODO: (below) types not compatible: number[] and number; 
        this.pixel_status([0, 0, 100])
        let return_val = esp32spi_requests.get(url, { null: kw })
        this.pixel_status(0)
        return return_val
    }
        
        public post(url: any; /** TODO: type **/, TODO ** kw): any; /** TODO: type **/ {
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
        if (!this._esp.is_connected) {
            this.connect()
        }

        // TODO: (below) types not compatible: number[] and number; 
        this.pixel_status([0, 0, 100])
        let return_val = esp32spi_requests.post(url, { null: kw })
        return return_val
    }
        
        public put(url: any; /** TODO: type **/, TODO ** kw): any; /** TODO: type **/ {
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
        if (!this._esp.is_connected) {
            this.connect()
        }

        // TODO: (below) types not compatible: number[] and number; 
        this.pixel_status([0, 0, 100])
        let return_val = esp32spi_requests.put(url, { null: kw })
        this.pixel_status(0)
        return return_val
    }
        
        public patch(url: any; /** TODO: type **/, TODO ** kw): any; /** TODO: type **/ {
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
        if (!this._esp.is_connected) {
            this.connect()
        }

        // TODO: (below) types not compatible: number[] and number; 
        this.pixel_status([0, 0, 100])
        let return_val = esp32spi_requests.patch(url, { null: kw })
        this.pixel_status(0)
        return return_val
    }
        
        public delete_(url: any; /** TODO: type **/, TODO ** kw): any; /** TODO: type **/ {
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
        if (!this._esp.is_connected) {
            this.connect()
        }

        // TODO: (below) types not compatible: number[] and number; 
        this.pixel_status([0, 0, 100])
        let return_val = esp32spi_requests.delete_(url, { null: kw })
        this.pixel_status(0)
        return return_val
    }
        
        public ping(host: any; /** TODO: type **/, ttl: number = 250): any; /** TODO: type **/ {
        /** 
    Pass the Ping request to the ESP32, update status LED, return response time

    :param str host: The hostname or IP address to ping
    :param int ttl: (Optional) The Time To Live in milliseconds for the packet (default=250)
    :return: The response time in milliseconds
    :rtype: int
    
*/
        if (!this._esp.is_connected) {
            this.connect()
        }

        // TODO: (below) types not compatible: number[] and number; 
        this.pixel_status([0, 0, 100])
        let response_time = this._esp.ping(host, { ttl: ttl })
        this.pixel_status(0)
        return response_time
    }
        
        public ip_address(): any; /** TODO: type **/ {
        /** Returns a formatted local IP address, update status pixel. */
        if (!this._esp.is_connected) {
            this.connect()
        }

        // TODO: (below) types not compatible: number[] and number; 
        this.pixel_status([0, 0, 100])
        this.pixel_status(0)
        return this._esp.pretty_ip(this._esp.ip_address)
    }
        
        public pixel_status(value: number): any; /** TODO: type **/ {
        /** 
    Change Status Pixel if it was defined

    :param value: The value to set the Board's status LED to
    :type value: int or 3-value tuple
    
*/
        if (this.statuspix) {
            if (hasattr(this.statuspix, "color")) {
                this.statuspix.color = value
            } else {
                this.statuspix.fill(value)
            }

        }

    }
        
        public signal_strength(): any; /** TODO: type **/ {
        /** Returns receiving signal strength indicator in dBm */
        if (!this._esp.is_connected) {
            this.connect()
        }

        return this._esp.rssi()
    }

}
    
}
