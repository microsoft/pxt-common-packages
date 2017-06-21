#include "pxt.h"
#include "DeviceSystemTimer.h"
#include "LIS3DH.h"
#include "string.h"
// #include "helper.h"

namespace pxt {

// Wrapper classes

class PredictAccel {
  public:
    DeviceI2C i2c; // note that this is different pins than io->i2c
    DevicePin int1;
    LIS3DH acc;
    PredictAccel()
        : i2c((PinName)PIN_ACCELEROMETER_SDA, (PinName)PIN_ACCELEROMETER_SCL),
          INIT_PIN(int1, PIN_ACCELEROMETER_INT), //
          acc(i2c, int1, LIS3DH_DEFAULT_ADDR, DEVICE_ID_ACCELEROMETER, NORTH_EAST_UP) //
    {
        acc.init();        
    }
};
SINGLETON(PredictAccel);
}

namespace loops {
  bool using_gesture = true;
  time_t prevTime1 = 0;
  time_t prevTime2 = 0;
  time_t curTime = 0;
  time_t sampleRate1 = 30; // 33fps
  time_t sampleRate2 = 20; // 50fps

    void forever_stub(void *a) {
      while (true) {
        curTime = system_timer_current_time();

        if (using_gesture && (curTime - prevTime1 >= sampleRate1 || curTime < prevTime1)) {
          int x = getPredictAccel()->acc.getX();
          int y = getPredictAccel()->acc.getY();
          int z = getPredictAccel()->acc.getZ();

          // call the predict function
          // stream the raw data
          // serial.writeString(numops.toString(x) + " " + numops.toString(y) + " " + numops.toString(z) + "\n");

          // test sending something in the background to ensure if it actually works
          // the main goal here is to ensure that the predict function is being called with the correct values in the main loop
          // with a precise frequency to ensure the sampling rate of the sensor data is the same for training and prediction.
          // TODO: move this to another _thread_ similar to the events thread!
          char packet[32];
          char buf[8];

          packet[0] = '\0';
          strcat(packet, "ACC ");
          
          itoa(x, buf);
          strcat(packet, buf);
          strcat(packet, " ");

          itoa(y, buf);
          strcat(packet, buf);
          strcat(packet, " ");

          itoa(z, buf);
          strcat(packet, buf);

          hf2.sendSerial(packet, strlen(packet));

          prevTime1 = curTime;
        }
        
        if (curTime - prevTime2 >= sampleRate2 || curTime < prevTime2) {
          runAction0((Action)a);

          prevTime2 = curTime;
        }

        fiber_sleep(5);
      }
    }
    /**
     * Repeats the code forever in the background. On each iteration, allows other codes to run.
     * @param body code to execute
     */
    //% help=loops/forever weight=100 blockGap=8
    //% blockId=forever block="forever" blockAllowMultiple=1
    void forever(Action a) {
      if (a != 0) {
        incr(a);
        create_fiber(forever_stub, (void*)a);
      }
    }
    
    /**
     * Pause for the specified time in milliseconds
     * @param ms how long to pause for, eg: 100, 200, 500, 1000, 2000
     */
    //% help=loops/pause weight=99
    //% async block="pause (ms) %pause"
    //% blockId=device_pause
    void pause(int ms) {
      fiber_sleep(ms);
    }
}