import "./ImageInput.less";
import { StPopImage } from "../stpop/StPopImage";
class ImgInputPop extends StPopImage {
    public assignValue(src: string) {
        let bindElm = this.bindElm,
            imageInput = <ImageInput>(bindElm["imageInput"]);
        imageInput.setValue(src);
        this.clearBind();
    }
}
let imagePop = new ImgInputPop();
imagePop.build();
export class ImageInput {
    public pop: ImgInputPop = imagePop;
    readonly inputName: string;
    public structNeedImg: boolean = true;
    private inputValue: string = "";
    public defaultAttr = {
        type: "hidden",
        btn: "上传图片",
    };
    private mustInput: boolean;
    public elm: HTMLElement;
    constructor(elm: HTMLElement, autoBuild: boolean = true) {
        this.elm = elm;
        this.inputName = elm.getAttribute("input-name");
        if (autoBuild) {
            this.build();
        }
    }
    static buildElm(inputName: string, inputValue = "", btnName = "上传图片", mustInput = "no") {
        let elm = document.createElement("div");
        elm.setAttribute("input-name", inputName);
        elm.setAttribute("input-value", inputValue);
        elm.setAttribute("must-input", mustInput);
        let imgInput = new ImageInput(elm, false);
        imgInput.defaultAttr.btn = btnName;
        imgInput.build();
        imgInput.setMustInput(mustInput);
        return elm;
    }
    public setMustInput(mustInput: string) {
        this.mustInput = false;
        if (mustInput == "yes") {
            this.mustInput = true;
        }
    }
    public getMustInput(): boolean {
        let mustInput = this.elm.getAttribute("must-input");
        this.mustInput = false;
        if (mustInput == "yes") {
            this.mustInput = true;
        }
        return this.mustInput;
    }
    private build() {
        if (this.elm["imageInput"]) {
            return;
        }
        let elm = this.elm;
        let fileSelector = this.elm.querySelector(".file-selector");
        if (!fileSelector) {
            this.buildFileSelector();
        }
        this.listenClick();
        elm["imageInput"] = this;
        return elm;
    }
    private buildFileSelector() {
        let inputValue = this.getValueWithDefault("value");
        let btnName = this.getValueWithDefault("btn");
        let inputType = this.getValueWithDefault("type");
        let fileSelector = document.createElement("div");
        fileSelector.setAttribute("class", "file-selector");
        fileSelector.innerHTML = `
            <div class="img-box"  data-input="${this.inputName}" style="background-image: url(&quot;${inputValue}&quot;);">
               <div class="operator">
                <div class="trash"></div>
               </div>
            </div>
            <input type="${inputType}" name="${this.inputName}" value="${inputValue}">
            <div class="file-btn">
                <button type="button" class="btn btn-file">${btnName}</button>
            </div>
        `;
        this.elm.appendChild(fileSelector);
    }
    private getValueWithDefault(attr): string {
        let val = this.elm.getAttribute(`input-${attr}`);
        if (!val) {
            val = this.defaultAttr[attr];
        }
        if (!val) {
            val = "";
        }
        return val;
    }
    public setValue(imgSrc: string) {
        if (this.mustInput && !imgSrc) {
            return ;
        }
        let input = <HTMLInputElement>this.elm.querySelector(`input[name="${this.inputName}"]`),
            imgBg = <HTMLDivElement>this.elm.querySelector(`.img-box[data-input="${this.inputName}"]`);
        this.elm.setAttribute("input-value", imgSrc);
        imgBg.style.backgroundImage = `url("${imgSrc}")`;
        input.value = imgSrc;
        if (this.inputValue !== imgSrc) {
            this.inputValue = imgSrc;
            $(this.elm).trigger("imageChange");
        }
    }
    public getValue(): string {
        let input = <HTMLInputElement>this.elm.querySelector(`input[name="${this.inputName}"]`);
        if (input) {
            return input.value;
        }
        return "";
    }
    protected listenClick() {
        let btn = this.elm.querySelector('.file-btn .btn-file'),
            trashBtn = this.elm.querySelector('.trash'),
            imgInput = this;
        if (btn) {
            btn.addEventListener("click", function (event) {
                imgInput.clickEvt(event, this);
            });
        }
        if (trashBtn) {
            trashBtn.addEventListener("click", () => {
                this.setValue("");
            });
        }
    }
    public clickEvt(event: Event, elm: HTMLElement) {
        this.pop.setBindElm(this.elm);
        this.pop.show();
    }
}