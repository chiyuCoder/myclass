import "./RadioGroup.less";
import {elmsArrayInitEvt} from "../../func/func";
export class RadioGroup {
    public elm: HTMLDivElement;
    readonly inputName: string;
    readonly checkedStatus = ["checked", "true", "yes"];
    constructor(elm) {
        if (!elm.radioGroup) {
            this.elm = elm;
            this.inputName = elm.getAttribute("input-name");
            this.initInput();
            this.initValue();
            this.initEvt();
        }
    }
    private initValue(){
        let value = this.getInputValue();
        this.setInputValue(value);
    }
    private initInput(){
        let input = <HTMLInputElement>this.elm.querySelector(`input[name="${this.inputName}"]`);
        if (!input) {
            let html = `<input type="hidden" name="${this.inputName}" />`,
                newInput = document.createElement("input"),
                firstChild = this.elm.firstChild;
            newInput.name = this.inputName;
            newInput.type = "hidden";
            this.elm.insertBefore(newInput, firstChild);
        }
    }
    public getInputValue(): string {
        let value = this.elm.getAttribute("input-value");
        return value ? value : "";
    }
    public setInputValue(value: string) {
        this.elm.setAttribute("input-value", value);
        this.selectRadioByValue(value);
        this.giveValueToInput(value);
    }
    public selectRadioByValue(value: string) {
        let radios = this.elm.querySelectorAll(`[data-type="radio"][input-name="${this.inputName}"]`),
            len = radios.length;
        for (let i = 0; i < len; i++) {
            let radio = radios[i];
            if (radio.getAttribute("input-value") == value) {
                radio.setAttribute("check-status", "checked");
            } else {
                radio.removeAttribute("check-status");
            }
        }
    }
    public giveValueToInput(value: string) {
        let input = <HTMLInputElement>this.elm.querySelector(`input[name="${this.inputName}"]`);
        if (input) {
            input.value = value;
        }
    }
    private initEvt(){
        let radios = this.elm.querySelectorAll(`[data-type="radio"][input-name="${this.inputName}"]`),
            obj = this;
        elmsArrayInitEvt(radios, "click", function (evt: Event) {
            obj.clickFunc(evt, obj, this);
        });
    }
    public statusIsChecked(status: string) {
        let checkedStatus = this.checkedStatus;
        if (checkedStatus.indexOf(status) < 0) {
            return false;
        }
        return true;
    }
    
    public clickFunc(evt: Event, obj: RadioGroup, elm: HTMLElement) {
        let radio = <HTMLElement>elm,
            checkStatus = radio.getAttribute("check-status");
        if (obj.statusIsChecked(checkStatus)) {
            return ;
        }
        let inputValue = radio.getAttribute("input-value");
        obj.setInputValue(inputValue);
        $(obj.elm).trigger("radioChange");
    }
}