import "./StPopImage.less";

import { StPopConfirmOption, StPopConfirm } from "./StPopConfirm";
import { StPopAlert } from "./StPopAlert";
import { StPopMsg } from "./StPopMsg";
import { StUploader } from "../StUploader/StUploader";
import { StPage } from "../StPage/StPage";
interface StPopImageOption {
    header: string;
    suredBtn: string;
    cancelBtn: string;
    classList: string;
    clickToHide: boolean;
    closeIsAnime: boolean;
    moveable: boolean;
    autoShow: boolean;
}
interface imgItem {
    src: string;
    'img-id': string;
    [attr: string]: any;
}
export class StPopImage extends StPopConfirm {
    public options: StPopImageOption = {
        header: "选择图片",
        suredBtn: "确定",
        cancelBtn: "取消",
        classList: " stpop-image ",
        clickToHide: true,
        closeIsAnime: true,
        moveable: true,
        autoShow: false,
    };
    public loadItemsUrl: string = location.protocol + "//" + location.host + "/admin/basis/imgLists";
    public upFileUrl: string = location.protocol + "//" + location.host + "/admin/basis/imgLists";
    public loadServer: string = "local";
    protected bindElm: HTMLElement;//优先级比bindInput高
    protected bindInput: HTMLInputElement;
    public alert: StPopAlert = new StPopAlert({
        body: "",
        autoShow: false
    });
    public msg: StPopMsg = new StPopMsg({
        msg: "",
        autoShow: false
    });
    public uploader: StUploader = new StUploader();
    public pager: StPage = new StPage();
    constructor() {
        super();
        this.resetUploader();
        this.resetPager();
    }
    protected resetPager() {
        this.pager.switchTo = (index) => {
            this.loadItems(index);
        }
    }
    protected resetUploader() {
        let imagePop = this;
        this.uploader.upFileSuccess = (reply) => {
            imagePop.upFileSuccess(reply);
        }
    }
    public upFileSuccess(reply) {
        this.uploader.progressor.done();
        this.loadItems();
    }
    protected toConfirmOpt(): StPopConfirmOption {
        let imgPop = this,
            options: StPopConfirmOption = {
                body: imgPop.initBodyHtml(),
                suredFunc: function () {
                    imgPop.suredFunc();
                },
                canceledFunc: function () {
                    imgPop.canceledFunc();
                }
            };
        for (let prop in imgPop.options) {
            options[prop] = imgPop.options[prop];
        }
        return options;
    }
    public build() {
        if (this.hasBuiltOne) {
            return;
        }
        let option = this.toConfirmOpt();
        this.buildConfirm(option);
        this.initImagePopEvents();
        this.initPage();
    }
    public initPage() {
        let pager = <HTMLElement>this.getPart("body").querySelector(".pagers");
        this.pager.bindBox(pager);
    }
    protected initImagePopEvents() {
        this.initFileChangeEvents();
        this.initSelectEvents();
    }
    protected initSelectEvents() {
        let imgPop = this,
            popBody = this.getPart("body");
        $(popBody).on('click', '.imgs-list .img-box .img-item', function () {
            imgPop.changeSelect(this);
        });
    }
    public changeSelect(elm: HTMLElement) {
        let selectedStatus = elm.getAttribute("select"),
            popBody = this.getPart("body");
        if (selectedStatus) {
            return;
        } else {
            $(popBody).find('.imgs-list .img-box .img-item').removeAttr("select");
            elm.setAttribute("select", "it");
        }
    }
    protected initFileChangeEvents() {
        let inputs = this.elm.querySelectorAll(`.btn-file input[type="file"]`),
            len = inputs.length,
            imgPop = this;
        for (let i = 0; i < len; i++) {
            inputs[i].addEventListener('change', function (event) {
                imgPop.installProgress();
                imgPop.uploader.evtFileChange(event, this);
                imgPop.uploader.progressor.autoStep();
            });
        }
    }
    public installProgress() {
        let progressor = this.uploader.progressor;
        progressor.init();
        let body = this.elm.querySelector(".stpop-body"),
            node = body.querySelector(".imgs-box");
        body.insertBefore(progressor.elm, node);
    }
    public showExtractPanel() {
        let imgList = this.elm.querySelector(".imgs-list"),
            pagerBox = this.elm.querySelector(".pagers");
        if (imgList) {
            imgList.innerHTML = `
                <input type="text" class="extract-from" placeholder="请在这里输入图片网址">
            `;
        }
        if (pagerBox) {
            pagerBox.innerHTML = `
                <button type="button" class="btn">提取</button>
            `;
        }
    };
    public initBodyHtml(): string {
        // <li server="wechat" title="微信">微信</li>
        // <li server="extract"  title="提取网络图片">提取网络图片</li>
        return `
            <div class="pbrow">
                <div class="left">
                    <ul class="servers list-horizontal">
                        <li server="local"  title="本地服务器">本地服务器</li>
                    </ul>
                </div>
                <div class="right">
                    <button type="button" class="btn btn-file">
                        <input type="file">
                        <span>上传图片</span>
                    </button>
                </div>
            </div>
            <div class="imgs-box">
                <div class="imgs-list"></div>
                <div class="pagers"></div>
            </div>
        `;
    }
    public suredFunc() {
        let selectedElm = this.getPart("body").querySelector('.img-item[select="it"]');
        if (selectedElm) {
            let selectedSrc = selectedElm.getAttribute("img-src");
            this.assignValue(selectedSrc);
        }
    }
    public assignValue(src: string) {
        if (this.bindElm) {
            let inputName = this.bindInput.getAttribute("name");
            let imgs = this.bindElm.querySelectorAll(`img[data-input="${inputName}"]`),
                imgLen = imgs.length;
            for (let i = 0; i < imgLen; i++) {
                (<HTMLImageElement>imgs[i]).src = src;
            }
        }
        if (this.bindInput) {
            this.bindInput.value = src;
        }
        this.clearBind();
    }
    public clearBind() {
        this.bindElm = undefined;
        this.bindInput = undefined;
    }
    public canceledFunc() {

    }
    public show(): this {
        if (!this.onShowing) {
            this.loadItems();
            super.show();
        }
        return this;
    }
    protected loadItems(page: number = 1) {
        let imgPop = this,
            server = this.loadServer;
        $.ajax({
            url: imgPop.loadItemsUrl,
            data: {
                server: server,
                page: page
            },
            dataType: 'json',
            success(reply) {
                // console.log(reply);
                let totalPage = reply.page,
                    list = <imgItem[]>reply.list;
                imgPop.listAllItems(list);
                imgPop.addPage(totalPage, page)
            },
            error(err) {
                console.error(err);
                imgPop.alertMsg("获取图片列表程序被怪兽阻止了");
            }
        });
    }
    public addPage(totalPage: number, page: number = 1) {
        this.pager.build(totalPage, page);
    }
    public initItemHTML(img: imgItem) {
        let attrVal;
        attrVal = ' ';
        for (let attr in img) {
            attrVal += ` ${attr}="${img[attr]}"`;
        }
        return `
            <div class="img-box" ${attrVal}>
                <div class="pbfont pbfont-close"></div>
                <div img-id="${img['img-id']}" class="img-item" img-src="${img.src}" style="background-image:url('${img.src}');">
                </div>
            </div>        
        `;
    }
    protected listAllItems(list: imgItem[]) {
        let listHTML = '',
            imgPop = this;
        if ((list instanceof Array) && (list.length > 0)) {
            list.forEach(elm => {
                listHTML += this.initItemHTML(elm);
            });
        } else {
            listHTML = '<div class="when-empty">当前没有图片</div>';
        }
        let imgList = this.elm.querySelector(".imgs-list");
        if (imgList) {
            imgList.innerHTML = listHTML;
        }
        this.centerBox();
    }
    protected alertMsg(errMsg: string, type: string = "error") {
        this.alert.setBody(errMsg).setAlertType(type).show();
    }
    protected notice(errMsg: string, type: string = "normal") {
        this.msg.setBody(errMsg).setMsgType(type).show();
    }
    public setBindElm(elm: HTMLElement, input: HTMLInputElement = undefined) {
        this.bindElm = elm;
        if (input) {
            this.bindInput = input;
        } else {
            this.bindInput = elm.querySelector('input');
        }
    }
    public setBindInput(input: HTMLInputElement) {
        this.bindElm = undefined;
        this.bindInput = input;
    }
}