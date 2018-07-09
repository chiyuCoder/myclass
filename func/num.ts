export function strToInt(str:string, whenNaN:number = 0): number {
    let num = parseInt(str);
    if (isNaN(num)) {
        return whenNaN;
    }
    return num;
}
export function strToNum(str:string, whenNaN: number = 0): number {
    let num = parseFloat(str);
    if (isNaN(num)) {
        return whenNaN;
    }
    return num;
}
export function strToPreciseNum(str: string, precise: number = 2): string {
    return parseFloat(str).toFixed(precise);
}
export function rand(min: number, max: number = 0): number {
    if (min > max) {
        let tmp = max;
        max = min;
        min = tmp;
    }
    return Math.floor(Math.random() * (max - min) + min);
}