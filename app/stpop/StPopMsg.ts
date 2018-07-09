import "./StPopMsg.less";
import {getCopy, joinObj, getProperEvtName} from "../../func/obj";
import { StPop } from "./StPop";
interface StPopMsgOptions {
    msg: string;
    type?: string;
    autoShow?: boolean;
    className?: string;
    closeIsAnime?: boolean;
    showIsAnime?: boolean;
    beforeClose?: Function;
    afterClose?: Function;
    autoHide?: boolean | number;
};

export class StPopMsg{
    readonly elm: HTMLDivElement;
    private onShowing: boolean = false;
    private defaultOption:StPopMsgOptions = {
        msg: "信息",
        type: "error",
        closeIsAnime: true,
        showIsAnime: true,
        autoShow: true,
        autoHide: 600,
        className: "",
        beforeClose() {
        },
        afterClose(){
        }
    };
    private gottenOpt:StPopMsgOptions;
    constructor(msgOpt: StPopMsgOptions | string = "", type: string = "") {
        this.elm = document.createElement("div");
        this.gottenOpt = this.orgOpt(msgOpt, type);
        this.buildByOpt(this.gottenOpt);
    }
    protected orgOpt(msgOpt: StPopMsgOptions | string, type: string = "") {
        let opt = this.defaultOption;
        if (typeof msgOpt == "string") {
            opt.msg = msgOpt;
        } else {
           opt = joinObj(opt, msgOpt);
        }
        if (type) {
            opt.type = type;
        }
        return opt;
    }
    protected buildByOpt(msgOpt: StPopMsgOptions) {
        this.elm.innerHTML = msgOpt.msg;
        this.elm.setAttribute("class", `stpop-msg ${this.gottenOpt.className}`);
        this.elm.setAttribute("data-type", msgOpt.type);
        this.listenAnimeEnd();
        if (msgOpt.autoShow) {
            this.show();
        }
    }
    private listenAnimeEnd() {
        let evtName = getProperEvtName("animationend"),
            elm = this.elm,
            msgPop = this;
        elm.addEventListener(evtName, function (evt) {
            let action = elm.getAttribute("action");
            elm.removeAttribute("action");
            msgPop.execAction(action, evt);
        });
    }
    public execAction(action: string, evt: Event) {
        switch (action) {
            case 'to-close':
            case 'hide':
                this.removeElm();
                break;
            case 'to-show':
                this.afterShow();
                break;
        }
    }
    public show(parentNode: HTMLElement = document.body) {
        if (this.onShowing) {
            return ;
        }
        let elm = this.elm,
            pop = this;
        parentNode.appendChild(elm);
        pop.onShowing = true;
        if (this.gottenOpt.showIsAnime) {
            this.elm.setAttribute("action", "to-show");
        } else {
            this.afterShow();
        }      
    }
    protected afterShow() {
        let pop = this;
        if (typeof this.gottenOpt.autoHide == "number") {
            let interval = this.gottenOpt.autoHide;
            window.setTimeout(function () {
                pop.close();
            }, interval);
        }
    }
    public updateMsg(newMsg: string): StPopMsg {
        this.gottenOpt.msg = newMsg;
        this.elm.innerHTML = newMsg;
        return this;
    }
    public updateType(newType: string): StPopMsg {
        this.gottenOpt.type = newType;
        this.elm.setAttribute("type", newType);
        return this;
    }
    public setBody(newMsg: string): StPopMsg {
        return this.updateMsg(newMsg);
    }
    public setMsgType(newType: string): StPopMsg  {
        return this.updateType(newType);
    }
    public setZIndex(zIndex: number = 1): this {
        let elm = <HTMLElement>this.elm;
        elm.style.zIndex = zIndex.toString();
        return this;
    }
    public close() {
        if (this.onShowing) {
            this.gottenOpt.beforeClose();
            this.elm.setAttribute("action", "to-close");
            if (this.gottenOpt.closeIsAnime) {
                return ;
            }
            this.removeElm();
        }
    }
    protected removeElm(): StPopMsg {  
        this.elm.remove();
        this.onShowing = false;
        this.gottenOpt.afterClose();
        return this;
    }
    public getParams(attr: string = ""): StPopMsgOptions | string {
        let opt = getCopy(this.gottenOpt);
        if (attr) {
            return opt[attr];
        } else {
            return opt;
        }
    }
}