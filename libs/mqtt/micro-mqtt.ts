namespace mqtt {

/**
 * Optimization, the TypeScript compiler replaces the constant enums.
 */
export const enum Constants {
    PingInterval = 40,
    WatchDogInterval = 5,
    DefaultPort = 1883,
    DefaultQos = 0,
    Uninitialized = -123,
    FixedPackedId = 1,
    KeepAlive = 60
}

/**
 * The specifics of the MQTT protocol.
 */
export module Protocol {
    const strChr: (...codes: number[]) => string = String.fromCharCode;

    /**
     * Encode remaining length
     * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718023
     */
    export function encodeRemainingLength(remainingLength: number): number[] {
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
    function pack(s: string): string {
        return strChr(...getBytes(s.length)) + s;
    }

    /**
     * Structure of an MQTT Control Packet
     * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc384800392
     */
    function createPacket(byte1: number, variable: string, payload: string = ''): string {
        const byte2: number[] = encodeRemainingLength(variable.length + payload.length);

        return strChr(byte1) +
            strChr(...byte2) +
            variable +
            payload;
    }

    /**
     * CONNECT - Client requests a connection to a Server
     * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718028
     */
    export function createConnect(options: IConnectionOptions): string {
        const byte1: number = ControlPacketType.Connect << 4;

        const protocolName: string = pack('MQTT');
        const protocolLevel: string = strChr(4);
        const flags: string = strChr(createConnectFlags(options));

        const keepAlive: string = strChr(...getBytes(Constants.KeepAlive));

        let payload: string = pack(options.clientId);

        if (options.will) {
            payload += pack(options.will.topic);
            payload += pack(options.will.message);
        }

        if (options.username) {
            payload += pack(options.username);
            if (options.password) {
                payload += pack(options.password);
            }
        }

        return createPacket(
            byte1,
            protocolName + protocolLevel + flags + keepAlive,
            payload
        );
    }

    /** PINGREQ - PING request
     * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc384800454
     */
    export function createPingReq(): string {
        return strChr(ControlPacketType.PingReq << 4, 0);
    }

    /**
     * PUBLISH - Publish message
     * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc384800410
     */
    export function createPublish(topic: string, message: string, qos: number, retained: boolean): string {
        let byte1: number = ControlPacketType.Publish << 4 | (qos << 1);
        byte1 |= (retained) ? 1 : 0;

        const pid: string = strChr(...getBytes(Constants.FixedPackedId));
        const variable: string = (qos === 0) ? pack(topic) : pack(topic) + pid;

        return createPacket(byte1, variable, message);
    }

    export function parsePublish(data: string): IMessage {
        const cmd: number = data.charCodeAt(0);
        const qos: number = (cmd & 0b00000110) >> 1;

        /**
         * Decode remaining length
         * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718023
         */
        let multiplier: number = 1;
        let remainingLength: number = 0;
        let index: number = 0;
        let encodedByte: number;
        do {
            index = index + 1;
            encodedByte = data.charCodeAt(index);
            remainingLength += (encodedByte & 127) * multiplier;
            multiplier *= 128;
        }
        while ((encodedByte & 128) !== 0);

        const topicLength: number = data.charCodeAt(index + 1) << 8 | data.charCodeAt(index + 2);
        let variableLength: number = topicLength;
        if (qos > 0) {
            variableLength += 2;
        }

        const messageLength: number = (remainingLength - variableLength) - 2;

        const message: IMessage = {
            topic: data.substr(index + 3, topicLength),
            content: data.substr(index + variableLength + 3, messageLength),
            qos: qos,
            retain: cmd & 1
        };

        if (data.charCodeAt(remainingLength + 2) > 0) {
            message.next = remainingLength + 2;
        }

        if (qos > 0) {
            message.pid = data.charCodeAt(index + variableLength + 3 - 2) << 8 |
                data.charCodeAt(index + variableLength + 3 - 1);
        }

        return message;
    }

    /**
     * PUBACK - Publish acknowledgement
     * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc384800416
     */
    export function createPubAck(pid: number): string {
        const byte1: number = ControlPacketType.PubAck << 4;

        return createPacket(byte1, strChr(...getBytes(pid)));
    }

    /**
     * SUBSCRIBE - Subscribe to topics
     * http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc384800436
     */
    export function createSubscribe(topic: string, qos: number): string {
        const byte1: number = ControlPacketType.Subscribe << 4 | 2;
        const pid: string = strChr(...getBytes(Constants.FixedPackedId));

        return createPacket(byte1,
                            pid,
                            pack(topic) +
            strChr(qos));
    }
}

/**
 * The MQTT client.
 */
export class Client {
    public version: string = '1.0.0';

    // @ts-ignore
    public on: (event: string, listener: (arg: string | IMessage) => void) => void;
     // @ts-ignore
    protected emit: (event: string, arg?: string | IMessage) => boolean;

    private opt: IConnectionOptions;

    private net: INet;
    private sct?: ISocket;

    private wdId: number = Constants.Uninitialized;
    private piId: number = Constants.Uninitialized;

    private connected: boolean = false;

    // tslint:disable-next-line:no-unsafe-any
    constructor(opt: IConnectionOptions, net: INet) {
        opt.port = opt.port || Constants.DefaultPort;
        opt.clientId = opt.clientId;

        if (opt.will) {
            opt.will.qos = opt.will.qos || Constants.DefaultQos;
            opt.will.retain = opt.will.retain || false;
        }

        this.opt = opt;
        this.net = net;
    }

    private static describe(code: ConnectReturnCode) : string {
        let error : string = 'Connection refused, ';
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

    public disconnect() : void {
        if (this.wdId !== Constants.Uninitialized) {
            clearInterval(this.wdId);
            this.wdId = Constants.Uninitialized;
        }

        if (this.piId !== Constants.Uninitialized) {
            clearInterval(this.piId);
            this.piId = Constants.Uninitialized;
        }

        if (this.sct) {
            this.sct.removeAllListeners('connect');
            this.sct.removeAllListeners('data');
            this.sct.removeAllListeners('close');
            this.sct.end();
        }
}

    public connect() : void {
        this.emit('info', `Connecting to ${this.opt.host}:${this.opt.port}`);

        if (this.wdId === Constants.Uninitialized) {
            this.wdId = setInterval(() => {
                if (!this.connected) {
                    this.emit('disconnected');
                    this.emit('error', 'No connection. Retrying.');

                    this.disconnect();
                    this.connect();
                }
            },                      Constants.WatchDogInterval * 1000);
        }

        this.sct = this.net.connect({ host: this.opt.host, port: this.opt.port }, () => {
            this.emit('info', 'Network connection established.');
            if (this.sct) {
                this.onConnect();
                this.write(Protocol.createConnect(this.opt));
                this.sct.removeAllListeners('connect');
            }
        });

        this.sct.on('data', (data: string) => {
            this.handleData(data);
        });

        this.sct.on('close', () => {
            this.emit('disconnected');
            this.connected = false;
        });
    }

    // Publish a message
    public publish(topic: string, message: string, qos: number = Constants.DefaultQos, retained: boolean = false): void {
        this.write(Protocol.createPublish(topic, message, qos, retained));
    }

    // Subscribe to topic
    public subscribe(topic: string, qos: number = Constants.DefaultQos): void {
        this.write(Protocol.createSubscribe(topic, qos));
    }

    // tslint:disable-next-line:no-empty
    private onConnect() : void {
    }

    private write(data: string) : void {
        if (this.sct) {
            this.sct.write(data);
        }
    }

    private handleData = (data: string): void => {
        const controlPacketType: ControlPacketType = data.charCodeAt(0) >> 4;
        this.emit('debug', `Rcvd: ${controlPacketType}: '${data}'.`);

        switch (controlPacketType) {
            case ControlPacketType.ConnAck:
                const returnCode: number = data.charCodeAt(3);
                if (returnCode === ConnectReturnCode.Accepted) {
                    this.emit('info', 'MQTT connection accepted.');
                    this.emit('connected');
                    this.connected = true;
                    this.piId = setInterval(this.ping, Constants.PingInterval * 1000);
                } else {
                    const connectionError: string = Client.describe(returnCode);
                    this.emit('error', connectionError);
                }
                break;
            case ControlPacketType.Publish:
                const message: IMessage = Protocol.parsePublish(data);
                this.emit('receive', message);
                if (message.qos > 0) {
                    setTimeout(() => {
                        this.write(Protocol.createPubAck(message.pid || 0));
                    },         0);
                }
                if (message.next) {
                    this.handleData(data.substr(message.next));
                }

                break;
            case ControlPacketType.PingResp:
            case ControlPacketType.PubAck:
            case ControlPacketType.SubAck:
                break;
            default:
                this.emit('error', `MQTT unexpected packet type: ${controlPacketType}.`);
        }
    }

    private ping = (): void => {
        this.write(Protocol.createPingReq());
        this.emit('debug', 'Sent: Ping request.');
    }
}

}