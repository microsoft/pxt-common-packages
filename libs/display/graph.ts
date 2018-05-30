namespace display {
    class Chart {
        // Variables used for data configuration.
        private times: number[];
        private values: number[];

        // grid
        private gridRows: number;
        private gridCols: number;
        private gridWidth: number;
        private gridHeight: number;

        // chart rendering
        private chartWidth: number;
        private chartHeight: number;
        private scaleXMin: number;
        private scaleXMax: number;
        private scaleYMin: number;
        private scaleYMax: number;
        private axisPaddingX: number;
        private axisPaddingY: number;

        // estimated best number of entries
        private maxEntries: number;

        public backgroundColor: number;
        public axisColor: number;
        public lineColor: number;

        constructor() {
            this.backgroundColor = 0;
            this.axisColor = 1;
            this.lineColor = 1;

            this.axisPaddingX = 22;
            this.axisPaddingY = image.font5.charHeight + 8;
            this.gridRows = 2;
            this.gridCols = 2; // computed on the fly
            this.times = [];
            this.values = [];
            this.chartWidth = screen.width - this.axisPaddingX;
            this.chartHeight = screen.height - this.axisPaddingY;
            this.maxEntries = (this.chartWidth - 2) / 2;
        }

        public addPoint(value: number) {
            this.times.push(control.millis() / 1000);
            this.values.push(value);
            if (this.times.length > this.maxEntries * 2) {
                this.times = this.times.slice(this.times.length - this.maxEntries - 1, this.times.length - 1);
                this.values = this.values.slice(this.values.length - this.maxEntries - 1, this.values.length - 1);
            }
        }

        public render() {
            if (this.times.length < 2) return;
            this.calculateScale();
            screen.fill(this.backgroundColor);
            this.drawAxes();
            this.drawChartGrid();
            this.drawGraphPoints();
        }

        private calculateScale() {
            this.scaleYMax = this.values[0];
            this.scaleYMin = this.values[0];
            for (let j = 0, len2 = this.values.length; j < len2; j++) {
                if (this.scaleYMax < this.values[j]) {
                    this.scaleYMax = this.values[j];
                }
                if (this.scaleYMin > this.values[j]) {
                    this.scaleYMin = this.values[j];
                }
            }

            // update axis to look better
            const rx = generateSteps(0, this.times[this.times.length - 1] - this.times[0], 4);
            this.scaleXMin = rx[0];
            this.scaleXMax = rx[1];
            this.gridCols = rx[2];
            const ry = generateSteps(this.scaleYMin, this.scaleYMax, 6);
            this.scaleYMin = ry[0];
            this.scaleYMax = ry[1];
            this.gridRows = ry[2];

            // avoid empty interval
            if (this.scaleXMin === this.scaleXMax) {
                this.scaleXMin = 0.5;
                this.scaleXMax = 0.5;
            }
            if (this.scaleYMin === this.scaleYMax) {
                this.scaleYMin = 0.5;
                this.scaleYMax = 0.5;
            }

            // update y-axis width
            let xl = 0;
            const yRange = this.scaleYMax - this.scaleYMin;
            const yUnit = yRange / this.gridRows;
            for (let i = 0; i <= this.gridRows; ++i)
                xl = Math.max(roundWithPrecision(this.scaleYMax - (i * yUnit), 2).toString().length, xl);
            this.axisPaddingX = xl * image.font5.charWidth + 4;
            this.chartWidth = screen.width - this.axisPaddingX;
            this.maxEntries = (this.chartWidth - 2) / 2;

            // Calculate the grid for background / scale.
            this.gridWidth = this.chartWidth / this.gridCols;  // This is the width of the grid cells (background and axes).
            this.gridHeight = this.chartHeight / this.gridRows; // This is the height of the grid cells (background axes).
        }

        private drawChartGrid() {
            const c = this.axisColor;
            const tipLength = 3;

            screen.drawRect(0, 0, this.chartWidth, this.chartHeight, c);

            for (let i = 0; i < this.gridCols; i++) {
                screen.drawLine(i * this.gridWidth, this.chartHeight, i * this.gridWidth, this.chartHeight - tipLength, c);
                screen.drawLine(i * this.gridWidth, 0, i * this.gridWidth, tipLength, c);
            }
            for (let i = 0; i < this.gridRows; i++) {
                screen.drawLine(0, i * this.gridHeight, tipLength, i * this.gridHeight, c);
                screen.drawLine(this.chartWidth, i * this.gridHeight, this.chartWidth - tipLength, i * this.gridHeight, c);
            }
        }

        private drawAxes() {
            const c = this.axisColor;
            const xRange = this.scaleXMax - this.scaleXMin;
            const yRange = this.scaleYMax - this.scaleYMin;

            const xUnit = xRange / this.gridCols;
            const yUnit = yRange / this.gridRows;

            // Draw the y-axes labels.
            let text = '';
            for (let i = 0; i <= this.gridRows; i++) {
                text = roundWithPrecision(this.scaleYMax - (i * yUnit), 2).toString();
                let y = i * this.gridHeight + image.font5.charHeight / 2;
                if (i == this.gridRows)
                    y -= image.font5.charHeight;
                else if (i == 0)
                    y += image.font5.charHeight / 2;
                screen.print(text, this.chartWidth + 5, y, c, image.font5);
            }

            // Draw the x-axis labels
            for (let i = 0; i <= this.gridCols; i++) {
                text = roundWithPrecision((i * xUnit), 2).toString();
                let x = i * this.gridWidth;
                screen.print(text, x, this.chartHeight + (this.axisPaddingY - 4 - image.font5.charHeight), c, image.font5);
            }
        }

        private drawGraphPoints() {
            const c = this.lineColor;
            // Determine the scaling factor based on the min / max ranges.
            const xRange = this.scaleXMax - this.scaleXMin;
            const yRange = this.scaleYMax - this.scaleYMin;

            const xFactor = this.chartWidth / xRange;
            let yFactor = this.chartHeight / yRange;

            let nextX = 0;
            let nextY = (this.values[0] - this.scaleYMin) * yFactor;
            const startX = nextX;
            const startY = nextY;
            for (let i = 1; i < this.values.length; i++) {
                let prevX = nextX;
                let prevY = nextY;
                nextX = (this.times[i] - this.times[0]) * xFactor;
                nextY = (this.values[i] - this.scaleYMin) * yFactor;
                screen.drawLine(prevX, prevY, nextX, nextY, c);
            }
        }
    }

    // helpers
    function log10(x: number): number {
        return Math.log(x) / Math.log(10);
    }

    function roundWithPrecision(x: number, digits: number): number {
        if (digits <= 0) return Math.round(x);
        let d = Math.pow(10, digits);
        return Math.round(x * d) / d;
    }

    function generateSteps(start: number, end: number, numberOfTicks: number): number[] {
        let bases = [1, 5, 2, 3]; // Tick bases selection
        let currentBase: number;
        let n: number;
        let intervalSize: number, upperBound: number, lowerBound: number;
        let nIntervals: number, nMaxIntervals: number;
        let the_intervalsize = 0.1;

        let exponentYmax =
            Math.floor(Math.max(log10(Math.abs(start)), log10(Math.abs(end))));
        let mantissaYmax = end / Math.pow(10.0, exponentYmax);

        // now check if numbers can be cleaned...
        // make it pretty
        let significative_numbers = Math.min(3, Math.abs(exponentYmax) + 1);

        let expo = Math.pow(10.0, significative_numbers);
        let start_norm = Math.abs(start) * expo;
        let end_norm = Math.abs(end) * expo;
        let mant_norm = Math.abs(mantissaYmax) * expo;

        // trunc ends
        let ip_start = Math.floor(start_norm * Math.sign(start));
        let ip_end = Math.ceil(end_norm * Math.sign(end));

        start = ip_start;
        end = ip_end;

        mantissaYmax = Math.ceil(mant_norm);

        nMaxIntervals = 0;
        for (let k = 0; k < bases.length; ++k) {
            // Loop initialisation
            currentBase = bases[k];
            n = 4; // This value only allows results smaller than about 1000 = 10^n


            do // Tick vector length reduction
            {
                --n;
                intervalSize = currentBase * Math.pow(10.0, exponentYmax - n);

                upperBound =
                    Math.ceil(mantissaYmax * Math.pow(10.0, n) / currentBase)
                    * intervalSize;

                nIntervals =
                    Math.ceil((upperBound - start) / intervalSize);
                lowerBound = upperBound - nIntervals * intervalSize;
            }
            while (nIntervals > numberOfTicks);

            if (nIntervals > nMaxIntervals) {
                nMaxIntervals = nIntervals;
                ip_start = ip_start = lowerBound;
                ip_end = upperBound;
                the_intervalsize = intervalSize;
            }
        }

        // trunc ends
        if (start < 0)
            start = Math.floor(ip_start) / expo;
        else
            start = Math.ceil(ip_start) / expo;

        if (end < 0)
            end = Math.floor(ip_end) / expo;
        else
            end = Math.ceil(ip_end) / expo;

        return [start, end, nMaxIntervals];
    }


    let chart: Chart;
    /**
     * Adds a new point to the trend chart and renders it to the screen.
     */
    //% group="Charts"
    //% blockId=graphadd block="graph %value"
    //% blockGap=8
    export function graph(value: number) {
        if (!chart)
            chart = new Chart();

        chart.addPoint(value);
        chart.render();
    }

    /**
     * Clears the trend chart and the screen
     */
    //% group="Charts"
    //% blockid=graphclear block="graph clear"
    export function graphClear() {
        chart = undefined;
        screen.fill(0);
    }
}
