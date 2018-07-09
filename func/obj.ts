export function getCopy<CopyObj>(obj: CopyObj): CopyObj{
    let copyObj = <CopyObj>{};
    for (let attr in obj) {
        copyObj[attr] = obj[attr];
    }
    return copyObj;
}
export function getDeepCopy<CopyObj>(obj: CopyObj): CopyObj {
    let copyObj = <CopyObj>{};
    for (let attr in obj) {
        let val = obj[attr];
        if (typeof val == "object") {
            copyObj[attr] = getDeepCopy(val);
        } else {
            copyObj[attr] = val;
        }        
    }
    return copyObj;
}
export function joinObj(opt1, opt2) {
    opt1 = getDeepCopy(opt1);
    opt2 = getDeepCopy(opt2);
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
import {ucfirst} from "./str";
export function getProperEvtName(evtName: string) {
    if (`on${evtName}` in window) {
        return evtName;
    }
    evtName = ucfirst(evtName);
    let prefixes = ["o", "webkit", "moz", "ms"];
    for (let prefix of prefixes) {
        let fullEvtName = prefix + evtName;
        if (fullEvtName in window) {
            return fullEvtName;
        }
    }
    throw new Error(`${evtName}事件不存在`);
}

