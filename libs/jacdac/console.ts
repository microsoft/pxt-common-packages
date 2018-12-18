enum JDConsoleMode {
    Off,
    Broadcast,
    Listen
}

namespace jacdac {
    export function toHex(n: number): string {
        const hexBuf = control.createBuffer(4);
        hexBuf.setNumber(NumberFormat.UInt32LE, 0, n);
        return hexBuf.toHex();
    }
    export function toHex16(n: number): string {
        const hexBuf = control.createBuffer(2);
        hexBuf.setNumber(NumberFormat.UInt16LE, 0, n);
        return hexBuf.toHex();
    }
    export function toHex8(n: number): string {
        const hexBuf = control.createBuffer(1);
        hexBuf.setNumber(NumberFormat.UInt8LE, 0, n);
        return hexBuf.toHex();
    }

    /**
     * Console logging driver. The driver is off, broadcasting or listening. Cannot do both.
     */
    export class ConsoleDriver extends Broadcast {
        private _lastListenerTime: number;

        static BROADCAST_TIMEOUT = 2000;

        constructor() {
            super("log", jacdac.LOGGER_DEVICE_CLASS, 10);
            this.controlData[0] = JDConsoleMode.Off;
            this.controlData[1] = console.minPriority; // TODO this may get outdated
            this.controlData[2] = 0; // empty name
            console.addListener((priority, text) => this.broadcast(priority, text));
        }

        setMode(mode: JDConsoleMode) {
            this.start();
            if (this.mode != mode) {
                this.controlData[0] = mode;
                this.supressLog = this.mode == JDConsoleMode.Broadcast;
                this.priority = this.mode == JDConsoleMode.Broadcast ? ConsolePriority.Error : ConsolePriority.Log;
                this.log(`mode ${this.mode}`);
            }
        }

        get mode(): JDConsoleMode {
            return this.controlData[0];
        }

        get priority(): ConsolePriority {
            this.controlData[1] = console.minPriority;
            return this.controlData[1];
        }

        set priority(value: ConsolePriority) {
            this.controlData[1] = value;
            console.minPriority = value; // keep in sync
        }

        private static readName(data: Buffer): string {
            let r = "";
            for (let i = 2; i < data.length; ++i) {
                const c = data[i];
                if (!c)
                    return r;
                r += String.fromCharCode(c);
            }
            return r;
        }

        updateName() {
            let value = jacdac.deviceName();
            const n = this.controlData.length - 2;
            // normalize name
            if (value.length > n)
                value = value.substr(0, n);
            // store characters
            let i = 0;
            for (; i < value.length; ++i) {
                const c = value.charCodeAt(i);
                this.controlData[i + 2] = c;
            }
            // fill remaning data with zeroes
            for (; i < n; ++i) {
                this.controlData[i] = 0;
            }
        }

        public handleControlPacket(pkt: Buffer): boolean {
            const packet = new ControlPacket(pkt);
            const data = packet.data;
            const mode = data[0];
            if (mode == JDConsoleMode.Listen) {
                // if a listener entres the bus, automatically start listening
                if (this.mode != JDConsoleMode.Listen)
                    this.setMode(JDConsoleMode.Broadcast);
                // update priority if needed
                const priority = data[1];
                if (priority < this.priority) // update priority
                    this.priority = priority;
                // update device name map
                const name = ConsoleDriver.readName(data);
                setRemoteDeviceName(packet.serialNumber, name);
                this._lastListenerTime = control.millis();
            }
            return true;
        }

        public handlePacket(pkt: Buffer): boolean {
            if (this.mode != JDConsoleMode.Listen)
                return true;

            const packet = new JDPacket(pkt);
            const data = packet.data;
            const priority = data[0];
            // shortcut
            if (priority < console.minPriority) return true;
            // send message to console
            const str = bufferToString(data, 1);
            // pipe to console
            console.add(priority, `${toHex8(packet.address)}> ${str}`);

            return true;
        }

        private broadcast(priority: ConsolePriority, str: string) {
            if (this.mode != JDConsoleMode.Broadcast)
                return;

            // no one listening -- or disconnected?
            if (!this.isConnected
                || control.millis() - this._lastListenerTime > ConsoleDriver.BROADCAST_TIMEOUT) {
                this.setMode(JDConsoleMode.Off);
                return;
            }

            let cursor = 0;
            while (cursor < str.length) {
                const txLength = Math.min(str.length - cursor, DAL.JD_SERIAL_DATA_SIZE - 1);
                const buf = control.createBuffer(txLength + 1);
                buf[0] = priority;
                for (let i = 0; i < txLength; i++)
                    buf[i + 1] = str.charCodeAt(i + cursor);
                this.sendPacket(buf);
                cursor += txLength;
            }
        }
    }

    //% whenUsed
    export const consoleDriver = new ConsoleDriver();

    let _deviceNames: { serialNumber: number; name: string; }[];
    function setRemoteDeviceName(serialNumber: number, name: string) {
        // 0 = this device
        if (!_deviceNames)
            _deviceNames = [];
        let entry = _deviceNames.find(d => d.serialNumber == serialNumber);
        if (!entry) {
            entry = { serialNumber: serialNumber, name: undefined };
            if (serialNumber == 0)
                _deviceNames.unshift(entry);
            else
                _deviceNames.push(entry);
        }
        entry.name = name;
        if (serialNumber == 0)
            consoleDriver.updateName();
    }

    export function remoteDeviceName(serialNumber: number) {
        if (_deviceNames) {
            let entry = _deviceNames.find(d => d.serialNumber == serialNumber);
            if (entry)
                return entry.name;
        }
        return "";
    }

    /**
     * Sets a friendly name for the device
     * @param name 
     */
    //% blockId=jacdacsetdevicename block="jacdac set device name to $name"
    //% group="Name"
    export function setDeviceName(name: string) {
        setRemoteDeviceName(0, name);
    }

    /**
     * Gets the current device name
     */
    //% blockId=jacdacdevicename block="jacdac device name"
    //% group="Name"
    export function deviceName() {
        return remoteDeviceName(0);
    }
}