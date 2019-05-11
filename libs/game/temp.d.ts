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
    function clamp(min: number, max: number, value: number): number;
    function ceil(x: number): number;
    function floor(x: number): number;
    function max(a: number, b: number): number;
    function min(a: number, b: number): number;
    function abs(x: number): number;
    function sqrt(x: number): number;
    function randomRange(min: number, max: number): number;
    function roundWithPrecision(x: number, digits: number): number;
    function idiv(x: number, y: number): number;
    function sign(x: number): number;
}

declare const img: any;