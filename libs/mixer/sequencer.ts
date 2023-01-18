namespace music.sequencer {
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
}