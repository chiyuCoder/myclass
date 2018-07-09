import "./SwitchTab.less";
interface IToggleFunc{
    (elm: HTMLElement)
}
export class SwitchTab{
    public elm: HTMLElement;
    public tabNav: string = ".tab-navs li";
    public activeClass: string = "active";
    public attrName: string = "data-target";
    public targetAttr: string = "target-id";
    constructor(elm: HTMLElement) {
        this.elm = elm;
    }
    public getActiveNav() {
        let activeNav = this.elm.querySelector(`${this.tabNav}.${this.activeClass}`);
        if (!activeNav) {
            activeNav = this.elm.querySelector(this.tabNav);
            let cls = activeNav.getAttribute("class") + " " + this.activeClass;
            activeNav.setAttribute("class", this.activeClass);
        }
        return activeNav;
    }  
    public init() {
        let activeNav = this.getActiveNav(),
            activeTargetId = activeNav.getAttribute("data-target");
        this.activeTarget(activeTargetId);
    }
    public activeTarget(activeTargetId: string) {
        let targets = this.elm.querySelectorAll(this.targetAttr),
            len = targets.length;
        for (let i = 0; i < len; i ++) {
            let target = targets[i];
            if (target.getAttribute(this.targetAttr) == activeTargetId) {
                this.show(<HTMLElement>target);
            } else {
                this.hide(<HTMLElement>target);
            }
        }
    }
    public show(target: HTMLElement) {
        $(target).addClass("show");
    }
    public hide(target: HTMLElement){
        $(target).removeClass("show");
    }
    public registerShowFunc(func: IToggleFunc) {
        this.show = func;
    }
    public registerHideFunc(func: IToggleFunc){
        this.hide = func;
    }
}