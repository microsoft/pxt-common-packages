namespace jacdac {
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
            super(ConsoleDriver.NAME, jacdac.LOGGER_DEVICE_CLASS);
        }
        renderPacket(device: JDDevice, packet: JDPacket) {
            const data = packet.data;
            const pri = data[0];
            const str = bufferToString(data, 1);
            return `${pri}:${str}`;
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
            super("btn", jacdac.BUTTON_DEVICE_CLASS);
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
            switch(value) {
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
            super("tch", jacdac.BUTTON_DEVICE_CLASS);
        }

        renderEvent(value: number): string {
            switch(value) {
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

    export function defaultDebugViews() {
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
            new TouchDebugView()
        ];
    }
}