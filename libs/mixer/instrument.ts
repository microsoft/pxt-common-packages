namespace music.sequencer {
    const BUFFER_SIZE = 12;

    let currentSequencer: sequencer.Sequencer;

    /**
     * Byte encoding format for songs
     * FIXME: should this all be word aligned?
     *
     * song(7 + length of all tracks bytes)
     *     0 version
     *     1 beats per minute
     *     3 beats per measure
     *     4 ticks per beat
     *     5 measures
     *     6 number of tracks
     *     ...tracks
     *
     * track(6 + instrument length + note length bytes)
     *     0 id
     *     1 flags
     *     2 instruments byte length
     *     4...instrument
     *     notes byte length
     *     ...note events
     *
     * instrument(28 bytes)
     *     0 waveform
     *     1 amp attack
     *     3 amp decay
     *     5 amp sustain
     *     7 amp release
     *     9 amp amp
     *     11 pitch attack
     *     13 pitch decay
     *     15 pitch sustain
     *     17 pitch release
     *     19 pitch amp
     *     21 amp lfo freq
     *     22 amp lfo amp
     *     24 pitch lfo freq
     *     25 pitch lfo amp
     *     27 octave
     *
     * drum(5 + 7 * steps bytes)
     *     0 steps
     *     1 start freq
     *     3 start amp
     *     5...steps
     *
     * drum step(7 bytes)
     *     0 waveform
     *     1 freq
     *     3 volume
     *     5 duration
     *
     * note event(5 + 1 * polyphony bytes)
     *     0 start tick
     *     2 end tick
     *     4 polyphony
     *     5...notes(1 byte each)
     *
     * note (1 byte)
     *     lower six bits = note - (instrumentOctave - 2) * 12
     *     upper two bits are the enharmonic spelling:
     *          0 = normal
     *          1 = flat
     *          2 = sharp
     */

    export class Song extends Playable {
        tracks: Track[];

        constructor(public buf: Buffer) {
            super();
            this.tracks = [];

            let currentOffset = 7;
            for (let i = 0; i < this.numberOfTracks; i++) {
                let track: Track = new MelodicTrack(this.buf, currentOffset);

                if (!track.isMelodicTrack) {
                    track = new DrumTrack(this.buf, currentOffset)
                }

                this.tracks.push(track);
                currentOffset += track.byteLength;
            }
        }

        get version(): number {
            return this.buf[0];
        }

        set version(value: number) {
            this.buf[0] = value;
        }

        get beatsPerMinute(): number {
            return this.buf.getNumber(NumberFormat.UInt16LE, 1);
        }

        set beatsPerMinute(value: number) {
            this.buf.setNumber(NumberFormat.UInt16LE, 1, value);
        }

        get beatsPerMeasure(): number {
            return this.buf[3];
        }

        set beatsPerMeasure(value: number) {
            this.buf[3] = value;
        }

        get ticksPerBeat(): number {
            return this.buf[4];
        }

        set ticksPerBeat(value: number) {
            this.buf[4] = value;
        }

        get measures(): number {
            return this.buf[5];
        }

        set measures(value: number) {
            this.buf[5] = value;
        }

        get numberOfTracks(): number {
            return this.buf[6];
        }

        play(playbackMode: PlaybackMode) {
            if (control.deviceDalVersion() === "sim") {
                const seq = new _SimulatorSequencer();

                if (playbackMode === PlaybackMode.UntilDone) {
                    seq.play(this.buf, false);

                    pauseUntil(() => seq.state() === "stop");
                }
                else if (playbackMode === PlaybackMode.InBackground) {
                    seq.play(this.buf, false);
                }
                else {
                    seq.play(this.buf, true);
                }
            }
            else {
                if (currentSequencer) currentSequencer.stop();
                currentSequencer = new sequencer.Sequencer(this);

                if (playbackMode === PlaybackMode.UntilDone) {
                    let seq = currentSequencer;
                    currentSequencer.start(false);
                    pauseUntil(() => !seq.isRunning);
                }
                else if (playbackMode === PlaybackMode.InBackground) {
                    currentSequencer.start(false);
                }
                else {
                    currentSequencer.start(true);
                }
            }
        }
    }

    export class Envelope {
        constructor(public buf?: Buffer, public offset?: number) {
            if (!buf) this.buf = control.createBuffer(10);
            this.offset = this.offset || 0;
        }

        // The time in ms for the envelope to reach its maximum value
        get attack(): number {
            return this.getValue(0);
        }

        set attack(value: number) {
            this.setValue(0, value);
        }

        // The time in ms for the envelope to reach its sustain value after reaching its maximum value
        get decay(): number {
            return this.getValue(2);
        }

        set decay(value: number) {
            this.setValue(2, value);
        }

        // The value (0-1024) to hold at during the sustain stage
        get sustain(): number {
            return this.getValue(4);
        }

        set sustain(value: number) {
            this.setValue(4, value);
        }

        // The time in ms for the envelope to reach 0 after the gate length ends
        get release(): number {
            return this.getValue(6);
        }

        set release(value: number) {
            this.setValue(6, value);
        }

        // The maximum value that this envelope will reach
        get amplitude(): number {
            return this.getValue(8);
        }

        set amplitude(value: number) {
            this.setValue(8, value);
        }

        protected getValue(offset: number) {
            return this.buf.getNumber(NumberFormat.UInt16LE, this.offset + offset);
        }

        protected setValue(offset: number, value: number) {
            this.buf.setNumber(NumberFormat.UInt16LE, this.offset + offset, value);
        }
    }

    export class LFO {
        constructor(public buf?: Buffer, public offset?: number) {
            if (!buf) this.buf = control.createBuffer(3);
            this.offset = this.offset || 0;
        }

        get frequency(): number {
            return this.buf[this.offset];
        }

        set frequency(value: number) {
            this.buf[this.offset] = value;
        }

        get amplitude(): number {
            return this.buf.getNumber(NumberFormat.UInt16LE, this.offset + 1);
        }

        set amplitude(value: number) {
            this.buf.setNumber(NumberFormat.UInt16LE, this.offset + 1, value);
        }
    }

    export class NoteEvent {
        constructor(public buf: Buffer, public offset: number) {

        }

        get startTick(): number {
            return this.getValue(0);
        }

        set startTick(value: number) {
            this.setValue(0, value);
        }

        get endTick(): number {
            return this.getValue(2);
        }

        set endTick(value: number) {
            this.setValue(2, value);
        }

        get polyphony(): number {
            return this.buf[this.offset + 4];
        }

        set polyphony(value: number) {
            this.buf[this.offset + 4] = value;
        }

        get byteLength() {
            return this.polyphony + 5;
        }

        getNote(offset: number, octave?: number) {
            const value = this.buf[this.offset + offset + 5] & 0x3f;
            if (octave !== undefined) {
                return value + (octave - 2) * 12
            }
            return value
        }

        protected getValue(offset: number) {
            return this.buf.getNumber(NumberFormat.UInt16LE, this.offset + offset);
        }

        protected setValue(offset: number, value: number) {
            this.buf.setNumber(NumberFormat.UInt16LE, this.offset + offset, value);
        }
    }

    export class Track {
        currentNoteEvent: NoteEvent;

        constructor(public buf: Buffer, public offset: number) {
            this.currentNoteEvent = new NoteEvent(this.buf, this.noteEventStart + 2);
        }

        get isMelodicTrack(): boolean {
            return this.flags === 0;
        }

        get id(): number {
            return this.buf[this.offset];
        }

        set id(value: number) {
            this.buf[this.offset] = value;
        }

        get flags(): number {
            return this.buf[this.offset + 1];
        }

        set flags(value: number) {
            this.buf[this.offset + 1] = value;
        }

        get instrumentByteLength(): number {
            return this.getValue(this.offset + 2);
        }

        set instrumentByteLength(value: number) {
            this.setValue(this.offset + 2, value);
        }

        get noteEventStart(): number {
            return this.offset + this.instrumentByteLength + 4;
        }

        get noteEventByteLength(): number {
            return this.getValue(this.noteEventStart);
        }

        set noteEventByteLength(value: number) {
            this.setValue(this.noteEventStart, value);
        }

        get byteLength() {
            return this.noteEventByteLength + this.instrumentByteLength + 6;
        }

        advanceNoteEvent() {
            this.currentNoteEvent.offset += this.currentNoteEvent.byteLength;

            if (this.currentNoteEvent.offset >= this.offset + this.byteLength) {
                this.currentNoteEvent.offset = this.noteEventStart + 2;
            }
        }

        protected getValue(offset: number) {
            return this.buf.getNumber(NumberFormat.UInt16LE, offset);
        }

        protected setValue(offset: number, value: number) {
            this.buf.setNumber(NumberFormat.UInt16LE, offset, value);
        }
    }

    export class MelodicTrack extends Track {
        instrument: Instrument;

        constructor(buf: Buffer, offset: number) {
            super(buf, offset);
            this.instrument = new Instrument(this.buf, this.offset + 4);
        }
    }

    export class DrumTrack extends Track {
        drums: DrumInstrument[];

        constructor(buf: Buffer, offset: number) {
            super(buf, offset);
            this.drums = [];

            let currentOffset = 0;
            while (currentOffset < this.instrumentByteLength) {
                this.drums.push(new DrumInstrument(this.buf, this.offset + 4 + currentOffset));
                currentOffset += this.drums[this.drums.length - 1].byteLength;
            }
        }
    }

    export class Instrument {
        ampEnvelope: Envelope;
        pitchEnvelope: Envelope;
        ampLFO: LFO;
        pitchLFO: LFO;

        constructor(public buf?: Buffer, public offset?: number) {
            if (!buf) this.buf = control.createBuffer(27);
            this.offset = this.offset || 0;
            this.ampEnvelope = new Envelope(this.buf, this.offset + 1);
            this.pitchEnvelope = new Envelope(this.buf, this.offset + 11);
            this.ampLFO = new LFO(this.buf, this.offset + 21);
            this.pitchLFO = new LFO(this.buf, this.offset + 24)
        }

        get waveform(): number {
            return this.buf[this.offset];
        }

        set waveform(value: number) {
            this.buf[this.offset] = value;
        }

        get octave(): number {
            return this.buf[this.offset + 27]
        }

        set octave(value: number) {
            this.buf[this.offset + 27] = value;
        }
    }

    export class DrumInstrument {
        steps: DrumStep[];

        constructor(public buf: Buffer, public offset: number) {
            this.steps = [];

            for (let i = 0; i < this.numSteps; i++) {
                this.steps.push(new DrumStep(this.buf, this.offset + 5 + i * 7))
            }
        }

        get byteLength(): number {
            return 5 + this.numSteps * 7;
        }

        get numSteps(): number {
            return this.buf[this.offset];
        }

        set numSteps(value: number) {
            this.buf[this.offset] = value;
        }

        get startFrequency(): number {
            return this.getValue(1);
        }

        set startFrequency(value: number) {
            this.setValue(1, value);
        }

        get startVolume(): number {
            return this.getValue(3);
        }

        set startVolume(value: number) {
            this.setValue(3, value);
        }

        protected getValue(offset: number) {
            return this.buf.getNumber(NumberFormat.UInt16LE, this.offset + offset);
        }

        protected setValue(offset: number, value: number) {
            this.buf.setNumber(NumberFormat.UInt16LE, this.offset + offset, value);
        }
    }

    export class DrumStep {
        constructor(public buf?: Buffer, public offset?: number) {
            if (!buf) this.buf = control.createBuffer(7);
            this.offset = this.offset || 0;
        }

        get waveform(): number {
            return this.buf[this.offset];
        }

        set waveform(value: number) {
            this.buf[this.offset] = value;
        }

        get frequency(): number {
            return this.getValue(1);
        }

        set frequency(value: number) {
            this.setValue(1, value);
        }

        get volume(): number {
            return this.getValue(3);
        }

        set volume(value: number) {
            this.setValue(3, value);
        }

        get duration(): number {
            return this.getValue(5);
        }

        set duration(value: number) {
            this.setValue(5, value);
        }

        protected getValue(offset: number) {
            return this.buf.getNumber(NumberFormat.UInt16LE, this.offset + offset);
        }

        protected setValue(offset: number, value: number) {
            this.buf.setNumber(NumberFormat.UInt16LE, this.offset + offset, value);
        }
    }

    /**
     * Renders a single note played on an instrument into a buffer of sound instructions.
     *
     * @param instrument The instrument being played
     * @param noteFrequency The frequency of the note being played. In other words, "the key being pressed on the piano"
     * @param gateLength The length of time that the "piano key" is held down in ms. The total duration
     *      of the sound instructions will be longer than this if the amplitude envelope of the
     *      instrument has a nonzero release time
     * @param volume The peak volume of the note to play (0-1024). Also called the "velocity"
     */
    export function renderInstrument(instrument: Instrument, noteFrequency: number, gateLength: number, volume: number) {
        // We cut off the sound at the end of the amplitude envelope's release time. This is to prevent
        // the amp envelope from making the sound keep playing forever
        const totalDuration = gateLength + instrument.ampEnvelope.release;

        // Our goal is to calculate the frequency and amplitude at all of the inflection points in this note's lifetime

        // For the ADSR envelopes, the inflection points are:
        //     1. The end of the envelope atack (which is when the decay begins)
        //     2. The end of the envelope decay (which is when the sustain begins)
        //     3. The end of the gateLength (which is when the release begins)
        //     4. The end of the envelope release
        // If the gateLength ends before any of these stages (e.g. it's shorter than the envelope's attack), then
        // we ignore the other stages and go straight to the release stage.

        // For the triangle LFOs, the inflections points occur every time the slope goes from positive to negative. In
        // other words, it's half the period of the triangle wave.

        const ampLFOInterval = instrument.ampLFO.amplitude ? Math.max(500 / instrument.ampLFO.frequency, 50) : 50;
        const pitchLFOInterval = instrument.pitchLFO.amplitude ? Math.max(500 / instrument.pitchLFO.frequency, 50) : 50;

        // We're going to add the timepoints to this array in order so that it doesn't need to be sorted
        let timePoints = [0];

        // For each LFO and envelope, keep track of the next inflection point. If any of the LFOs or envelopes have
        // an amplitude of 0, we can ignore them entirely.
        let nextAETime = instrument.ampEnvelope.attack;
        let nextPETime = instrument.pitchEnvelope.amplitude ? instrument.pitchEnvelope.attack : totalDuration;
        let nextPLTime = instrument.pitchLFO.amplitude ? pitchLFOInterval : totalDuration;
        let nextALTime = instrument.ampLFO.amplitude ? ampLFOInterval : totalDuration;

        let time = 0;
        while (time < totalDuration) {
            // Amp envelope
            if (nextAETime <= nextPETime && nextAETime <= nextPLTime && nextAETime <= nextALTime) {
                time = nextAETime;
                timePoints.push(nextAETime);

                // Check if the end of the decay stage is next
                if (time < instrument.ampEnvelope.attack + instrument.ampEnvelope.decay && instrument.ampEnvelope.attack + instrument.ampEnvelope.decay < gateLength) {
                    nextAETime = instrument.ampEnvelope.attack + instrument.ampEnvelope.decay;
                }
                // Then check for the end of the sustain stage
                else if (time < gateLength) {
                    nextAETime = gateLength;
                }
                // Otherwise it must be the end of the release
                else {
                    nextAETime = totalDuration;
                }
            }
            // Pitch envelope
            else if (nextPETime <= nextPLTime && nextPETime <= nextALTime && nextPETime < totalDuration) {
                time = nextPETime;
                timePoints.push(nextPETime);

                // Check if the end of the decay stage is next
                if (time < instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay && instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay < gateLength) {
                    nextPETime = instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay;
                }
                // Then check for the end of the sustain stage
                else if (time < gateLength) {
                    nextPETime = gateLength;
                }
                // Otherwise it must be the end of the release
                else if (time < gateLength + instrument.pitchEnvelope.release) {
                    nextPETime = Math.min(totalDuration, gateLength + instrument.pitchEnvelope.release);
                }
                // If we reach the end of the release before the amp envelope is finished, bail out
                else {
                    nextPETime = totalDuration
                }
            }
            // Pitch LFO
            else if (nextPLTime <= nextALTime && nextPLTime < totalDuration) {
                time = nextPLTime;
                timePoints.push(nextPLTime);
                nextPLTime += pitchLFOInterval;
            }
            // Amp LFO
            else if (nextALTime < totalDuration) {
                time = nextALTime;
                timePoints.push(nextALTime);
                nextALTime += ampLFOInterval;
            }


            if (time >= totalDuration) {
                break;
            }

            // Now that we've advanced the time, we need to check all of the envelopes/LFOs again
            // to see if any of them also need to be pushed forward (e.g. they had the same inflection point
            // as the one we just added to the array)
            if (nextAETime <= time) {
                if (time < instrument.ampEnvelope.attack + instrument.ampEnvelope.decay && instrument.ampEnvelope.attack + instrument.ampEnvelope.decay < gateLength) {
                    nextAETime = instrument.ampEnvelope.attack + instrument.ampEnvelope.decay;
                }
                else if (time < gateLength) {
                    nextAETime = gateLength;
                }
                else {
                    nextAETime = totalDuration;
                }
            }
            if (nextPETime <= time) {
                if (time < instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay && instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay < gateLength) {
                    nextPETime = instrument.pitchEnvelope.attack + instrument.pitchEnvelope.decay;
                }
                else if (time < gateLength) {
                    nextPETime = gateLength;
                }
                else if (time < gateLength + instrument.pitchEnvelope.release) {
                    nextPETime = Math.min(totalDuration, gateLength + instrument.pitchEnvelope.release);
                }
                else {
                    nextPETime = totalDuration
                }
            }
            while (nextALTime <= time) {
                nextALTime += ampLFOInterval;
            }
            while (nextPLTime <= time) {
                nextPLTime += pitchLFOInterval;
            }
        }

        // Once we've calculated the inflection points, calculate the frequency and amplitude at
        // each step and interpolate between them with sound instructions
        let prevAmp = instrumentVolumeAtTime(instrument, gateLength, 0, volume) | 0;
        let prevPitch = instrumentPitchAtTime(instrument, noteFrequency, gateLength, 0) | 0;
        let prevTime = 0;

        let nextAmp: number;
        let nextPitch: number;
        const out = control.createBuffer(BUFFER_SIZE * timePoints.length);
        for (let i = 1; i < timePoints.length; i++) {
            if (timePoints[i] - prevTime < 5) {
                prevTime = timePoints[i];
                continue;
            }

            nextAmp = instrumentVolumeAtTime(instrument, gateLength, timePoints[i], volume) | 0;
            nextPitch = instrumentPitchAtTime(instrument, noteFrequency, gateLength, timePoints[i]) | 0
            addNote(
                out,
                (i - 1) * 12,
                (timePoints[i] - prevTime) | 0,
                prevAmp,
                nextAmp,
                instrument.waveform,
                prevPitch,
                255,
                nextPitch
            )

            prevAmp = nextAmp;
            prevPitch = nextPitch;
            prevTime = timePoints[i];
        }

        // Finally, add one extra step to move the amplitude to 0 without
        // clipping just in case the amp LFO caused it to be nonzero
        addNote(
            out,
            (timePoints.length - 1) * 12,
            10,
            prevAmp,
            0,
            instrument.waveform,
            prevPitch,
            255,
            prevPitch
        )
        return out;
    }

    export function renderDrumInstrument(sound: DrumInstrument, volume: number) {
        // Drum instruments are rendered just like melodic instruments, but the inflection
        // points are already calculated for us
        let prevAmp = sound.startVolume;
        let prevFreq = sound.startFrequency;

        const scaleVolume = (value: number) => (value / 1024) * volume;

        let out = control.createBuffer((sound.steps.length + 1) * BUFFER_SIZE);

        for (let i = 0; i < sound.steps.length; i++) {
            addNote(
                out,
                i * BUFFER_SIZE,
                sound.steps[i].duration,
                scaleVolume(prevAmp),
                scaleVolume(sound.steps[i].volume),
                sound.steps[i].waveform,
                prevFreq,
                255,
                sound.steps[i].frequency
            );
            prevAmp = sound.steps[i].volume;
            prevFreq = sound.steps[i].frequency
        }

        addNote(
            out,
            sound.steps.length * BUFFER_SIZE,
            10,
            scaleVolume(prevAmp),
            0,
            sound.steps[sound.steps.length - 1].waveform,
            prevFreq,
            255,
            prevFreq
        );

        return out;
    }

    function instrumentPitchAtTime(instrument: Instrument, noteFrequency: number, gateLength: number, time: number) {
        let mod = 0;
        if (instrument.pitchEnvelope.amplitude) {
            mod += envelopeValueAtTime(instrument.pitchEnvelope, time, gateLength)
        }
        if (instrument.pitchLFO.amplitude) {
            mod += lfoValueAtTime(instrument.pitchLFO, time)
        }
        return Math.max(noteFrequency + mod, 0);
    }

    function instrumentVolumeAtTime(instrument: Instrument, gateLength: number, time: number, maxVolume: number) {
        let mod = 0;
        if (instrument.ampEnvelope.amplitude) {
            mod += envelopeValueAtTime(instrument.ampEnvelope, time, gateLength)
        }
        if (instrument.ampLFO.amplitude) {
            mod += lfoValueAtTime(instrument.ampLFO, time)
        }
        return ((Math.max(Math.min(mod, instrument.ampEnvelope.amplitude), 0) / 1024) * maxVolume) | 0;
    }

    /**
     * Calculates the value of an ADSR envelope at the given time for a given gate length.
     *
     * @param envelope The ADSR envelope
     * @param time The point and time to calculate the value at
     * @param gateLength The length of time that the "piano key" is held down in ms. The total duration
     *      of the sound instructions will be longer than this if the amplitude envelope of the
     *      instrument has a nonzero release time
     */
    function envelopeValueAtTime(envelope: Envelope, time: number, gateLength: number) {
        // ADSR envelopes consist of 4 stages. They are (in order):
        //     1. The attack stage, where the value starts at 0 and rises to the maximum value
        //     2. The decay stage, where the value falls from the maximum value to the sustain value
        //     3. The sustain stage, where the value holds steady at the sustain value until the gate length ends
        //     4. The release stage, where the value falls to 0 after the gate length ends
        // If the gate length ends before the sustain stage, we immediately skip to the release stage. All stages
        // use a linear function for the value
        const adjustedSustain = (envelope.sustain / 1024) * envelope.amplitude;

        // First check to see if we are already in the release stage
        if (time > gateLength) {
            if (time - gateLength > envelope.release) return 0;

            // Did the gate length end before the attack stage finished?
            else if (time < envelope.attack) {
                const height = (envelope.amplitude / envelope.attack) * gateLength;
                return height - ((height / envelope.release) * (time - gateLength))
            }
            // Did the gate length end before the decay stage finished?
            else if (time < envelope.attack + envelope.decay) {
                const height2 = envelope.amplitude - ((envelope.amplitude - adjustedSustain) / envelope.decay) * (gateLength - envelope.attack);
                return height2 - ((height2 / envelope.release) * (time - gateLength))
            }
            else {
                return adjustedSustain - (adjustedSustain / envelope.release) * (time - gateLength)
            }
        }
        else if (time < envelope.attack) {
            return (envelope.amplitude / envelope.attack) * time
        }
        else if (time < envelope.attack + envelope.decay) {
            return envelope.amplitude - ((envelope.amplitude - adjustedSustain) / envelope.decay) * (time - envelope.attack)
        }
        else {
            return adjustedSustain;
        }
    }

    /**
     * Calculates the value of the LFO at the given time.
     *
     * TODO: might be nice to give options to shift the phase of the LFO or let it run free
     *
     * @param lfo The LFO to calculate the value of
     * @param time The time to calculate the value at
     */
    function lfoValueAtTime(lfo: LFO, time: number) {
        // Use cosine to smooth out the value somewhat
        return Math.cos(((time / 1000) * lfo.frequency) * 2 * Math.PI) * lfo.amplitude
    }

    export function _stopAllSongs() {
        if (currentSequencer) {
            currentSequencer.stop();
            currentSequencer = undefined;
        }
        _stopAllSimSequencers();
    }
}