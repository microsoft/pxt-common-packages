namespace pxsim.music {
    export function playInstructions(b: RefBuffer) {
        return AudioContextManager.playInstructionsAsync(b.data)
    }

    export function queuePlayInstructions(when: number, b: RefBuffer) {
        AudioContextManager.queuePlayInstructions(when, b)
    }

    export function stopPlaying() {
        AudioContextManager.muteAllChannels()

        if (sequencers) {
            for (const seq of sequencers) {
                seq.sequencer.stop();
                seq.sequencer.dispose();
            }
        }
    }

    export function forceOutput(mode: number) { }

    export const SEQUENCER_STOP_MESSAGE = 3243;
    export const SEQUENCER_TICK_MESSAGE = 3244;
    export const SEQUENCER_STATE_CHANGE_MESSAGE = 3245;
    export const SEQUENCER_LOOPED_MESSAGE = 3246;

    interface SequencerWithId {
        id: number;
        sequencer: Sequencer;
    }

    let sequencers: SequencerWithId[];
    let nextSequencerId = 0;

    export async function _createSequencer(): Promise<number> {
        if (!sequencers) {
            pxsim.AudioContextManager.onStopAll(() => {
                for (const seq of sequencers) {
                    seq.sequencer.stop();
                    seq.sequencer.dispose();
                }
                sequencers = [];
            })

            sequencers = [];
        }
        const res = {
            id: nextSequencerId++,
            sequencer: new Sequencer()
        };

        sequencers.push(res)

        await res.sequencer.initAsync();
        res.sequencer.addEventListener("stop", () => {
            board().bus.queue(SEQUENCER_STOP_MESSAGE, res.id);
        });
        res.sequencer.addEventListener("state-change", () => {
            board().bus.queue(SEQUENCER_STATE_CHANGE_MESSAGE, res.id);
        });
        res.sequencer.addEventListener("looped", () => {
            board().bus.queue(SEQUENCER_LOOPED_MESSAGE, res.id);
        });
        res.sequencer.addEventListener("tick", () => {
            board().bus.queue(SEQUENCER_TICK_MESSAGE, res.id);
        });


        return res.id;
    }

    export function _sequencerState(id: number): string {
        return lookupSequencer(id)?.state();
    }

    export function _sequencerCurrentTick(id: number): number {
        return lookupSequencer(id)?.currentTick();
    }

    export function _sequencerPlaySong(id: number, song: RefBuffer, loop: boolean): void {
        const decoded = decodeSong(song.data);
        lookupSequencer(id)?.start(decoded, loop);
    }

    export function _sequencerStop(id: number): void {
        lookupSequencer(id)?.stop();
    }

    export function _sequencerSetVolume(id: number, volume: number): void {
        lookupSequencer(id)?.setVolume(volume);
    }

    export function _sequencerSetVolumeForAll(volume: number): void {
        for (const seq of sequencers) {
            seq.sequencer.setVolume(volume);
        }
    }

    export function _sequencerSetTrackVolume(id: number, trackIndex: number, volume: number): void {
        lookupSequencer(id)?.setTrackVolume(trackIndex, volume);
    }

    export function _sequencerSetDrumTrackVolume(id: number, trackIndex: number, drumIndex: number, volume: number): void {
        lookupSequencer(id)?.setDrumTrackVolume(trackIndex, drumIndex, volume);
    }

    export function _sequencerDispose(id: number) {
        lookupSequencer(id)?.dispose();
        sequencers = sequencers.filter(s => s.id !== id);
    }

    function lookupSequencer(id: number) {
        for (const seq of sequencers) if (seq.id === id) return seq.sequencer;
        return undefined;
    }
}