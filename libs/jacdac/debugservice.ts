namespace jacdac{

    export interface DebuggerStruct
    {
        pkt: jacdac.JDPacket;
        view: DebugView;
        timestamp: number;
        crcStatus:string;
        serviceClass: string;
    }

    export enum DebuggerClassEnums {
        CONTROL = 0,
        CONTROL_RNG = 1,
        CONTROL_CONFIGURATION = 2,
        CONTROL_TEST = 3,

        JOYSTICK = 4,
        MESSAGE_BUS = 5,
        BRIDGE = 6,
        BUTTON = 7,
        ACCELEROMETER = 8,
        CONSOLE = 9
    }

    export class DebuggerService extends jacdac.JDService {
        running: boolean;
        deviceManager: jacdac.JDDeviceManager
        _intervalId: any;
        paintDevices:(devices: jacdac.JDDevice[]) => void;
        paintPacket:(packet: DebuggerStruct) => void;

        constructor(){
            super(jacdac.JDServiceClass.BRIDGE, jacdac.JDServiceMode.ClientService)
            jacdac.JACDAC.instance.bridge = this;
            this.running = true;
            this.deviceManager = new jacdac.JDDeviceManager();

            this._intervalId = setInterval(()=>{
                const devices = this.deviceManager.getDeviceList();

                for (let device of devices)
                {
                    device.rolling_counter++;

                    if (device.rolling_counter >= jacdac.JD_CONTROL_ROLLING_TIMEOUT_VAL)
                    {
                        this.deviceManager.removeDevice(device);

                        if (this.paintDevices)
                            this.paintDevices(this.deviceManager.getDeviceList());
                    }
                }
            },500)
        }

        handlePacket(pkt : jacdac.JDPacket) : number
        {
            // let packetEntry: DebuggerStruct ={pkt: pkt, view: undefined, timestamp:jacdac.options.getTimeMs(), crcStatus: "Poo", serviceClass: "ABC"}

            // if (this.paintPacket)
            //     this.paintPacket(packetEntry);

            // return jacdac.DEVICE_OK;

            if (!this.running)
                return jacdac.DEVICE_OK;

            // console.log("DEBUGGER HANDLE PACKET", pkt, pkt.device_address, pkt.service_number);
            if (pkt.device_address == 0 && pkt.service_number == 0)
            {
                const cp = new jacdac.JDControlPacket(pkt);
                // console.log(cp);

                if ((cp.device_flags & (jacdac.JD_DEVICE_FLAGS_REJECT | jacdac.JD_DEVICE_FLAGS_PROPOSING)) == 0)
                {
                    const remote = this.deviceManager.addDevice(cp, pkt.communication_rate);

                    if (this.paintDevices)
                        this.paintDevices(this.deviceManager.getDeviceList());

                    // console.log("CP REM ",remote);
                    remote.update(cp);
                }
                // console.log("propose ",cp.device_flags & (jacdac.JD_DEVICE_FLAGS_PROPOSING), " rejecting ",cp.device_flags & (jacdac.JD_DEVICE_FLAGS_REJECT) )
            }

            const remote = this.deviceManager.getRemoteDevice(pkt.device_address);

            // console.log("REMOTE ", pkt.device_address, pkt.service_number, remote, this.deviceManager);
            const crc = jacdac.jd_crc(pkt,remote);

            let crcString = "OK"

            if (crc != pkt.crc)
                if (!remote)
                    crcString = "ERROR - DEVICE NOT FOUND";
                else
                    crcString = "ERROR - INCORRECT"

            let serviceString = "UNKNOWN";

            let view = undefined;
            if (remote)
            {
                let serviceClass = remote.services[pkt.service_number].service_class;
                // serviceString =  DebuggerClassEnums[serviceClass] || serviceClass.toString();
                view = DebugView.find(serviceClass);
            }
            else if (pkt.device_address == 0)
            {
                serviceString = "CONTROL";
                view = DebugView.find(jacdac.JDServiceClass.CONTROL);
            }

            let packetEntry ={pkt: pkt, view: view, timestamp:jacdac.options.getTimeMs(), crcStatus: crcString, serviceClass: serviceString}

            if (this.paintPacket)
                this.paintPacket(packetEntry)

            return jacdac.DEVICE_OK;
        }

        handleServiceInformation(device: jacdac.JDDevice, serviceInfo: jacdac.JDServiceInformation): number {
            return jacdac.DEVICE_OK;
        }
    }

}