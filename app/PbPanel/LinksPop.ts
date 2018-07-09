import "./LinksPop.less";
import { StPopConfirm, StPopConfirmOption } from "../stpop/StPopConfirm";
import { local } from "../StUrl/StUrl";
interface Link{
    symbol: string;
    module_name: string;
    url: string;
}
export class LinksPop extends StPopConfirm{
    public getLinkUrl: string = local.updateTpAction('moduleList').getPart("href");
    public options:StPopConfirmOption = {
        header: "插件列表",
        body: "",
        classList: "stpop-links ",
        autoShow: false,
    };
    private links: Link[] = [];
    public inputGroup: HTMLElement;
    constructor() {
        super();
        this.ajaxToGetLinks();
    }
    public getLinks() {
        return this.links;
    }
    protected ajaxToGetLinks() {
        let linkPop = this;
        $.ajax({
            url: linkPop.getLinkUrl,
            dataType: "json",
            success(reply) {
                if (reply.code > 0) {
                    linkPop.links = reply.msg;
                }
            },
            error(err){
                console.error(err);
            }
        });
    }
    public getBody():string {
        let links = this.links,
            html = "";
        links.forEach(link => {
            if (link.url) {
                html += `
                    <div class="addon-link" data-symbol="${link.symbol}" data-url="${link.url}">${link.module_name}</div>
                `;
            }
        });
        return `<div class="addon-links-list">${html}</div>`;
    }
    public build(): this {
        let options = this.options;
        options.body =  this.getBody();
        options.suredFunc = () => {
            this.suredFunc();
        }
        this.buildConfirm(options);
        this.listenLinkClick();
        return this;
    }
    public show(): this {
        if (!this.elm) {
            this.build();
        }
        super.show();        
        return this;
    }
    protected listenLinkClick() {
        let body = this.getPart("body"),
            pop = this;
        $(body).on("click", `.addon-link`, function () {
            let selected = $(this).attr("select");
            if (selected == "it") {
                return ;
            }
            $(body).find('.addon-link').removeAttr('select');
            $(this).attr('select', 'it');
        });
    }
    public suredFunc() {
        let elm = this.getSelect();      
        if (elm) {
            let url = this.getUrlByElm(elm);
            console.log(url);
            if (this.inputGroup) {
                let input = <HTMLInputElement>this.inputGroup.querySelector('input'),
                    changeEvent = document.createEvent("HTMLEvents");
                input.value = url;
                console.log(input);
    
                console.log(changeEvent);
                changeEvent.initEvent("input", true, true);
                input.dispatchEvent(changeEvent);
            }
        }
    }
    public getAppUrlBySymbol(symbol: string) {
        return location.protocol + "//" + location.host + "/addons/execute/" + symbol + "-app-index?" + location.search;
    }
    public getUrlByElm(elm): string {
        let url = elm.getAttribute("data-url");
        if (!url) {
            let symbol = elm.getAttribute("data-symbol");
            url = this.getAppUrlBySymbol(symbol);
        }
        return url;
    }
    public getSelect(): HTMLElement {
        let body = this.getPart("body");
        return body.querySelector('.addon-link[select="it"]');
    }
    public bindElm(inputGroup: HTMLElement) {
        this.inputGroup = inputGroup;
    }
    public getInputGroup(elm: HTMLElement) {
        if ($(elm).hasClass("input-group")) {
            return elm;
        } else {
            return this.getInputGroup(<HTMLElement>elm.parentNode);
        }
    }
    public bindElmByChild(child: HTMLElement) {
        let inputGroup = this.getInputGroup(child);
        this.bindElm(inputGroup);        
    }
}
