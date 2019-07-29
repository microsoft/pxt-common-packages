namespace texteffects {
    export enum TextEffectKind {
        //% block=none
        None,
        //% block=shake
        Shake,
        //% block=wave
        Wave
    }

    export function getTextEffect(e: TextEffectKind) {
        switch (e) {
            case texteffects.TextEffectKind.Wave:
                return texteffects.wave;
            case texteffects.TextEffectKind.Shake:
                return texteffects.shake;
            default:
                return null;
        }
    }
 
    //% fixedInstances
    export class TextEffect {
        public getState: (index?: number, state?: TextEffectState) => TextEffectState;
    
        constructor(getState: (index?: number, state?: TextEffectState) => TextEffectState) {
            this.getState = getState;
        }
    }

    //% fixedInstance
    export const shake = new TextEffect(() => { 
        return { xOffset: (Math.random() * 2 - 1),
                 yOffset: (Math.random() * 2 - 1) }
    });


    interface WaveEffectState extends TextEffectState {
        up: boolean;
    }

    //% fixedInstance
    export const wave = new TextEffect((index?: number, state?: WaveEffectState) => {  // TODO cast state type
        if (!state) {
            state = {
                xOffset: 0,
                yOffset: Math.sin(index) * 2,
                up: Math.sign(Math.sin(index)) < 0
            };
        }

        state.yOffset += (state.up ? 1 : -1) * 0.5;
        state.up = Math.abs(state.yOffset) > 2 ? !state.up : state.up;

        return state
    });

    /**
     * A text sprite on the screen
     **/
    export class TextSprite {
        _str: string
        _font: image.Font
        _color: number;
        _effect: TextEffect
        _state: TextEffectState[]; // per-character state initialized and used by the effect

        get color(): number {
            return this._color;
        }

        get state(): TextEffectState[] {
            return this._state;
        }

        constructor(str: string, font: image.Font, color: number, effect?: TextEffect) {
            this._str = str;
            this._font = font;
            this._color = color;
            this._effect = effect;
            this._state = [];
        }

        updateState() {
            if (!this._effect) return;
    
            let i = 0;
            while (i < this._str.length) {
                this._state[i] = this._effect.getState(i, (i < this._state.length ? this._state[i] : null));
                i++;
            }
        }

        draw(image: Image, x: number, y: number, start?: number, length?: number): void {
            this.updateState();

            let s = this._str.substr(Math.max(start, 0), Math.min(length, this._str.length - start));
            image.print(s, x, y, this._color, this._font, this._state);
        }
    }
}