/// <reference path="service.ts"/>

namespace jacdac{
    const JD_CONTROL_SERVICE_STATUS_ENUMERATE = 0x02
    const JD_CONTROL_SERVICE_STATUS_ENUMERATING = 0x04
    const JD_CONTROL_SERVICE_STATUS_ENUMERATED = 0x08
    const JD_CONTROL_SERVICE_STATUS_BUS_LO = 0x10
    const JD_CONTROL_SERVICE_STATUS_INITIALISED = 0x20

    export class JDControlService extends JDService {
        name: string
        deviceManager: JDDeviceManager;
        rngService: JDRNGService;
        configurationService: JDConfigurationService;
        _intervalId: number;

        onChange: () => void;

        send(buffer: Buffer): void {
            if (JACDAC.instance.bus.isConnected())
                JACDAC.instance.write(buffer, 0, 0, null);
        }

        deviceDisconnected(device: JDDevice): void {
            // iterate over services on the device and provide connect / disconnect events.
            for (let current of JACDAC.instance.services) {
                if (!current.device || current.mode == JDServiceMode.ControlLayerService || device.device_address != current.device.device_address)
                    continue;

                current.device = undefined;
                current.service_number = JD_SERVICE_NUMBER_UNITIALISED_VAL;
                current._hostDisconnected();
            }
        }

        deviceEnumerated(): void {
            // iterate over services on the device and provide connect / disconnect events.
            for (let current of JACDAC.instance.services) {
                if (current == this || current.mode == JDServiceMode.ClientService)
                    continue;

                current.device = this.device;
                current._hostConnected();
            }
        }

        formControlPacket(): JDControlPacket {
            const controlPacket = new JDControlPacket();

            controlPacket.unique_device_identifier = this.device.unique_device_identifier;
            controlPacket.device_address = this.device.device_address;
            controlPacket.device_flags = this.device.device_flags;
            controlPacket.device_name = this.name;

            let service_number = 0;

            for (let current of JACDAC.instance.services) {
                if (current.mode == JDServiceMode.ControlLayerService || current.mode == JDServiceMode.ClientService)
                    continue;

                if (current.service_number != JD_SERVICE_NUMBER_UNITIALISED_VAL && current.service_number != service_number)
                    jacdac.options.error("Device service order changed whilst enumerated");

                current.service_number = service_number;

                let info = new JDServiceInformation();

                info.service_flags = current.service_flags;
                info.service_class = current.service_class;
                const data = current.addAdvertisementData();
                info.advertisement_size = data.length;
                info.data = data;

                controlPacket.append(info.getBuffer());

                service_number++;
            }

            if (controlPacket.getBuffer().length > JD_SERIAL_MAX_PAYLOAD_SIZE)
                jacdac.options.error("Packet too big");

            return controlPacket;
        }

        /**
         * Timer callback every 500 ms
         **/
        startDeviceTimer() {

            if (this._intervalId !== undefined)
                jacdac.options.error("Device Timer called twice.");

            jacdac.options.log("start device timer")
            this._intervalId = setInterval(() => {
                jacdac.options.log("control tick")
                // handle enumeration
                if (this.status & JD_CONTROL_SERVICE_STATUS_ENUMERATE) {
                    if (this.status & JD_CONTROL_SERVICE_STATUS_ENUMERATING) {
                        this.device.rolling_counter++;

                        if (this.device.rolling_counter > 3) {
                            this.status &= ~JD_CONTROL_SERVICE_STATUS_ENUMERATING;
                            this.status |= JD_CONTROL_SERVICE_STATUS_ENUMERATED;
                            this.device.device_flags &= ~JD_DEVICE_FLAGS_PROPOSING;
                            this.deviceEnumerated();
                        }
                    }
                    else {
                        if (!JACDAC.instance.bus.isConnected()) {
                            this.device.rolling_counter++;

                            if (this.device.rolling_counter >= JD_CONTROL_ROLLING_TIMEOUT_VAL) {
                                this.status |= JD_CONTROL_SERVICE_STATUS_BUS_LO;
                                jacdac.options.log("This disconnected");
                                this.deviceDisconnected(this.device);
                                return;
                            }
                        }
                        else {
                            if (this.status & JD_CONTROL_SERVICE_STATUS_BUS_LO) {
                                this.deviceEnumerated();
                                this.status &= ~JD_CONTROL_SERVICE_STATUS_BUS_LO;
                            }

                            this.device.rolling_counter = 0;
                        }
                    }

                    // queue a control packet if we have host services.
                    this.send(this.formControlPacket().getBuffer());
                }

                // now check to see if remote devices have timed out.
                for (let dev of this.deviceManager.getDeviceList()) {
                    dev.rolling_counter++;

                    if (dev.rolling_counter >= JD_CONTROL_ROLLING_TIMEOUT_VAL) {
                        this.deviceManager.removeDevice(dev);
                        this.deviceDisconnected(dev);
                    }
                }
            }, 500);
        }

        private initialise(): void{
            if (this.status & JD_CONTROL_SERVICE_STATUS_INITIALISED)
                return;

            this.status |= JD_CONTROL_SERVICE_STATUS_INITIALISED;
            JACDAC.instance.add(this.configurationService);
            JACDAC.instance.add(this.rngService);

            this.device = new JDDevice();

            this.device.unique_device_identifier = generate_eui64(jacdac.options.getSerialNumber());

            // naiive implementation for now... we can sniff the bus for a little before enumerating to
            // get a good first address in the future.
            this.device.device_address = random(1,0xff);
            jacdac.options.log(`device address: ${this.device.device_address}`)

            // set the device state for the control service.
            this.device.device_flags |= JD_DEVICE_FLAGS_PROPOSING;
            this.device.communication_rate = JD_DEVICE_DEFAULT_COMMUNICATION_RATE;
            this.device.rolling_counter = 0;
        }

        enumerate(): void {
            if (this.status & JD_CONTROL_SERVICE_STATUS_ENUMERATE) {
                jacdac.options.log("already enumerating")
                return;
            }

            this.initialise();

            let hostServiceCount = 0;

            for (let s of JACDAC.instance.services)
            {
                if (s.mode == JDServiceMode.ClientService || s.mode == JDServiceMode.ControlLayerService)
                    continue;

                hostServiceCount++;
            }

            if (hostServiceCount)
            {
                this.status |= (JD_CONTROL_SERVICE_STATUS_ENUMERATING | JD_CONTROL_SERVICE_STATUS_ENUMERATE);
                this.startDeviceTimer();
            }

            return;
        }

        /**
         *
         **/
        isEnumerated(): boolean {
            return (this.status & JD_CONTROL_SERVICE_STATUS_ENUMERATED) ? true : false;
        }

        /**
         *
         **/
        isEnumerating(): boolean {
            return (this.status & JD_CONTROL_SERVICE_STATUS_ENUMERATING) ? true : false;
        }

        disconnect(): void {
            if (!(this.status & JD_CONTROL_SERVICE_STATUS_ENUMERATE))
                return;

            clearInterval(this._intervalId);
            this._intervalId = undefined;
            this.deviceDisconnected(this.device);
            this.status &= ~JD_CONTROL_SERVICE_STATUS_ENUMERATE;
            return;
        }

        constructor() {
            super(JDServiceClass.CONTROL, JDServiceMode.ControlLayerService);
            this.deviceManager = new JDDeviceManager();

            this.rngService = new JDRNGService();
            this.configurationService = new JDConfigurationService();
        }

        getRemoteDevice(device_address: number): JDDevice{
            return this.deviceManager.getRemoteDevice(device_address);
        }

        routePacket(pkt: JDPacket) {
            let device: JDDevice = null;

            if (this.device && pkt.device_address == this.device.device_address)
                device = this.device;
            else
                device = this.getRemoteDevice(pkt.device_address);

            // jacdac.options.log("RP: a ",pkt.device_address, " sn ", pkt.service_number, " crc ", pkt.crc);

            const crc = jd_crc(pkt, device); // include size and address in the checksum.

            let crcCheck: boolean = (crc == pkt.crc);

            // jacdac.options.log("crc check: computed ", crc, "  received: ", pkt.crc);

            if (crcCheck) {
                if (!device)
                    this.handlePacket(pkt);
                else {
                    // map from device broadcast map to potentially the service number of one of our enumerated broadcast hosts
                    let host_service_number: number = -1;

                    if (device.servicemap_bitmsk & (1 << pkt.service_number)) {
                        host_service_number = device.broadcast_servicemap.getUint8(pkt.service_number);
                        device = this.device;
                    }

                    let broadcast: boolean = (host_service_number >= 0);

                    // we matched a broadcast host, route to all broadcast hosts on the device.
                    if (broadcast)
                    {
                        let broadcast_class: number = 0;

                        for (let service of JACDAC.instance.services) {

                            if (!service.device || service.mode == JDServiceMode.ClientService || service.mode == JDServiceMode.ControlLayerService)
                                continue;

                            if (service.device.device_address == device.device_address && service.service_number == host_service_number) {
                                jacdac.options.log("BROADCAST MATCH CL:" + service.service_class);
                                broadcast_class = service.service_class;
                                break;
                            }
                        }

                        for (let service of JACDAC.instance.services) {
                            if (!service.device || service.mode != JDServiceMode.BroadcastHostService)
                                continue;

                            if (service.service_class == broadcast_class) {
                                // break if DEVICE_OK is returned (indicates the packet has been handled)
                                if (service.handlePacket(pkt) == DEVICE_OK)
                                    break;
                            }
                        }
                    }
                    else
                    {
                        // route to client / host services
                        for (let service of JACDAC.instance.services) {

                            if (!service.device || service.mode == JDServiceMode.ControlLayerService)
                                continue;

                            // jacdac.options.log("ITER: "service);
                            if (service.device && service.device.device_address == device.device_address && service.service_number == pkt.service_number)
                                if (service.handlePacket(pkt) == DEVICE_OK)
                                    break;
                        }
                    }
                }
            }
        }

        handlePacket(pkt: JDPacket): number {
            if (pkt.service_number == this.rngService.service_number) {
                this.rngService.handlePacket(pkt);
                return DEVICE_OK;
            }

            if (pkt.service_number == this.configurationService.service_number) {
                this.configurationService.handlePacket(pkt);
                return DEVICE_OK;
            }

            let cp: JDControlPacket = new JDControlPacket(pkt);

            // jacdac.options.log("HP ControlPacket: ",cp, cp.getBuffer());

            // address collision check
            if (this.status & (JD_CONTROL_SERVICE_STATUS_ENUMERATING | JD_CONTROL_SERVICE_STATUS_ENUMERATED) && this.device.device_address == cp.device_address) {
                // a different device is using our address!!
                if (!(this.device.udidl == cp.udidl && this.device.udidh == cp.udidh)) {
                    // if the device is proposing, we can reject (as per the spec)
                    if (cp.device_flags & JD_DEVICE_FLAGS_PROPOSING) {
                        // if we're proposing too, the remote device has won the address
                        if (this.device.device_flags & JD_DEVICE_FLAGS_PROPOSING) {
                            this.device.rolling_counter = 0;
                            this.device.device_address = 1 + (Math.random() % 254);
                        }
                        // if our address is established, reject the proposal
                        else {
                            let rejectCP = new JDControlPacket();

                            rejectCP.device_address = cp.device_address;
                            rejectCP.unique_device_identifier = cp.unique_device_identifier;
                            rejectCP.device_flags = cp.device_flags | JD_DEVICE_FLAGS_REJECT;
                            this.send(rejectCP.getBuffer())
                            jacdac.options.log("ASK OTHER TO REASSIGN");
                        }

                        return DEVICE_OK; // no further processing required.
                    }
                }
                // someone has flagged a conflict with our device address, re-enumerate
                else if (cp.device_flags & JD_DEVICE_FLAGS_REJECT) {
                    this.device.rolling_counter = 0;
                    this.device.device_address = 1 + (Math.random() % 254);
                    return DEVICE_OK;
                }
            }

            // the device has not got a confirmed address (enumerating)... if there was a collision it would be handled above
            if (cp.device_flags & JD_DEVICE_FLAGS_PROPOSING)
                return DEVICE_OK;

            // if a service is relying on a remote device, the control service is maintaining the state.
            let remoteDevice: JDDevice = this.deviceManager.getRemoteDeviceUnique(cp.device_address, cp);

            if (remoteDevice)
            {
                // jacdac.options.log("TRACKED REMOTE DEVICE ", remoteDevice);
                this.deviceManager.updateDevice(cp, pkt.communication_rate);
            }
            // else
                // jacdac.options.log ("UNTRACKED");

            // if here, address validation has completed successfully... process service information
            const dataPointer = cp.data;
            let service_number = 0;
            let dataIdx = 0;

            // jacdac.options.log("USDEV: a %d, s %d, c %d, i %d, t %c%c%c", this.device.device_address, this.device.unique_device_identifier, this.service_class, this.status & JD_SERVICE_STATUS_FLAGS_INITIALISED ? 1 : 0, this.mode == BroadcastHostService ? 'B' : ' ', this.mode == HostService ? 'H' : ' ', this.mode == ClientService ? 'C' : ' ');
            while (dataIdx < dataPointer.length) {
                let serviceInfo = new JDServiceInformation(dataPointer.slice(dataIdx, dataPointer.length));
                // jacdac.options.log("data idx ", dataIdx, " ", dataPointer.length, " service ", serviceInfo);

                for (let current of JACDAC.instance.services) {

                    if (current.mode == JDServiceMode.ControlLayerService)
                        continue;

                    const class_check = current.service_class == serviceInfo.service_class;

                    // if the service is running, route the packet.
                    if (current.status & JD_SERVICE_STATUS_FLAGS_INITIALISED) {
                        const address_check = current.device.device_address == cp.device_address && current.service_number == service_number;
                        const serial_check = cp.udidl == current.device.udidl && cp.udidh == current.device.udidh;

                        // this boolean is used to override stringent address checks (not needed for broadcast services as they receive all packets) to prevent code duplication
                        const broadcast_override = current.mode == JDServiceMode.BroadcastHostService;
                        // JD_DMESG("INITDSer", current.device.device_address, current.device.unique_device_identifier, current.service_class, current.status & JD_SERVICE_STATUS_FLAGS_INITIALISED ? 1 : 0, current.mode == BroadcastHostService ? 'B' : ' ', current.mode == HostService ? 'H' : ' ', current.mode == ClientService ? 'C' : ' ');

                        // check if applicable
                        if ((address_check && serial_check && class_check) || (class_check && broadcast_override)) {
                            // we are receiving a packet from a remote device for a service in broadcast mode.
                            if (broadcast_override && cp.device_address != this.device.device_address) {
                                // create a device representation if none exists
                                if (!remoteDevice)
                                    remoteDevice = this.deviceManager.addDevice(cp, pkt.communication_rate);

                                remoteDevice.servicemap_bitmsk |= 1 << service_number;
                                remoteDevice.broadcast_servicemap.setUint8(service_number, current.service_number);
                            }

                            // if the service has handled the packet it will return DEVICE_OK.
                            // any non zero return value will cause packet routing to continue
                            if (current.handleServiceInformation(remoteDevice, serviceInfo) == DEVICE_OK) {
                                jacdac.options.log("uS ABSORBED " + current.device.device_address + " " + current.service_class);
                                break;
                            }
                        }
                    }
                    else if (class_check && current.mode == JDServiceMode.ClientService) {
                        // this service instance is looking for a specific device (either a unique_device_identifier or name)
                        if (current.requiredDevice) {
                            if (current.requiredDevice.unique_device_identifier 
                                && current.requiredDevice.unique_device_identifier.length 
                                && !(current.requiredDevice.udidl == cp.udidl && current.requiredDevice.udidh == cp.udidh))
                                continue;

                            if (current.requiredDevice.device_name != cp.device_name)
                                continue;
                        }

                        jacdac.options.log("FOUND NEW" + current.service_class);
                        remoteDevice = this.deviceManager.addDevice(cp, pkt.communication_rate);

                        if (current.handleServiceInformation(remoteDevice, serviceInfo) == DEVICE_OK) {
                            current.device = remoteDevice;
                            current.service_number = service_number;
                            current._hostConnected();

                            if (this.onChange)
                                this.onChange();
                            break;
                        }
                    }
                }
                service_number++;
                dataIdx += JD_SERVICE_INFO_HEADER_SIZE + serviceInfo.advertisement_size;
            }

            return DEVICE_OK;
        }

        setDeviceName(name:string)
        {
            return this.name = name;
        }

        getDeviceName() : string
        {
            return this.name;
        }
    }
}