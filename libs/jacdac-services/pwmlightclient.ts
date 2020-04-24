namespace jacdac {
    //% fixedInstances
    export class MonoLightAnimation {
        constructor(public buffer: Buffer) { }
    }

    export namespace mono {
        //% fixedInstance whenUsed
        export const slowGlow = new MonoLightAnimation(hex`000f dc05 ffff dc05 000f 0100`)
        //% fixedInstance whenUsed
        export const stable = new MonoLightAnimation(hex`ffff e803 ffff 0000`)
        //% fixedInstance whenUsed
        export const blink = new MonoLightAnimation(hex`ffff f401 ffff 0100 0000 fd01`)
    }

    enum PwmReg {
        CurrIteration = 0x80,
        MaxIterations = 0x81,
        Steps = 0x82,
        MaxSteps = 0x180,
    }

    //% fixedInstances
    export class MonoLightClient extends Client {
        constructor(requiredDevice: string = null) {
            super("pwml", jd_class.PWM_LIGHT, requiredDevice);
        }

        // set to negative for infinity
        setIterations(numIters: number): void {
            numIters |= 0
            if (numIters < 0 || numIters >= 0xffff) numIters = 0xffffffff
            else if (numIters) numIters--
            this.setRegInt(PwmReg.MaxIterations, numIters)
        }

        setBrightness(brightness: number): void {
            this.setRegInt(REG_INTENSITY, brightness << 8)
        }

        showAnimation(animation: MonoLightAnimation, speed = 100) {
            const anim = animation.buffer.slice()
            if (speed != 100) {
                for (let i = 0; i < anim.length; i += 4) {
                    const curr = anim.getNumber(NumberFormat.UInt16LE, i + 2)
                    let adj = Math.idiv(curr * 100, speed)
                    if (curr != 0 && adj == 0) adj = 1
                    anim.setNumber(NumberFormat.UInt16LE, i + 2, adj)
                }
            }
            this.setRegBuffer(PwmReg.Steps, anim)
        }
    }

    //% fixedInstance whenUsed
    export const monoLightClient = new MonoLightClient();
}