namespace pxsim {
    enum ThresholdState {
        High,
        Low,
        Normal
    }

    export class AnalogSensorState {
        public sensorUsed: boolean = false;

        private level: number;
        private state = ThresholdState.Normal;

        constructor(public id: number, private min = 0, private max = 255, private lowThreshold = 64, private highThreshold = 192) {
            this.level = Math.ceil((max - min) / 2);
        }

        public setUsed() {
            if (!this.sensorUsed) {
                this.sensorUsed = true;
                runtime.queueDisplayUpdate();
            }
        }

        public setLevel(level: number) {
            this.level = this.clampValue(level);

            if (this.level >= this.highThreshold) {
                this.setState(ThresholdState.High);
            }
            else if (this.level <= this.lowThreshold) {
                this.setState(ThresholdState.Low);
            }
            else {
                this.setState(ThresholdState.Normal);
            }
        }

        public getLevel(): number {
            return this.level;
        }

        public setLowThreshold(value: number) {
            this.lowThreshold = this.clampValue(value);
            this.highThreshold = Math.max(this.lowThreshold + 1, this.highThreshold);
        }

        public setHighThreshold(value: number) {
            this.highThreshold = this.clampValue(value);
            this.lowThreshold = Math.min(this.highThreshold - 1, this.lowThreshold);
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

        private setState(state: ThresholdState) {
            if (this.state === state) {
                return;
            }

            this.state = state;
            switch (state) {
                case ThresholdState.High:
                    board().bus.queue(this.id, DAL.SENSOR_THRESHOLD_HIGH);
                    break;
                case ThresholdState.Low:
                    board().bus.queue(this.id, DAL.SENSOR_THRESHOLD_LOW);
                    break;
                case ThresholdState.Normal:
                    break;
            }
        }
    }
}