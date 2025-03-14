namespace pxsim.browserEvents {
    export function currentTime(): number {
        return Date.now();
    }

    export function getYear(time: number): number {
        return new Date(time).getFullYear();
    }

    export function getMonth(time: number): number {
        return new Date(time).getMonth();
    }

    export function getDayOfMonth(time: number): number {
        return new Date(time).getDate();
    }

    export function getDayOfWeek(time: number): number {
        return new Date(time).getDay();
    }

    export function getHours(time: number): number {
        return new Date(time).getHours();
    }

    export function getMinutes(time: number): number {
        return new Date(time).getMinutes();
    }

    export function getSeconds(time: number): number {
        return new Date(time).getSeconds();
    }
}