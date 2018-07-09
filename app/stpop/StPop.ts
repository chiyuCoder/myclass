import "./StPop.less";
import { strToInt, execCallback } from "../../func/func";
export interface StPopOptions{
    body: string;
    header?: string;
    footer?: string;
    classList?: string[] | string;
    beforeClose?: Function;
    afterClose?: Function;
    clickToHide?: boolean;
    closeIsAnime?: boolean;
    moveable?: boolean,
    suredFunc?: Function;
    canceledFunc?: Function;
    closeMask?: Boolean;
    [attr: string]: any;
}
interface Point{
    x: number;
    y: number;
}
export class StPop{
    static initPopId: number = 1;
    static showingPops: StPop[] = [];
    protected params: StPopOptions =  {
        body: "通知弹窗",
        header: `
                <span>通知弹窗</span>
            `,
        footer: `
               <div class="text-center">
                     <button type="button" data-type="sure-btn" class="btn">确定</button>
                    <button type="button" data-type="cancel-btn" class="btn">取消</button>
               </div>
            `,
        classList: [],
        clickToHide: true,
        closeIsAnime: true,
        moveable: true,
        closeMask: true,
        beforeClose() {

        },
        afterClose() {

        },
        suredFunc() { },
        canceledFunc() { },
    };
    readonly prefix = "stpop";
    readonly parts = ["header", "body", "footer"];
    public elm: HTMLDivElement;
    public box: HTMLDivElement;
    private maskMoveable: boolean;
    protected mouseMoveStart: Point;
    protected maskMoveStart: Point;
    readonly defaultClass: string = "stpop";
    private popId: number;
    protected onShowing: boolean = false;
    protected hasBuiltOne: boolean = false;
    protected getDefaultPopOpt(): StPopOptions {
        return this.params;
    }
    protected setDefaultOptions(options: StPopOptions): StPopOptions{
        let defaultOptions = this.getDefaultPopOpt();
        for (let prop in defaultOptions) {
            if (options[prop] == undefined) {
                options[prop] = defaultOptions[prop];
            }
        }
        options.header = `<div class="stpop-header-text">${options.header}</div>`;
        if (options.closeMask) {
            options.header +=  `
                <div class="stpop-close"></div>
            `;
        }
        options.classList = this.orgClassWidthDefault(options.classList);
        return options;
    }
    protected orgClassWidthDefault(classList: string | string[]): string {
        let cls = "";
        if (classList instanceof Array) {
            cls = classList.join(" ");
        } else {
            cls = classList;
        }
        cls += " " + this.defaultClass;
        return cls;
    }
    constructor(options?: StPopOptions) {
        this.popId = StPop.initPopId ++;
        if(options) {
            this.buildPop(<StPopOptions> options);
        }
    }
    public updateParams(key: keyof StPopOptions, value: StPopOptions[keyof StPopOptions]): this {
        this.params[key] = value;
        return this;
    }
    protected buildPop(options: StPopOptions) {
        if (this.hasBuiltOne) {
            return ;
        }
        this.params = this.setDefaultOptions(options);
        this.buildHtml();
        this.initEvts();
        this.hasBuiltOne = true;
    }
    private buildHtml() {
        let header = this.buildHtmlPart('header'),
            body = this.buildHtmlPart("body"),
            footer = this.buildHtmlPart("footer"),
            stpop = document.createElement('div'),
            box = document.createElement("div");
        stpop.setAttribute("class", <string> this.params.classList);
        this.elm = stpop;
        box.setAttribute("class", "stpop-box");
        this.box = box;
        this.box.appendChild(header);
        this.box.appendChild(body);
        this.box.appendChild(footer);
        this.elm.appendChild(box);
    }
    public buildHtmlPart(partName): HTMLElement {
        let partInnerHtml:string = this.params[partName],
            className:string = this.prefix + "-" + partName,
            div = document.createElement("div");
        div.setAttribute("class", className);
        div.innerHTML = partInnerHtml;
        return div;
    }
    public getPart(partName: string): HTMLDivElement {
        if (partName == 'header') {
            partName = "header-text";
        }
        return this.box.querySelector(`.stpop-${partName}`);
    }
    public setPart(partName: string, partHtml:string): this {
        let part = this.getPart(partName),
            stpop = this;
        part.innerHTML = partHtml;
        return this;
    }
    public setHeader(newHeaderHTML: string): this {
        return this.setPart("header", newHeaderHTML);
    }
    public setBody(newHTML: string): this {
        return this.setPart("body", newHTML);
    }
    public setFooter(newHTML: string): this {
        return this.setPart("footer", newHTML);
    }
    public show(elm: HTMLElement= document.body): this {
        if (!this.onShowing) {
            this.onShowing = true;
            elm.appendChild(this.elm);
            StPop.showingPops.push(this);
            this.centerBox();
        }
        return this;
    }
    public close(): this {     
        if (this.onShowing) {
            this.elm.setAttribute("data-action", "close");
            this.removeThisFromShowingPops();
            if (!this.params.closeIsAnime) {
                this.trueClose();
            }     
            this.onShowing = false;       
        } 
        return this;
    }    
    protected removeThisFromShowingPops() {
        let popId = this.popId,
            pops = StPop.showingPops,
            num = pops.length;
        for (let i = 0; i < num; i ++) {
            if (pops[i] && (pops[i].popId === popId)) {
                let delLen = 1;
                pops.splice(i, delLen);
            }
        }
    }
    private trueClose() {
        this.moveToStartPosition();
        this.elm.remove();
        this.params.afterClose();
    }
    public moveToStartPosition() {
        this.box.style.left = -this.box.offsetWidth.toString() + 'px';
        this.box.style.top = -this.box.offsetHeight.toString() + 'px';
    }
    public centerBox() {
        let boxStyle = window.getComputedStyle(this.box),
            boxWidth: number = strToInt(boxStyle.width),
            boxHeight: number = strToInt(boxStyle.height),
            maskStyle = window.getComputedStyle(this.elm),
            maskWidth: number = strToInt(maskStyle.width),
            maskHeight: number = strToInt(maskStyle.height),
            left: number = (maskWidth - boxWidth) / 2,
            top: number = (maskHeight - boxHeight) / 2;
        this.box.style.top = `${top.toString()}px`;
        this.box.style.left = `${left.toString()}px`;
    }
    private initEvts() {
        this.initClickMask();
        this.initAnimationendEvt();
        this.initCloseEvt();
        this.initSuredEvt();
        this.initCancelEvt();
        if (this.params.moveable) {
            this.initMoveEvt();
        }
    }
    protected arrayInitEvt(arr: NodeList, evtName: string, func: Function) {
        let len = arr.length;
        for (let i = 0; i < len; i ++) {
            let item = arr[i];
            item.addEventListener(evtName, function (evt) {
                func(evt);
            });
        }
    }
    private initSuredEvt() {
        let suredBtns = this.elm.querySelectorAll('[data-type="sure-btn"]'),
            stpop = this;
        stpop.arrayInitEvt(suredBtns, "click", function (evt) {
            let stopHere = stpop.params.suredFunc();
            if (stopHere != undefined) {
                return;
            }
            stpop.close();
        });
    }
    private initCancelEvt() {
        let canceledBtns = this.elm.querySelectorAll('[data-type="cancel-btn"]'),
            stpop = this;
        stpop.arrayInitEvt(canceledBtns, "click", function (evt) {
            let stopHere = stpop.params.canceledFunc();
            if (stopHere != undefined) {
                return;
            }
            stpop.close();
        });
    }
    private initCloseEvt() {
        let closeBtns = this.elm.querySelectorAll(".stpop-close"),
            stpop = this;
        stpop.arrayInitEvt(closeBtns, "click", function (evt) {
            stpop.beforeToClose();
        });
    }
    private beforeToClose() {
        let stopHere = this.params.beforeClose();
        if (stopHere != undefined) {
            return;
        }
        this.close();
    }
    private initClickMask() {
        let mask = this.elm,
            box = this.box;
        mask.addEventListener('click', () => {
            if (this.params.clickToHide) {
                this.beforeToClose();
            }
        });
        box.addEventListener("click", (evt) => {
            evt.stopPropagation();
        });
    }
    public getProperEvtAttr(attr) {
        if (`on${attr}` in window) {
            return attr;
        } else {
            let providers = ['webkit', 'ms', 'moz', 'o'],
                firstLetter = attr.slice(0, 1),
                properAttr = '';
            attr = attr.replace(firstLetter, firstLetter.toUpperCase());
            for (let provider of providers) {
                let providerAttr = provider + attr;
                if (`on${providerAttr}` in window) {
                    properAttr = providerAttr;
                    break;
                }
            }
            if (properAttr) {
                return properAttr;
            } else {
                throw new Error(`${attr}不存在`);
            }
        }
    }
    public initAnimationendEvt() {
        let animeEvtListener = this.getProperEvtAttr('animationend'),
            stpop = this;
        this.elm.addEventListener(animeEvtListener, function () {
            let action = stpop.elm.getAttribute('data-action');
            stpop.elm.removeAttribute('data-action');
            if (action == "close") {
                stpop.trueClose();
            }
        });
    }
    private initMoveEvt() {
        this.initHeaderDownEvt();
        this.initHeaderMoving();
        this.initHeaderMouseUp();
        this.listenResize();
    }
    protected listenResize() {
        window.addEventListener("resize", () => {
            this.centerBox();
        });
    }
    protected mouseDownHeader(evt) {
        this.elm.setAttribute("data-action", "moving");
        let style = window.getComputedStyle(this.box),
            boxLeft = strToInt(style.left),
            boxTop = strToInt(style.top);
        this.maskMoveable = true;
        this.maskMoveStart = {
            x: boxLeft,
            y: boxTop,
        };
        this.mouseMoveStart = {
            x: evt.clientX,
            y: evt.clientY
        };
    }
    private initHeaderDownEvt() {
        let header = this.getPart("header");
        if (header) {
            header.style.cursor = "move";
            header.addEventListener("mousedown", (evt) => {
                this.mouseDownHeader(evt);                
            });
       }
    }
    protected onmoving(evt) {
        let stpop = this;
        if (this.maskMoveable) {
            let left = evt.clientX - stpop.mouseMoveStart.x + stpop.maskMoveStart.x,
                top = evt.clientY - stpop.mouseMoveStart.y + stpop.maskMoveStart.y;
            stpop.box.style.left = left + 'px';
            stpop.box.style.top = top + 'px';
        }
    }
    private initHeaderMoving() {
        let header = this.getPart("header"),
            stpop = this;
        if (header) {
            this.elm.addEventListener("mousemove", (evt) => {            
                this.onmoving(evt);
            });
        }    
    }
    protected mouseUpHeader(evt) {
        let stpop = this;
        stpop.elm.removeAttribute("data-action");
        stpop.maskMoveable = false;
    }
    private initHeaderMouseUp() {
        let stpop = this,
            header = stpop.getPart("header");
        if (header) {
            header.addEventListener('mouseup', function (event) {
                stpop.mouseUpHeader(event);
            });
        }
    }
    public closeAll() {
        let showingPops = StPop.showingPops;
        for (let pop of showingPops) {
            pop.close();
        }
    }
}