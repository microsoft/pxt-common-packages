const enum AzureIotEvent {
    Connected = 1,
    Disconnected = 2,
    Error = 3
}

namespace azureiot {
    export let logPriority = ConsolePriority.Silent;

    let _mqttClient: mqtt.Client;
    let _messageBusId: number;
    let _receiveHandler: (msg: any) => void;

    function log(msg: string) {
        console.add(logPriority, "azureiot: " + msg);
    }

    export function mqttClient(): mqtt.Client {
        if (!_mqttClient)
            _mqttClient = createMQTTClient();
        return _mqttClient;
    }

    export let network: net.Net
    export let connString = ""
    export let sasToken = ""

    function createMQTTClient() {
        _messageBusId = control.allocateNotifyEvent(); // TODO

        const connStringParts = parsePropertyBag(connString, ";");
        const iotHubHostName = connStringParts["HostName"];
        const deviceId = connStringParts["DeviceName"];

        const opts: mqtt.IConnectionOptions = {
            host: iotHubHostName,
            /* port: 8883, overriden based on platform */
            username: `${iotHubHostName}/${deviceId}/api-version=2018-06-30`,
            password: sasToken,
            clientId: deviceId
        }
        const c = new mqtt.Client(opts, network);
        c.on('connected', () => {
            log("connected")
            control.raiseEvent(_messageBusId, AzureIotEvent.Connected)
        });
        c.on('disconnected', () => {
            log("disconnected")
            control.raiseEvent(_messageBusId, AzureIotEvent.Disconnected)
        });
        c.on('error', (msg) => {
            log("error: " + msg)
            control.raiseEvent(_messageBusId, AzureIotEvent.Error)
        });
        c.on('receive', (packet: mqtt.IMessage) => {
            log("got data")
            handleReceive(packet)
        });
        c.connect();
        return c;
    }

    function handleReceive(packet: mqtt.IMessage) {
        if (!_receiveHandler) return; // nobody's listening
        const topic = packet.topic;
        const pref = `devices/${_mqttClient.opt.clientId}/messages/devicebound/`
        if (packet.topic.slice(0, pref.length) == pref) {
            const props = packet.topic.slice(pref.length);
            const msg = decodeQuery(props);
            log("recv: " + props + " / " + packet.content.length)
            _receiveHandler(msg);
        } else {
            log("msg: " + packet.topic + " / " + packet.content.toString())
        }
    }

    function splitPair(kv: string): string[] {
        let i = kv.indexOf('=');
        if (i < 0)
            return [kv, ""];
        else
            return [kv.slice(0, i), kv.slice(i + 1)];
    }

    function parsePropertyBag(msg: string, separator?: string): any {
        let r: any = {};
        msg.split(separator || "&")
            .map(kv => splitPair(kv))
            .forEach(parts => r[parts[0]] = parts[1]);
        return r;
    }

    function decodeQuery(msg: string, separator?: string): any {
        const r = parsePropertyBag(msg, separator);
        // TODO uridecode
        Object.keys(r).forEach(k => r[k] = JSON.parse(r[k]));
        return r;
    }

    function encodeQuery(props: any): string {
        // TODO uriencode
        return Object.keys(props)
            .map(k => `${k}=${JSON.stringify(props[k])}`)
            .join('&');
    }

    /**
     * Connects to the IoT hub
     */
    export function connect() {
        const c = mqttClient();
        // wait for connection
        if (!c.connected)
            control.waitForEvent(_messageBusId, AzureIotEvent.Connected);
    }

    /**
     * Registers code when the mqtt client gets connector or disconnected
     * @param event 
     * @param handler 
     */
    export function onEvent(event: AzureIotEvent, handler: () => void) {
        const c = mqttClient();
        control.onEvent(_messageBusId, event, handler);
        if (c.connected) // raise connected event by default
            control.raiseEvent(_messageBusId, AzureIotEvent.Connected);
    }

    /**
     * Indicates if the MQTT client is connected
     */
    //%
    export function isConnected(): boolean {
        const c = mqttClient();
        return !!c.connected;
    }

    /**
     * Send a message via mqtt
     * @param msg 
     */
    //%
    export function publishMessage(msg: any, sysProps?: any) {
        const c = mqttClient();
        let topic = `devices/${c.opt.clientId}/messages/events/`;
        if (sysProps)
            topic += encodeQuery(sysProps);
        // qos, retained are not supported
        c.publish(topic, JSON.stringify(msg));
    }

    /**
     * Registers code to run when a message is received
     * @param handler 
     */
    //%
    export function onMessageReceived(handler: (msg: any) => void) {
        const c = mqttClient();
        if (!_receiveHandler) {
            // subscribe as needed
            c.subscribe(`devices/${c.opt.clientId}/messages/devicebound/#`);
            c.subscribe(`devices/${c.opt.clientId}/messages/events/#`);
            c.subscribe('$iothub/twin/PATCH/properties/desired/#')
            c.subscribe('$iothub/methods/#')
            c.subscribe("$iothub/twin/res/#")
            c.publish("$iothub/twin/GET/?$rid=foobar")
        }
        _receiveHandler = handler;
    }
}
