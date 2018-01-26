namespace automation {
    /**
     * A behavior
     */
    //%
    export class Behavior {
        active: boolean;

        constructor() {
            this.active = false;
        }

        /**
         * Called on each behavior iteration even for suppresed behaviors
         * @param elapsed milli seconds since last call
         */
        update(elapsed: number) {
            // override
        }

        shouldRun(): boolean {
            // needs override
            return false;
        }

        run(): void {
            // override
        }
    }

    enum BehaviorManagerState {
        Stopped,
        Running,
        StopPending
    }

    /**
     * A manager for behaviors
     */
    //%
    export class BehaviorManager {
        private _behaviors: Behavior[];
        private _state: BehaviorManagerState;
        private _timer: control.Timer;

        public timestep: number;

        constructor() {
            this._behaviors = [];
            this._state = BehaviorManagerState.Stopped;
            this._timer = new control.Timer();
            this.timestep = 20;
        }

        /**
         * Adds a new behavior to the behavior manager
         * @param behavior the behavior to add
         */
        //% group="Behaviors"
        add(behavior: Behavior) {
            if (!behavior) return;

            behavior.active = false;
            this._behaviors.push(behavior);
        }

        /**
         * Starts the behavior control loop
         */
        //%  group="Behaviors"
        start(): void {
            if (this._state == BehaviorManagerState.Running) return;
            this._state = BehaviorManagerState.Running;
            control.runInParallel(() => this.run());
        }

        /**
         * Stops the execution loop
         */
        stop(): void {
            this._state = BehaviorManagerState.StopPending;
            pauseUntil(() => this._state == BehaviorManagerState.Stopped);
        }
        
        private run() {
            let elapsed = 0;
            // this is the main control loop
            while (this._state == BehaviorManagerState.Running) {
                const bvs = this._behaviors;
                const n = bvs.length;

                // update all behaviors, even supprsed
                for (let i = 0; i < n; ++i)
                    bvs[i].update(elapsed);                

                // poll non-suppressed behaviors
                for (let i = 0; i < n; ++i) {
                    const bv = bvs[i];
                    // behavior is already active, stop polling
                    if (bv.active) break;
                    // behavior is not active, test if it needs to take over
                    if (!bv.active && bv.shouldRun()) {
                        this.activate(i);
                        break;
                    }
                }

                // give a breather to the events
                this._timer.pauseUntil(this.timestep);
                elapsed = this._timer.millis();
                this._timer.reset();
            }

            // tell manager that we are done
            this._state = BehaviorManagerState.Stopped;
        }

        private activate(i: number) {
            // take over...
            // stop all lower priority behaviors
            for (let j = i + 1; j < this._behaviors.length; ++j) {
                this._behaviors[j].active = false;
            }
            // allow events to percolate
            loops.pause(1);

            // activate current behavior
            this._behaviors[i].active = true;
            control.runInParallel(() => this._behaviors[i].run())
        }
    }

    let _manager: BehaviorManager;
    /**
     * Adds the behavior and starts it
     * @param behavior a behavior
     */
    //% blockId=behaviorsAddBehavior block="add behavior %behavior"
    //% weight=100 group="Behaviors"
    export function addBehavior(behavior: Behavior) {
        if (!_manager) {
            _manager = new BehaviorManager();
            _manager.start();
        }
        _manager.add(behavior);
    }
}