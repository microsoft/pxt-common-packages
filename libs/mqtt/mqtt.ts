namespace mqtt {
    /**
     * Connect flags
     * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc385349229
     */
    export const enum ConnectFlags {
        UserName = 128,
        Password = 64,
        WillRetain = 32,
        WillQoS2 = 16,
        WillQoS1 = 8,
        Will = 4,
        CleanSession = 2
    }

    /**
     * Connect Return code
     * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc385349256
     */
    export const enum ConnectReturnCode {
        Unknown = -1,
        Accepted = 0,
        UnacceptableProtocolVersion = 1,
        IdentifierRejected = 2,
        ServerUnavailable = 3,
        BadUserNameOrPassword = 4,
        NotAuthorized = 5
    }

    /**
     * A message received in a Publish packet.
     */
    export interface IMessage {
        pid?: number;
        topic: string;
        content: Buffer;
        qos: number;
        retain: number;
    }

    /**
     * MQTT Control Packet type
     * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc353481061
     */
    export const enum ControlPacketType {
        Connect = 1,
        ConnAck = 2,
        Publish = 3,
        PubAck = 4,
        // PubRec = 5,
        // PubRel = 6,
        // PubComp = 7,
        Subscribe = 8,
        SubAck = 9,
        Unsubscribe = 10,
        UnsubAck = 11,
        PingReq = 12,
        PingResp = 13,
        Disconnect = 14
    }

    /**
     * Optimization, the TypeScript compiler replaces the constant enums.
     */
    export const enum Constants {
        PingInterval = 40,
        WatchDogInterval = 50,
        DefaultQos = 0,
        Uninitialized = -123,
        FixedPackedId = 1,
        KeepAlive = 60
    }

    /**
     * The options used to connect to the MQTT broker.
     */
    export interface IConnectionOptions {
        host: string;
        port?: number;
        username?: string;
        password?: string;
        clientId: string;
        will?: IConnectionOptionsWill;
    }

    export interface IConnectionOptionsWill {
        topic: string;
        message: string;
        qos?: number;
        retain?: boolean;
    }

    /**
     * The specifics of the MQTT protocol.
     */
    export module Protocol {
        function strChr(codes: number[]): Buffer {
            return pins.createBufferFromArray(codes)
        }

        /**
         * Encode remaining length
         * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718023
         */
        function encodeRemainingLength(remainingLength: number): number[] {
            let length: number = remainingLength;
            const encBytes: number[] = [];
            do {
                let encByte: number = length & 127;
                length = length >> 7;
                // if there are more data to encode, set the top bit of this byte
                if (length > 0) {
                    encByte += 128;
                }
                encBytes.push(encByte);
            } while (length > 0);

            return encBytes;
        }

        /**
         * Connect flags
         * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc385349229
         */
        function createConnectFlags(options: IConnectionOptions): number {
            let flags: number = 0;
            flags |= (options.username) ? ConnectFlags.UserName : 0;
            flags |= (options.username && options.password) ? ConnectFlags.Password : 0;
            flags |= ConnectFlags.CleanSession;

            if (options.will) {
                flags |= ConnectFlags.Will;
                flags |= (options.will.qos || 0) << 3;
                flags |= (options.will.retain) ? ConnectFlags.WillRetain : 0;
            }

            return flags;
        }

        // Returns the MSB and LSB.
        function getBytes(int16: number): number[] {
            return [int16 >> 8, int16 & 255];
        }

        /**
         * Structure of UTF-8 encoded strings
         * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Figure_1.1_Structure
         */
        function pack(s: string): Buffer {
            const buf = control.createBufferFromUTF8(s);
            return strChr(getBytes(buf.length)).concat(buf);
        }

        /**
         * Structure of an MQTT Control Packet
         * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc384800392
         */
        function createPacket(byte1: number, variable: Buffer, payload?: Buffer): Buffer {
            if (payload == null) payload = control.createBuffer(0);
            const byte2: number[] = encodeRemainingLength(variable.length + payload.length);
            return strChr([byte1])
                .concat(strChr(byte2))
                .concat(variable)
                .concat(payload)
        }

        /**
         * CONNECT - Client requests a connection to a Server
         * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718028
         */
        export function createConnect(options: IConnectionOptions): Buffer {
            const byte1: number = ControlPacketType.Connect << 4;

            const protocolName = pack('MQTT');
            const nums = control.createBuffer(4)
            nums[0] = 4; // protocol level
            nums[1] = createConnectFlags(options)
            nums[2] = 0
            nums[3] = Constants.KeepAlive

            let payload = pack(options.clientId);

            if (options.will) {
                payload = payload
                    .concat(pack(options.will.topic)
                        .concat(pack(options.will.message)));
            }

            if (options.username) {
                payload = payload.concat(pack(options.username));
                if (options.password) {
                    payload = payload.concat(pack(options.password));
                }
            }

            return createPacket(
                byte1,
                protocolName.concat(nums),
                payload
            );
        }

        /** PINGREQ - PING request
         * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc384800454
         */
        export function createPingReq() {
            return strChr([ControlPacketType.PingReq << 4, 0]);
        }

        /**
         * PUBLISH - Publish message
         * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc384800410
         */
        export function createPublish(topic: string, message: Buffer, qos: number, retained: boolean) {
            let byte1: number = ControlPacketType.Publish << 4 | (qos << 1);
            byte1 |= (retained) ? 1 : 0;

            const pid = strChr(getBytes(Constants.FixedPackedId));
            const variable = (qos === 0) ? pack(topic) : pack(topic).concat(pid);

            return createPacket(byte1, variable, message);
        }

        export function parsePublish(cmd: number, payload: Buffer): IMessage {
            const qos: number = (cmd & 0b00000110) >> 1;

            const topicLength = payload.getNumber(NumberFormat.UInt16BE, 0);
            let variableLength: number = 2 + topicLength;
            if (qos > 0) {
                variableLength += 2;
            }

            const message: IMessage = {
                topic: payload.slice(2, topicLength).toString(),
                content: payload.slice(variableLength),
                qos: qos,
                retain: cmd & 1
            };

            if (qos > 0)
                message.pid = payload.getNumber(NumberFormat.UInt16BE, variableLength - 2);

            return message;
        }

        /**
         * PUBACK - Publish acknowledgement
         * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc384800416
         */
        export function createPubAck(pid: number) {
            const byte1: number = ControlPacketType.PubAck << 4;

            return createPacket(byte1, strChr(getBytes(pid)));
        }

        /**
         * SUBSCRIBE - Subscribe to topics
         * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc384800436
         */
        export function createSubscribe(topic: string, qos: number): Buffer {
            const byte1: number = ControlPacketType.Subscribe << 4 | 2;
            const pid = strChr(getBytes(Constants.FixedPackedId));

            return createPacket(byte1,
                pid,
                pack(topic).concat(strChr([qos])))
        }
    }

    export type EventHandler = (arg?: string | IMessage) => void;

    export class EventEmitter {
        private handlers: { [index: string]: EventHandler[] };

        constructor() {
            this.handlers = {};
        }

        public on(event: string, listener: EventHandler): void {
            if (!event || !listener) return;

            let listeners = this.handlers[event];
            if (!listeners)
                this.handlers[event] = listeners = [];
            listeners.push(listener);
        }
        protected emit(event: string, arg?: string | IMessage): boolean {
            let listeners = this.handlers[event];
            if (listeners) {
                listeners.forEach(listener => listener(arg));
            }
            return true;
        }
    }

    class MQTTHandler {
        constructor(
            public topic: string,
            public handler: (m: IMessage) => void
        ) { }
    }

    export class Client extends EventEmitter {
        public logPriority : ConsolePriority;
        private log(msg: string) {
            console.add(this.logPriority, `mqtt: ${msg}`);
        }

        public opt: IConnectionOptions;

        private net: net.Net;
        private sct?: net.Socket;

        private wdId: number;
        private piId: number;

        private buf: Buffer;

        public connected: boolean;

        private mqttHandlers: MQTTHandler[];

        constructor(opt: IConnectionOptions) {
            super();

            this.wdId = Constants.Uninitialized;
            this.piId = Constants.Uninitialized;
            this.logPriority = ConsolePriority.Silent;
            this.connected = false;
            opt.port = opt.port || 8883;
            opt.clientId = opt.clientId;

            if (opt.will) {
                opt.will.qos = opt.will.qos || Constants.DefaultQos;
                opt.will.retain = opt.will.retain || false;
            }

            this.opt = opt;
            this.net = net.instance();
        }

        private static describe(code: ConnectReturnCode): string {
            let error: string = 'Connection refused, ';
            switch (code) {
                case ConnectReturnCode.UnacceptableProtocolVersion:
                    error += 'unacceptable protocol version.';
                    break;
                case ConnectReturnCode.IdentifierRejected:
                    error += 'identifier rejected.';
                    break;
                case ConnectReturnCode.ServerUnavailable:
                    error += 'server unavailable.';
                    break;
                case ConnectReturnCode.BadUserNameOrPassword:
                    error += 'bad user name or password.';
                    break;
                case ConnectReturnCode.NotAuthorized:
                    error += 'not authorized.';
                    break;
                default:
                    error += `unknown return code: ${code}.`;
            }

            return error;
        }

        public disconnect(): void {
            if (this.wdId !== Constants.Uninitialized) {
                clearInterval(this.wdId);
                this.wdId = Constants.Uninitialized;
            }

            if (this.piId !== Constants.Uninitialized) {
                clearInterval(this.piId);
                this.piId = Constants.Uninitialized;
            }

            if (this.sct) {
                //this.sct.removeAllListeners('connect');
                //this.sct.removeAllListeners('data');
                //this.sct.removeAllListeners('close');
                this.sct.close();
            }
        }

        public connect(): void {
            this.log(`Connecting to ${this.opt.host}:${this.opt.port}`);
            if (this.wdId === Constants.Uninitialized) {
                this.wdId = setInterval(() => {
                    if (!this.connected) {
                        this.emit('disconnected');
                        this.emit('error', 'No connection. Retrying.');
                        this.disconnect();
                        this.connect();
                    }
                }, Constants.WatchDogInterval * 1000);
            }

            this.sct = this.net.createSocket(this.opt.host, this.opt.port, true);
            this.sct.onOpen(() => {
                this.log('Network connection established.');
                this.emit('connect');
                this.send(Protocol.createConnect(this.opt));
            });
            this.sct.onMessage((msg: Buffer) => {
                this.log("incoming " + msg.length + " bytes")
                this.handleMessage(msg);
            });
            this.sct.onError(() => {
                this.log('Error.');
                this.emit('error');
            });
            this.sct.onClose(() => {
                this.log('Close.');
                this.emit('disconnected');
                this.connected = false;
            });
            this.sct.connect();
        }

        // Publish a message
        public publish(topic: string, message?: string | Buffer, qos: number = Constants.DefaultQos, retained: boolean = false): void {
            const buf = typeof message == "string" ? control.createBufferFromUTF8(message) : message
            this.send(Protocol.createPublish(topic, buf, qos, retained));
        }

        // Subscribe to topic
        public subscribe(topic: string, handler?: (msg: IMessage) => void, qos: number = Constants.DefaultQos): void {
            this.send(Protocol.createSubscribe(topic, qos));
            if (handler) {
                if (topic[topic.length - 1] == "#")
                    topic = topic.slice(0, topic.length - 1)
                if (!this.mqttHandlers) this.mqttHandlers = []
                this.mqttHandlers.push(new MQTTHandler(topic, handler))
            }
        }

        private send(data: Buffer): void {
            if (this.sct) {
                //this.log("send: " + data[0] + " / " + data.length + " bytes")
                this.log("send: " + data[0] + " / " + data.length + " bytes: " + data.toString())
                this.sct.send(data);
            }
        }

        private handleMessage(data: Buffer) {
            if (this.buf) {
                data = this.buf.concat(data)
                this.buf = null
            }
            if (data.length < 2)
                return
            let len = data[1]
            let payloadOff = 2
            if (len & 0x80) {
                if (data.length < 3)
                    return
                if (data[2] & 0x80) {
                    this.emit('error', `too large packet.`);
                    this.buf = null
                    return
                }
                len = (data[2] << 7) | (len & 0x7f)
                payloadOff++
            }

            const payloadEnd = payloadOff + len
            if (data.length < payloadEnd)
                return // wait for the rest of data

            const cmd = data[0]
            const controlPacketType: ControlPacketType = cmd >> 4;
            // this.emit('debug', `Rcvd: ${controlPacketType}: '${data}'.`);

            const payload = data.slice(payloadOff, payloadEnd - payloadOff)

            switch (controlPacketType) {
                case ControlPacketType.ConnAck:
                    const returnCode: number = payload[0];
                    if (returnCode === ConnectReturnCode.Accepted) {
                        this.log('MQTT connection accepted.');
                        this.emit('connected');
                        this.connected = true;
                        this.piId = setInterval(() => this.ping(), Constants.PingInterval * 1000);
                    } else {
                        const connectionError: string = Client.describe(returnCode);
                        this.emit('error', connectionError);
                    }
                    break;
                case ControlPacketType.Publish:
                    const message: IMessage = Protocol.parsePublish(cmd, payload);
                    let handled = false
                    if (this.mqttHandlers)
                        for (let h of this.mqttHandlers)
                            if (message.topic.slice(0, h.topic.length) == h.topic) {
                                h.handler(message)
                                handled = true
                            }
                    if (!handled)
                        this.emit('receive', message);
                    if (message.qos > 0) {
                        setTimeout(() => {
                            this.send(Protocol.createPubAck(message.pid || 0));
                        }, 0);
                    }
                    break;
                case ControlPacketType.PingResp:
                case ControlPacketType.PubAck:
                case ControlPacketType.SubAck:
                    break;
                default:
                    this.emit('error', `MQTT unexpected packet type: ${controlPacketType}.`);
            }

            if (data.length > payloadEnd)
                this.handleMessage(data.slice(payloadEnd))
        }

        private ping() {
            this.send(Protocol.createPingReq());
            this.emit('debug', 'Sent: Ping request.');
        }
    }
}