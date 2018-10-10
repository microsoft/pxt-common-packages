namespace pxsim.jacdac {
    function __internalSendPacket(packet: RefBuffer, address: number) {
        pxsim.Runtime.postMessage(<SimulatorJacDacPacketMessage>{ 
            type: "jacdac",
            packetType: "pkt",
            packet: packet.data,
            address
        });
    }
}