namespace pxsim.jacdac {
    function __internalSendPacket(packet: RefBuffer, address: number) {
        pxsim.Runtime.postMessage(<pxsim.SimulatorJacDacPacketMessage>{ 
            type: "jacdac",
            packetType: "pkt",
            packet: packet.data,
            address
        });
    }
}