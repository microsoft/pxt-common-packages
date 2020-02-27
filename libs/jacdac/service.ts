namespace jacdac {
    //% fixedInstances
    export class Broadcast extends Service {
        constructor(name: string, serviceClass: number, controlDataLength?: number) {
            super(name, JDServiceMode.BroadcastHostService, serviceClass, controlDataLength);
        }
    }
}