namespace pins {
    export class LevelDetector {
        public id: number;
        public min: number;
        public max: number;
        public lowThreshold: number;
        public highThreshold: number;
        private transition: number;
        private transitionMs: number;
        private _level: number;
        private _state: number;
        public onHigh: () => void;
        public onLow: () => void;
        public onNeutral: () => void;
        public transitionWindow: number;
        // minimum duration (ms) between events
        public transitionInterval: number;

        static LEVEL_THRESHOLD_NEUTRAL = 0;

        constructor(id: number,
            min: number, max: number,
            lowThreshold: number, highThreshold: number) {
            this.id = id;
            this.min = min;
            this.max = max;
            this.lowThreshold = lowThreshold;
            this.highThreshold = highThreshold;
            this.transitionWindow = 4;
            this.transitionInterval = 0;

            this.onHigh = () => control.raiseEvent(this.id, DAL.LEVEL_THRESHOLD_HIGH);
            this.onLow = () => control.raiseEvent(this.id, DAL.LEVEL_THRESHOLD_LOW);
            this.onNeutral = undefined;

            this.reset();
        }

        reset() {
            this.transition = 0;
            this.transitionMs = 0;
            this._level = Math.ceil((this.highThreshold - this.lowThreshold) / 2);
            this._state = LevelDetector.LEVEL_THRESHOLD_NEUTRAL;
        }

        get level(): number {
            return this._level;
        }

        set level(level: number) {
            this._level = this.clampValue(level);

            if (this._level >= this.highThreshold) {
                this.setState(DAL.LEVEL_THRESHOLD_HIGH);
            }
            else if (this._level <= this.lowThreshold) {
                this.setState(DAL.LEVEL_THRESHOLD_LOW);
            }
            else {
                this.setState(LevelDetector.LEVEL_THRESHOLD_NEUTRAL);
            }
        }

        public setLowThreshold(value: number) {
            this.lowThreshold = this.clampValue(value);
            this.reset();
        }

        public setHighThreshold(value: number) {
            this.highThreshold = this.clampValue(value);
            this.reset();
        }

        private clampValue(value: number) {
            if (value < this.min) {
                return this.min;
            }
            else if (value > this.max) {
                return this.max;
            }
            return value;
        }

        private setState(state: number) {
            // not enough samples to change
            if (this._state === state 
                || (this.transition++ < this.transitionWindow)
                || (control.millis() - this.transitionMs) < this.transitionInterval) {
                return;
            }

            this.transition = 0;
            this.transitionMs = control.millis();
            this._state = state;
            switch (state) {
                case DAL.LEVEL_THRESHOLD_HIGH:
                    if (this.onHigh) this.onHigh();
                    break;
                case DAL.LEVEL_THRESHOLD_LOW:
                    if (this.onLow) this.onLow();
                    break;
                case LevelDetector.LEVEL_THRESHOLD_NEUTRAL:
                    if (this.onNeutral) this.onNeutral();
                    break;
            }
        }
    }
}