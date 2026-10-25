namespace pxsim {
    export interface MusicBoard extends CommonBoard {
        audioState: AudioState;

        getDefaultPitchPin(): Pin;
    }

    export function getAudioState() {
        return (board() as MusicBoard).audioState;
    }
}