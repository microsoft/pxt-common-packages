enum JDDriverEvent {
    //% block="connected"
    Connected = DAL.JD_DRIVER_EVT_CONNECTED,
    //% block="disconnected"
    Disconnected = DAL.JD_DRIVER_EVT_DISCONNECTED,
    //% block="paired"
    Paired = DAL.JD_DRIVER_EVT_PAIRED,
    //% block="unpaired"
    Unpaired = DAL.JD_DRIVER_EVT_UNPAIRED,
    //% block="pair rejected"
    PairingRefused = DAL.JD_DRIVER_EVT_PAIR_REJECTED,
    //% block="pairing response"
    PairingResponse = DAL.JD_DRIVER_EVT_PAIRING_RESPONSE,
    //% block="driver error"
    DriverError = DAL.JD_DRIVER_EVT_ERROR
}

enum JDEvent {
    //% block="bus connected"
    BusConnected = DAL.JD_SERIAL_EVT_BUS_CONNECTED,
    //% block="bus disconnected"
    BusDisconnected = DAL.JD_SERIAL_EVT_BUS_DISCONNECTED,
    //% block="driver changed"
    DriverChanged = DAL.JD_LOGIC_DRIVER_EVT_CHANGED,
}

enum JDDriverErrorCode
{
    // No error occurred.
    DRIVER_OK = 0,

    // Device calibration information
    DRIVER_CALIBRATION_IN_PROGRESS,
    DRIVER_CALIBRATION_REQUIRED,

    // The driver has run out of some essential resource (e.g. allocated memory)
    DRIVER_NO_RESOURCES,

    // The driver operation could not be performed as some essential resource is busy (e.g. the display)
    DRIVER_BUSY,

    // I2C / SPI Communication error occured
    DRIVER_COMMS_ERROR,

    // An invalid state was detected (i.e. not initialised)
    DRIVER_INVALID_STATE,

    // an external peripheral has a malfunction e.g. external circuitry is drawing too much power.
    DRIVER_PERIPHERAL_MALFUNCTION
}

enum JDState {
    Receiving,
    Transmitting,
    High,
    Low,
    NotSupported = -1
}

/**
 * JACDAC protocol support
 */
namespace jacdac {
    // common logging level for jacdac services
    export let consolePriority = ConsolePriority.Debug;

    export type MethodCollection = ((p: Buffer) => boolean)[];

    export function onEvent(event: JDEvent, handler: () => void) {
        const id = event == JDEvent.DriverChanged ? jacdac.logicEventId() : jacdac.eventId();
        if (id)
            control.onEvent(id, event, handler);
    }

    /**
     * Adds a JacDac device driver
     * @param n driver
     */
    export function addDriver(n: Driver) {
        if (!!n.proxy) { // don't add twice
            n.log(`already added`);
            return;
        }

        n.log(`add c${n.deviceClass}`)
        const proxy = jacdac.__internalAddDriver(n.driverType, n.deviceClass,
            [(p: Buffer) => n.handlePacket(p),
            (p: Buffer) => n.handleControlPacket(p)],
            n.controlData
        );
        n.proxy = proxy;
    }

    export function removeDriver(n: Driver) {
        const proxy = n.proxy;
        if (!proxy) {
            n.log(`already removed`);
            return;
        }

        n.log(`remove c${n.deviceClass}`);
        n.proxy = undefined;
        jacdac.__internalRemoveDriver(proxy);
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
