/**
 * This file exists to make vscode not complain about typing errors. It is not
 * included in the package and is ignored by PXT
 */
declare interface Array<T> {
    [index: number]: T;
    length: number;
    push(e: T): void;
    pop(): T;
    forEach(cb: (e: T, index: number) => void): void;
    filter(cb: (e: T) => boolean): Array<T>;
    removeElement(e: T): void;
    indexOf(e: T): number;
    sort(cb: (a: T, b: T) => number): Array<T>;
    shift(): T;
    some(cb: (a: T) => boolean): boolean;
}

declare interface String {
    length: number;
    charAt(index: number): string;
    substr(start: number, length?: number): string;
}

declare namespace Math {
    function clamp(a: number, b: number, c: number): number;
    function ceil(n: number): number;
    function floor(n: number): number;
    function max(a: number, b: number): number;
    function min(a: number, b: number): number;
    function abs(a: number): number;
    function sqrt(a: number): number;
    function randomRange(a: number, b: number): number;
    function idiv(x: number, y: number): number;
    function sign(x: number): number;
}

declare const img: any;