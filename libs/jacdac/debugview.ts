namespace jacdac {
    export class DebugView {
        static _debugViews: DebugView[];
        serviceClass: number;
        name: string;

        constructor(name: string, serviceClass: number) {
            this.name = name;
            this.serviceClass = serviceClass;

            if (DebugView._debugViews === undefined)
            {
                DebugView._debugViews = [];
                DebugView.registerDefaultViews();
            }

            // replace existing debug views.
            for (let i = 0; i < DebugView._debugViews.length; i++) {
                if (DebugView._debugViews[i].serviceClass == serviceClass) {
                    DebugView._debugViews[i] = this;
                    return;
                }
            }

            DebugView._debugViews.push(this);
        }

        static find(serviceClass: number) {
            for (let view of DebugView._debugViews) {
                if (view.serviceClass == serviceClass)
                    return view;
            }

            return undefined;
        }

        static registerDefaultViews(){
            new jacdac.ControlDebugView();
        }

        renderControlPacket(device: JDDevice, service_information: JDServiceInformation) {
            return "";
        }

        renderPacket(packet: JDPacket) {
            return "";
        }
    }
}