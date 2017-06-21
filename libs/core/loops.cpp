#include "pxt.h"

bool using_gesture = true;
int prevTime1 = 0
int prevTime2 = 0
int time1 = 0
int time2 = 0
int sampleRate1 = 30; //33fps
int sampleRate2 = 20; //50fps

namespace loops {    
    void forever_stub(void *a) {
      while (true) {
        time = system_timer_current_time();

        if (using_gesture && time1 - prevTime1 >= sampleRate1 || time1 < prevTime1) {
          int x = input.acceleration(Dimension::X);
          int y = input.acceleration(Dimension::Y);
          int z = input.acceleration(Dimension::Z);

          // call the predict function
          // stream the raw data
          // serial.writeString(numops.toString(x) + " " + numops.toString(y) + " " + numops.toString(z) + "\n");

          prevTime1 = time1;
        }
        else if (time2 - prevTime2 >= sampleRate2 || time2 < prevTime2) {
          runAction0((Action)a);
          
          prevTime2 = time2;
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