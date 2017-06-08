#include "pxt.h"

namespace loops {    
    void forever_stub(void *a) {
      while (true) {
        runAction0((Action)a);
        fiber_sleep(20);
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