// Auto-generated. Do not edit.
namespace pxsim.storage {
    export function init() {
        // do nothing
    }

    export function appendBuffer(filename: string, data: RefBuffer): void {
        BufferMethods.typeCheck(data);
        const state = storageState();
        let buf = state.files[filename];
        if (!buf) buf = state.files[filename] = [];
        for (let i = 0; i < data.data.length; ++i)
            buf.push(data.data[i]);
    }

    export function overwriteWithBuffer(filename: string, data: RefBuffer): void {
        BufferMethods.typeCheck(data);
        const state = storageState();
        const buf = [];
        for (let i = 0; i < data.data.length; ++i)
            buf.push(data.data[i]);
        state.files[filename] = buf;
    }

    export function exists(filename: string): boolean {
        const state = storageState();
        return !!state.files[filename];
    }

    export function remove(filename: string): void {
        const state = storageState();
        delete state.files[filename];
    }

    export function size(filename: string): number {
        const state = storageState();
        const buf = state.files[filename];
        return buf ? buf.length : 0;
    }

    export function readAsBuffer(filename: string): RefBuffer {
        const state = storageState();
        const buf = state.files[filename];
        return buf ? new RefBuffer(Uint8Array.from(buf)) : undefined;
    }
}
