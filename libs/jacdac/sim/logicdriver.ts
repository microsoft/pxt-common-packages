namespace pxsim.jacdac {

    class JDLogicDriver {
        populateControlPacket(driver: JacDacDriverStatus, cp: ControlPacket) {
            cp.packet_type = DAL.CONTROL_JD_TYPE_HELLO;
            cp.address = driver.device.address;
            cp.flags = 0;

            if (driver.device.isPairing())
                cp.flags |= DAL.CONTROL_JD_FLAGS_PAIRING_MODE;

            if (driver.device.isPaired())
                cp.flags |= DAL.CONTROL_JD_FLAGS_PAIRED;

            if (driver.device.isPairable())
                cp.flags |= DAL.CONTROL_JD_FLAGS_PAIRABLE;

            cp.driverClass = driver.device.driverClass;
            cp.serialNumber = driver.device.serialNumber;
        }
    }
}