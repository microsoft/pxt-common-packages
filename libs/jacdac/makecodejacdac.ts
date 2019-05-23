enum JDBusState {
    Receiving,
    Transmitting,
    High,
    Low,
    NotSupported = -1
}

namespace jacdac {

    class JACDACBus implements jacdac.JDPhysicalLayer {
        constructor() {
        }

        start() {
            __physStart();
            control.internalOnEvent(__physId(), DAL.JD_SERIAL_EVT_DATA_READY, () => this.handlePacketData());
        }

        stop() {
            __physStop();
        }

        handlePacketData() {
            let buf: Buffer = undefined;
            while (buf = __physGetPacket()) {
                const pkt = new jacdac.JDPacket(buf);
                jacdac.JACDAC.instance.routePacket(pkt)
            }
        }

        writeBuffer(b: Buffer) {
            __physSendPacket(b);
        }

        isConnected() {
            return __physIsConnected()
        }

        isRunning() {
            return __physIsRunning();
        }

        getDiagnostics() {
            return __physGetDiagnostics();
        }
    }

    let jacdacStarted = false;
    let bus: JACDACBus;
    export function start(): void {
        if (jacdacStarted)
            return;

        jacdacStarted = true;
        if (!bus) {
            bus = new JACDACBus();
            jacdac.JACDAC.instance.bus = bus;
        }

        // load name from storage
        const DEVICE_NAME_STORAGE_KEY = "jddn"

        if (!jacdac.JACDAC.instance.getDeviceName()) {
            const deviceName = configStorage.getItem(DEVICE_NAME_STORAGE_KEY);
            if (deviceName) {
                console.add(jacdac.consolePriority, `:jd> restoring device name changed to ${deviceName}`)
                jacdac.JACDAC.instance.setDeviceName(deviceName);
            }
        }
        jacdac.JACDAC.instance.onNameRemotelyChanged = function (name: string) {
            control.dmesg(`:jd> device name changed to ${name}`);
            console.add(jacdac.consolePriority, `:jd> device name changed to ${name}`)
            configStorage.setItem(DEVICE_NAME_STORAGE_KEY, name);
        };

        jacdac.JACDAC.instance.onIdentificationRequest = function () {
            // DEVICE_ID_JACDAC_CONFIGURATION_SERVICE = 33
            // JD_CONTROL_CONFIGURATION_EVT_IDENTIFY = 2
            control.raiseEvent(33, 2)
        }

        // start service
        bus.start();
        jacdac.JACDAC.instance.start();

        console.addListener(function (pri, msg) {
            jacdac.JACDAC.instance.consoleService.add(<jacdac.JDConsolePriority><number>pri, msg);
        });
    }

    export function diagnostics(): jacdac.JDDiagnostics {
        if (!bus)
            return new jacdac.JDDiagnostics(control.createBuffer(0));

        return new jacdac.JDDiagnostics(bus.getDiagnostics());
    }

    export function stop() {
        if (jacdacStarted) {
            jacdacStarted = false;
            jacdac.JACDAC.instance.stop();
            bus.stop();
        }
    }
}