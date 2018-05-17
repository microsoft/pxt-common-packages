namespace performance {
    let enabled = false;
    export function track(name: string, value: number) {
        if (enabled) console.log(`<${name} val=${value}>`);
    }

    export function startTimer(name: string) {
        if (enabled) console.log(`<${name} start=${control.millis()}>`);
    }

    export function stopTimer(name: string) {
        if (enabled) console.log(`<${name} end=${control.millis()}>`);
    }
}