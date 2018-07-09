import { StQuery } from "./StQuery";
import { getCopy } from "../../func/func";
import { StPromise } from "../StPromise/StPromise";
interface IBaseUrl{
    protocol: string,
    host: string,
    path: string,
    query: string,
    hash: string,
}
type localPart = "protocol" | "origin" | "host" | "query" | "path" | "hash" | "href";
declare namespace StUrl{
    export interface IDic{
        [name: string]: string
    }
}
export class StUrl {
    readonly givenUrl: string;
    readonly url: string;
    readonly reg = /^(https?:\/\/)?([\w\.]+)?(\/[^?]*)?(\?[^#]*)?(\#.*)?$/;
    readonly tpQueryKey = "s";
    readonly baseParts = ["protocol", "host", "path", "query", "hash"];
    private protocol: string;
    private host: string;
    private path: string;
    private query: string;
    private hash: string;
    private origin: string;
    private href: string;
    private isTpUrl: boolean = false;
    private isAddonUrl: boolean = false;
    private constProperties = [
        "protocol",
        "host",
        "path",
        "query",
        "hash",
        "origin",
        "href",
        "isTpUrl",
        "isAddonUrl",
    ];
    private tpUrl = {
        module: "",
        controller: "",
        action: "",
        remain: "",
    };
    private addonUrl = {
        module: "",
        controller: "",
        action: "",
    };
    private queryObj: StQuery;
    constructor(url: string = "") {
        this.givenUrl = url;
        if (!url) {
            url = location.href;
        }
        this.url = url;
        this.parseUrl();
        this.produceQuery();
        this.analyseTpUrl();
        this.analyseAddonUrl();
    }
    private produceQuery() {
        let queryString = this.query;
        this.queryObj = new StQuery(queryString);
    }
    private parseUrl() {
        let reg = this.reg,
            res = this.url.match(reg);
        this.protocol = res[1] ? res[1] : location.protocol + '//';
        this.host = res[2] ? res[2] : location.host;
        this.path = res[3] ? res[3] : location.pathname;
        this.query = res[4] ? res[4] : location.search;
        this.hash = res[5] ? res[5] : location.hash;
        this.origin = this.protocol + this.host;
        this.href = this.protocol + this.host + this.path + this.query + this.hash;
    }
    private analyseTpUrl() {
        if (this.path == "/index.php") {
            this.analyseTpUrlOnQuery();
        } else {
            this.analyseTpUrlOnPath();
        }
    }
    private analyseTpUrlOnPath() {
        let reg = /(\/index.php)?\/([\w\-]+)\/([\w\-]+)\/([\w\-]+)(\.\w+)?(\/.*)?/,
            match = this.path.match(reg);
        if (match) {
            this.isTpUrl = true;
            this.tpUrl = {
                module: match[2],
                controller: match[3],
                action: match[4],
                remain: match[6] ? match[6] : "",
            }
        }
    }
    private analyseTpUrlOnQuery() {
        let path = this.query,
            reg = /\?s=\/([\w\-]+)\/([\w\-]+)\/([\w\-]+)(\.\w+)?([^\?]*)(\?[^#]+)*/,
            match = path.match(reg);
        if (match) {
            this.isTpUrl = true;
            this.tpUrl = {
                module: match[1],
                controller: match[2],
                action: match[3],
                remain: match[5] ? match[5] : "",
            }
            if (match[6]) {
                this.queryObj = new StQuery(match[6]);
            }
        }
    }
    private jumpToBaseUrl() {
        let baseTpUrl = "";
        baseTpUrl = this.protocol + this.host 
            + `/${this.tpUrl.module}/${this.tpUrl.controller}/${this.tpUrl.action}${this.tpUrl.remain}`
            + "?" + this.queryObj.string + this.hash;
        location.href = baseTpUrl;
    }
    private analyseAddonUrl() {
        if (this.isTpUrl && (this.tpUrl.module == "addons") && (this.tpUrl.controller == "execute")) {
            let reg = /(\w+)\-(\w+)\-(\w+)/,
                matcher = this.tpUrl.action.match(reg);
            if (matcher) {
                this.isAddonUrl = true;
                this.addonUrl = {
                    module: matcher[1],
                    controller: matcher[2],
                    action: matcher[3],
                }
            }
        }
    }
    public updateTpUrl(key: string, value: string): StUrl {
        let tpUrl = getCopy(this.tpUrl);
        key = key.toLowerCase();
        if (key in tpUrl) {
            tpUrl[key] = value;
        }
        let baseTpUrl = "";
        baseTpUrl = this.protocol + this.host 
            + `/${this.tpUrl.module}/${tpUrl.controller}/${tpUrl.action}${tpUrl.remain}`
            + "?" + this.queryObj.string + this.hash;
        return new StUrl(baseTpUrl);
    }
    public updateTpModule(value: string): StUrl {
        return this.updateTpUrl("module", value);
    }
    public updateTpController(value: string): StUrl {
        return this.updateTpUrl("Controller", value);
    }
    public updateTpAction(value: string): StUrl {
        return this.updateTpUrl("Action", value);
    }
    public jqGetJSON(data?: any): StPromise {
        return new StPromise((resolve, reject) => {
            $.getJSON(this.href, data).then((reply) => {
                if (reply.code > 0) {
                    resolve(reply);
                } else {
                    reject(reply);
                }
            }).catch(err => {
                console.error(err);
                reject(err, "ajaxFailed");
            });
        });
    }
    public updateAddonUrl(key: string, value: string): StUrl {
        let addonUrl = getCopy(this.addonUrl);
        key = key.toLowerCase();
        if (key in addonUrl) {
            addonUrl[key] = value;
        }
        return this.updateTpAction(addonUrl.module + "-" + addonUrl.controller + "-" + addonUrl.action);
    }
    public updateAddonModule(value: string): StUrl {
        return this.updateAddonUrl("module", value);
    }
    public updateAddonController(value: string): StUrl {
        return this.updateAddonUrl("Controller", value);
    }
    public updateAddonAction(value: string): StUrl {
        return this.updateAddonUrl("Action", value);
    }
    public updateUrl(key: string, value: string) {
        let obj = {},
            urlObj = this,
            parts = this.baseParts;
        for (let part of parts) {
            obj[part] = urlObj[part];
        }
        if (parts.indexOf(key) < 0) {
            return this;
        } else {
            obj[key] = value;
            return this.assemble(<IBaseUrl>obj);
        }
    }
    public assemble(obj: IBaseUrl): StUrl {
        let parts = this.baseParts,
            newUrl: string = "";
        for (let part of parts) {
            newUrl += obj[part];
        }
        return new StUrl(newUrl);
    }
    public jump(delay: number = 200) {
        let url = this;
        setTimeout(function () {
            location.href = url.href;
        }, delay);
    }
    public getPart(partName: localPart): string {
        let url = this;
        if (this.constProperties.indexOf(partName) < 0) {
            throw new Error(`仅能获取以下属性${url.constProperties.join(", ")}`);
        } else {
            return url[partName];
        }
    }
    public getQueryValue(key: string): string {
        return  this.queryObj.getValueByKey(key);
    }
    public buildAddonUrl(base, queryObj: StUrl.IDic = {}): string {
        return this.buildTpUrl("/addons/execute/" + base, queryObj);
    }
    public buildTpUrl(base, queryObj: StUrl.IDic = {}): string {
        if (!queryObj.acid) {
            queryObj.acid = this.getQueryValue("acid");
        }     
        if (!queryObj.safe) {
            queryObj.safe = this.getQueryValue("safe");
        }
        return this.buildUrl(base, queryObj);
    }
    public buildUrl(path, queryObj: StUrl.IDic = {}): string {
        let queryStr = "?";
        for(let name in queryObj) {
            if (queryObj[name]) {
                queryStr += `${name}=${queryObj[name]}&`;
            }
        }
        return this.origin + path + queryStr;
    }
}
let local = new StUrl;
window["local"] = local;
export {local};