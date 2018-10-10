namespace pxsim.jacdac {
    interface SimulatorJacDacMessage extends SimulatorMessage {
        type: "jacdac";
        broadcast: true;
        packet: Buffer;
        deviceAddress: number;
    }

    function __internalSendPacket(packet: Buffer, deviceAddress: number) {
        pxsim.Runtime.postMessage(<SimulatorJacDacMessage>{ packet, deviceAddress });
    }
}