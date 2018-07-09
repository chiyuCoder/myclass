import { local } from "../StUrl/StUrl";

let animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback: Function) {
    setTimeout(function () {
        callback();
    }, 1000 / 60);
};
class QrcPanel {
    public swicther: JQuery<HTMLElement> = $('[data-type="qrcode-btn"]');
    public panel: JQuery<HTMLElement> = $("#qrcode-panel");
    public saveKey: string = local.getQueryValue("acid") + "_qrcStatus";
    private animing: boolean = false;
    public step: number = 10;
    public minRight: number = 0;
    public maxRight: number = 10;
    public direction: "left" | "right" = "right";
    toggle() {
        let status = $(this.swicther).attr("qrc-status");
        if (status == "hide") {
            this.show();
        } else {
            this.hide();
        }
    }
    getLocalStatus() {
        let status = localStorage.getItem(this.saveKey);
        if (status) {
            return status;
        }
        return "hide";
    }
    toMiddle() {
        let panelHeight = $(this.panel).height(),
            winHeight = window.innerHeight,
            top = (winHeight - panelHeight) / 2;
        $(this.panel).css("top", top + "px");
    }
    build(): this {
        this.toMiddle();
        if (this.getLocalStatus() == "hide") {
            this.hide();
        } else {
            this.show();
        }
        return this;
    }
    setRange(min?: number, max?: number): this {
        if (min === undefined) {
            min = 0 - this.getIntAttr("width");
        }
        if (max === undefined) {
            max = 10;
        }
        this.minRight = min;
        this.maxRight = max;
        return this;
    }
    hide() {
        $(this.swicther).attr("qrc-status", "hide");
        localStorage.setItem(this.saveKey, "hide");
        this.moveToRight();
    }
    show() {
        $(this.swicther).attr("qrc-status", "show");
        localStorage.setItem(this.saveKey, "show");
        this.moveToLeft();
    }
    getIntAttr(attr: string): number {
        let strVal = $(this.panel).css(attr),
            intVal = parseInt(strVal);
        return isNaN(intVal) ? 0 : intVal;
    }
    moveToRight() {
        let nowRight = this.getIntAttr("right"),
            endRight = this.minRight,
            $this = this;
        if (nowRight < endRight) {
            this.animing = false;
            this.setRight(endRight);
        } else {
            this.animing = true;
            let newRight = nowRight - this.step;
            this.setRight(newRight);
            animate(function () {
                $this.moveToRight();
            });
        }
    }
    moveToLeft() {
        let nowRight = this.getIntAttr("right"),
            endRight = this.maxRight,
            $this = this;
        if (nowRight > endRight) {
            this.animing = false;
            this.setRight(endRight);
        } else {
            this.animing = true;
            let newRight = nowRight + this.step;
            this.setRight(newRight);
            animate(function () {
                $this.moveToLeft();
            });
        }
    }
    setRight(right: number) {
        $(this.panel).css("right", right + "px");
        let bodyMarginRight = right + this.getIntAttr("width");
        if (bodyMarginRight > 0) {            
            $("#body").css("width", `calc(100% - ${right + this.getIntAttr("width")}px)`);
        } else {
            $("#body").css("width", "100%");
        }
    }
}

export let qrcPanel = new QrcPanel();
