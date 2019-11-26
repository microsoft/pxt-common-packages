const enum AzureIotEvent {
    Connected = 1,
    Disconnected = 2,
    Error = 3
}

namespace azureiot {
    export const SECRETS_KEY = "azureiot"

    export let logPriority = ConsolePriority.Silent;

    type SMap<T> = { [s: string]: T; }
    export type Json = any;

    let _mqttClient: mqtt.Client;
    let _messageBusId: number;
    let _receiveHandler: (msg: Json) => void;
    let _methodHandlers: SMap<(msg: Json) => Json>;

    function log(msg: string) {
        console.add(logPriority, "azureiot: " + msg);
    }

    export function mqttClient(): mqtt.Client {
        if (!_mqttClient)
            _mqttClient = createMQTTClient();
        return _mqttClient;
    }

    function createMQTTClient() {
        _messageBusId = control.allocateNotifyEvent(); // TODO

        const connString = settings.programSecrets.readSecret(SECRETS_KEY, true);
        const connStringParts = parsePropertyBag(connString, ";");
        const iotHubHostName = connStringParts["HostName"];
        const deviceId = connStringParts["DeviceName"];
        const sasToken = connStringParts["SharedAccessSignature"];

        const opts: mqtt.IConnectionOptions = {
            host: iotHubHostName,
            /* port: 8883, overriden based on platform */
            username: `${iotHubHostName}/${deviceId}/api-version=2018-06-30`,
            password: "SharedAccessSignature " + sasToken,
            clientId: deviceId
        }
        const c = new mqtt.Client(opts);
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
            log("unhandled msg: " + packet.topic + " / " + packet.content.toString())
        });
        c.connect();
        return c;
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
     * Registers code when the MQTT client gets connected or disconnected
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
            c.subscribe(`devices/${c.opt.clientId}/messages/devicebound/#`, handleDeviceBound);

            /*
            c.subscribe(`devices/${c.opt.clientId}/messages/events/#`);
            c.subscribe('$iothub/twin/PATCH/properties/desired/#')
            c.subscribe("$iothub/twin/res/#")
            c.publish("$iothub/twin/GET/?$rid=foobar")
            */
        }
        _receiveHandler = handler;
    }

    function parseTopicArgs(topic: string) {
        const qidx = topic.indexOf("?")
        if (qidx >= 0)
            return parsePropertyBag(topic.slice(qidx + 1))
        return {}
    }

    function handleDeviceBound(packet: mqtt.IMessage) {
        if (!_receiveHandler) return; // nobody's listening
        // TODO this needs some testing
        const props = parseTopicArgs(packet.topic)
        _receiveHandler(props);
    }

    function handleMethod(msg: mqtt.IMessage) {
        const props = parseTopicArgs(msg.topic)
        const qidx = msg.topic.indexOf("/?")
        const methodName = msg.topic.slice(21, qidx)
        log("method: '" + methodName + "'; " + JSON.stringify(props))
        let status = 200
        let resp: any = {}
        if (!_methodHandlers[methodName]) {
            log("method not found: '" + methodName + "'")
            status = 404
        } else {
            const h = _methodHandlers[methodName]
            const resp2 = h(JSON.parse(msg.content.toString()))
            if (resp2)
                resp = resp2
            if (resp["_status"] != null) {
                status = resp["_status"]
                resp["_status"] = null
            }
            log("method: '" + methodName + "' status=" + status)
        }

        const c = mqttClient();
        c.publish('$iothub/methods/res/' + status + "/?$rid=" + props["$rid"], JSON.stringify(resp))
    }

    export function onMethod(methodName: string, handler: (msg: Json) => Json) {
        const c = mqttClient();
        if (!_methodHandlers) {
            if (!c.connected)
                control.fail("not connected")
            _methodHandlers = {}
            c.subscribe('$iothub/methods/POST/#', handleMethod)
        }
        _methodHandlers[methodName] = handler
    }
}
