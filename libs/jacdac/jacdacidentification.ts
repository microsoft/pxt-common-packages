namespace jacdac{


    export class JDIdentification {
        identifying:boolean;

        constructor () {
            this.identifying = false;
            control.onEvent(33,2, () =>{
                this.identify();
            });
        }

        identify()
        {
            this.identifying = true;
            // do something to identify the device
            this.identifying = false;
        }
    }

    export class JDGPIOIdentification extends JDIdentification{
        pin : DigitalInOutPin
        constructor (pin:DigitalInOutPin) {
            super();
            this.pin = pin;
        }

        identify()
        {
            if (this.identifying)
                return;

            this.identifying = true;

            let state = false;
            for (let i = 0; i < 50; i++)
            {
                this.pin.digitalWrite(state = !state);
                pause(100);
            }

            this.identifying = false;
        }
    }
    export let identification: JDIdentification;
}