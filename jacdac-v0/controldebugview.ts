/// <reference path="debugview.ts"/>

namespace jacdac{

    export class ControlDebugView extends DebugView
    {
        constructor() {
            super("CONTROL", jacdac.JDServiceClass.CONTROL);
        }

        renderPacket(pkt:jacdac.JDPacket){

            // only render control packet for now
            if (pkt.service_number == 0)
            {
                const cp = new jacdac.JDControlPacket(pkt);
                const device = new jacdac.JDDevice(cp);

                let cpFlags = ""
                cpFlags += (device.device_flags & JD_DEVICE_FLAGS_NACK) ? "NACK | " : ""
                cpFlags += (device.device_flags & JD_DEVICE_FLAGS_HAS_NAME) ? "NAME | " : ""
                cpFlags += (device.device_flags & JD_DEVICE_FLAGS_PROPOSING) ? "PROP | " : ""
                cpFlags += (device.device_flags & JD_DEVICE_FLAGS_REJECT) ? "REG | " : ""

                if (cpFlags.length == 0)
                    cpFlags = "NONE"

                let ss = "\r\nclass\tflags\tadvert\r\n"
                for (let s of device.services) {
                    ss += `${s.service_class}\t${s.service_flags}\t${s.data.toHex()}\r\n`
                }

                return `\r\nid: ${(device.device_name) ? device.device_name : device.udid.toHex()}\r\naddress: ${device.device_address}\tflags:${cpFlags} ${ss}\r\n`
            }

            return "";
        }
    }

}