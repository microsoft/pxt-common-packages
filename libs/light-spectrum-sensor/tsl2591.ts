namespace sensors {
    /**
     * Makecode package for the TSL2591 Light sensor.
     *
     * More details here: https://ams.com/documents/20143/36005/TSL2591_DS000338_6-00.pdf/090eb50d-bb18-5b45-4938-9b3672f86b80
     */

    const TSL2591_I2C_ADDRESS = 0x29  //I2C address of the TSL2591 (Page 28)

    //See Page 13 for full register description of TSL2591

    const TSL2591_REGISTER_COMMAND = 0xA0	// Select Command Register. CMD: Must write as 1 when addressing COMMAND register + TRANSACTION: 01 Normal Operation (1010 0000)

    const TSL2591_REGISTER_COMMAND_SET_INT = 0xE4	// Interrupt set – forces an interrupt (11100100)
    const TSL2591_REGISTER_COMMAND_CLEAR_ALS_INT = 0xE6	// Clears ALS interrupt (11100110)
    const TSL2591_REGISTER_COMMAND_CLEAR_ALS_NO_PERS_INT = 0xE7	// Clears ALS and no persist ALS interrupt (11100111)
    const TSL2591_REGISTER_COMMAND_CLEAR_NO_PERS_INT = 0xEA	// Clears no persist ALS interrupt (11101010)

    const TSL2591_REGISTER_ENABLE = 0x00	// The ENABLE register is used to power the device on/off, enable functions and interrupts..
    const TSL2591_REGISTER_NPIEN_ENABLE = 0x80	// No Persist Interrupt Enable. When asserted NP Threshold conditions will generate an interrupt, bypassing the persist filter.
    const TSL2591_REGISTER_SAI_ENABLE = 0x40	// Sleep after interrupt. When asserted, the device will power down at the end of an ALS cycle if an interrupt has been generated.
    const TSL2591_REGISTER_AIEN_ENABLE = 0x10	// ALS Interrupt Enable. When asserted permits ALS interrupts to be generated, subject to the persist filter.
    const TSL2591_REGISTER_AEN_ENABLE = 0x02	// ALS Enable. This field activates ALS function. Writing a one activates the ALS. Writing a zero disables the ALS.
    const TSL2591_REGISTER_PON_ENABLE = 0x01	// Power ON. This field activates the internal oscillator to permit the timers and ADC channels to operate. Writing a one activates the oscillator. Writing a zero disables the oscillator.
    const TSL2591_REGISTER_POFF_ENABLE = 0x00	// Power OFF. This field activates the internal oscillator to permit the timers and ADC channels to operate. Writing a one activates the oscillator. Writing a zero disables the oscillator.

    const TSL2591_REGISTER_CONTROL = 0x01	// The CONTROL register is used to configure the ALS gain and integration time. In addition, a system reset is provided. Upon power up, the CONTROL register resets to 0x00.
    const TSL2591_REGISTER_CONTROL_SRESET = 0x80	// System reset. When asserted, the device will reset equivalent to a power-on reset. SRESET is self-clearing.

    const TSL2591_REGISTER_PID = 0x11	// The PID register provides an identification of the devices package. This register is a read-only register whose value never changes.
    const TSL2591_REGISTER_ID = 0x12	// The ID register provides the device identification. This register is a read-only register whose value never changes.

    const TSL2591_REGISTER_STATUS = 0x13	// The Status Register provides the internal status of the device. This register is read only.
    const TSL2591_REGISTER_STATUS_NPINTR = 0x20	// No-persist Interrupt. Indicates that the device has encountered a no-persist interrupt condition.
    const TSL2591_REGISTER_STATUS_AINT = 0x10	// ALS Interrupt. Indicates that the device is asserting an ALS interrupt.
    const TSL2591_REGISTER_STATUS_AVALID = 0x01	// ALS Valid. Indicates that the ADC channels have completed an integration cycle since the AEN bit was asserted.

    const TSL2591_REGISTER_C0DATAL = 0x14	// ALS CH0 data low byte
    const TSL2591_REGISTER_C0DATAH = 0x15	// ALS CH0 data high byte
    const TSL2591_REGISTER_C1DATAL = 0x16	// ALS CH1 data low byte
    const TSL2591_REGISTER_C1DATAH = 0x17	// ALS CH1 data high byte

    const TSL2591_REGISTER_AILTL = 0x04	// ALS low threshold lower byte
    const TSL2591_REGISTER_AILTH = 0x05	// ALS low threshold upper byte
    const TSL2591_REGISTER_AIHTL = 0x06	// ALS high threshold lower byte
    const TSL2591_REGISTER_AIHTH = 0x07	// ALS high threshold upper byte
    const TSL2591_REGISTER_NPAILTL = 0x08	// No Persist ALS low threshold lower byte
    const TSL2591_REGISTER_NPAILTH = 0x09	// No Persist ALS low threshold upper byte
    const TSL2591_REGISTER_NPAIHTL = 0x0A	// No Persist ALS high threshold lower byte
    const TSL2591_REGISTER_NPAIHTH = 0x0B	// No Persist ALS high threshold upper byte

    const TSL2591_REGISTER_PERSIST = 0x0B	// The Interrupt persistence filter sets the number of consecutive out-of-range ALS cycles necessary to generate an interrupt. Out-of-range is determined by comparing C0DATA (0x14 and 0x15) to the interrupt threshold registers (0x04 - 0x07). Note that the no-persist ALS interrupt is not affected by the interrupt persistence filter. Upon power up, the interrupt persistence filter register resets to 0x00.


    /* #region Enums for Modes, etc */

    // ALS gain sets the gain of the internal integration amplifiers for both photodiode channels.
    enum TSL2591_AGAIN {
        AGAIN_LOW = 0x00,      // Low gain mode
        AGAIN_MEDIUM = 0x10,   // Medium gain mode
        AGAIN_HIGH = 0x20,     // High gain mode
        AGAIN_MAX = 0x30       // Maximum gain mode
    }

    // ALS time sets the internal ADC integration time for both photodiode channels.
    enum TSL2591_ATIME {
        ATIME_100_MS = 0x00,    // 100 ms
        ATIME_200_MS = 0x01,    // 200 ms
        ATIME_300_MS = 0x02,    // 300 ms
        ATIME_400_MS = 0x03,    // 400 ms
        ATIME_500_MS = 0x04,    // 500 ms
        ATIME_600_MS = 0x05     // 600 ms
    }

    export class TSL2591 extends sensors.LightSpectrumSensor {

        private TSL2591_I2C_ADDR: number;
        private isConnected: boolean;
        private atimeIntegrationValue: TSL2591_ATIME;
        private gainSensorValue: TSL2591_AGAIN;

        constructor(id: number) {
            super(id);
            this.atimeIntegrationValue = TSL2591_ATIME.ATIME_100_MS,
            this.gainSensorValue = TSL2591_AGAIN.AGAIN_HIGH,
            this.TSL2591_I2C_ADDR = TSL2591_I2C_ADDRESS;
            this.isConnected = false;
            this.initSensor();
        }

        private initSensor() {
            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER READ:     TSL2591_REGISTER_COMMAND (0x80) | TSL2591_REGISTER_COMMAND_NORMAL (0x20) | TSL2591_REGISTER_ID (0x12)
            let device_id = pins.i2cReadRegister(this.TSL2591_I2C_ADDR, TSL2591_REGISTER_COMMAND | TSL2591_REGISTER_ID)
            //Check that device Identification = 0x50 (Page 19)
            this.isConnected = (device_id == 0x50);

            this.configureSensor();
        }

        setAtime(atime: TSL2591_ATIME) {
            this.atimeIntegrationValue = atime;
            this.configureSensor();
        }

        setGain(gain: TSL2591_AGAIN) {
            this.gainSensorValue = gain;
            this.configureSensor();
        }

        private configureSensor() {
            //Always make sure the sensor is connected. Useful for cases when this block is used but the sensor wasn't set randomly.
            if (!this.isConnected)
                return;

            //Turn sensor on
            this.enableSensor();


            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER VALUE:    TSL2591_REGISTER_COMMAND (0x80) | TSL2591_REGISTER_CONTROL (0x01)
            //REGISTER WRITE:    atimeIntegrationValue | gainSensorValue
            pins.i2cWriteRegister(this.TSL2591_I2C_ADDR, TSL2591_REGISTER_COMMAND | TSL2591_REGISTER_CONTROL, this.atimeIntegrationValue | this.gainSensorValue);
        }

        private enableSensor() {
            //1 - First set the command bit to 1, to let the device be set
            //2 - Next, turn it on, then enable ALS, enable ALS Interrupt, and enable No Persist Interrupt

            if (this.isConnected)
                //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
                //REGISTER VALUE:    TSL2591_REGISTER_COMMAND (0x80) | TSL2591_REGISTER_COMMAND_NORMAL (0x20) | TSL2591_REGISTER_ENABLE (0x00)
                //REGISTER WRITE:    TSL2591_REGISTER_PON_ENABLE (0x01) | TSL2591_REGISTER_AEN_ENABLE (0x02) | TSL2591_REGISTER_AIEN_ENABLE (0x10) | TSL2591_REGISTER_NPIEN_ENABLE (0x80)
                pins.i2cWriteRegister(this.TSL2591_I2C_ADDR, TSL2591_REGISTER_COMMAND | TSL2591_REGISTER_ENABLE, TSL2591_REGISTER_PON_ENABLE | TSL2591_REGISTER_AEN_ENABLE /*| TSL2591_REGISTER_AIEN_ENABLE | TSL2591_REGISTER_NPIEN_ENABLE*/)
        }

        disableSensor() {
            //1 - First set the command bit to 1, to let the device be set
            //2 - Next, turn it off

            if (this.isConnected)
                //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
                //REGISTER VALUE:    TSL2591_REGISTER_COMMAND (0x80) | TSL2591_REGISTER_COMMAND_NORMAL (0x20) | TSL2591_REGISTER_ENABLE (0x00)
                //REGISTER WRITE:    TSL2591_REGISTER_POFF_ENABLE (0x00)
                pins.i2cWriteRegister(this.TSL2591_I2C_ADDR, TSL2591_REGISTER_COMMAND | TSL2591_REGISTER_ENABLE, TSL2591_REGISTER_POFF_ENABLE)
        }

        protected readSpectrum(): LightSpectrum {
            let retVal: LightSpectrum = new LightSpectrum();
            if (this.isConnected) {
                // this.enableSensor();
                // basic.pause(100);

                //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
                //REGISTER READ:     TSL2591_REGISTER_COMMAND (0x80) | TSL2591_REGISTER_COMMAND_NORMAL (0x20) | TSL2591_REGISTER_C1DATAL (0x16)

                const channel0l = pins.i2cReadRegister(this.TSL2591_I2C_ADDR, TSL2591_REGISTER_COMMAND | TSL2591_REGISTER_C0DATAL);
                const channel0h = pins.i2cReadRegister(this.TSL2591_I2C_ADDR, TSL2591_REGISTER_COMMAND | TSL2591_REGISTER_C0DATAH);
                const channel1l = pins.i2cReadRegister(this.TSL2591_I2C_ADDR, TSL2591_REGISTER_COMMAND | TSL2591_REGISTER_C1DATAL);
                const channel1h = pins.i2cReadRegister(this.TSL2591_I2C_ADDR, TSL2591_REGISTER_COMMAND | TSL2591_REGISTER_C1DATAH);
                // const channel1 = pins.i2cReadRegister(this.TSL2591_I2C_ADDR, TSL2591_REGISTER_COMMAND | TSL2591_REGISTER_C1DATAL, NumberFormat.UInt16LE);

                if (channel0l !== undefined && channel0h !== undefined && channel1l !== undefined && channel1h !== undefined) {
                    const full = channel0l | (channel0h << 8);
                    const ir = channel1l | (channel1h << 8);
                    // catch overflow condition when ir and full are equal (max value)
                    let visible = (full != ir) ? full - ir : full;
                    // control.dmesg("RAW C0:");
                    // control.dmesg(channel0l.toString());
                    // control.dmesg(channel0h.toString());
                    // control.dmesg("RAW C1:");
                    // control.dmesg(channel1l.toString());
                    // control.dmesg(channel1h.toString());
                    // control.dmesg("PROC:");
                    // control.dmesg(full.toString());
                    // control.dmesg(ir.toString());
                    // control.dmesg(visible.toString());

                    retVal.full = full;
                    retVal.infrared = ir;
                    retVal.visible = visible;
                    retVal.normalized = Math.map(visible, 0, 37888, 0, 1024);
                }
                else
                    control.dmesg("LSBAD");
            }
            else
                this.initSensor();

            return retVal
        }
    }
}