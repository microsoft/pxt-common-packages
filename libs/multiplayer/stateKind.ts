namespace MultiplayerState {
    let nextKind: number;

    export function create() {
        if (nextKind === undefined) nextKind = 0;
        return nextKind++;
    }

    //% isKind
    export const score = create();

    //% isKind
    export const life = create();
}
