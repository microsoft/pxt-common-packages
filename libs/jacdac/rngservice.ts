namespace jacdac{

    const JD_CONTROL_RNG_SERVICE_NUMBER = 2

    const JD_CONTROL_RNG_SERVICE_REQUEST_TYPE_REQ = 1;
    const JD_CONTROL_RNG_SERVICE_REQUEST_TYPE_RESP = 2;

    export class JDRNGService extends JDService {

        send(buffer: Buffer): void {
            if (JACDAC.instance.bus.isConnected())
                JACDAC.instance.write(buffer, this.service_number, 0, null);
        }

        constructor() {
            super(JDServiceClass.CONTROL_RNG, JDServiceMode.ControlLayerService);
            this.service_number = JD_CONTROL_RNG_SERVICE_NUMBER;
        }

        // no imp for now.
    }

}