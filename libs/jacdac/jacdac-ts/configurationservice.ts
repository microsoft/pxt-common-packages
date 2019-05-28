/// <reference path="service.ts"/>

namespace jacdac{

    const JD_CONTROL_CONFIGURATION_SERVICE_NUMBER = 1;

    const JD_CONTROL_CONFIGURATION_SERVICE_REQUEST_TYPE_NAME = 1;
    const JD_CONTROL_CONFIGURATION_SERVICE_REQUEST_TYPE_IDENTIFY= 2;

    export const JD_CONTROL_CONFIGURATION_SERVICE_PACKET_HEADER_SIZE = 2;

    export class JDConfigurationService extends JDService {

        name: string

        send(buffer: Buffer): void {
            if (JACDAC.instance.bus.isConnected())
                JACDAC.instance.write(buffer, this.service_number, 0, null);
        }

        constructor() {
            super(JDServiceClass.CONTROL_CONFIGURATION, JDServiceMode.ControlLayerService);
            this.service_number = JD_CONTROL_CONFIGURATION_SERVICE_NUMBER;
        }

        handlePacket(pkt: JDPacket)
        {
            let cfg = new JDConfigurationPacket(pkt);

            if (this.device)
            {
                if (cfg.device_address == this.device.device_address)
                {
                    if (cfg.request_type == JD_CONTROL_CONFIGURATION_SERVICE_REQUEST_TYPE_NAME && cfg.new_name.length)
                    {
                        JACDAC.instance.setDeviceName(cfg.new_name);
                        if (JACDAC.instance.onNameRemotelyChanged)
                            JACDAC.instance.onNameRemotelyChanged(cfg.new_name);
                    }

                    if (cfg.request_type == JD_CONTROL_CONFIGURATION_SERVICE_REQUEST_TYPE_IDENTIFY && JACDAC.instance.onIdentificationRequest)
                        JACDAC.instance.onIdentificationRequest()
                }
            }

            return DEVICE_OK;
        }

        triggerRemoteIdentification(device_address: number) : void
        {
            if (device_address == 0)
                return;

            let cfg = new JDConfigurationPacket;

            cfg.device_address = device_address;
            cfg.request_type = JD_CONTROL_CONFIGURATION_SERVICE_REQUEST_TYPE_IDENTIFY;

            this.send(cfg.getBuffer());
        }

        setRemoteDeviceName(device_address: number, name: string) : void
        {
            let cfg = new JDConfigurationPacket;
            cfg.device_address = device_address;
            cfg.request_type = JD_CONTROL_CONFIGURATION_SERVICE_REQUEST_TYPE_NAME;
            cfg.new_name = name;
            this.send(cfg.getBuffer());
        }
    }
}