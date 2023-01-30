namespace mp {
    /**
     * A type of state to get for a player
     */
    //% shim=KIND_GET
    //% blockId=mp_multiplayerstate
    //% block="$kind"
    //% kindNamespace=MultiplayerState
    //% kindMemberName=value
    //% kindPromptHint="e.g. Cooldown, Speed, Attack..."
    //% blockHidden
    //% help=multiplayer/multiplayer-state
    export function _multiplayerState(kind: number): number {
        return kind;
    }
}
