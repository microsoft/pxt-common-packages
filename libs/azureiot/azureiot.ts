/** 
Provides access to a Microsoft Azure IoT Hub.
https://docs.microsoft.com/en-us/rest/api/iothub/ 
*/
namespace azureiot {
    // Azure URI API Version Identifier
    export const AZ_API_VER = "2018-06-30"
    // Azure HTTP Status Codes
    export const AZURE_HTTP_ERROR_CODES = [400, 401, 404, 403, 412, 429, 500]
    export class IotHub {
        private _iot_hub_url: string;
        private _azure_header: StringMap;

        /**  Creates an instance of an Azure IoT Hub Client.
    :param wifi_manager: WiFiManager object from ESPSPI_WiFiManager.
    :param str iot_hub_name: Name of your IoT Hub.
    :param str sas_token: Azure IoT Hub SAS Token Identifier.
    :param str device_id: Unique Azure IoT Device Identifier.
    
*/
        constructor(
            private _wifi: esp32spi.WiFiManager, 
            private _iot_hub_name: string, 
            private _sas_token: string, 
            public device_id: string
        ) {
            this._iot_hub_url = `https://${this._iot_hub_name}.azure-devices.net`;
            this._azure_header = {
                "Authorization": this._sas_token
            };
        }

        /** Returns a message from a Microsoft Azure IoT Hub (Cloud-to-Device).
    Returns None if the message queue is empty.
    NOTE: HTTP Cloud-to-Device messages are throttled. Poll every 25+ minutes.
    
*/
        public hubMessage(): string {
            let reject_message = true
            // get a device-bound notification
            const path = `${this._iot_hub_url}/devices/${this.device_id}/messages/deviceBound?api-version=${AZ_API_VER}`
            let data = this.get(path, true)
            // device's message queue is empty
            if (data == 204) {
                return null
            }

            let etag = data[1]["etag"]
            // either complete or nack the message
            if (etag) {
                reject_message = false
                let path_complete = `${this._iot_hub_url}/devices/${this.device_id}/messages/deviceBound/${etag.strip("'\"")}?api-version=${AZ_API_VER}`;
                if (reject_message) {
                    path_complete += "&reject"
                }

                let del_status = this.delete(path_complete)
                if (del_status == 204) {
                    return data[0]
                }
            }
            return null
        }

        /** Sends a device-to-cloud message.
    :param string message: Message to send to Azure IoT.
    
*/
        public sendDeviceMessage(message: any): void {
            let path = `${this._iot_hub_url}/devices/${this.device_id}/messages/events?api-version=${AZ_API_VER}`
            this.post(path, message, false)
        }

        /** Returns the device's device twin information in JSON format. */
        public deviceTwin(): any {
            let path = `${this._iot_hub_url}/twins/${this.device_id}?api-version=${AZ_API_VER}`
            return this.get(path)
        }

        /** Updates tags and desired properties of the device's device twin.
    :param str properties: Device Twin Properties
    (https://docs.microsoft.com/en-us/rest/api/iothub/service/updatetwin#twinproperties)
    
*/
        public updateDeviceTwin(properties: any): any {
            let path = `${this._iot_hub_url}/twins/${this.device_id}?api-version=${AZ_API_VER}`;
            return this.patch(path, properties)
        }

        /** Replaces tags and desired properties of a device twin.
    :param str properties: Device Twin Properties.
    
*/
        public replaceDeviceTwin(properties: any): any {
            let path = `${this._iot_hub_url}/twins/${this.device_id}?api-version-${AZ_API_VER}`
            return this.put(path, properties)
        }

        // IoT Hub Service
        /** Enumerate devices from the identity registry of the IoT Hub. */
        public devices(): any {
            let path = `${this._iot_hub_url}/devices/?api-version=${AZ_API_VER}`
            return this.get(path)
        }

        /** Gets device information from the identity
    registry of an IoT Hub.
    
*/
        public device(): any {
            let path = `${this._iot_hub_url}/devices/${this.device_id}?api-version=${AZ_API_VER}`;
            return this.get(path)
        }

        /** HTTP POST
    :param str path: Formatted Azure IOT Hub Path.
    :param str payload: JSON-formatted Data Payload.
    
*/
        private post(path: string, payload: any, return_response: boolean = true): string | any {
            let response = this._wifi.post(path, { json: payload, headers: this._azure_header })
            this.parseHttpStatus(response.status_code, response.reason)
            if (return_response) {
                return response.json;
            }

            return response.text
        }

        /** HTTP GET
    :param str path: Formatted Azure IOT Hub Path.
    :param bool is_c2d: Cloud-to-device get request.
    
*/
        private get(path: string, is_c2d: boolean = false): any {
            let response = this._wifi.get(path, { headers: this._azure_header })
            let status_code = response.status_code
            if (is_c2d) {
                if (status_code == 200) {
                    let data = response.text
                    let headers = response.headers
                    response.close()
                    return [data, headers]
                }

                response.close()
                return status_code
            }

            let json = response.json
            response.close()
            return json
        }

        /** HTTP DELETE
    :param str path: Formatted Azure IOT Hub Path.
    
*/
        private delete(path: string, etag?: string): number {
            let data_headers: any;
            if (etag) {
                data_headers = { "Authorization": this._sas_token, "If-Match": `"${etag}"` }
            } else {
                data_headers = this._azure_header
            }

            let response = this._wifi.delete(path, { headers: data_headers })
            this.parseHttpStatus(response.status_code, response.reason)
            let status_code = response.status_code
            response.close()
            return status_code
        }

        /** HTTP PATCH
    :param str path: Formatted Azure IOT Hub Path.
    :param str payload: JSON-formatted payload.
    
*/
        private patch(path: string, payload: any): any {
            let response = this._wifi.patch(path, { json: payload, headers: this._azure_header })
            this.parseHttpStatus(response.status_code, response.reason)
            let json_data = response.json
            response.close()
            return json_data
        }

        /** HTTP PUT
    :param str path: Formatted Azure IOT Hub Path.
    :param str payload: JSON-formatted payload.
    
*/
        private put(path: any, payload?: any): any {
            let response = this._wifi.put(path, { json: payload, headers: this._azure_header })
            this.parseHttpStatus(response.status_code, response.reason)
            let json_data = response.json
            response.close()
            return json_data
        }

        // Parses status code, throws error based on Azure IoT Common Error Codes
        private parseHttpStatus(status_code: number, status_reason: string) {
            if (AZURE_HTTP_ERROR_CODES.indexOf(status_code) > -1)
                console.log(`error ${status_code}: ${status_reason}`);
        }
    }
}
