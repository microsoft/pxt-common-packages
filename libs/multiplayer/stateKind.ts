namespace MultiplayerState {
    let nextKind: number;

    export function create() {
        if (nextKind === undefined) nextKind = 0;
        return nextKind++;
    }

    //% isKind
    export const Score = create();

    //% isKind
    export const Life = create();
}
