namespace pxsim {
    export class LCDState {
        lines = 0;
        columns = 0;
        cursor: [number, number];
        text: string[] = ["                ", "                "];
        backLightColor: string = "#6e7d6e";
        
        public sensorUsed: boolean = false;

        constructor(lines = 2, columns = 16) {
            this.lines = lines;
            this.columns = columns;
            this.cursor = [0, 0];
        }

        public setUsed() {
            if (!this.sensorUsed) {
                this.sensorUsed = true;
                runtime.queueDisplayUpdate();
            }
        }
    }

    export interface LCDBoard extends CommonBoard {
        lcdState: LCDState;
    }

    export function lcdState(): LCDState {
        return (board() as LCDBoard).lcdState;
    }
}

namespace pxsim.lcd {
    export function __showString(s: string) {
        let b = lcdState();
        if (!b) return;

        b.setUsed();
        if (b.cursor[0] >= b.lines || b.cursor[0] < 0)
            return;
            
        if (b.cursor[1] >= b.columns || b.cursor[1] < 0)
            return;
        b.text[b.cursor[0]] = b.text[b.cursor[0]].substring(0, b.cursor[1]) + s + b.text[b.cursor[0]].substring(b.cursor[1] + s.length, b.columns);
        b.cursor[1] += s.length;
        runtime.queueDisplayUpdate()
    }
}
