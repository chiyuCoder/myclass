import { StPopOptions, StPop } from "./StPop";
import {mixedObj, joinObj} from "../../func/func";
export interface StPopConfirmOption  {
    body: string;
    header?: string;
    classList?: string[] | string,
    clickToHide?: boolean;
    closeIsAnime?: boolean;
    moveable?: boolean;
    autoShow?: boolean;
    sureBtn?: string;
    cancelBtn?: string;
    suredFunc?: Function;
    canceledFunc?: Function;
};

export class StPopConfirm extends StPop{
    readonly defaultClass: string = "stpop stpop-confirm";
    protected getDefaultConfirm(): StPopConfirmOption {
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
            autoShow: true,
            sureBtn: "确定",
            cancelBtn: "取消",
            suredFunc() {

            },
            canceledFunc() {

            }
        };
    }
    private orgOpt(opt: StPopConfirmOption | string): StPopConfirmOption {
        let options = this.getDefaultConfirm();
        if (typeof opt == "string") {
            options.body = opt;
        } else {
            options = joinObj(options, opt);
        }
        return options;
    }
    private toPopOpt(opt: StPopConfirmOption): StPopOptions {
        let options = this.getDefaultPopOpt();
        options = mixedObj(options, opt);
        options.footer = `
        <div class="text-center">
            <button type="button" data-type="sure-btn" class="btn">${opt.sureBtn}</button>
            <button type="button" data-type="cancel-btn" class="btn">${opt.cancelBtn}</button>
        </div>
        `;
        return options;
    }
    constructor(opt: StPopConfirmOption | string = "") {
        super();
        if (opt) {
            this.buildConfirm(opt);
        }
    }
    buildConfirm(opt: StPopConfirmOption | string){
        let confirmOpt = this.orgOpt(opt),
            popOpt = this.toPopOpt(confirmOpt);
        this.buildPop(popOpt);
        if (this.params.autoShow) {
            this.show();
        }
    }
}