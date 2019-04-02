/**
 * Makecode package for the TCS34725 Color sensor.
 * 
 * More details here: https://ams.com/documents/20143/36005/TCS3472_DS000390_2-00.pdf/6e452176-2407-faaf-a590-d526c78c7432
 */
namespace sensors {

    const TCS34725_I2C_ADDRESS = 0x29        //I2C address of the TCS34725 (Page 34)

    /* TCS34725 register addresses (Page 20)*/

    const TCS34725_REGISTER_COMMAND = 0x80		// Specifies register address 

    const TCS34725_REGISTER_ENABLE = 0x00		// Enables states and interrupts
    const TCS34725_REGISTER_AIEN_ENABLE = 0x10	// RGBC interrupt enable. When asserted, permits RGBC interrupts to be generated.
    const TCS34725_REGISTER_WEN_ENABLE = 0x08	// Wait enable. This bit activates the wait feature. Writing a 1 activates the wait timer. Writing a 0 disables the wait timer.
    const TCS34725_REGISTER_AEN_ENABLE = 0x02	// RGBC enable. This bit actives the two-channel ADC. Writing a 1 activates the RGBC. Writing a 0 disables the RGBC.
    const TCS34725_REGISTER_PON_ENABLE = 0x01	// Power ON. This bit activates the internal oscillator to permit the timers and ADC channels to operate. Writing a 1 activates the oscillator. Writing a 0 disables the oscillator

    const TCS34725_REGISTER_ATIME = 0x01		// The RGBC timing register controls the internal integration time of the RGBC clear and IR channel ADCs in 2.4-ms increments.
    const TCS34725_REGISTER_WTIME = 0x03		// Wait time is set 2.4 ms increments unless the WLONG bit is asserted, in which case the wait times are 12× longer. WTIME is programmed as a 2’s complement number.

    const TCS34725_REGISTER_AILTL = 0x04		// Clear interrupt low threshold low byte
    const TCS34725_REGISTER_AILTH = 0x05		// Clear interrupt low threshold high byte
    const TCS34725_REGISTER_AIHTL = 0x06		// Clear interrupt high threshold low byte
    const TCS34725_REGISTER_AIHTH = 0x07		// Clear interrupt high threshold high byte

    const TCS34725_REGISTER_PERS = 0x0C		    // The persistence register controls the filtering interrupt capabilities of the device.

    const TCS34725_REGISTER_CONFIG = 0x0D		// The configuration register sets the wait long time.
    const TCS34725_REGISTER_CONFIG_WLONG = 0x02	// Configuration: Wait Long. When asserted, the wait cycles are increased by a factor 12× from that programmed in the WTIME register

    const TCS34725_REGISTER_CONTROL = 0x0F		// The Control register provides eight bits of miscellaneous control to the analog block. These bits typically control functions such as gain settings and/or diode selection
    const TCS34725_REGISTER_ID = 0x12		    // The ID Register provides the value for the part number. The ID register is a read-only register.

    const TCS34725_REGISTER_STATUS = 0x13		    // The Status Register provides the internal status of the device. This register is read only.
    const TCS34725_REGISTER_STATUS_AINT = 0x10		// Device status: RGBC clear channel Interrupt
    const TCS34725_REGISTER_STATUS_AVALID = 0x01	// Device status: RGBC Valid. Indicates that the RGBC channels have completed an integration cycle

    const TCS34725_REGISTER_CDATAL = 0x14		// Clear data low byte
    const TCS34725_REGISTER_CDATAH = 0x15		// Clear data high byte

    const TCS34725_REGISTER_RDATAL = 0x16		// Red data low byte
    const TCS34725_REGISTER_RDATAH = 0x17		// Red data high byte

    const TCS34725_REGISTER_GDATAL = 0x18		// Green data low byte
    const TCS34725_REGISTER_GDATAH = 0x19		// Green data high byte

    const TCS34725_REGISTER_BDATAL = 0x1A		// Blue data low byte
    const TCS34725_REGISTER_BDATAH = 0x1B		// Blue data high byte


    /* #region Enums for Modes, etc */

    // Parameters for setting the internal integration time of the RGBC clear and IR channel.
    export enum TCS34725_ATIME {
        ATIME_2_4_MS = 0xFF,    // 1 2.4 ms 1024
        ATIME_24_MS = 0xF6,     // 10 24 ms 10240
        ATIME_100_MS = 0xD5,    // 42 101 ms 43008
        ATIME_154_MS = 0xC0,    // 64 154 ms 65535
        ATIME_700_MS = 0x00     // 256 700 ms 65535
    }

    // Parameters for setting the wait time register.
    enum TCS34725_WTIME {
        WTIME_2_4_MS = 0xFF,    // 1 2.4 ms 0.029 sec
        WTIME_204_MS = 0xAB,    // 85 204 ms 2.45 sec
        WTIME_614_MS = 0x00     // 256 614 ms 7.4 sec
    }

    // Parameters for setting the persistence register. The persistence register controls the filtering interrupt capabilities of the device.
    enum TCS34725_APERS {
        APERS_0_CLEAR = 0b0000,      // Every RGBC cycle generates an interrupt
        APERS_1_CLEAR = 0b0001,      // 1 clear channel value outside of threshold range
        APERS_2_CLEAR = 0b0010,      // 2 clear channel consecutive values out of range
        APERS_3_CLEAR = 0b0011,      // 3 clear channel consecutive values out of range
        APERS_5_CLEAR = 0b0100,      // 5 clear channel consecutive values out of range
        APERS_10_CLEAR = 0b0101,     // 10 clear channel consecutive values out of range
        APERS_15_CLEAR = 0b0110,     // 15 clear channel consecutive values out of range
        APERS_20_CLEAR = 0b0111,     // 20 clear channel consecutive values out of range
        APERS_25_CLEAR = 0b1000,     // 25 clear channel consecutive values out of range
        APERS_30_CLEAR = 0b1001,     // 30 clear channel consecutive values out of range
        APERS_35_CLEAR = 0b1010,     // 35 clear channel consecutive values out of range
        APERS_40_CLEAR = 0b1011,     // 40 clear channel consecutive values out of range
        APERS_45_CLEAR = 0b1100,     // 45 clear channel consecutive values out of range
        APERS_50_CLEAR = 0b1101,     // 50 clear channel consecutive values out of range
        APERS_55_CLEAR = 0b1110,     // 55 clear channel consecutive values out of range
        APERS_60_CLEAR = 0b1111,     // 60 clear channel consecutive values out of range
    }

    // Parameters for setting the gain of the sensor.
    enum TCS34725_AGAIN {
        AGAIN_1X = 0x0,      // 1x gain
        AGAIN_4X = 0x1,      // 4x gain
        AGAIN_16X = 0x2,      // 16x gain
        AGAIN_60X = 0x3       // 60x gain
    }


    export class TCS34725 implements sensors.ColorSensor {
        isConnected: boolean;
        atimeIntegrationValue: TCS34725_ATIME;
        gainSensorValue: TCS34725_AGAIN;

        constructor() {
            this.isConnected = false;
            this.atimeIntegrationValue = 0;
            this.gainSensorValue = 0;

            this.start(TCS34725_ATIME.ATIME_2_4_MS, TCS34725_AGAIN.AGAIN_1X);
        }

        private connect() {
            let retry = 0;
            while (!this.isConnected && retry < 5) {

                //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
                //REGISTER READ:     TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_ID (0x12)
                const device_id = pins.i2cReadRegister(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_ID)

                //Check that device Identification has one of 2 i2c addresses         
                if ((device_id == 0x44) || (device_id == 0x10))
                    this.isConnected = true;

                retry++;
            }
        }

        private turnSensorOn() {

            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER VALUE:    TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_ENABLE (0x00)
            //REGISTER WRITE:    TCS34725_REGISTER_PON_ENABLE (0x01)
            pins.i2cWriteRegister(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_ENABLE, TCS34725_REGISTER_PON_ENABLE);
            basic.pause(300);


            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER VALUE:    TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_ENABLE (0x00)
            //REGISTER WRITE:    TCS34725_REGISTER_PON_ENABLE (0x01) | TCS34725_REGISTER_AEN_ENABLE (0x02)        
            pins.i2cWriteRegister(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_ENABLE, TCS34725_REGISTER_PON_ENABLE | TCS34725_REGISTER_AEN_ENABLE);

            this.pauseSensorForIntegrationTime();
        }

        private pauseSensorForIntegrationTime() {
            switch (this.atimeIntegrationValue) {
                case TCS34725_ATIME.ATIME_2_4_MS: {
                    basic.pause(2.4);
                    break;
                }
                case TCS34725_ATIME.ATIME_24_MS: {
                    basic.pause(24);
                    break;
                }
                case TCS34725_ATIME.ATIME_100_MS: {
                    basic.pause(100);
                    break;
                }
                case TCS34725_ATIME.ATIME_154_MS: {
                    basic.pause(154);
                    break;
                }
                case TCS34725_ATIME.ATIME_700_MS: {
                    basic.pause(700);
                    break;
                }
            }
        }

        private turnOff() {
            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER READ:     TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_ID (0x12)        
            let sensorReg = pins.i2cReadNumber(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_ENABLE);

            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER VALUE:    TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_ENABLE (0x00)
            //REGISTER WRITE:    sensorReg & ~(TCS34725_REGISTER_PON_ENABLE (0x01) | TCS34725_REGISTER_AEN_ENABLE (0x02))            
            pins.i2cWriteRegister(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_ENABLE, sensorReg & ~(TCS34725_REGISTER_PON_ENABLE | TCS34725_REGISTER_AEN_ENABLE));
        }

        setATIMEintegration(atime: TCS34725_ATIME) {
            //Always make sure the color sensor is connected. Useful for cases when this block is used but the sensor wasn't set randomly. 
            this.connect();

            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER VALUE:    TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_ATIME (0x01)
            //REGISTER WRITE:    atime                
            pins.i2cWriteRegister(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_ATIME, atime)
            this.atimeIntegrationValue = atime;

        }

        setGAINsensor(gain: TCS34725_AGAIN) {
            //Always make sure the color sensor is connected. Useful for cases when this block is used but the sensor wasn't set randomly. 
            this.connect();

            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER VALUE:    TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_CONTROL (0x0F)
            //REGISTER WRITE:    gain         
            pins.i2cWriteRegister(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_CONTROL, gain)

            this.gainSensorValue = gain;
        }

        private start(atime: TCS34725_ATIME, gain: TCS34725_AGAIN) {
            this.connect();
            this.setATIMEintegration(atime);
            this.setGAINsensor(gain);
            this.turnSensorOn();
        }

        color(): number {
            //Always check that sensor is/was turned on
            this.connect();

            if (!this.isConnected)
                return 0;

            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER READ:     TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_RDATAL (0x16)          
            const redColorValue = pins.i2cReadRegister(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_RDATAL, NumberFormat.UInt16LE);

            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER READ:     TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_GDATAL (0x18)          
            const greenColorValue = pins.i2cReadRegister(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_GDATAL, NumberFormat.UInt16LE);

            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER READ:     TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_BDATAL (0x1A)          
            const blueColorValue = pins.i2cReadRegister(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_BDATAL, NumberFormat.UInt16LE);

            //REGISTER FORMAT:   CMD | TRANSACTION | ADDRESS
            //REGISTER READ:     TCS34725_REGISTER_COMMAND (0x80) | TCS34725_REGISTER_CDATAL (0x14)          
            const clearColorValue = pins.i2cReadRegister(TCS34725_I2C_ADDRESS, TCS34725_REGISTER_COMMAND | TCS34725_REGISTER_CDATAL, NumberFormat.UInt16LE);

            this.pauseSensorForIntegrationTime();

            let sum = clearColorValue;
            let r = 0;
            let g = 0;
            let b = 0;

            if (clearColorValue == 0)
                return 0;
            else {
                r = (redColorValue / sum * 255) & 0xff;
                g = (greenColorValue / sum * 255) & 0xff;
                b = (blueColorValue / sum * 255) & 0xff;

                return (r << 16) | (g << 8) | b;
            }
        }
    }
}

/*
let strip: neopixel.Strip = null
strip = neopixel.create(DigitalPin.P1, 30, NeoPixelMode.RGB)
strip.setBrightness(255)

TCS34725.start(TCS34725_ATIME.ATIME_2_4_MS, TCS34725_AGAIN.AGAIN_1X);

basic.forever(function () {
    basic.pause(2000);
    serial.writeLine(TCS34725.isConnected + "");
    let a = TCS34725.getSensorRGB();

    strip.showColor(neopixel.rgb(a.red, a.green, a.blue));

})

*/