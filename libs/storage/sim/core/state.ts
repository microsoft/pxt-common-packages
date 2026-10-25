namespace pxsim {
    export class StorageState {
        files: pxsim.Map<number[]> = {};
    }

    export interface StorageBoard extends CommonBoard {
        storageState: StorageState;
    }

    export function storageState() {
        return (board() as StorageBoard).storageState;
    }
}