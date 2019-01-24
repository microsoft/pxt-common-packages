const enum AzureIotEvent {
    Connected = 1,
    Disconnected = 2,
    Error = 3
}

namespace azure {
    export let logPriority = ConsolePriority.Silent;

    let _mqttClient: mqtt.Client;
    let _messageBusId: number;
    let _receiveHandler: (msg: any) => void;

    function log(msg: string) {
        console.add(logPriority, msg);
    }

    function mqttClient(): mqtt.Client {
        if (!_mqttClient)
            _mqttClient = createMQTTClient();
        return _mqttClient;
    }

    function createMQTTClient() {
        _messageBusId = control.allocateNotifyEvent(); // TODO

        const net: mqtt.INet = undefined; // TODO
        const sasToken = "";// TODO get from config
        const sasParts = parsePropertyBag(sasToken, ";");
        const iotHubHostName = sasParts["HostName"];
        const deviceId = sasParts["DeviceName"];
        const sharedAccessSignature = sasParts["SharedAccessSignature"];

        const opts: mqtt.IConnectionOptions = {
            host: iotHubHostName,
            port: 8883,
            username: `${iotHubHostName}/${deviceId}/api-version=2018-06-30`,
            password: sharedAccessSignature,
            clientId: deviceId
        }
        const c = new mqtt.Client(opts, net);
        c.on('info', (msg: string) => log(msg));
        c.on('connected', () => control.raiseEvent(_messageBusId, AzureIotEvent.Connected));
        c.on('disconnected', () => control.raiseEvent(_messageBusId, AzureIotEvent.Disconnected));
        c.on('error', () => control.raiseEvent(_messageBusId, AzureIotEvent.Error));
        c.on('receive', (packet: mqtt.IMessage) => handleReceive(packet));
        c.connect();
        // wait for connection
        if (!c.connected)
            control.waitForEvent(_messageBusId, AzureIotEvent.Connected);
        return c;
    }

    function handleReceive(packet: mqtt.IMesssage) {
        if (!_receiveHandler) return; // nobody's listening
        const topic = packet.topic;
        const props = packet.topic.substring(`devices/${_mqttClient.opt.clientId}/messages/devicebound/`.length);
        const msg = decodeQuery(props);
        _receiveHandler(msg);
    }

    function splitPair(kv: string): string[] {
        let i = kv.indexOf('=');
        if (i < 0)
            return [kv, ""];
        else
            return [kv.substr(0, i), kv.substr(i + 1)];
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
        Object.keys(r).forEach(k => r[k] = Object.parse(r[k]));
        return r;
    }

    function encodeQuery(props: any): string {
        // TODO uriencode
        return Object.keys(props)
            .map(k => `${k}=${JSON.stringify(props[k])}`)
            .join('&');
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
    export function publishMessage(msg: any) {
        const c = mqttClient();
        let topic = `devices/${c.opt.clientId}/events/`;
        if (msg)
            topic += encodeQuery(msg);
        // qos, retained are not supported
        c.publish(topic, "");
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
            const topic = `devices/${c.opt.clientId}/messages/devicebound/#`;
            c.subscribe(topic);
        }
        _receiveHandler = handler;
    }
}