enum JacDacDriverEvent {
    Connected = DAL.JD_DRIVER_EVT_CONNECTED,
    Disconnected = DAL.JD_DRIVER_EVT_DISCONNECTED,
    Paired = DAL.JD_DRIVER_EVT_PAIRED,
    Unpaired = DAL.JD_DRIVER_EVT_UNPAIRED,
    PairingRefused = DAL.JD_DRIVER_EVT_PAIR_REJECTED,
    PairingResponse = DAL.JD_DRIVER_EVT_PAIRING_RESPONSE
}

/**
 * JACDAC protocol support
 */
namespace jacdac {
    // drivers
    export const JD_DEVICE_CLASS_MAKECODE_START = 2000;
    export const LOGGER_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 1;
    export const BATTERY_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 2;
    export const ACCELEROMETER_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 3;
    export const BUTTON_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 4;
    export const TOUCHBUTTON_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 5;
    export const LIGHT_SENSOR_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 6;
    export const MICROPHONE_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 7;
    export const THERMOMETER_DEVICE_CLASS = JD_DEVICE_CLASS_MAKECODE_START + 8;

    // events
    export const JD_MESSAGE_BUS_ID = JD_DEVICE_CLASS_MAKECODE_START;
    export const JD_DRIVER_EVT_FILL_CONTROL_PACKET = JD_DEVICE_CLASS_MAKECODE_START + 1;

    export const BUTTON_EVENTS = [
        DAL.DEVICE_BUTTON_EVT_CLICK,
        DAL.DEVICE_BUTTON_EVT_DOWN,
        DAL.DEVICE_BUTTON_EVT_UP,
        DAL.DEVICE_BUTTON_EVT_LONG_CLICK
    ];

    // common logging level for jacdac services
    export let consolePriority = ConsolePriority.Silent;

    export type MethodCollection = ((p: Buffer) => boolean)[];

    /**
     * Adds a JacDac device driver
     * @param n driver
     */
    export function addDriver(n: Driver) {
        if (n.hasProxy()) { // don't add twice
            n.log(`already added`);
            return;
        }

        n.log(`add t${n.driverType} c${n.deviceClass}`)
        const proxy = __internalAddDriver(n.driverType, n.deviceClass,
            [(p: Buffer) => n.handlePacket(p),
            (p: Buffer) => n.handleControlPacket(p)],
            n.controlData
        );
        n.setProxy(proxy);
    }

    /**
     * Sends a packet
     * @param pkt jackdack data
     */
    export function sendPacket(pkt: Buffer, deviceAddress: number) {
        // control.dmesg(`jd> send ${pkt.length}b to ${deviceAddress}`)
        __internalSendPacket(pkt, deviceAddress);
    }

    /**
     * Gets the list of drivers and their status in JACDAC
     */
    //%
    export function drivers(): JDDevice[] {
        const buf: Buffer = __internalDrivers();
        const devices: JDDevice[] = [];
        for (let k = 0; k < buf.length; k += JDDevice.SIZE) {
            devices.push(new JDDevice(buf.slice(k, JDDevice.SIZE)));
        }
        return devices;
    }
}
