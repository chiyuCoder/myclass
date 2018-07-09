import {mixedObj, joinObj} from "../../func/func";
import { StPopOptions, StPop } from "./StPop";
import "./StPopAlert.less";
export interface StPopAlertOptions {
    body: string;
    header?: string;
    classList?: string[] | string,
    clickToHide?: boolean;
    closeIsAnime?: boolean;
    moveable?: boolean;
    alertBtn?: string;
    autoShow?: boolean;
    alertType?: string;
    beforeClose?: Function;
    afterClose?: Function;
}
export class StPopAlert extends StPop {
    readonly defaultClass: string = "stpop stpop-alert";
    static alertId: number = 1;
    static alertOnShow: StPopAlert[] = [];
    readonly alertId: number;
    private getDefaultAlert(): StPopAlertOptions {
        return {
            body: "alert",
            header: `
                    <span>通知弹窗</span>
                    <div class="stpop-close"></div>
                `,
            classList: [],
            clickToHide: true,
            closeIsAnime: true,
            moveable: false,
            alertBtn: "关闭",
            autoShow: true,
            alertType: "normal",
            beforeClose() {
            },
            afterClose() {
            },
        };
    }
    private orgOpt(options: StPopAlertOptions | string, alertType: string = ""): StPopAlertOptions{
        let opt = this.getDefaultAlert();       
        if (typeof options == "string") {
            opt.body = options;
        } else {
            opt = joinObj(opt, options);
        }
        if (alertType) {
            opt.alertType = alertType;
        }
        return opt;
    }
    private toPopOpt(option: StPopAlertOptions): StPopOptions {
       let opt = this.getDefaultPopOpt();
       opt = mixedObj(opt, option);
       opt.footer = `
        <div class="text-center">
            <button type="button" class="stpop-close btn">${option.alertBtn}</button>
        </div>
       `;
       return opt;
    }
    constructor(options: StPopAlertOptions | string = "", alertType: string = "") {
        super();
        this.alertId = StPopAlert.alertId ++;
        if (options) {
            this.producePop(options, alertType);
        }
    }
    public producePop(options: StPopAlertOptions | string = "", alertType: string = "") {
        let opt = this.orgOpt(options, alertType),
            popOpt = this.toPopOpt(opt);
        this.buildPop(popOpt);
        this.elm.setAttribute("alert-type", this.params.alertType);        
        if (this.params.autoShow) {
            this.show();
        }
    }
    public show(elm:HTMLElement =  document.body): this {
        if (!this.onShowing) {
            super.show(elm);
            this.closeAllAlerts();
            let popAlert = this;
            StPopAlert.alertOnShow.push(popAlert);
        }
        return this;
    }
    public closeAllAlerts() {
        let showingAlerts = StPopAlert.alertOnShow;
        for(let showingAlert of showingAlerts) {
            showingAlert.close();
        }
    }
    public close(): this {
        if (this.onShowing) {
            let showingAlerts = StPopAlert.alertOnShow,
                showNum = showingAlerts.length;
            super.close();
            for (let i = 0; i < showNum; i ++) {
                let alertPopId = showingAlerts[i].alertId;
                if (alertPopId == this.alertId) {
                    showingAlerts.splice(i, 1);
                }
            }
        }
        return this;
    }
    public setAlertType(alertType: string): this {
        this.params.alertType = alertType;
        this.elm.setAttribute("alert-type", alertType);
        return this;
    }
    public setClosedFunc(func: Function) {
        this.params.afterClose = func;
    }
}