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
export function execCallback(callback) {
    if (typeof callback == "function") {
        callback();
    }
}
export function getCopy<CopyObj>(obj: CopyObj): CopyObj{
    let copyObj = <CopyObj>{};
    for (let attr in obj) {
        copyObj[attr] = obj[attr];
    }
    return copyObj;
}
export function joinObj(opt1, opt2) {
    for (let attr in opt1) {
        if (opt2[attr] != undefined) {
            opt1[attr] = opt2[attr];
        }
    }
    return opt1;
}
export function mixedObj(opt1, opt2) {
    for (let attr in opt2) {
        opt1[attr] = opt2[attr];
    }
    return opt1;
}
interface IEvtFunc{
    (evt: Event): any
}
export function elmsArrayInitEvt(elms: HTMLElement[] | NodeList, evtname: string, callfunc: IEvtFunc) {
    let len = elms.length;
    for (let i = 0; i < len; i ++) {
        elms[i].addEventListener(evtname, callfunc);
    }
}