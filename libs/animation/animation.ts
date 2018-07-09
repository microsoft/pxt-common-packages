namespace animation {

    export enum Style {
        Walking,
        Idle,
        Jumping
    }

    //% fixedInstances
    export class Animation {

        frames: Image[];
        index: number;
        interval: number;
        kind: Style;
        timer: number;
            
        constructor(kind: Style, interval: number) {
            this.interval = interval;
            this.timer = interval;
            this.index = -1;
            this.kind = kind;
        }
    
        update(dt: number) {
            this.timer -= dt;
            if (this.timer <= 0 && this.index >= 0) {
                this.index = (this.index + 1) % this.frames.length;
                this.timer = this.interval;
            }
        }
        
        getImage() {
            return this.frames[this.index];
        }
        
        getStyle() {
            return this.kind;
        }

        getInterval() {
            return this.interval;
        }

        setInterval(interval: number) {
            this.interval = interval;
        }

        addFrame(frame: Image) {
            this.frames[++this.index] = frame;
        }

    }

    export function createAnimation(kind: Style, interval: number) {
        const f = new Animation(interval, kind);
        let lastTime = control.millis();
        game.onUpdate(function () {
            let currentTime = control.millis();
            f.update(currentTime - lastTime);
            lastTime = currentTime;
        })
        return f;
    }

    export function attachAnimation(s: Sprite, set: Animation) {
        game.onUpdate(function () {
            /*
            if (s.style === set.kind) {
                s.setImage(set.getImage())
            }
            */
        })
    }

    export function setStyle(s: Sprite, kind: Style) {
            //s.style = kind;
    }    
  
}