// Should we move this file to the app?
export { };
declare global {
    interface Array<T> {
        findLast(callbackFunc: (value: T, index: number, array: T[]) => boolean): T; // , thisArg?: any
        findLastIndex(callbackFunc: (value: T, index: number, array: T[]) => boolean): number; // , thisArg?: any
        sum(): number;
        distinct(): Array<T>;
    }
}



Array.prototype.findLast = function (func: Function): any {
    const len = this.length;
    for (let i = len - 1; i >= 0; i--) {
        if (func(this[i])) {
            return this[i];
        }
    }
    return null;
};

Array.prototype.findLastIndex = function (func: Function): number {
    const len = this.length;
    for (let i = len - 1; i >= 0; i--) {
        if (func(this[i])) {
            return i;
        }
    }
    return -1;
};

Array.prototype.sum = function (): number {
    const len = this.length;
    let total = 0;
    for (let i = len - 1; i >= 0; i--) {
        total += this[i];
    }
    return total;
};

Array.prototype.distinct = function (): Array<any> {
    const len = this.length;
    const existing = [];
    for (let i = 0;  i < len; i++) {
        if (existing.indexOf(this[i]) < 0) {
            existing.push(this[i]);
        }
    }
    return existing;
};
