namespace jacdac {
    export class DebugView {
        driverClass: number;
        name: string;

        constructor(name: string, driverClass: number) {
            this.name = name;
            this.driverClass = driverClass;
        }
        renderControlPacket(cp: ControlPacket) {
            return "";
        }
        renderPacket(device: JDDevice, packet: JDPacket) {
            return "";
        }
    }

    export class SensorDebugView extends DebugView {
        constructor(name: string, driverClass: number) {
            super(name, driverClass);
        }

        renderControlPacket(packet: ControlPacket): string {
            const data = packet.data;
            const state = data[0];
            switch (state) {
                case SensorState.Stopping: return "stopping";
                case SensorState.Streaming: return "stream";
                default: return "stop";
            }
        }

        renderPacket(device: JDDevice, packet: JDPacket): string {
            const data = packet.data;
            const cmd = data[0];
            switch (cmd) {
                case SensorCommand.StartStream:
                    const interval = data.getNumber(NumberFormat.UInt32LE, 1);
                    return `start stream ${interval ? `(${interval}ms)` : ''}`;
                case SensorCommand.StopStream:
                    return `stop stream`;
                case SensorCommand.LowThreshold:
                    return `low ${data[1]}`
                case SensorCommand.HighThreshold:
                    return `high ${data[1]}`
                case SensorCommand.Event:
                    return this.renderEvent(data[1]);
                case SensorCommand.State:
                    return `ev ${this.renderState(data.slice(1)) || data[1]}`;
                default:
                    return this.renderCustomPacket(cmd, packet);
            }
        }

        renderCustomPacket(cmd: number, packet: JDPacket): string {
            return packet.data.toHex();
        }

        renderEvent(value: number): string {
            return value.toString();
        }

        renderState(data: Buffer): string {
            return data.toHex();
        }
    }

    class BridgeDebugView extends DebugView {
        constructor() {
            super("bridge", DAL.JD_DRIVER_CLASS_BRIDGE);
        }
    }

    class LightDebugView extends DebugView {
        constructor() {
            super("light", jacdac.LIGHT_DEVICE_CLASS);
        }

        renderPacket(device: JDDevice, packet: JDPacket) {
            const data = packet.data;
            const cmd = data[0];
            const payload = data.slice(1, data.length - 1);
            const names = [
                "none",
                "all",
                "bright",
                "rainbow",
                "rlights",
                "colorw",
                "comet",
                "theaterchase",
                "sparkle"
            ];
            return `${names[cmd]} ${payload.toHex()}`
        }
    }

    class MusicDebugView extends DebugView {
        constructor() {
            super("music", jacdac.MUSIC_DEVICE_CLASS);
        }

        renderPacket(device: JDDevice, packet: JDPacket) {
            const data = packet.data;
            const cmd = data[0];
            switch (cmd) {
                case JDMusicCommand.PlayTone:
                    return `tone ${data.getNumber(NumberFormat.UInt32LE, 1)} ${data.getNumber(NumberFormat.UInt32LE, 5)}`;
                default:
                    return "";
            }
        }
    }

    class ConsoleDebugView extends DebugView {
        constructor() {
            super("log", jacdac.LOGGER_DEVICE_CLASS);
        }

        renderControlPacket(cp: ControlPacket): string {
            const data = cp.data;
            return `${["off", "broad", "listen"][data[0]]} ${data[1]}`;
        }

        renderPacket(device: JDDevice, packet: JDPacket) {
            const data = packet.data;
            const pri = data[0];
            const str = bufferToString(data, 1);
            const name = ConsoleService.readName(data);
            return `${pri}:${str} ${name}`;
        }
    }

    class MessageBusDebugView extends DebugView {
        constructor() {
            super(MessageBusService.NAME, DAL.JD_DRIVER_CLASS_MESSAGE_BUS);
        }

        renderPacket(device: JDDevice, packet: JDPacket): string {
            return `${packet.getNumber(NumberFormat.UInt16LE, 0)} ${packet.getNumber(NumberFormat.UInt16LE, 2)}`;
        }
    }

    class AccelerometerDebugView extends SensorDebugView {
        constructor() {
            super("acc", jacdac.ACCELEROMETER_DEVICE_CLASS);
        }

        renderEvent(data: number): string {
            switch (data) {
                case JDGesture.Shake: return "shake";
                case JDGesture.FreeFall: return "freefall";
            }
            return "";
        }

        renderState(data: Buffer): string {
            const x = data.getNumber(NumberFormat.UInt16LE, 0);
            const y = data.getNumber(NumberFormat.UInt16LE, 2);
            const z = data.getNumber(NumberFormat.UInt16LE, 4);
            return `${x} ${y} ${z}`;
        }
    }

    class ButtonDebugView extends SensorDebugView {
        constructor() {
            super("button", jacdac.BUTTON_DEVICE_CLASS);
        }

        renderEvent(value: number): string {
            switch (value) {
                case JDButtonEvent.Click: return "click";
                case JDButtonEvent.Down: return "down";
                case JDButtonEvent.Up: return "up";
                case JDButtonEvent.LongClick: return "lg click"
                default: return "";
            }
        }

        renderState(data: Buffer): string {
            return !!data[0] ? `up` : `down`;
        }
    }

    class LightSensorDebugView extends SensorDebugView {
        constructor() {
            super("lis", jacdac.LIGHT_SENSOR_DEVICE_CLASS);
        }
    }

    class MicrophoneDebugView extends SensorDebugView {
        constructor() {
            super("mic", jacdac.MICROPHONE_DEVICE_CLASS);
        }

        renderEvent(value: number): string {
            if (value == DAL.SENSOR_THRESHOLD_HIGH)
                return "loud";
            return "";
        }

        renderState(data: Buffer): string {
            return `level ${data[0]}`;
        }
    }

    class SwitchDebugView extends SensorDebugView {
        constructor() {
            super("switch", jacdac.SWITCH_DEVICE_CLASS);
        }

        renderEvent(value: number): string {
            switch (value) {
                case JDSwitchDirection.Left: return "left";
                case JDSwitchDirection.Right: "right";
                default: return "";
            }
        }

        renderState(data: Buffer): string {
            return !!data[0] ? `right` : `left`;
        }
    }

    class ThermometerDebugView extends SensorDebugView {
        constructor() {
            super("temp", jacdac.THERMOMETER_DEVICE_CLASS);
        }
    }

    class TouchDebugView extends SensorDebugView {
        constructor() {
            super("touch", jacdac.TOUCHBUTTON_DEVICE_CLASS);
        }

        renderEvent(value: number): string {
            switch (value) {
                case JDButtonEvent.Click: return "click";
                case JDButtonEvent.Down: "down";
                case JDButtonEvent.Up: "up";
                case JDButtonEvent.LongClick: return "lg click"
                default: return "";
            }
        }

        renderState(data: Buffer): string {
            return `${data.getNumber(NumberFormat.UInt16LE, 0)}`;
        }
    }

    class PixelDebugView extends ActuatorDebugView {
        constructor() {
            super("pixel", jacdac.PIXEL_DEVICE_CLASS);
        }
    }

    class ControllerDebugView extends DebugView {
        constructor() {
            super("ctrl", jacdac.CONTROLLER_DEVICE_CLASS);
        }

        renderControlPacket(cp: ControlPacket): string {
            const data = cp.data;
            return this.renderData(data);
        }

        renderPacket(device: JDDevice, packet: JDPacket): string {
            const data = packet.data;
            return this.renderData(data);
        }

        private renderData(data: Buffer): string {
            const cmd: JDControllerCmd = data[0];
            switch (cmd) {
                case JDControllerCmd.ClientButtons:
                    const state = data[1];
                    const left = state & (1 << 1);
                    const up = state & (1 << 2);
                    const right = state & (1 << 3);
                    const down = state & (1 << 4);
                    const A = state & (1 << 5);
                    const B = state & (1 << 6);
                    return `${left ? "L" : "-"}${up ? "U" : "-"}${right ? "R" : "-"}${down ? "D" : "-"}${A ? "A" : "-"}${B ? "B" : "-"}`;
                case JDControllerCmd.ControlServer:
                    return `srv> ${data[1] ? toHex8(data[1]) : "--"} ${data[2] ? toHex8(data[2]) : "--"} ${data[3] ? toHex8(data[3]) : "--"} ${data[4] ? toHex8(data[4]) : "--"}`;
                case JDControllerCmd.ControlClient:
                    return `client> ${data[1] ? toHex8(data[1]) : "--"}`;
                default:
                    return toHex8(cmd);
            }
        }
    }

    export function defaultDebugViews(): DebugView[] {
        return [
            new ConsoleDebugView(),
            new MessageBusDebugView(),
            new LightDebugView(),
            new MusicDebugView(),
            new AccelerometerDebugView(),
            new ButtonDebugView(),
            new LightSensorDebugView(),
            new MicrophoneDebugView(),
            new SwitchDebugView(),
            new ThermometerDebugView(),
            new TouchDebugView(),
            new BridgeDebugView(),
            new PixelDebugView(),
            new ControllerDebugView()
        ];
    }
}