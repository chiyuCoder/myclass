import "./progress.less";
let animator = window.requestAnimationFrame || window.webkitRequestAnimationFrame,
    stopAnimator = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;
export class StUploaderProgress{
    public elm: HTMLElement;
    public uploadingText: string = "正在上传中";
    public uploadDoneText: string = "上传完成";
    public numSelector: string = ".progress-num";
    private progress: number;
    public autoStepAdd: number = 0.1;
    public delayToHide: number = 500;
    public animeId: number;//requsetAnimationFrame的ID
    public initHtml() {
        return `
            <div class="left">
                <div class="progress-box">
                    <div class="progress"></div>
                </div>
            </div>
            <div class="right">
                <span>正在上传中</span>
            </div>
        `;
    }
   
    public init(): HTMLElement {
        if (!this.elm) {
            let progress = document.createElement("div");
            progress.setAttribute("class", "pbrow progress-component");
            progress.innerHTML = this.initHtml();
            this.elm = progress;
        }
        return this.elm;
    }
    public installOn(elm: HTMLElement) {
        this.init();
        elm.appendChild(this.elm);
    }
    public setProcess(newProgress: number) {
        this.progress = newProgress;
        this.setProcessOnBox(newProgress);
        this.setProcessOnNum(newProgress);
    }
    protected setProcessOnBox(newProgress: number) {
        let div = <HTMLElement>this.elm.querySelector(".progress");
        if (div) {
            div.style.width = newProgress + "%";
        }
    }
    protected setProcessOnNum(newProgress: number) {
        let div = <HTMLElement>this.elm.querySelector(this.numSelector);
        if (div) {
            div.innerHTML = newProgress.toString();
        }
    }
    public getProcess() {
        return this.progress;
    }
    public autoStep(end: number = 99) {
        this.progress = 0;
        this.animeStep(this.progress, end);
    }
    protected animeStep(start: number, end: number){
        let progress = this;
        if (start <= end) {
            progress.setProcess(start);
            start += progress.autoStepAdd;
            this.animeId = animator(function () {
                progress.animeStep(start, end);
            });
        } else {
            this.animeEnd();
        }
    }
    public animeEnd() {
    };
    public autoHide() {
        let progress = this;
        setTimeout(function () {
            progress.hide();
        }, progress.delayToHide);
    }
    public hide() {
        this.elm.remove();
    }
    public done() {
        let progress = this;
        stopAnimator(progress.animeId);
        this.setProcess(100);
        this.autoHide();
    }
}