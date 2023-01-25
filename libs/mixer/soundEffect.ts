enum WaveShape {
    //% block="sine"
    Sine = 0,
    //% block="sawtooth"
    Sawtooth = 1,
    //% block="triangle"
    Triangle = 2,
    //% block="square"
    Square = 3,
    //% block="noise"
    Noise = 4
}

enum InterpolationCurve {
    //% block="linear"
    Linear,
    //% block="curve"
    Curve,
    //% block="logarithmic"
    Logarithmic
}

enum SoundExpressionEffect {
    //% block="none"
    None = 0,
    //% block="vibrato"
    Vibrato = 1,
    //% block="tremolo"
    Tremolo = 2,
    //% block="warble"
    Warble = 3
}

enum SoundExpressionPlayMode {
    //% block="until done"
    UntilDone,
    //% block="in background"
    InBackground
}

namespace music {
    export class SoundEffect extends Playable {
        waveShape: WaveShape;
        startFrequency: number;
        endFrequency: number;
        startVolume: number;
        endVolume: number;
        duration: number;
        effect: SoundExpressionEffect;
        interpolation: InterpolationCurve;

        constructor() {
            super();
            this.waveShape = WaveShape.Sine;
            this.startFrequency = 5000;
            this.endFrequency = 1;
            this.startVolume = 255;
            this.endVolume = 0;
            this.duration = 1000;
            this.effect = SoundExpressionEffect.None;
            this.interpolation = InterpolationCurve.Linear;
        }

        toBuffer(volume?: number) {
            if (volume === undefined) volume = music.volume();

            return soundToInstructionBuffer(
                this.waveShape,
                this.startFrequency,
                this.endFrequency,
                this.startVolume,
                this.endVolume,
                this.duration,
                this.effect,
                this.interpolation,
                20,
                1,
                volume
            );
        }

        play(playbackMode: PlaybackMode) {
            const toPlay = this.toBuffer(music.volume());
            if (playbackMode === PlaybackMode.InBackground) {
                queuePlayInstructions(0, toPlay);
            }
            else if (playbackMode === PlaybackMode.UntilDone) {
                queuePlayInstructions(0, toPlay);
                pause(this.duration)
            }
            else {
                this.loop();
            }
        }
    }


    /**
     * Play a SoundEffect.
     * @param sound the SoundEffect to play
     * @param mode the play mode, play until done or in the background
     */
    //% blockId=soundExpression_playSoundEffect
    //% block="play sound $sound $mode"
    //% weight=30
    //% help=music/play-sound-effect
    //% blockGap=8
    //% group="Sounds"
    //% deprecated=1
    export function playSoundEffect(sound: SoundEffect, mode: SoundExpressionPlayMode) {
        const toPlay = sound.toBuffer(music.volume());

        queuePlayInstructions(0, toPlay);
        if (mode === SoundExpressionPlayMode.UntilDone) {
            pause(sound.duration);
        }
    }

    /**
     * Create a sound expression from a set of sound effect parameters.
     * @param waveShape waveform of the sound effect
     * @param startFrequency starting frequency for the sound effect waveform
     * @param endFrequency ending frequency for the sound effect waveform
     * @param startVolume starting volume of the sound, or starting amplitude
     * @param endVolume ending volume of the sound, or ending amplitude
     * @param duration the amount of time in milliseconds (ms) that sound will play for
     * @param effect the effect to apply to the waveform or volume
     * @param interpolation interpolation method for frequency scaling
     */
    //% blockId=soundExpression_createSoundEffect
    //% help=music/create-sound-effect
    //% block="$waveShape|| start frequency $startFrequency end frequency $endFrequency duration $duration start volume $startVolume end volume $endVolume effect $effect interpolation $interpolation"
    //% waveShape.defl=WaveShape.Sine
    //% waveShape.fieldEditor=soundeffect
    //% waveShape.fieldOptions.useMixerSynthesizer=true
    //% startFrequency.defl=5000
    //% startFrequency.min=0
    //% startFrequency.max=5000
    //% endFrequency.defl=0
    //% endFrequency.min=0
    //% endFrequency.max=5000
    //% startVolume.defl=255
    //% startVolume.min=0
    //% startVolume.max=255
    //% endVolume.defl=0
    //% endVolume.min=0
    //% endVolume.max=255
    //% duration.defl=500
    //% duration.min=1
    //% duration.max=9999
    //% effect.defl=SoundExpressionEffect.None
    //% interpolation.defl=InterpolationCurve.Linear
    //% compileHiddenArguments=true
    //% inlineInputMode="variable"
    //% inlineInputModeLimit=3
    //% expandableArgumentBreaks="3,5"
    //% toolboxParent=music_playable_play
    //% toolboxParentArgument=toPlay
    //% weight=20
    //% group="Sounds"
    //% duplicateShadowOnDrag
    export function createSoundEffect(waveShape: WaveShape, startFrequency: number, endFrequency: number, startVolume: number, endVolume: number, duration: number, effect: SoundExpressionEffect, interpolation: InterpolationCurve): SoundEffect {
        const result = new SoundEffect();

        result.waveShape = waveShape;
        result.startFrequency = startFrequency;
        result.endFrequency = endFrequency;
        result.startVolume = startVolume;
        result.endVolume = endVolume;
        result.duration = duration;
        result.effect = effect;
        result.interpolation = interpolation;

        return result;
    }

    interface Step {
        frequency: number;
        volume: number;
    }

     export function soundToInstructionBuffer(waveShape: WaveShape, startFrequency: number, endFrequency: number, startVolume: number, endVolume: number, duration: number, effect: SoundExpressionEffect, interpolation: InterpolationCurve, fxSteps: number, fxRange: number, globalVolume: number) {
        const steps: Step[] = [];

        // Optimize the simple case
        if (interpolation === InterpolationCurve.Linear && effect === SoundExpressionEffect.None) {
            steps.push({
                frequency: startFrequency,
                volume: (startVolume / 255) * globalVolume,
            })
            steps.push({
                frequency: endFrequency,
                volume: (endVolume / 255) * globalVolume,
            })
        }
        else {

            fxSteps = Math.min(fxSteps, Math.floor(duration / 5))

            const getVolumeAt = (t: number) => ((startVolume + t * (endVolume - startVolume) / duration) / 255) * globalVolume;
            let getFrequencyAt: (t: number) => number;

            switch (interpolation) {
                case InterpolationCurve.Linear:
                    getFrequencyAt = t => startFrequency + t * (endFrequency - startFrequency) / duration;
                    break;
                case InterpolationCurve.Curve:
                    getFrequencyAt = t => startFrequency + (endFrequency - startFrequency) * Math.sin(t / duration * (Math.PI / 2));
                    break;
                case InterpolationCurve.Logarithmic:
                    getFrequencyAt = t => startFrequency + (Math.log(1 + 9 * (t / duration)) / Math.log(10)) * (endFrequency - startFrequency)
                    break;
            }

            const timeSlice = duration / fxSteps;

            for (let i = 0; i < fxSteps; i++) {
                const newStep = {
                    frequency: getFrequencyAt(i * timeSlice),
                    volume: getVolumeAt(i * timeSlice)
                };

                if (effect === SoundExpressionEffect.Tremolo) {
                    if (i % 2 === 0) {
                        newStep.volume = Math.max(newStep.volume - fxRange * 500, 0)
                    }
                    else {
                        newStep.volume = Math.min(newStep.volume + fxRange * 500, 1023)
                    }
                }
                else if (effect === SoundExpressionEffect.Vibrato) {
                    if (i % 2 === 0) {
                        newStep.frequency = Math.max(newStep.frequency - fxRange * 100, 0)
                    }
                    else {
                        newStep.frequency = newStep.frequency + fxRange * 100
                    }
                }
                else if (effect === SoundExpressionEffect.Warble) {
                    if (i % 2 === 0) {
                        newStep.frequency = Math.max(newStep.frequency - fxRange * 1000, 0)
                    }
                    else {
                        newStep.frequency = newStep.frequency + fxRange * 1000
                    }
                }

                steps.push(newStep)
            }
        }

        const out = control.createBuffer(12 * (steps.length - 1));
        const stepDuration = Math.floor(duration / (steps.length - 1))

        for (let i = 0; i < steps.length - 1; i++) {
            const offset = i * 12;
            out.setNumber(NumberFormat.UInt8LE, offset, waveToValue(waveShape));
            out.setNumber(NumberFormat.UInt16LE, offset + 2, steps[i].frequency);
            out.setNumber(NumberFormat.UInt16LE, offset + 4, stepDuration);
            out.setNumber(NumberFormat.UInt16LE, offset + 6, steps[i].volume);
            out.setNumber(NumberFormat.UInt16LE, offset + 8, steps[i + 1].volume);
            out.setNumber(NumberFormat.UInt16LE, offset + 10, steps[i + 1].frequency);
        }

        return out;
    }

    function waveToValue(wave: WaveShape) {
        switch (wave) {
            case WaveShape.Square: return 15;
            case WaveShape.Sine: return 3;
            case WaveShape.Triangle: return 1;
            case WaveShape.Noise: return 18;
            case WaveShape.Sawtooth: return 2;
        }
    }


    /**
     * Generate a random similar sound effect to the given one.
     *
     * @param sound the sound effect
     */
    //% blockId=soundExpression_generateSimilarSound
    //% block="randomize $sound"
    //% sound.shadow=soundExpression_createSoundEffect
    //% weight=0 help=music/generate-similar-sound
    //% blockGap=8
    //% group="Sounds"
    export function randomizeSound(sound: SoundEffect) {
        const res = new SoundEffect();
        res.waveShape = sound.waveShape;
        res.startFrequency = sound.startFrequency;
        res.endFrequency = sound.endFrequency;
        res.startVolume = sound.startVolume;
        res.endVolume = sound.endVolume;
        res.duration = sound.duration;
        res.effect = sound.effect;
        res.interpolation = randomInterpolation();

        res.duration = Math.clamp(
            Math.min(100, res.duration),
            Math.max(2000, res.duration),
            res.duration + (Math.random() - 0.5) * res.duration,
        );

        if (res.waveShape === WaveShape.Noise) {
            // The primary waveforms don't produce sounds that are similar to noise,
            // but adding an effect sorta does
            if (Math.percentChance(20)) {
                res.waveShape = randomWave();
                res.effect = randomEffect();
            }
        }
        else {
            res.waveShape = randomWave();

            // Adding an effect can drastically alter the sound, so keep it
            // at a low percent chance unless there already is one
            if (res.effect !== SoundExpressionEffect.None || Math.percentChance(10)) {
                res.effect = randomEffect();
            }
        }

        // Instead of randomly changing the frequency, change the slope and choose
        // a new start frequency. This keeps a similar profile to the sound
        const oldFrequencyDifference = res.endFrequency - res.startFrequency;
        let newFrequencyDifference = oldFrequencyDifference + (oldFrequencyDifference * 2) * (Math.random() - 0.5);

        if (Math.sign(oldFrequencyDifference) !== Math.sign(newFrequencyDifference)) {
            newFrequencyDifference *= -1;
        }

        newFrequencyDifference = Math.clamp(-5000, 5000, newFrequencyDifference);

        res.startFrequency = Math.clamp(
            Math.max(-newFrequencyDifference, 1),
            Math.clamp(1, 5000, 5000 - newFrequencyDifference),
            Math.random() * 5000,
        );

        res.endFrequency = Math.clamp(1, 5000, res.startFrequency + newFrequencyDifference);

        // Same strategy for volume
        const oldVolumeDifference = res.endVolume - res.startVolume;
        let newVolumeDifference = oldVolumeDifference + oldVolumeDifference * (Math.random() - 0.5);

        newVolumeDifference = Math.clamp(-255, 255, newVolumeDifference);

        if (Math.sign(oldVolumeDifference) !== Math.sign(newVolumeDifference)) {
            newVolumeDifference *= -1;
        }

        res.startVolume = Math.clamp(
            Math.max(-newVolumeDifference, 0),
            Math.clamp(0, 255, 255 - newVolumeDifference),
            Math.random() * 255,
        );

        res.endVolume = Math.clamp(0, 255, res.startVolume + newVolumeDifference);

        return res;
    }

    function randomWave() {
        switch (Math.randomRange(0, 3)) {
            case 1: return WaveShape.Sawtooth;
            case 2: return WaveShape.Square;
            case 3: return WaveShape.Triangle;
            case 0:
            default:
                return WaveShape.Sine;
        }
    }

    function randomEffect() {
        switch (Math.randomRange(0, 2)) {
            case 1: return SoundExpressionEffect.Warble;
            case 2: return  SoundExpressionEffect.Tremolo;
            case 0:
            default:
                return SoundExpressionEffect.Vibrato;
        }
    }

    function randomInterpolation() {
        switch (Math.randomRange(0, 2)) {
            case 1: return InterpolationCurve.Linear;
            case 2: return  InterpolationCurve.Curve;
            case 0:
            default:
                return InterpolationCurve.Logarithmic;
        }
    }

    //% shim=music::queuePlayInstructions
    function queuePlayInstructions(timeDelta: number, buf: Buffer) { }
}