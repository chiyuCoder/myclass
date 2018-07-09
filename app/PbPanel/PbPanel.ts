import "./PbPanel.less";
type elmSel = Element | string;
export class PbPanel {
    private classname = {
        panel: "pb-panel"
    };
    protected panelClass: string = "";
    public panel: HTMLDivElement;
    protected header: Element;
    protected body: Element;
    public createPanel(): HTMLDivElement {
        let div = document.createElement("div");
        div.setAttribute("class", this.classname.panel + " " + this.panelClass);
        div.innerHTML = `
            <div class="pb-panel-header"></div>
            <div class="pb-panel-body"></div>
        `;
        this.panel = div;
        this.body = div.querySelector(".pb-panel-body");
        this.header = div.querySelector(".pb-panel-header");
        return this.panel;
    }
    public getChildNode(partSelector: elmSel): Element {
        if (typeof partSelector == "string") {
            return this.panel.querySelector(partSelector);
        }
        return partSelector;
    }
    public updatePanelPart(partSelector: elmSel, newHtml: string): Element {
        let elm = this.getChildNode(partSelector);
        if (elm) {
            elm.innerHTML = newHtml;
        }
        return elm;
    }
    public setPanelHeader(headerStr: string) {
        let div = this.updatePanelPart(".pb-panel-header", headerStr);
        this.header = div;
    }
    public setPanelBody(bodyStr: string) {
        let div = this.updatePanelPart(".pb-panel-body", bodyStr);
        this.body = div;
    }
    public getPanelBody(): Element {
        return this.body;
    }
    public getPanelHeader(): Element {
        return this.header;
    }
}