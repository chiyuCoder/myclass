import "./switcher.less";
export class Switcher {
    public elm: HTMLElement;
    readonly inputName;
    readonly statusDefaultText = {
        "on": "开启",
        "off": "关闭"
    };
    public inputElm: HTMLInputElement;
    public boxElm:HTMLElement;
    public pointerElm: HTMLElement;
    constructor(elm: HTMLElement) {
        this.elm = elm;
        this.inputName = this.elm.getAttribute("input-name");
        this.build();
        this.listenClick();
    }
    private build() {
        let input = this.elm.querySelector(`input[name="${this.inputName}"]`);
        if (!input) {
            let switcherInput = this.buildInput();
            input = switcherInput;
        }
        this.inputElm = <HTMLInputElement>input;
        this.boxElm = this.getBoxElm();
        this.pointerElm = this.getPointerElm();
        this.elm.appendChild(this.boxElm);
        this.elm.appendChild(this.pointerElm);        
    }
    private getPointerElm(): HTMLElement {
        let pointer = <HTMLElement>this.elm.querySelector(".switcher-pointer");
        if (!pointer) {
            pointer = document.createElement("div");
            pointer.setAttribute("class", "switcher-pointer");
        }
        return pointer;
    }
    private getBoxElm():HTMLElement {
        let box = <HTMLElement>this.elm.querySelector(".switcher-box");
        if (!box) {
            let on = this.getTextByStatus("on"),
                off = this.getTextByStatus("off");
            box = document.createElement("div");
            box.setAttribute("class", "switcher-box");
            box.innerHTML = `
                <div class="switcher-on">${on}</div>
                <div class="switcher-off">${off}</div>
            `;
        }
        return box;
    }
    public getTextByStatus(status: "on" | "off") {
        let statusValue = this.elm.getAttribute(status);
        if (!statusValue) {
            statusValue = this.statusDefaultText[status];
        }
        return statusValue;
    }
    private buildInput(): HTMLInputElement {
        let switcherInput = document.createElement("input");
        switcherInput.setAttribute("name", this.inputName);
        switcherInput.setAttribute("type", "hidden");
        let value = this.elm.getAttribute("now");
        if (!value) {
            value = "off";
            this.elm.setAttribute("now", value);
        }
        switcherInput.value = value;
        this.elm.appendChild(switcherInput);
        return switcherInput;
    }
    protected changeStatus(newStatus: "on" | "off") {
        this.inputElm.value = newStatus;
        this.elm.setAttribute("now", newStatus);
        $(this.elm).trigger("switcherChange");
    }
    public switchStatus(newStatus: "on" | "off"): "on" | "off" {
        if (newStatus == "on") {
            return "off";
        }
        return "on";
    }
    private listenClick() {
        let switcher = this;
        this.elm.addEventListener("click", function () {
            let nowStatus = <"on" | "off">this.getAttribute("now"),
                nexStatus = switcher.switchStatus(nowStatus);
            switcher.changeStatus(nexStatus);
        });
    }
}