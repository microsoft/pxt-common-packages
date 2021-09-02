const enum AzureIotEvent {
    Connected = 1,
    Disconnected = 2,
    Error = 3,
    GotTwinResponse = 100,
}

namespace azureiot {
    export const SECRETS_KEY = "azureiot"

    export let logPriority = ConsolePriority.Debug;

    type SMap<T> = { [s: string]: T; }
    export type Json = any;

    let _mqttClient: mqtt.Client;
    let _messageBusId: number;
    let _receiveHandler: (msg: Json, sysProps: SMap<string>) => void;
    let _methodHandlers: SMap<(msg: Json) => Json>;

    function log(msg: string) {
        console.add(logPriority, "azureiot: " + msg);
    }

    export function mqttClient(): mqtt.Client {
        if (!_mqttClient)
            _mqttClient = createMQTTClient();
        return _mqttClient;
    }

    function generateSasToken(resourceUri: string, signingKey: string, expiresEpoch: number) {
        const key = Buffer.fromBase64(signingKey)
        resourceUri = net.urlencode(resourceUri)
        const toSign = resourceUri + "\n" + expiresEpoch
        const sig = net.urlencode(crypto.sha256Hmac(key, Buffer.fromUTF8(toSign)).toBase64())
        const token = `sr=${resourceUri}&se=${expiresEpoch}&sig=${sig}`
        return token
    }

    function createMQTTClient() {
        _messageBusId = control.allocateEventSource();

        const connString = settings.programSecrets.readSecret(SECRETS_KEY, true);
        const connStringParts = parsePropertyBag(connString, ";");
        const iotHubHostName = connStringParts["HostName"];
        const deviceId = connStringParts["DeviceId"];
        let sasToken = connStringParts["SharedAccessSignature"];
        if (!sasToken)
            // token valid until year 2255; in future we may try something more short-lived
            sasToken = generateSasToken(`${iotHubHostName}/devices/${deviceId}`, connStringParts["SharedAccessKey"], 9000000000)

        const opts: mqtt.IConnectionOptions = {
            host: iotHubHostName,
            /* port: 8883, overriden based on platform */
            username: `${iotHubHostName}/${deviceId}/?api-version=2018-06-30`,
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

    function parsePropertyBag(msg: string, separator?: string): SMap<string> {
        let r: SMap<string> = {};
        msg.split(separator || "&")
            .map(kv => splitPair(kv))
            .forEach(parts => r[net.urldecode(parts[0])] = net.urldecode(parts[1]));
        return r;
    }

    function encodeQuery(props: SMap<string>): string {
        const keys = Object.keys(props)
        if (keys.length == 0)
            return ""
        return "?" + keys
            .map(k => `${net.urlencode(k)}=${net.urlencode(props[k])}`)
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
    export function publishMessageJSON(msg: Json, sysProps?: SMap<string>) {
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
    export function onMessageReceived(handler: (body: Json, sysProps: SMap<string>) => void) {
        const c = mqttClient();
        if (!_receiveHandler) {
            c.subscribe(`devices/${c.opt.clientId}/messages/devicebound/#`, handleDeviceBound);

            /*
            c.subscribe('$iothub/twin/PATCH/properties/desired/#')
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
        const sysProps = parseTopicArgs(packet.topic)
        _receiveHandler(JSON.parse(packet.content.toString()), sysProps);
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
                resp["_status"] = undefined
            }
            log("method: '" + methodName + "' status=" + status)
        }

        const c = mqttClient();
        c.publish('$iothub/methods/res/' + status + "/?$rid=" + props["$rid"], JSON.stringify(resp))
    }

    let twinRespHandlers: SMap<(status: number, body: any) => void>

    // $iothub/twin/res/{status}/?$rid={request id}
    function twinResponse(msg: mqtt.IMessage) {
        const args = parseTopicArgs(msg.topic)
        const h = twinRespHandlers[args["$rid"]]
        const status = parseInt(msg.topic.slice(17))
        // log(`twin resp: ${status} ${msg.content.toHex()} ${msg.content.toString()}`)
        if (h)
            h(status, JSON.parse(msg.content.toString() || "{}"))
    }

    export class ValueAwaiter {
        private evid: number
        private value: any
        constructor() {
            this.evid = control.allocateNotifyEvent()
        }
        setValue(v: any) {
            this.value = v
            control.raiseEvent(DAL.DEVICE_ID_NOTIFY, this.evid)
            this.evid = -1
        }
        wait() {
            if (this.evid < 0) return this.value
            control.waitForEvent(DAL.DEVICE_ID_NOTIFY, this.evid)
            return this.value
        }
    }

    function twinReq(path: string, msg?: string): Json {
        const c = mqttClient();
        if (!twinRespHandlers) {
            twinRespHandlers = {}
            c.subscribe("$iothub/twin/res/#", twinResponse)
        }
        const rid = Math.randomRange(100000000, 900000000) + ""
        const va = new ValueAwaiter()
        twinRespHandlers[rid] = (status, body) => {
            if (status == 204 || status == 200) {
                va.setValue(body)
            } else {
                log(`error on get twin -> ${status} ${JSON.stringify(body)}`)
                va.setValue(null)
            }
        }
        c.publish(`$iothub/twin/${path}/?$rid=${rid}`, msg)
        return va.wait()
    }

    export function getTwin(): Json {
        return twinReq("GET")
    }

    export function patchTwin(patch: Json) {
        twinReq("PATCH/properties/reported", JSON.stringify(patch))
    }

    export function computePatch(curr: Json, target: Json) {
        const patch: Json = {}
        for (const k of Object.keys(curr)) {
            const vt = target[k]
            if (vt === undefined) {
                patch[k] = null
            } else {
                const vc = curr[k]
                if (typeof vt == "object")
                    if (typeof vc == "object") {
                        const p0 = computePatch(vc, vt)
                        if (Object.keys(p0).length > 0)
                            patch[k] = p0
                    } else {
                        patch[k] = vt
                    }
                else if (vc != vt)
                    patch[k] = vt
            }
        }
        for (const k of Object.keys(target)) {
            if (curr[k] === undefined)
                patch[k] = target[k]
        }
        return patch
    }

    export function applyPatch(trg: Json, patch: Json) {
        for (const k of Object.keys(patch)) {
            const v = patch[k]
            if (v === null) {
                delete trg[k]
            } else if (typeof v == "object") {
                if (!trg[k]) trg[k] = {}
                applyPatch(trg[k], v)
            } else {
                trg[k] = v
            }
        }
    }

    export function onTwinUpdate(handler: (twin: Json, patch: Json) => void) {
        const c = mqttClient()
        let currTwin: Json = null
        let lastVersion: number
        c.subscribe("$iothub/twin/PATCH/properties/desired/#", msg => {
            if (!currTwin)
                return
            const sysProps = parseTopicArgs(msg.topic)
            const ver = parseInt(sysProps["$version"])
            if (ver <= lastVersion) {
                log(`skipping twin update: ${ver}`)
                return
            }
            const update = JSON.parse(msg.content.toString())
            applyPatch(currTwin["desired"], update)
            handler(currTwin, update)
        })
        currTwin = getTwin()
        lastVersion = currTwin["desired"]["$version"]
        handler(currTwin, currTwin["desired"])
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
