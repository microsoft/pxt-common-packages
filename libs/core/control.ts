/**
* Runtime and event utilities.
*/
//% weight=10 color="#31bca3" icon="\uf110" advanced=true
namespace control {

    /**
     * Display specified error code and stop the program.
     */
    // shim=pxtrt::panic
    export function panic(code: number) { }

    /**
     * Display specified error code and stop the program.
     */
    // shim=pxtrt::assert
    export function assert(cond: boolean, code: number) { }

    export function fail(message: string) {
        serial.writeString("Fatal failure: ")
        serial.writeString(message)
        serial.writeString("\r\n")
        panic(108)
    }

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
        runUntilDone(render: () => boolean) {
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
            // unblock 1 fiber
            control.raiseEvent(DAL.DEVICE_ID_NOTIFY_ONE, this.eventID);
        }

        isCancelled(evid: number) {
            return this.eventID !== evid;
        }

        /**
         * Cancels the current running animation and clears the queue
         */
        cancel() {
            if (this.running) {
                this.running = false;
                const evid = this.eventID;
                this.eventID = control.allocateNotifyEvent();
                // unblock fibers
                control.raiseEvent(DAL.DEVICE_ID_NOTIFY, evid);
            }
        }
    }
}


/**
 * Tagged hex literal converter
 */
//% shim=@hex
function hex(lits: any, ...args: any[]): Buffer { return null }