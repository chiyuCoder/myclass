import { StPopConfirm, StPopConfirmOption } from "./StPopConfirm";
import { mixedObj, joinObj } from "../../func/func";
import "./StPopForm.less";
interface mainSingleInputAttr{
    value:string;
    label: string;
}
interface CommonInput {
    label: string;
    name: string;
    type?: string;
    value?: string;
    helpText?: string;
    [attr: string]: string | string[] | number | mainSingleInputAttr[];
}
interface IMultitypeInput extends CommonInput{
    values: mainSingleInputAttr[]
}
interface IFormData {
    [name: string]: any;
}
interface ICollectFunc {
    (data: IFormData): any;
}
export interface StPopFormOpt {
    inputs: CommonInput[];
    header?: string;
    autoShow?: boolean;
    classList?: string[] | string,
    clickToHide?: boolean;
    closeIsAnime?: boolean;
    moveable?: boolean;
    sureBtn?: string;
    cancelBtn?: string;
    canceledFunc?: Function;
    collectFunc?: ICollectFunc
}
export class StPopForm extends StPopConfirm {
    readonly defaultClass: string = "stpop stpop-form";
    private hasFocus: boolean = false;
    public errorClass: string = "error";
    private getMainInputAttr() {
        return  ["label", "name", "type", "value", "helpText", "unit"];
    }
    private getDefaultForm(): StPopFormOpt {
        return {
            inputs: [
                {
                    label: "label",
                    name: "name",
                    type: "text",
                }
            ],
            collectFunc(data) {

            }
        };
    }
    protected getOtherAttrStr(input: CommonInput, mainAttr: string[]) {
        let otherAttrs = "";
        for (let otherAttr in input) {
            if (mainAttr.indexOf(otherAttr) < 0) {
                otherAttrs +=` ${otherAttr}="${input[otherAttr]}" `;
            }
        }
        return otherAttrs;
    }
    protected getMultiTypeInput(input: IMultitypeInput): string {
        let mainAttr = this.getMainInputAttr();
        mainAttr.push("values");
        let values = input.values,
            inputs = "",
            otherAttrs = this.getOtherAttrStr(input, mainAttr);
        values.forEach(inputValue => {
            let checked = "";
            if (input.value && (inputValue.value == input.value)) {
                checked = "checked";
            }
            inputs += `
                <div class="multitype-input">
                    <span class="input-label">${inputValue.label}</span>
                    <input type="${input.type}" name="${input.name}" value=${inputValue.value} ${otherAttrs} ${checked}/>
                </div>
            `;
        });
        return inputs;
    }
    protected getSelectTypeInput(input: IMultitypeInput): string {
        let options = "",
            mainAttr = this.getMainInputAttr(),
            values = input.values,
            otherAttrs = "";
        mainAttr.push("values");
        otherAttrs = this.getOtherAttrStr(input, mainAttr);
        values.forEach(value => {
            let selected = "";
            if (value.value == input.value) {
                selected = "selected";
            }
            options += `<option value="${value.value}" ${selected}>${value.label}</option>`
        });
        return `
            <select type="select" name="${input.name}" ${otherAttrs}>${options}</select>
        `;
    }
    protected commonInputToHTML(input: CommonInput): string {
        let inputStr = "",
            mainAttr = this.getMainInputAttr();
        if (input.type == "radio" || input.type == "checkbox") {
            inputStr = this.getMultiTypeInput(<IMultitypeInput> input);
        } else if (input.type == "select") {
            inputStr = this.getSelectTypeInput(<IMultitypeInput> input);
        } else  {
            let otherAttrs =  this.getOtherAttrStr(input, mainAttr);
            if (input.unit) {
                inputStr = `
                    <div class="input-group">
                        <input  type="${input.type}" name="${input.name}" value="${input.value}" ${otherAttrs}>
                        <div class="input-unit">${input.unit}</div>
                    </div>
                `;
            } else{
                inputStr = `<input  type="${input.type}" name="${input.name}" value="${input.value}" ${otherAttrs}>`;
            }
        }
        return `
            <div class="pbrow">
                <label>${input.label}</label>
                <div class="help-input">
                    <div class="inputs">${inputStr}</div>
                    <div class="help-text">${input.helpText}</div>
                </div>
            </div>
        `;
    }
    private orgInputs(inputs: CommonInput[]): string {
        let form = "",
            formObj = this;
        inputs.forEach(input => {
            if (input.type == undefined) {
                input.type = "text";
            }
            if (input.helpText == undefined) {
                input.helpText = "";
            }
            if (input.value == undefined) {
                input.value = "";
            }
            form += formObj.commonInputToHTML(input);
        });
        return `
            <form class="stpop-form" onsubmit="return false;">${form}</form>
        `;
    }
    private collectFormData(): IFormData{
        let formData: IFormData = {},
            formElm = this.getForm(),
            inputs = formElm.querySelectorAll("input, select"),
            inputLen = inputs.length;
        for (let i = 0; i < inputLen; i ++) {
            let inputElm = <HTMLInputElement>inputs[i],
                inputType = inputElm.getAttribute("type"),
                inputName = inputElm.getAttribute("name"),
                inputValue = inputElm.value;
            if (inputType == "radio" || inputType == "checkbox") {
                let checked = inputElm.checked;
                if (checked) {
                    if (inputType == "radio") {
                        formData[inputName] = inputValue;
                    } else {
                        if (formData[inputName] == undefined) {
                            formData[inputName] = [];
                        }
                        formData[inputName].push(inputValue);
                    }
                }
            } else {
                formData[inputName] = inputValue;
            }
        }
        return formData;
    }
    private formOptToConfirmOpt(opt: StPopFormOpt): StPopConfirmOption {
        let confirmOpt = this.getDefaultConfirm();
        confirmOpt = mixedObj(confirmOpt, opt);
        confirmOpt["body"] = this.orgInputs(opt.inputs);
        if (opt.collectFunc == undefined) {
            opt.collectFunc = (data) => {
                console.log(data);
            }
        }
        confirmOpt.suredFunc = () => {
            let data = this.collectFormData();
            opt.collectFunc(data);
            return false;
        }
        return confirmOpt;
    }
    constructor(opt: StPopFormOpt) {
        super();
        let confirmOpt = this.formOptToConfirmOpt(opt);
        this.buildConfirm(confirmOpt);
        this.listenEnterDown();
    }
    public getForm() {
        return this.elm.querySelector("form.stpop-form");
    }
    private listenEnterDown() {
        let popForm = this,
            enterKey = 13;
        $(document).on('keydown', (event) => {
            if (event.keyCode === enterKey) {
                if (popForm.hasFocus) {
                    popForm.params.suredFunc();
                }
            }
        });
    }
    public show(): this {
        this.hasFocus = true;
        super.show();
        return this;
    }
    public close(): this {
        this.hasFocus = false;
        super.close();
        return this;
    }
    public getFormRow(div: any, attr: string = "") {
        if ($(div).hasClass("pbrow") || $(div)[0].tagName.toLowerCase() == "body") {
            if (attr) {
                return $(div).attr(attr);
            }
            return $(div);
        }
        return this.getFormRow($(div).parent(), attr);
    }
    public triggerError(div, errorInfo): boolean {
        let row = this.getFormRow(div);
        $(row).addClass(this.errorClass);
        $(row).find('.help-text').html(errorInfo);
        return false;
    }
    public removeError(div): boolean {
        let row = this.getFormRow(div);
        $(row).removeClass(this.errorClass);
        $(row).find('.help-text').html('');
        return true;
    }
}