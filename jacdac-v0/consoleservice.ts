/// <reference path="service.ts"/>

namespace jacdac {
    const JD_CONSOLE_LOG_PRIORITY_DEBUG = 0;
    const JD_CONSOLE_LOG_PRIORITY_LOG = 1;
    const JD_CONSOLE_LOG_PRIORITY_WARNING = 2;
    const JD_CONSOLE_LOG_PRIORITY_ERROR = 3;
    const JD_CONSOLE_LOG_PRIORITY_SILENT = 4;

    export enum JDConsolePriority {
        Debug = JD_CONSOLE_LOG_PRIORITY_DEBUG,
        Log = JD_CONSOLE_LOG_PRIORITY_LOG,
        Warning = JD_CONSOLE_LOG_PRIORITY_WARNING,
        Error = JD_CONSOLE_LOG_PRIORITY_ERROR,
        Silent = JD_CONSOLE_LOG_PRIORITY_SILENT
    };

    export const enum JDConsolePacketType {
        Unknown,
        Message
    }

    export const JD_CONSOLE_SERVICE_MODE_OFF = 0;
    export const JD_CONSOLE_SERVICE_MODE_LISTEN = 1;
    export const JD_CONSOLE_SERVICE_MODE_LOGGER = 2;
    export const JD_CONSOLE_SERVIE_LOGGER_TIMEOUT = 2000;

    export enum JDConsoleMode {
        Off = JD_CONSOLE_SERVICE_MODE_OFF,
        Listen = JD_CONSOLE_SERVICE_MODE_LISTEN,
        Logger = JD_CONSOLE_SERVICE_MODE_LOGGER
    }

    export const JD_CONSOLE_SERVICE_PACKET_HEADER_SIZE = 1;

    export class JDConsoleService extends JDService {
        private _consoleMode: JDConsoleMode;
        private _lastListenerTime: number;

        onMessageReceived: (priority: number, device_address: number, device_name: string, message: string) => void;

        constructor() {
            super(JDServiceClass.CONSOLE, JDServiceMode.BroadcastHostService);
            this._consoleMode = JD_CONSOLE_SERVICE_MODE_OFF;
            this.minPriority = JDConsolePriority.Silent; // drop all packets by default
            this._lastListenerTime = 0;
        }

        get consoleMode() {
            return this._consoleMode;
        }

        set consoleMode(consoleMode: JDConsoleMode) {
            if (this._consoleMode != consoleMode) {
                this._consoleMode = consoleMode;
            }
        }

        addAdvertisementData(): Buffer {

            const buf = jacdac.options.createBuffer(2);
            buf.setUint8(0,this.consoleMode);
            buf.setUint8(1,this.minPriority);
            return buf;
        }

        handleServiceInformation(device: JDDevice, serviceInfo: JDServiceInformation): number {
            const data = serviceInfo.data;
            if (data.length < 2)
                return -1; // TODO fix
            const consoleMode = data.getUint8(0);
            const priority = data.getUint8(1);

            if (consoleMode == JDConsoleMode.Listen) {
                // if a listener enters the bus, automatically start broadcasting
                if (this.consoleMode != JDConsoleMode.Listen)
                    this.consoleMode = JDConsoleMode.Logger;
                // update priority if needed
                if (priority < this.minPriority) // update priority
                    this.minPriority = priority;
                this._lastListenerTime = jacdac.options.getTimeMs();
            }
            return jacdac.DEVICE_OK;
        }

        handlePacket(packet: JDPacket): number {
            // received packet, ignore unless in listening mode
            if (this.consoleMode != JD_CONSOLE_SERVICE_MODE_LISTEN)
                return jacdac.DEVICE_OK;

            const cpacket = new JDConsolePacket(packet);
            switch (cpacket.packetType) {
                case JDConsolePacketType.Message:
                    // check priority
                    if (cpacket.priority < this.minPriority)
                        return DEVICE_OK;

                    // send message to console
                    const device = jacdac.JACDAC.instance.getRemoteDevice(packet.device_address);
                    const deviceName = device && device.device_name ? device.device_name : `${packet.device_address}`;
                    const msg = `:${deviceName}> ${cpacket.message}`;
                    switch(cpacket.priority) {
                        case JD_CONSOLE_LOG_PRIORITY_DEBUG: console.debug(msg); break;
                        case JD_CONSOLE_LOG_PRIORITY_LOG: console.log(msg); break;
                        case JD_CONSOLE_LOG_PRIORITY_WARNING: console.warn(msg); break;
                        case JD_CONSOLE_LOG_PRIORITY_ERROR: console.error(msg); break;
                    }
                    if (this.onMessageReceived)
                        this.onMessageReceived(cpacket.priority, packet.device_address, deviceName, cpacket.message);
                    break;
                default:
                    break;
            }

            return DEVICE_OK;
        }

        get minPriority() {
            return <JDConsolePriority>((this.status & 0xF0) >> 4);
        }

        set minPriority(priority: JDConsolePriority) {
            this.status = priority << 4 | (this.status & 0x0F);
        }

        debug(message: string): void {
            this.add(JDConsolePriority.Debug, message);
        }
        log(message: string): void {
            this.add(JDConsolePriority.Log, message);
        }
        warn(message: string): void {
            this.add(JDConsolePriority.Warning, message);
        }
        error(message: string): void {
            this.add(JDConsolePriority.Error, message);
        }

        add(priority: JDConsolePriority, message: string): void {
            if (this.consoleMode != JDConsoleMode.Logger
                || !message || !message.length)
                return;

            // no one listening -- or disconnected?
            if (!jacdac.JACDAC.instance.bus.isConnected()
                || jacdac.options.getTimeMs() - this._lastListenerTime > JD_CONSOLE_SERVIE_LOGGER_TIMEOUT) {
                this.consoleMode = JDConsoleMode.Off;
                return;
            }

            // chunk message
            let cursor = 0;
            while (cursor < message.length) {
                const txLength = Math.min(message.length - cursor, jacdac.JD_SERIAL_MAX_PAYLOAD_SIZE - 2);

                const pkt = new JDConsolePacket();
                pkt.priority = priority;
                pkt.packetType = JDConsolePacketType.Message;
                pkt.message = message.substr(cursor, txLength);
                this.send(pkt.getBuffer());

                cursor += txLength;
            }
        }
    }
}