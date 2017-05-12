
//% color="#B4009E" weight=98 icon="\uf192"
namespace input {
}

namespace control {
    export class AnimationQueue {
        running: boolean;
        eventID: number;

        constructor() {
            this.running = false;
            this.eventID = control.allocateNotifyEvent();
        }

        /**
         * Runs 'render' in a loop until it returns false or the 'stop' function is called
         */
        runUntilDone(render:() => boolean) {
            const evid = this.eventID;

            // if other animation, wait for turn
            if (this.running)
                control.waitForEvent(DAL.DEVICE_ID_NOTIFY, evid);

            // check if the animation hasn't been cancelled since we've waiting
            if (this.isCancelled(evid))
                return;

            // run animation
            this.running = true;
            while (this.running 
                    && !this.isCancelled(evid)
                    && render()) {                
                loops.pause(1);
            }

            // check if the animation hasn't been cancelled since we've been waiting
            if (this.isCancelled(evid))
                return;            

            // we're done
            this.running = false;
            control.raiseEvent(DAL.DEVICE_ID_NOTIFY_ONE, this.eventID);
        }

        isCancelled(evid: number) {
            return this.eventID !== evid;
        }

        /**
         * Cancels the current running animation and clears the queue
         */
        stop() {
            if(this.running) {
                this.running = false;
                const evid = this.eventID;
                this.eventID = control.allocateNotifyEvent();
                control.raiseEvent(DAL.DEVICE_ID_NOTIFY, evid);
            }
        }
    }
}