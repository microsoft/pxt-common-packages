namespace jacdac {
    export class BridgeDriver extends Driver {
        constructor(name: string) {
            super(name, 0, DAL.JD_DRIVER_CLASS_BRIDGE);
            this.supressLog = true; // too verbose
            jacdac.addDriver(this);
        }

        /**
         * Enables this driver as a bridge
         */
        enable() {
            this._proxy.setBridge();
        }
    }
}