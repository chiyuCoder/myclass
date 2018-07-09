import "./AccountsPanel.less";
import { PbPanel } from "./PbPanel";
import { RadioGroup } from "../RadioGroup/RadioGroup";
import { StPopConfirm } from "../stpop/StPopConfirm";
import { StPopAlert } from "../stpop/StPopAlert";

type IAccountType = "official" | "private";

interface IType {
    name: string;
    symbol: string;
};
interface IAccount {
    id: number;
    name: string;
    avatar: string;
    is_public?: 0 | 1;
}
export class AccountsPanel extends PbPanel {
    protected panelClass: string = "accounts-panel";
    private onPage: number = 1;
    public types: IType[] = [
        {
            name: "使用官方公众号",
            symbol: "official",
        },
        {
            name: "使用自己的公众号",
            symbol: "private",
        }
    ];
    public defaultTypeSymbol: string = "private";
    public headerStr: string = "请选择活动使用的公众号";
    public radioName: string = "accouts_type";
    public classSelector = {
        types: "types",
        subTitle: "subTitle",
        searcher: 'searcher',
        pager: "pager",
        list: "list",
        addItem: 'add-item',
        selectedItem: 'selected-item',
        comment: 'comment'
    };
    private textParts: string[] = ["subTitle", "comment"];
    public prevPage: string = "上一页";
    public nextPage: string = "下一页";
    public subTitle: string = "我的公众号";
    public comment: string = "请搜索公众号的名字，选择活动使用的公众号。必须先授权活动使用的公众号，才可以搜索到！";
    public ajaxSearchUrl: string = location.protocol + "//" + location.host + "/admin/base/accountList";
    private selectedAccountId: number;
    public alert: StPopAlert = new StPopAlert({
        body: "",
        autoShow: false,
    });
    constructor() {
        super();
    }
    public getBodyHtml(): string {
        return `
            <div class="${this.classSelector.types} pbrow"></div>
            <div class="pbrow">
                <div class="left accounts">
                    <div class="${this.classSelector.searcher} pbrow"></div>
                    <div class="${this.classSelector.list} pbrow"></div>
                    <div class="pbrow">
                        <div class="${this.classSelector.comment}"></div>
                        <div class="${this.classSelector.addItem}"></div>
                    </div>
                </div>
                <div class="left">
                    <div class="${this.classSelector.pager}"></div>
                </div>
                <div class="left ${this.classSelector.selectedItem}"></div>
            </div>
            <div class="test-elm"></div>
        `;
    }
    public createPanel(): HTMLDivElement {
        super.createPanel();
        this.setPanelHeader(this.headerStr);
        let newBody = this.getBodyHtml();
        this.setPanelBody(newBody);
        this.buildOtherParts();
        return this.panel;
    }
    protected getData() {
        this.autoAjaxSearcher();
    }
    protected buildOtherParts() {
        this.addTypeSwitches();
        this.updateTextParts();
        this.addSearcher();
        this.addPager();
        this.addItemAddBtn();
        window["count"] = 1;
    }
    public initAddItemHtml(): string {
        return `
            <button type="button" class="btn btn-sm btn-add-item">添加新公众号</button>
        `;
    }
    public initSearcherHtml(): string {
        return `
            <label>公众号名称</label>
            <div class="search-group">
                <div class="search-by">
                    <input type="text" name="search-by">
                </div>
                <div class="search-btn">
                    <button type="button" class="pbfont pbfont-search"></button>
                </div>
            </div>
        `;
    }
    public initPagerHtml(): string {
        return `
            <button type="button" class="prev-page btn btn-sm">${this.prevPage}</button>
            <button type="button" class="next-page btn btn-sm">${this.nextPage}</button>
        `;
    }
    public initAddBtnEvts(addBtnParent: HTMLElement) {
        let panel = this;
        $(addBtnParent).on("click", ".btn-add-item", function () {
            let addAccountUrl = location.protocol + "//" + location.host + "/admin/publics/binding"
            window.open(addAccountUrl, "_blank");
            let confirmPop = new StPopConfirm({
                body: `已完成公众号的新增？点击"新增完成"便会刷新公众号列表`,
                sureBtn: "新增完成",
                cancelBtn: "取消新增",
                suredFunc() {
                    panel.ajaxSearcher("private");
                }
            });
        });
    }
    protected addItemAddBtn() {
        let div = <HTMLElement>this.panel.querySelector(`.${this.classSelector.addItem}`);
        if (div) {
            div.innerHTML = this.initAddItemHtml();
            this.initAddBtnEvts(div);
        }
    }
    protected addSearcher() {
        let div = this.panel.querySelector(`.${this.classSelector.searcher}`);
        if (div) {
            div.innerHTML = this.initSearcherHtml();
            this.listenSearchClick(div);
        }
    }
    protected listenSearchClick(div: Element) {
        let btn = div.querySelector('.search-btn button'),
            panel = this;
        btn.addEventListener("click", function () {
            panel.searchClick(this);
        });
    }
    public searchClick(elm: HTMLElement) {
        let page = 1;
        this.autoAjaxSearcher(page);
    }
    protected addPager() {
        let div = this.panel.querySelector(`.${this.classSelector.pager}`);
        if (div) {
            div.innerHTML = this.initPagerHtml();
            this.listenPageClick(div);
        }
    }
    protected listenPageClick(div: Element) {
        let panel = this;
        $(div).on("click", ".btn", function () {
            let pageIndex = this.getAttribute("index");
            panel.changePageTo(parseInt(pageIndex), this);
        });
    }
    public changePageTo(pageIndex: number, elm: Element) {
        if (pageIndex) {
            this.autoAjaxSearcher(pageIndex);
        }
    }
    public getSelectedType() {
        let typesDiv = this.body.querySelector(`.${this.classSelector.types} .type-switchers`);
        return typesDiv["radioGroup"].getInputValue();
    }
    public setSelectedType(type: IAccountType) {
        let typesDiv = this.body.querySelector(`.${this.classSelector.types} .type-switchers`),
            radioGroup = typesDiv["radioGroup"];
        radioGroup.setInputValue(type);
    }
    public getSearchText() {
        let elm = <HTMLInputElement>this.body.querySelector(`.${this.classSelector.searcher} input[name="search-by"]`);
        return elm.value;
    }
    public autoAjaxSearcher(page: number = 1) {
        let selectedType = this.getSelectedType(),
            text = this.getSearchText();
        this.ajaxSearcher(selectedType, text, page);
    }
    public ajaxSearcher(type: string, searchText: string = '', page: number = 1) {
        let panel = this;
        $.ajax({
            url: panel.ajaxSearchUrl,
            data: {
                type: type,
                text: searchText,
                page: page
            },
            type: "POST",
            success(reply) {
                if (reply.code > 0) {
                    panel.onPage = page;
                    panel.dealSearchReaply(reply);
                } else {
                    panel.alert.setBody(reply.msg).setAlertType("error").show();
                }
            },
            error(err) {
                console.error(err);
            }
        });
    }
    public dealSearchReaply(reply) {
        this.clearAccountList();
        let list = <IAccount[]>reply.msg.list;
        list.forEach(account => {
            this.addAccountItemDiv(account);
        });
        this.showPageBtn(<number>reply.msg.page);
    }
    public showPageBtn(totalPageNum: number) {
        let pager = this.panel.querySelector(`.${this.classSelector.pager}`);
        if (totalPageNum <= 1) {
            $(pager).fadeOut();
        } else {
            $(pager).fadeIn();
            let prevPage = pager.querySelector(`.prev-page`),
                nextPage = pager.querySelector(`.next-page`);
            if (this.onPage <= 1) {
                $(prevPage).slideUp();
            } else {
                $(prevPage).slideDown();
                $(prevPage).attr("index", this.onPage - 1);
            }
            if (this.onPage >= totalPageNum) {
                $(nextPage).slideUp();
            } else {
                $(nextPage).slideDown();
                $(nextPage).attr("index", this.onPage + 1);
            }
        }
    }
    public clearAccountList() {
        let list = this.panel.querySelector(`.${this.classSelector.list}`);
        list.innerHTML = '';
    }
    protected addAccountItemDiv(account: IAccount) {
        let accountDiv = this.getAccountItemDiv(account);
        let listDiv = this.panel.querySelector(`.${this.classSelector.list}`);
        if (listDiv) {
            listDiv.appendChild(accountDiv);
            this.listenAccountClick(accountDiv);
        }
    }
    public listenAccountClick(accountDiv: Element) {
        let panel = this;
        accountDiv.addEventListener("click", function () {
            let selected = this.getAttribute("select");
            if (selected == "it") {
                return;
            } else {
                let items = this.parentNode.querySelectorAll(`.account-item`),
                    len = items.length;
                for (let i = 0; i < len; i++) {
                    items[i].removeAttribute("select");
                }
                this.setAttribute("select", "it");
                panel.selectAccountByDiv(accountDiv);
            }
        });
    }
    public accountDivToObj(accountDiv: Element): IAccount {
        let avatar = accountDiv.querySelector("img").src,
            name = (<HTMLElement>accountDiv.querySelector(".account-figcaption")).innerText,
            id = accountDiv.getAttribute("data-id");
        return {
            avatar: avatar,
            name: name,
            id: parseInt(id)
        };
    }
    public selectAccountByDiv(accountDiv: Element) {
        let accountObj = this.accountDivToObj(accountDiv);
        this.showSelectedAccount(accountObj);
    }
    public initSelectedAccountHtml(accountObj: IAccount) {
        return `
            <div class="title">已选公众号：</div>
            <div class="account-item">
                <input type="hidden" name="selected_account" value="${accountObj.id}">    
                <div class="account-figure">
                    <img src="${accountObj.avatar}" alt="${accountObj.name}">
                </div>
                <div class="account-figcaption">${accountObj.name}</div>     
            </div>
        `;
    }
    public replaceSelectAccountBy(accountObj: IAccount) {
        let elm = this.panel.querySelector(`.${this.classSelector.selectedItem}`).querySelector('.account-item');
        let input = <HTMLInputElement>elm.querySelector('input[name="selected_account"]'),
            img = <HTMLImageElement>elm.querySelector('.account-figure img'),
            name = <HTMLDivElement>elm.querySelector('.account-figcaption');
        input.value = accountObj.id.toString();
        img.src = accountObj.avatar;
        img.alt = accountObj.name;
        name.innerText = accountObj.name;
    }
    public showSelectedAccount(accountObj: IAccount) {
        let box = this.panel.querySelector(`.${this.classSelector.selectedItem}`);
        if (box) {
            let elm = box.querySelector('.account-item');
            if (elm) {
                this.replaceSelectAccountBy(accountObj);
            } else {
                box.innerHTML = this.initSelectedAccountHtml(accountObj);
            }
        }
    }
    public getAccountItemDiv(account: IAccount): Element {
        let div = document.createElement("div");
        div.setAttribute("class", "account-item");
        div.setAttribute("data-id", account.id.toString());
        if (account.id == this.selectedAccountId) {
            div.setAttribute("select", "it");
        }
        div.innerHTML = `
            <div class="account-figure">
                <img src="${account.avatar}" alt="${account.name}">
            </div>
            <div class="account-figcaption">${account.name}</div>
        `;
        return div;
    }
    protected updateTextParts() {
        let textParts = this.textParts,
            panel = this,
            selectors = this.classSelector;
        textParts.forEach(elm => {
            this.updateTextNode(selectors[elm], panel[elm]);
        });
    }
    protected updateTextNode(classSelector, text) {
        let node = this.panel.querySelector(`.${classSelector}`);
        if (node && text) {
            node.innerHTML = text;
        }
    }
    protected addTypeSwitches() {
        let typeSwitchers = this.buildTypeSwitchers();
        let typesDiv = this.body.querySelector(`.${this.classSelector.types}`);
        if (typesDiv) {
            typesDiv.appendChild(typeSwitchers);
            this.listenTypeChangeEvt(typesDiv);
        }
    }
    protected listenTypeChangeEvt(elm: Element) {
        let typesGroup = elm.querySelector('.type-switchers'),
            panel = this;
        if (typesGroup) {
            $(typesGroup).on("radioChange", function (event) {
                let value = this.getAttribute("input-value");
                panel.typeChanged(value, this);
            });
        }
    }
    public typeChanged(type: string, elm: Element) {
        this.clearSearchInput();
        this.ajaxSearcher(type);
    }
    public clearSearchInput() {
        let serachInput = <HTMLInputElement>this.panel.querySelector(`.${this.classSelector.searcher} .search-by input`);
        serachInput.value = "";
    }
    public getPartElm(elmSymbol: string): Element {
        let classSelector = this.classSelector[elmSymbol];
        if (classSelector) {
            return this.body.querySelector(classSelector);
        }
    }
    protected buildTypeSwitchers(): Element {
        let typeSwitchers = document.createElement("div"),
            html = "";
        typeSwitchers.setAttribute("class", "type-switchers");
        typeSwitchers.setAttribute('data-type', "radio-group");
        typeSwitchers.setAttribute("input-name", this.radioName);
        if (this.defaultTypeSymbol) {
            typeSwitchers.setAttribute("input-value", this.defaultTypeSymbol);
        }
        this.types.forEach(elm => {
            html += this.getTypeHtml(elm);
        });
        typeSwitchers.innerHTML = html;
        typeSwitchers["radioGroup"] = new RadioGroup(typeSwitchers);
        return typeSwitchers;
    }
    public getTypeHtml(elm: IType): string {
        return `
            <div data-type="radio" input-name="${this.radioName}" input-value="${elm.symbol}">${elm.name}</div>
        `;
    }
    public updateData(account: IAccount = undefined) {
        if (account) {
            this.selectAccountById(account.id);
            this.showSelectedAccount(account);
            let type: IAccountType = "official";
            if (account.is_public) {
                type = "private";
            }
            this.setSelectedType(type);
            this.autoAjaxSearcher();
        }
    }
    public selectAccountById(accountId: number) {
        if (accountId) {
            let dataId = accountId.toString();
            this.selectedAccountId = accountId;
        }
    }
    public updateSelectedAccount() {
        let panel = this.panel.querySelector(`.${this.classSelector.list} .account-item[data-id="${this.selectedAccountId.toString()}"]`);
        if (panel) {
            panel.setAttribute("select", "it");
        }
    }
}
