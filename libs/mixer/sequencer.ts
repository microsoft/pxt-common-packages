namespace music.sequencer {
    const SEQUENCER_STOP_MESSAGE = 3243;
    const SEQUENCER_TICK_MESSAGE = 3244;
    const SEQUENCER_STATE_CHANGE_MESSAGE = 3245;
    const SEQUENCER_LOOPED_MESSAGE = 3246;

    export class Sequencer {
        currentTick: number;
        isPlaying: boolean;
        isLooping: boolean;
        isRunning: boolean;

        constructor(public song: Song) {
            this.currentTick = 0;
            this.isPlaying = false;
            this.isLooping = false;
        }

        start(loop: boolean) {
            this.currentTick = 0;
            this.isLooping = loop;
            this.isPlaying = true;

            if (this.isRunning) return;
            this.isRunning = true;

            control.runInParallel(() => {
                while (this.isPlaying) {
                    this.scheduleCurrentTick();

                    this.currentTick ++;

                    if (this.currentTick >= this.song.beatsPerMeasure * this.song.measures * this.song.ticksPerBeat) {
                        if (this.isLooping) this.currentTick = 0;
                        else this.isPlaying = false;
                    }

                    pause(this.tickToMs(1))
                }
                this.isRunning = false;
            })
        }

        stop() {
            this.isPlaying = false;
        }

        tickToMs(ticks: number) {
            return ((60000 / this.song.beatsPerMinute) / this.song.ticksPerBeat) * ticks;
        }

        protected scheduleCurrentTick() {
            for (const track of this.song.tracks) {
                if (track.currentNoteEvent.startTick === this.currentTick) {
                    if (track.isMelodicTrack) {
                        this.scheduleMelodicTrack(track as MelodicTrack);
                    }
                    else {
                        this.scheduleDrumTrack(track as DrumTrack);
                    }

                    track.advanceNoteEvent();
                }
            }
        }

        protected scheduleMelodicTrack(track: MelodicTrack) {
            for (let i = 0; i < track.currentNoteEvent.polyphony; i++) {
                playInstructions(
                    0,
                    renderInstrument(
                        track.instrument,
                        lookupFrequency(track.currentNoteEvent.getNote(i, track.instrument.octave)),
                        this.tickToMs(track.currentNoteEvent.endTick - track.currentNoteEvent.startTick),
                        music.volume()
                    )
                );
            }
        }

        protected scheduleDrumTrack(track: DrumTrack) {
            for (let i = 0; i < track.currentNoteEvent.polyphony; i++) {
                playInstructions(
                    0,
                    renderDrumInstrument(
                        track.drums[track.currentNoteEvent.getNote(i, undefined)],
                        music.volume()
                    )
                );
            }
        }
    }

    let activeSimSequencers: _SimulatorSequencer[];
    export function _stopAllSimSequencers() {
        if (activeSimSequencers) {
            for (const seq of activeSimSequencers) {
                seq.stop();
                seq.dispose();
            }
            activeSimSequencers = [];
        }
    }

    // Simulator only! Does nothing on hardware
    export class _SimulatorSequencer {
        protected id: number;

        constructor() {
            if (!activeSimSequencers) activeSimSequencers = [];
            activeSimSequencers.push(this);
            this.id = _createSequencer();
            this.setVolume(music.volume());
        }

        play(song: Buffer, loop: boolean) {
            this.setVolume(music.volume());
            _sequencerPlaySong(this.id, song, loop)
        }

        stop() {
            _sequencerStop(this.id);
        }

        setVolume(volume: number) {
            _sequencerSetVolume(this.id, volume);
        }

        setTrackVolume(trackIndex: number, volume: number) {
            _sequencerSetTrackVolume(this.id, trackIndex, volume)
        }

        setDrumTrackVolume(trackIndex: number, drumIndex: number, volume: number) {
            _sequencerSetDrumTrackVolume(this.id, drumIndex, trackIndex, volume)
        }

        state() {
            return _sequencerState(this.id) || "stop";
        }

        currentTick() {
            return _sequencerCurrentTick(this.id);
        }

        dispose() {
            _sequencerDispose(this.id);
        }

        onTick(handler: (tick: number) => void) {
            control.onEvent(SEQUENCER_TICK_MESSAGE, this.id, () => {
                handler(this.currentTick());
            });
        }

        onStateChange(handler: (state: string) => void) {
            control.onEvent(SEQUENCER_STATE_CHANGE_MESSAGE, this.id, () => {
                handler(this.state());
            });
        }

        onStop(handler: () => void) {
            control.onEvent(SEQUENCER_STOP_MESSAGE, this.id, () => {
                handler();
            });
        }

        onLooped(handler: () => void) {
            control.onEvent(SEQUENCER_LOOPED_MESSAGE, this.id, () => {
                handler();
            });
        }
    }

    //% promise
    //% shim=music::_createSequencer
    declare function _createSequencer(): number

    //% shim=music::_sequencerState
    declare function _sequencerState(id: number): string;

    //% shim=music::_sequencerCurrentTick
    declare function _sequencerCurrentTick(id: number): number;

    //% shim=music::_sequencerPlaySong
    declare function _sequencerPlaySong(id: number, song: Buffer, loop: boolean): void;

    //% shim=music::_sequencerStop
    declare function _sequencerStop(id: number): void;

    //% shim=music::_sequencerSetVolume
    declare function _sequencerSetVolume(id: number, volume: number): void;

    //% shim=music::_sequencerSetVolumeForAll
    declare function _sequencerSetVolumeForAll(volume: number): void;

    //% shim=music::_sequencerSetTrackVolume
    declare function _sequencerSetTrackVolume(id: number, trackIndex: number, volume: number): void;

    //% shim=music::_sequencerSetDrumTrackVolume
    declare function _sequencerSetDrumTrackVolume(id: number, trackIndex: number, drumIndex: number, volume: number): void;

    //% shim=music::_sequencerDispose
    declare function _sequencerDispose(id: number): void;
}