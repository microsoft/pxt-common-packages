namespace jacdac {
    export class BridgeDriver extends Driver {
        constructor(name: string) {
            super(name, 0, DAL.JD_DRIVER_CLASS_BRIDGE);
            this.supressLog = true; // too verbose
        }

        start() {
            super.start();
            if (this._proxy) this._proxy.setBridge();
        }
    }
}