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
    let twinRespHandlers: SMap<(status: number, body: any) => void>

    function log(msg: string) {
        console.add(logPriority, "azureiot: " + msg);
    }

    export function mqttClient(skipCreate?: boolean): mqtt.Client {
        if (!_mqttClient && !skipCreate) {
            log("creating mqtt client")
            _mqttClient = createMQTTClient();
        }
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

    export function hubName() {
        return connectionStringPart("HostName")
    }

    export function hubDeviceId() {
        return connectionStringPart("DeviceId")
    }

    function messageBusId() {
        if (!_messageBusId)
            _messageBusId = control.allocateEventSource();
        return _messageBusId
    }

    function createMQTTClient() {
        messageBusId()
        const iotHubHostName = hubName()
        const deviceId = hubDeviceId()
        if (!iotHubHostName || !deviceId)
            throw "invalid connection string"

        const connStringParts = parseConnectionString();
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
        const evid = messageBusId()
        c.on('connected', () => {
            log("connected")
            control.raiseEvent(evid, AzureIotEvent.Connected)
        });
        c.on('disconnected', () => {
            log("disconnected")
            control.raiseEvent(evid, AzureIotEvent.Disconnected)
        });
        c.on('error', (msg) => {
            log("error: " + msg)
            control.raiseEvent(evid, AzureIotEvent.Error)
        });
        c.on('receive', (packet: mqtt.IMessage) => {
            log("unhandled msg: " + packet.topic + " / " + packet.content.toString())
        });
        c.connect();
        return c;
    }

    function splitPair(kv: string): string[] {
        const i = kv.indexOf('=');
        if (i < 0)
            return [kv, ""];
        else
            return [kv.slice(0, i), kv.slice(i + 1)];
    }

    function parsePropertyBag(msg: string, separator?: string): SMap<string> {
        const r: SMap<string> = {};
        if (msg && typeof msg === "string")
            msg.split(separator || "&")
                .map(kv => splitPair(kv))
                .filter(parts => !!parts[1].length)
                .forEach(parts => r[net.urldecode(parts[0])] = net.urldecode(parts[1]));
        return r;
    }

    function parseConnectionString() {
        try {
            const connString = settings.programSecrets.readSecret(SECRETS_KEY);
            const connStringParts = parsePropertyBag(connString, ";");
            return connStringParts
        } catch {
            console.debug(`clearing invalid azure iot connection string`)
            settings.programSecrets.setSecret(SECRETS_KEY, "")
            return {}
        }
    }

    function connectionStringPart(name: string) {
        const connStringParts = parseConnectionString()
        const value = connStringParts[name];
        return value || ""
    }

    function encodeQuery(props: SMap<string>): string {
        const keys = Object.keys(props)
        if (keys.length == 0)
            return ""
        return "?" + keys
            .map(k => `${net.urlencode(k)}=${net.urlencode(props[k])}`)
            .join('&');
    }

    export function setConnectionString(connectionString: string) {
        disconnect()
        settings.programSecrets.setSecret(SECRETS_KEY, connectionString)
        parseConnectionString()
    }

    /**
     * Disconnects the hub if any
     */
    export function disconnect() {
        const c = mqttClient(true)
        if (c) {
            try {
                c.disconnect()
            }
            catch {
                // just ignore errors disconnecting
            }
        }
    }

    /**
     * Connects to the IoT hub
     */
    export function connect() {
        const c = mqttClient();
        if (!c.connected) {
            c.connect() // start connect if not started yet
            // busy wait for connection
            const start = control.millis()
            const timeout = 30000
            while (!c.connected && control.millis() - start < timeout) {
                pause(1000)
            }
            if (!c.connected)
                throw "connection failed"
        }
    }

    /**
     * Registers code when the MQTT client gets connected or disconnected
     * @param event 
     * @param handler 
     */
    export function onEvent(event: AzureIotEvent, handler: () => void) {
        const evid = messageBusId()
        control.onEvent(evid, event, handler);
        try {
            const c = mqttClient(true);
            if (c && c.connected) // raise connected event by default
                control.raiseEvent(evid, AzureIotEvent.Connected);
        } catch { }
    }

    /**
     * Indicates if the MQTT client is connected
     */
    //%
    export function isConnected(): boolean {
        try {
            const c = mqttClient(true);
            return !!c && !!c.connected;
        }
        catch {
            return false
        }
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
        const m = JSON.stringify(msg)
        msg = null
        // qos, retained are not supported
        c.publish(topic, m);
    }

    /**
     * Send a message via mqtt
     * @param msg 
     */
    //%
    export function publishMessageBuffer(msg: Buffer, sysProps?: SMap<string>) {
        const c = mqttClient();
        let topic = `devices/${c.opt.clientId}/messages/events/`;
        if (sysProps)
            topic += encodeQuery(sysProps);
        // qos, retained are not supported
        c.publish(topic, msg);
    }

    /**
     * Send a message via mqtt
     * @param msg 
     */
    //%
    export function publishMessageHex(msg: Buffer, len?: number, sysProps?: SMap<string>) {
        const c = mqttClient();
        let topic = `devices/${c.opt.clientId}/messages/events/`;
        if (sysProps)
            topic += encodeQuery(sysProps);
        if (len == null)
            len = msg.length
        if (len > msg.length) {
            log(`len too long: ${len}/${msg.length}`)
            len = msg.length
        }
        // qos, retained are not supported
        if (c.startPublish(topic, len * 2)) {
            const chunk = 128
            for (let ptr = 0; ptr < len; ptr += chunk)
                c.continuePublish(Buffer.fromUTF8(msg.slice(ptr, Math.min(chunk, len - ptr)).toHex()))
            c.finishPublish()
        }
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

    // $iothub/twin/res/{status}/?$rid={request id}
    function twinResponse(msg: mqtt.IMessage) {
        const args = parseTopicArgs(msg.topic)
        const h = twinRespHandlers[args["$rid"]]
        const status = parseInt(msg.topic.slice(17))
        // log(`twin resp: ${status} ${msg.content.toHex()} ${msg.content.toString()}`)
        if (h) {
            delete twinRespHandlers[args["$rid"]]
            h(status, JSON.parse(msg.content.toString() || "{}"))
        }
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
                log(`twin error -> ${status} ${JSON.stringify(body)}`)
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
        const p = JSON.stringify(patch)
        if (p == "{}")
            log("skipping empty twin patch")
        else {
            log(`twin patch: ${JSON.stringify(patch)}`)
            twinReq("PATCH/properties/reported", p)
        }
    }

    export function computePatch(curr: Json, target: Json) {
        const patch: Json = {}
        for (const k of Object.keys(curr)) {
            const vt = target[k]
            if (k[0] == "$")
                continue
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
            if (curr[k] === undefined && k[0] != "$")
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
                throw "azure iot hub not connected"
            _methodHandlers = {}
            c.subscribe('$iothub/methods/POST/#', handleMethod)
        }
        _methodHandlers[methodName] = handler
    }
}
