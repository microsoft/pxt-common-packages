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
    /**
     * Play a sound effect from a sound expression string.
     * @param sound the sound expression string
     * @param mode the play mode, play until done or in the background
     */
    //% blockId=soundExpression_playSoundEffect
    //% block="play sound $sound $mode"
    //% sound.shadow=soundExpression_createSoundEffect
    //% weight=100 help=music/play-sound-effect
    //% blockGap=8
    export function playSoundEffect(sound: Buffer, mode: SoundExpressionPlayMode) {
        queuePlayInstructions(0, sound);
        if (mode === SoundExpressionPlayMode.UntilDone) {
            let totalDuration = 0;

            for (let i = 0; i < sound.length; i += 12) {
                totalDuration += sound.getNumber(NumberFormat.UInt16LE, i + 4);
            }

            pause(totalDuration);
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
    export function createSoundEffect(waveShape: WaveShape, startFrequency: number, endFrequency: number, startVolume: number, endVolume: number, duration: number, effect: SoundExpressionEffect, interpolation: InterpolationCurve): Buffer {
        return soundToInstructionBuffer(waveShape, startFrequency, endFrequency, startVolume, endVolume, duration, effect, interpolation, 20, 1);
    }

    interface Step {
        frequency: number;
        volume: number;
    }

     export function soundToInstructionBuffer(waveShape: WaveShape, startFrequency: number, endFrequency: number, startVolume: number, endVolume: number, duration: number, effect: SoundExpressionEffect, interpolation: InterpolationCurve, fxSteps: number, fxRange: number) {
        const steps: Step[] = [];

        // Optimize the simple case
        if (interpolation === InterpolationCurve.Linear && effect === SoundExpressionEffect.None) {
            steps.push({
                frequency: startFrequency,
                volume: (startVolume / 255) * 1024,
            })
            steps.push({
                frequency: endFrequency,
                volume: (endVolume / 255) * 1024,
            })
        }
        else {

            fxSteps = Math.min(fxSteps, Math.floor(duration / 5))

            const getVolumeAt = (t: number) => ((startVolume + t * (endVolume - startVolume) / duration) / 255) * 1024;
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

    //% shim=music::queuePlayInstructions
    function queuePlayInstructions(timeDelta: number, buf: Buffer) { }
}