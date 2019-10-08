namespace music {
    /**
     * Get the frequency of a note.
     * @param note the note name, eg: Note.C
     */
    //% weight=1 help=music/note-frequency
    //% blockId=device_note block="%note"
    //% shim=TD_ID
    //% color="#FFFFFF" colorSecondary="#FFFFFF" colorTertiary="#D83B01"
    //% note.fieldEditor="note" note.defl="262"
    //% note.fieldOptions.decompileLiterals=true
    //% useEnumVal=1
    //% weight=10 blockGap=8
    //% group="Tone"
    export function noteFrequency(note: Note): number {
        return note;
    }
}