namespace jacdac {

    function cmdCode(cmd: string) {
        switch (cmd) {
            case "set": return 0xD0
            case "fade": return 0xD1
            case "fadehsv": return 0xD2
            case "rotfwd": return 0xD3
            case "rotback": return 0xD4
            case "wait": return 0xD5
            default: return undefined
        }
    }

    function isWhiteSpace(code: number) {
        return code == 32 || code == 13 || code == 10 || code == 9
    }

    function lightEncode(format: string, args: (number | number[])[]) {
        // tokens are white-space separated
        // % - number from args[]
        // # - color from args[]
        // #0123ff - color
        // 123 - number
        // commands: set, fade, fadehsv, rotfwd, rotback, pause
        // fadehsv 0 12 #00ffff #ffffff

        const outarr: number[] = []
        let colors: number[] = []

        function pushNumber(n: number) {
            if (n == null || (n | 0) != n || n < 0 || n >= 16383)
                throw "light: number out of range: " + n
            if (n < 128)
                outarr.push(n)
            else {
                outarr.push(0x80 | (n >> 8))
                outarr.push(n & 0xff)
            }
        }

        function flush() {
            if (colors.length == 0)
                return
            if (colors.length <= 3)
                outarr.push(0xC0 | colors.length)
            else {
                outarr.push(0xC0)
                outarr.push(colors.length)
            }
            for (let c of colors) {
                outarr.push((c >> 16) & 0xff)
                outarr.push((c >> 8) & 0xff)
                outarr.push((c >> 0) & 0xff)
            }
            colors = []
        }

        let pos = 0
        let currcmd = 0
        while (pos < format.length) {
            while (isWhiteSpace(format.charCodeAt(pos)))
                pos++;
            const beg = pos
            while (pos < format.length && !isWhiteSpace(format.charCodeAt(pos)))
                pos++
            const token = format.slice(beg, pos)
            const t0 = token.charCodeAt(0)
            if (97 <= t0 && t0 <= 122) { // a-z
                currcmd = cmdCode(token)
                if (currcmd == undefined)
                    throw "Unknown light command: " + token
                flush()
                outarr.push(currcmd)
            } else if (48 <= t0 && t0 <= 57) { // 0-9
                pushNumber(parseInt(token))
            } else if (t0 == 37) { // %
                if (args.length == 0) throw "Out of args, %"
                const v = args.shift()
                if (typeof v != "number")
                    throw "Expecting number"
                pushNumber(v)
            } else if (t0 == 35) { // #
                if (token.length == 1) {
                    if (args.length == 0) throw "Out of args, #"
                    const v = args.shift()
                    if (typeof v == "number")
                        colors.push(v)
                    else
                        for (let vv of v) colors.push(vv)
                } else {
                    if (token.length == 7) {
                        const b = Buffer.fromHex("00" + token.slice(1))
                        colors.push(b.getNumber(NumberFormat.UInt32BE, 0))
                    } else {
                        throw "Invalid color: " + token
                    }
                }
            }
        }
        flush()

        return Buffer.fromArray(outarr)
    }

    //% fixedInstances
    export class LightClient extends Client {
        constructor(requiredDevice: string = null) {
            super("light", jd_class.LIGHT, requiredDevice);
        }

        _length = 10

        setStrip(numpixels: number, type = 0, maxpower = 500): void {
            this._length = numpixels
            this.setRegInt(JDLightReg.NumPixels, numpixels)
            this.setRegInt(JDLightReg.LightType, type)
            this.setRegInt(REG_MAX_POWER, maxpower)
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 20
         */
        //% blockId="jdlight_set_brightness" block="set %strip brightness %brightness"
        //% brightness.min=0 brightness.max=255
        //% weight=2 blockGap=8
        //% group="Light"
        setBrightness(brightness: number): void {
            this.setRegInt(REG_INTENSITY, brightness)
        }

        runProgram(prog: Buffer) {
            this.sendCommand(JDPacket.from(JDLightCommand.Run, prog), true)
        }

        runEncoded(prog: string, args?: number[]) {
            if (!args) args = []
            this.config.send(JDPacket.from(JDLightCommand.Run, lightEncode(prog, args)))
        }

        /**
         * Set all of the pixels on the strip to one RGB color.
         * @param rgb RGB color of the LED
         */
        //% blockId="jdlight_set_strip_color" block="set %strip all pixels to %rgb=colorNumberPicker"
        //% weight=80 blockGap=8
        //% group="Light"
        setAll(rgb: number) {
            this.runEncoded("fade #", [rgb])
        }

        private currAnimation = 0

        /**
         * Show an animation or queue an animation in the animation queue
         * @param animation the animation to run
         * @param duration the duration to run in milliseconds, eg: 500
         */
        //% blockId=jdlight_show_animation block="show %strip animation %animation for %duration=timePicker ms"
        //% weight=90 blockGap=8
        //% group="Light"
        showAnimation(animation: LightAnimation, duration: number, color = 0) {
            const currAnim = ++this.currAnimation
            control.runInParallel(() => {
                animation.length = this._length
                animation.clear()
                let buf: Buffer = null
                let totTime = 0
                let last = false
                const frameTime = 50
                for (; ;) {
                    if (currAnim != this.currAnimation)
                        return
                    let framelen = 0
                    let frames: Buffer[] = []
                    let waitTime = 0
                    const wait = lightEncode("wait %", [frameTime])
                    for (; ;) {
                        if (!buf)
                            buf = animation.nextFrame()
                        if (!buf || !buf.length) {
                            last = true
                            animation.clear()
                            break
                        }
                        if (framelen + buf.length > 220)
                            break
                        framelen += buf.length + wait.length
                        frames.push(buf)
                        frames.push(wait)
                        buf = null
                        waitTime += frameTime
                        totTime += frameTime
                        if (waitTime > 500 || (duration > 0 && totTime >= duration))
                            break
                    }
                    if (framelen)
                        this.runProgram(Buffer.concat(frames))
                    pause(waitTime)
                    if ((duration > 0 && totTime >= duration) || (duration <= 0 && last))
                        break
                }
            })
        }
    }

    export class LightAnimation {
        length: number
        step: number
        color = 0xffffff
        constructor() { }
        clear() {
            this.step = 0
        }
        nextFrame(): Buffer {
            return null
        }
    }

    export class RainbowCycleAnimation extends LightAnimation {
        nextFrame() {
            // we want to move by half step each frame, so we generate slightly shifted fade on odd steps
            const off = Math.idiv(128, this.length) << 16
            let c0 = 0x00ffff
            let c1 = 0xffffff
            if (this.step & 1) c0 += off
            else c1 -= off
            if (this.step > (this.length << 1))
                return null
            return lightEncode("fadehsv # # rotback %", [c0, c1, this.step++ >> 1])
        }
    }

    function scale(col: number, level: number) {
        level = Math.clamp(0, 0xff, level)
        return (((col >> 16) * level) >> 8) << 16 |
            ((((col >> 8) & 0xff) * level) >> 8) << 8 |
            (((col & 0xff) * level) >> 8)
    }

    export class RunningLightsAnimation extends LightAnimation {
        constructor() {
            super()
            this.color = 0xff0000
        }

        // you need lots of pixels to see this one
        nextFrame() {
            const stops = Math.clamp(2, 70, this.length >> 4)
            const stopVals: number[] = []
            for (let i = 0; i < stops; ++i)
                stopVals.push(scale(this.color, Math.isin(this.step + Math.idiv(i * this.length, stops))))
            this.step++

            if (this.step >= 256)
                return null

            return lightEncode("fade #", [stopVals])
        }
    }

    export class CometAnimation extends LightAnimation {
        constructor() {
            super()
            this.color = 0xff00ff
        }

        nextFrame() {
            const off = (this.step * this.step) % this.length
            if (this.step++ >= 20)
                return null
            return lightEncode("fade # # rotback %", [this.color, this.color & 0x00ffff, off])
        }
    }


    export class SparkleAnimation extends LightAnimation {
        constructor() {
            super()
            this.color = 0xffffff
        }

        private lastpix = -1

        nextFrame() {
            if (this.step++ == 0)
                return lightEncode("fade #000000", [])

            if (this.step >= 50)
                return null
            const p = this.lastpix
            if (p < 0) {
                this.lastpix = Math.randomRange(0, this.length - 1)
                return lightEncode("set % #", [this.lastpix, this.color])
            } else {
                this.lastpix = -1
                return lightEncode("set % #000000", [p])
            }
        }
    }

    export class ColorWipeAnimation extends LightAnimation {
        constructor() {
            super()
            this.color = 0x0000ff
        }

        nextFrame() {
            const col = this.step < this.length ? this.color : 0
            let idx = this.step++
            if (idx >= this.length) idx -= this.length
            if (idx >= this.length)
                return null
            return lightEncode("set % #", [idx, col])
        }
    }

    export class TheaterChaseAnimation extends LightAnimation {
        constructor() {
            super()
            this.color = 0x0000ff
        }

        nextFrame() {
            if (this.step++ >= this.length)
                return null
            let idx = this.step++ % 3
            return lightEncode("set % 10000 # # #", [0,
                idx == 0 ? this.color : 0,
                idx == 1 ? this.color : 0,
                idx == 2 ? this.color : 0
            ])
        }
    }


    //% fixedInstance whenUsed block="light client"
    export const lightClient = new LightClient();
}