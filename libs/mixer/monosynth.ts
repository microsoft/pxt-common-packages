namespace music.monosynth {
    const MIDI_NOTE_0_FREQ = 8.17579891564;
    const PITCH_MOD_RANGE = 24; // 2 octaves
    const MAX_LFO_FREQUENCY = 200;
    const MIN_LFO_FREQUENCY = 0.001;
    const MAX_NOTE = 127;


    export enum ComponentIndex {
        Gate = 0,
        Oscillator = 1,
        Frequency = 2,
        AmpEnvelope = 3,
        PitchEnvelope = 4,
        AmpLFO = 5,
        PitchLFO = 6,
        PitchBend = 7,
    }

    export enum OscillatorParamIndex {
        Wave = 0
    }

    export enum EnvelopeParamIndex {
        Attack = 0,
        Decay = 1,
        Sustain = 2,
        Release = 3,
        Amplitude = 4,
        Interpolation = 5
    }

    export enum LFOParamIndex {
        Frequency = 0,
        Wave = 1,
        Amplitude = 2
    }

    export enum PitchBendParamIndex {
        Value = 0,
        Range = 1
    }

    export class MonoSynthParam {
        constructor(
            public channel: number,
            public component: ComponentIndex,
            public index: number,
            public scale?: (value: number) => number
        ) {}

        set(value: number) {
            if (this.scale) value = this.scale(value);

            const message = control.createBuffer(4);
            message.setNumber(NumberFormat.UInt8LE, 0, this.component);
            message.setNumber(NumberFormat.UInt8LE, 1, this.index);
            message.setNumber(NumberFormat.Int16LE, 2, value);
            music.sendMonoSynthMessage(this.channel, message);
        }
    }

    export class MonoSynthEnvelope {
        attack: MonoSynthParam;
        decay: MonoSynthParam;
        sustain: MonoSynthParam;
        release: MonoSynthParam;
        amplitude: MonoSynthParam;
        interpolation: MonoSynthParam;

        constructor(public channel: number, public componentIndex: number) {
            this.attack = new MonoSynthParam(channel, componentIndex, EnvelopeParamIndex.Attack);
            this.decay = new MonoSynthParam(channel, componentIndex, EnvelopeParamIndex.Decay);
            this.sustain = new MonoSynthParam(channel, componentIndex, EnvelopeParamIndex.Sustain);
            this.release = new MonoSynthParam(channel, componentIndex, EnvelopeParamIndex.Release);
            this.amplitude = new MonoSynthParam(channel, componentIndex, EnvelopeParamIndex.Amplitude, scaleAmplitude);
            this.interpolation = new MonoSynthParam(channel, componentIndex, EnvelopeParamIndex.Interpolation);
        }
    }

    export class PitchBend {
        value: MonoSynthParam;
        range: MonoSynthParam;

        constructor(public channel: number, public componentIndex: number) {
            this.value = new MonoSynthParam(channel, componentIndex, PitchBendParamIndex.Value, scaleAmplitude);
            this.range = new MonoSynthParam(channel, componentIndex, PitchBendParamIndex.Range, scaleRange(0, PITCH_MOD_RANGE));
        }
    }

    export class MonoSynthLFO {
        frequency: MonoSynthParam;
        wave: MonoSynthParam;
        amplitude: MonoSynthParam;

        constructor(public channel: number, public componentIndex: number) {
            this.frequency = new MonoSynthParam(channel, componentIndex, LFOParamIndex.Frequency, scaleRange(MIN_LFO_FREQUENCY, MAX_LFO_FREQUENCY));
            this.wave = new MonoSynthParam(channel, componentIndex, LFOParamIndex.Wave);
            this.amplitude = new MonoSynthParam(channel, componentIndex, LFOParamIndex.Amplitude, scaleAmplitude);
        }
    }

    export class MonoSynth {
        ampEnvelope: MonoSynthEnvelope;
        pitchEnvelope: MonoSynthEnvelope;
        pitchBend: PitchBend;
        ampLFO: MonoSynthLFO;
        pitchLFO: MonoSynthLFO;
        waveform: MonoSynthParam;
        gate: MonoSynthParam;
        frequency: MonoSynthParam;

        constructor(
            public channel: number
        ) {
            this.ampEnvelope = new MonoSynthEnvelope(channel, ComponentIndex.AmpEnvelope);
            this.pitchEnvelope = new MonoSynthEnvelope(channel, ComponentIndex.PitchEnvelope);
            this.pitchEnvelope.amplitude.scale = scalePitchMod
            this.pitchBend = new PitchBend(channel, ComponentIndex.PitchBend);
            this.ampLFO = new MonoSynthLFO(channel, ComponentIndex.AmpLFO);
            this.pitchLFO = new MonoSynthLFO(channel, ComponentIndex.PitchLFO);
            this.pitchLFO.amplitude.scale = scalePitchMod
            this.waveform = new MonoSynthParam(channel, ComponentIndex.Oscillator, OscillatorParamIndex.Wave);
            this.gate = new MonoSynthParam(channel, ComponentIndex.Gate, 0);
            this.frequency = new MonoSynthParam(channel, ComponentIndex.Frequency, 0, scaleFrequency);
        }
    }

    function frequencyToMidiNote(frequency: number) {
        return (Math.log(frequency / MIDI_NOTE_0_FREQ) / Math.LN2) * 12
    }

    function scaleAmplitude(amplitude: number) {
        amplitude = Math.max(-1, Math.min(1, amplitude));
        return amplitude * 0x7fff | 0;
    }

    function scaleFrequency(frequency: number) {
        frequency = Math.max(0, frequency);
        return (Math.min(frequencyToMidiNote(frequency), MAX_NOTE) / MAX_NOTE) * 0x7fff | 0;
    }

    function scaleRange(min: number, max: number) {
        return (value: number) => {
            value = Math.max(min, Math.min(max, value));
            return ((value - min) / (max - min)) * 0x7fff | 0;
        }
    }

    function scalePitchMod(value: number) {
        return scaleAmplitude(value / PITCH_MOD_RANGE);
    }
}

namespace music {
    //% shim=music::sendMonoSynthMessage
    export function sendMonoSynthMessage(
        channel: number,
        message: Buffer
    ) {
    }
}