import "./KeywordsPanel.less";

import { PbPanel } from "./PbPanel";
import { ImageInput } from "../ImageInput/ImageInput";
import { KeywordLinksPop, linksPop } from "./KeywordLinksPop";
import { local } from "../StUrl/StUrl";
import { StPopAlert } from "../stpop/StPopAlert";
interface IReplyMsg {
    img: string;
    title: string;
    url: string;
    index?: number;
}

export class KeyWordsPanel extends PbPanel {
    public headerStr: string = "请设置活动使用的关键词";
    public LinksPop: KeywordLinksPop = linksPop;
    public minReplyLength: number = 1;
    protected panelClass: string = "keywords-panel";
    public alert: StPopAlert = new StPopAlert({
        body: "",
        autoShow: false,
    });
    constructor() {
        super();
    }
    public getBodyHtml(): string {
        return `
            <div class="pbrow">
                <div class="keyword"></div>
            </div>
            <div class="pbrow">
                <div class="menu-list-box">
                    <div class="menu-list"></div>
                    <div class="text-center">
                        <button type="button" class="btn btn-sm btn-add-item">添加一条</button>
                    </div>
                </div>
                <div class="menu-item"></div>
            </div>
        `;
    }
    public createPanel(): HTMLDivElement {
        super.createPanel();
        this.setPanelHeader(this.headerStr);
        let newBody = this.getBodyHtml();
        this.setPanelBody(newBody);
        this.initKeyword();
        this.initReplyList();
        this.initEditMsg();
        this.initEvents();
        return this.panel;
    }
    protected initEvents() {
        this.initLinksClick();
        this.initAddItemInit();
    }
    protected initAddItemInit() {
        let btn = this.panel.querySelector('.btn-add-item'),
            panel = this;
        btn.addEventListener("click", function (event) {
            panel.clickAddItem(event);
        });
    }
    public clickAddItem(event: Event) {
        let list = this.panel.querySelector('.menu-list'),
            len = list.querySelectorAll('.menu-reply-item').length,
            reply:IReplyMsg = {
            img: "",
            url: location.href,
            title: "没有标题",
            index: len,
        };
        let div = this.createReplyItem(len, reply);
        list.appendChild(div);
        this.updateReplyItemEditor(reply, len);
    }
    protected initLinksClick() {
        let linksBtn = this.panel.querySelector(".btn-pop-links"),
            panel = this;
        linksBtn.addEventListener("click", function (event) {
            panel.clickLinkBtn(event, this);
        });
    }
    public clickLinkBtn(event: Event, elm: HTMLElement) {
        this.LinksPop.bindElmByChild(elm);
        this.LinksPop.show();
    }
    protected initKeyword() {
        let html = this.initKeywordHtml(),
            elm = this.body.querySelector('.keyword');
        elm.innerHTML = html;
        this.initEditKeywordEvt(elm);
    }
    public initEditKeywordEvt(elm: Element) {
        let panel = this,
            input = elm.querySelector('input[name="keywords"]');
        input.addEventListener('input', function () {
            let value = this.value;
            panel.checkKeywords(value, input);
        });
    }
    public checkKeywords(value: string, input: Element) {
        let panel = this,
            url = local.updateTpAction("checkKeyword").getPart("href");
         
        $.getJSON(url, { keywords: value }).done(function (reply) {
            if (reply.code > 0) {
                $(input).parent().parent().removeClass("error");
                $(input).parent().parent().find(".help-text").text("");
            } else {
                $(input).parent().parent().addClass("error");
                $(input).parent().parent().find(".help-text").text(reply.msg);
            }
        }).fail((err) => {
            console.error(err);
        });
    }
    public initKeywordHtml(): string {
        return `
            <div class="pbrow">
                <div class="left">
                    <input type="text" name="keywords">
                </div>
                <div class="left help-text"></div>
            </div>
            <div class="pbrow comment">
                <p>关键词: 来宾参加活动，扫码关注公众号后回复的口令。</p>
                <p>来宾扫码关注公众号后，在公众号内回复上面设置的关键词可以触发活动的入口，点击相应的功能参加活动。</p>
            </div>
        `;
    }
    protected initReplyList() {
        let html = this.initReplyListHtml(),
            elm = this.body.querySelector(".menu-list");
        elm.innerHTML = html;
    }
    protected initEditMsg() {
        let html = this.initEditMsgHtml(),
            elm = this.body.querySelector(".menu-item");
        elm.innerHTML = html;
        this.installImageInputOn(elm.querySelector('[data-type="image-input"]'));
        this.initEditorEvts(elm);
    }
    public initEditorEvts(elm: Element) {
        this.initEditTitleEvts(elm);
        this.initEditImgEvts(elm);
        this.initEditUrlEvts(elm);
        this.initEditDelEvts(elm);
    }
    public initEditDelEvts(elm) {
        let btn = elm.querySelector(".btn-del-item"),
            panel = this;
        btn.addEventListener("click", function () {
            let itemIndex = elm.getAttribute("item-index");
            panel.delItemByIndex(itemIndex);           
        });
    }
    public delItemByIndex(itemIndex: string) {
        let div = this.panel.querySelector(`.menu-list .menu-reply-item[item-index="${itemIndex}"]`),
            items = this.panel.querySelectorAll('.menu-list .menu-reply-item'),
            len = items.length;
        if (len <= this.minReplyLength) {
            this.alert.setBody(`至少要有${this.minReplyLength}个回复`);
            return ;
        }
        div.remove();
        this.resetItemIndex();
        let replyIndex = parseInt(itemIndex),
            nextReply =  this.panel.querySelector(`.menu-list .menu-reply-item[item-index="${replyIndex}"]`);
        if (!nextReply) {
            replyIndex = parseInt(itemIndex) - 1;
            nextReply = this.panel.querySelector(`.menu-list .menu-reply-item[item-index="${replyIndex}"]`)
        }
        let reply = this.replyItemDivToObj(<HTMLElement>nextReply);
        this.updateReplyItemEditor(reply, reply.index);
    }
    public resetItemIndex() {
        let items = this.panel.querySelectorAll('.menu-list .menu-reply-item'),
            len = items.length;
        for(let i = 0; i < len; i ++) {
            items[i].setAttribute("item-index", i.toString());
        }
    }
    public initEditImgEvts(elm: Element) {
        let panel = this;
        $(elm).find('[data-type="image-input"][input-name="reply_image"]').on("imageChange", function () {
            let itemIndex = elm.getAttribute("item-index"),
                div = panel.panel.querySelector(`.menu-list .menu-reply-item[item-index="${itemIndex}"]`);
            if (div) {
                let imageInput = <ImageInput>this["imageInput"],
                    imgSrc = imageInput.getValue();
                panel.updateReplyItemImg(div, imgSrc);
            }
        });
    }
    public initEditUrlEvts(elm: Element) {
        let panel = this;
        $(elm).find('input[name="link"]').on("input", function () {
            let itemIndex = elm.getAttribute("item-index"),
                div = panel.panel.querySelector(`.menu-list .menu-reply-item[item-index="${itemIndex}"]`),
                url = (<HTMLInputElement>this).value;
            panel.updateReplyItemUrl(div, url);
        });
    }
    public initEditTitleEvts(elm: Element) {
        let panel = this;
        $(elm).find('input[name="title"]').on("input", function () {
            let itemIndex = elm.getAttribute("item-index"),
                div = panel.panel.querySelector(`.menu-list .menu-reply-item[item-index="${itemIndex}"]`),
                title = (<HTMLInputElement>this).value;
            if (div) {
                panel.updateReplyItemTitle(div, title);
            }
        });
    }
    public installImageInputOn(elm: HTMLElement): ImageInput {
        return new ImageInput(elm);
    }
    public initReplyListHtml() {
        return ``;
    }
    public initEditMsgHtml() {
        return `
            <div class="pbrow">
                <label>标题</label>
                <div class="help-input">
                    <input type="text" name="title">
                    <div class="help-text"></div>
                </div>
            </div>
            <div class="pbrow">
                <label>图片</label>
                <div class="help-input">
                    <div data-type="image-input" input-value="" input-name="reply_image"></div>
                    <div class="help-text"></div>
                </div>
            </div>
            <div class="pbrow">
                <label>链接</label>
                <div class="help-input">
                    <div class="input-group">
                        <input type="text" name="link">
                        <div class="input-btn">
                            <button type="button" class="btn btn-sm btn-pop-links">选择链接</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="pbrow text-center">
                <button type="button" class="btn btn-sm btn-del-item">删除</button>
            </div>
        `;
    }
    public updateData(reply) {   
        this.setKeyword(reply.keyword);
        this.updateMenuList(reply.list);
    }
    public setKeyword(keyword) {
        let input = <HTMLInputElement>this.panel.querySelector('input[name="keywords"]');
        input.value = keyword;
    }
    public updateMenuList(list: IReplyMsg[]) {
        let parentNode = this.panel.querySelector(".menu-list"),
            num = list.length,
            replyItems = parentNode.querySelectorAll(".menu-reply-item");
        for (let index = 0; index < num; index++) {
            let node = replyItems[index],
                replyMsg = list[index];
            if (node) {
                this.writeReplyItemToDiv(node, replyMsg);
            } else {
                let newNode = this.createReplyItem(index, replyMsg);
                parentNode.appendChild(newNode);
            }
        }
        if (list[0]) {
            this.updateReplyItemEditor(list[0], 0);
        }
    }
    public updateReplyItemImg(div: Element, img: string) {
        let imgInput = <HTMLInputElement>div.querySelector('input[name="reply_text[img][]"]'),
            imgDiv = <HTMLImageElement>div.querySelector(".item-reply-img img");
        imgInput.value = img;
        imgDiv.src = img;
    }
    public updateReplyItemUrl(div: Element, url: string) {
        let urlInput = <HTMLInputElement>div.querySelector('input[name="reply_text[url][]"]');
        urlInput.value = url;
    }
    public updateReplyItemTitle(div: Element, title: string) {
        let titleInput = <HTMLInputElement>div.querySelector('input[name="reply_text[title][]"]'),
            titleDiv = <HTMLElement>div.querySelector(".item-reply-text");
        titleInput.value = title;
        titleDiv.innerText = title;
    }
    public writeReplyItemToDiv(div: Element, replyMsg: IReplyMsg) {
        this.updateReplyItemImg(div, replyMsg.img);
        this.updateReplyItemUrl(div, replyMsg.url);
        this.updateReplyItemTitle(div, replyMsg.title);
    }
    public createReplyItem(index: number, itemInfo: IReplyMsg): Element {
        let div = document.createElement("div");
        div.setAttribute("class", "menu-reply-item");
        div.setAttribute("item-index", index.toString());
        div.innerHTML = `
            <input type="hidden" name="reply_text[img][]" value="${itemInfo.img}">
            <input type="hidden" name="reply_text[url][]" value="${itemInfo.url}">
            <input type="hidden" name="reply_text[title][]" value="${itemInfo.title}">
            <div class="item-reply-text">${itemInfo.title}</div>
            <div class="item-reply-img">
                <img src="${itemInfo.img}" alt="${itemInfo.title}">
            </div>
        `;
        this.initItemClickEvt(div);
        return div;
    }
    public initItemClickEvt(replyItem: HTMLElement) {
        let panel = this;
        replyItem.addEventListener("click", function (event) {
            panel.clickReplyItem(event, replyItem);
        });
    }
    public replyItemDivToObj(div: HTMLElement): IReplyMsg {
        let img = (<HTMLInputElement>div.querySelector('input[name="reply_text[img][]"]')).value,
            url = (<HTMLInputElement>div.querySelector('input[name="reply_text[url][]"]')).value,
            title = (<HTMLInputElement>div.querySelector('input[name="reply_text[title][]"]')).value,
            index = parseInt(div.getAttribute("item-index"));
        return {
            img: img,
            url: url,
            title: title,
            index: index
        };
    }
    public clickReplyItem(event: Event, replyItem: HTMLElement) {
        let replyMsg = this.replyItemDivToObj(replyItem);
        this.updateReplyItemEditor(replyMsg, replyMsg.index);
    }
    public updateReplyItemEditor(replyMsg: IReplyMsg, index: number): this {
        let editor = this.panel.querySelector('.menu-item'),
            titleInput = <HTMLInputElement>editor.querySelector('input[name="title"]'),
            imageInput = <ImageInput>editor.querySelector('[input-name="reply_image"][data-type="image-input"]')["imageInput"],
            urlInput = <HTMLInputElement>editor.querySelector('input[name="link"]');
        editor.setAttribute("item-index", index.toString());
        titleInput.value = replyMsg.title;
        urlInput.value = replyMsg.url;
        imageInput.setValue(replyMsg.img);
        return this;
    }
}