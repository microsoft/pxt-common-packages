namespace pxsim.keyboard {
    const events = [
        "press",
        "up",
        "down"
    ]

    export function __flush() {
        console.log(`kb: flush`)
    }

    export function __type(s: string) {
        console.log(`kb: type ${s}`);
    }

    export function __key(c: string, event: number) {
        console.log(`kb: key ${c} ${events[event]}`);
    }

    export function __mediaKey(key: number, event: number): void {
        console.log(`kb: media ${key} ${events[event]}`);
    }

    export function __functionKey(key: number, event: number): void {
        console.log(`kb: function ${key} ${events[event]}`);
    }

    export function __modifierKey(key: number, event: number): void {
        console.log(`kb: modifier ${key} ${events[event]}`);
    }
}