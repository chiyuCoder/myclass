import { getCopy } from "../../func/func";
interface QueryObj {
    [name: string]: string;
}

export class StQuery {
    readonly string: string;
    private obj = {};
    readonly firstSperator = "&";
    readonly secondSperator = "=";
    constructor(queryString: string) {
        let str = queryString.replace(/(^\?|\&$)?/g, '');
        this.string = str;
        this.makeObj();
    }
    private makeObj() {
        let obj = this.obj,
            str = this.string,
            pairs = str.split(this.firstSperator),
            pairsNum = pairs.length;
        for (let pair of pairs) {
            let couple = pair.split(this.secondSperator);
            if (couple.length == 2) {
                this.obj[couple[0]] = couple[1];
            }
        }
    }
    getObj() {
        return getCopy(this.obj);
    }
    add(queryStr: any, queryValue?: string): StQuery {
        return this.update(queryStr, queryValue);
    }
    update(queryStr: any, queryValue?: string): StQuery {
        let newQuery: StQuery;
        if (typeof queryStr == 'string') {
            newQuery = this.updateByString(<string>queryStr, queryValue);
        } else {
            if (queryStr instanceof Array) {
                newQuery = this.updateByArray(queryStr);
            } else {
                newQuery = this.updateByObj(queryStr);
            }
        }
        return newQuery;
    }
    updateByString(queryStr: string, queryValue: string): StQuery {
        let obj = this.getObj();
        obj[queryStr] = queryValue;
        return this.assemble(obj);
    }
    updateByArray(queryStr: string[][]): StQuery {
        let obj = this.getObj();
        for (let couple of queryStr) {
            obj[couple[0]] = couple[1];
        }
        return this.assemble(obj);
    }
    updateByObj(queryObj: QueryObj): StQuery {
        let obj = this.getObj();
        for (let name in queryObj) {
            obj[name] = queryObj[name];
        }
        return this.assemble(obj);
    }
    remove(param: string[] | string): StQuery {
        if (typeof param == 'string') {
            return this.removeName(<string> param);
        }
        return this.removeNames(<string[]> param);
    }
    removeName(param: string): StQuery {
        let obj = this.getObj();
        if (param in obj) {
            delete obj[param];
        }
        return this.assemble(obj);
    }
    removeNames(names: string[]): StQuery {
        let obj = this.getObj();
        names.forEach(name => {
            if (name in obj) {
                delete obj[name];
            }
        });
        return this.assemble(obj);
    }
    assemble(obj: QueryObj): StQuery {
        let queryString = "?",
            thisObj = this;
        for (let name in obj) {
            queryString += name + thisObj.secondSperator + obj[name] + thisObj.firstSperator;
        }
        return new StQuery(queryString);
    }
    public getValueByKey(key: string): string {
        let obj = this.getObj();
        let val =  obj[key];
        if (!val) {
            val = "";
        }
        return val;
    }
}