import "./NavBall.less";

import { local } from "../StUrl/StUrl";
import { MoveElm } from "../MoveElm/MoveElm";
import { strToInt } from "../../func/func";
interface IModule {
    symbol: string;
}
interface IAjaxReply {
    code: number;
    msg: any
}
interface IAjaxModules extends IAjaxReply {
    msg: IModule[]
}
export class NavBall {
    public reqUrl = local.updateAddonAction('getAppModules').getPart("href");
    public numInAlistPage: number = 12;
    protected hasWritten: boolean = false;
    public exclude: string[] = [
        "verifyform",
        "infoform",
    ];
    public swicther: string = "#navball";
    protected modules: IModule[] = [];
    protected appModules: IModule[] = [];
    protected totalPage: number = 0;
    public listBox: HTMLElement = document.getElementById("nav-list");
    public pageWidth: number;
    public mvElm: MoveElm;
    public mvBall: MoveElm;
    protected requested: boolean = false;
    protected requestAllNav() {
        if (this.requested) {
            return ;
        }
        this.requested = true;
        return $.getJSON(this.reqUrl).then((data: IAjaxModules) => {
            this.modules = data.msg;
            this.appModules = this.excludeModules(this.modules);
            this.writeOnDom();
        }).catch(err => {
            console.error(err);
        });
    }
    protected excludeModules(modules: IModule[]) {
        let appModules = [];
        for (let app of modules) {
            if (this.exclude.indexOf(app.symbol) < 0) {
                appModules.push(app);
            }
        }
        return appModules;
    }
    public loadData() {
        if (!this.hasWritten) {
            this.requestAllNav();
        }
    }
    public getDefaultIcon(sym: string): string {
        return location.protocol + "//" + location.host
            + `/public/styles/proDefault/imgs/app/${sym}.png`;
    }
    protected getAppItem(app) {
        let aElm = document.createElement("a");
        aElm.setAttribute("class", "app-item");
        aElm.setAttribute("href", this.getHref(app.symbol));
        aElm.innerHTML = `
            <div class="app-figure">
                <img src="${app.icon}"  onerror="this.src=\'${this.getDefaultIcon(app.symbol)}\';"/>
            </div>
            <div class="app-figcaption">${app.module_name}</div>
        `;
        return aElm;
    }
    public getHref(sym: string): string {
        return local.updateTpAction(`${sym}-app-index`).getPart("href");
    }
    protected writeOnDom() {
        if (this.hasWritten) {
            return ;
        }
        this.hasWritten = true;
        let listBox = this.listBox;
        let listElm = document.createElement("div"),
            modules = this.appModules,
            len = this.appModules.length,
            pageIndex = 0;
        listElm.setAttribute("class", "app-list");
        for (let itemIndex = 0; itemIndex < len; itemIndex++) {
            pageIndex = Math.floor(itemIndex / this.numInAlistPage);
            let appListPage = this.getAppListPage(listElm, pageIndex),
                item = this.getAppItem(modules[itemIndex]);
            appListPage.appendChild(item);
        }
        this.totalPage = pageIndex + 1;
        listBox.querySelector(".nav-list-body").appendChild(listElm);
        this.setListBoxWidth();
        this.enMoveElm(listElm, pageIndex);
        this.activeListOrder();
    }
    protected enMoveElm(elm, maxIndex) {
        let mvElm = new MoveElm(elm, "left");
        let pageWidth = this.pageWidth,
            $this = this;
        this.mvElm = mvElm;
        mvElm.moveEnd = (endPoint) => {
            let movedLeft = 0 - endPoint.x,
                pageIndex = Math.round(movedLeft / pageWidth),
                endLeft = 0;
            if (pageIndex < 0) {
                pageIndex = 0;
            }
            if (pageIndex > maxIndex) {
                pageIndex = maxIndex;
            }
            endLeft = 0 - pageIndex * pageWidth;
            mvElm.animeLeft(endLeft + "px");
            $this.activeListOrder(pageIndex);
        }
    }
    protected setListBoxWidth() {
        let num = this.totalPage;
        let pageWidth = window.innerWidth,
            listWidth = Math.ceil(pageWidth * num);
        $(this.listBox).find('.nav-list-body .app-list').width(listWidth);
        $(this.listBox).find('.nav-list-body .app-list .app-list-page').each((index, elm) => {
            $(elm).width(pageWidth);
        });
        this.pageWidth = pageWidth;
    }
    protected createAppPageOrder(pageIndex) {
        let order = document.createElement("li");
        order.setAttribute("page-index", pageIndex);
        let orderList = this.listBox.querySelector('.nav-list-footer ol');
        orderList.appendChild(order);
    }
    protected createAppListPage(listElm, pageIndex) {
        let page = document.createElement("div");
        page.setAttribute("class", "app-list-page");
        page.setAttribute("page-index", pageIndex);
        listElm.appendChild(page);
        this.createAppPageOrder(pageIndex);
        return page;
    }
    public activeListOrder(orderIndex = 0) {
        let orders = $(this.listBox).find(".nav-list-footer ol li");
        $(orders).each((index, elm) => {
            if (orderIndex == index) {
                $(elm).addClass("active");
            } else {
                $(elm).removeClass("active");
            }
        });
    }
    protected getAppListPage(listElm, pageIndex): HTMLElement {
        let pageElm = listElm.querySelector(`.app-list-page[page-index="${pageIndex}"]`);
        if (!pageElm) {
            pageElm = this.createAppListPage(listElm, pageIndex);
        }
        return pageElm;
    }
    protected setMoveBallRange() {
        let moveBall = this.mvBall;
        if (moveBall) {
            this.mvBall
                .setLeftRange(0, window.innerWidth - $(moveBall.elm).width())
                .setTopRange(0, window.innerHeight - $(moveBall.elm).height());
        }
    }
    public toMoveBall() {
        let moveBall = new MoveElm(this.swicther);
        this.mvBall = moveBall;
        this.setMoveBallRange();
        moveBall.moveEnd = (endPoint) => {
            if (endPoint.x < window.innerWidth / 2) {
                moveBall.animeLeft(0);
            } else {
                let range = moveBall.maxLeft - moveBall.minLeft;
                moveBall.animeLeft(range / window.innerWidth * 100 + "%");
            }
            let percent = endPoint.y / window.innerHeight * 100;
            moveBall.elm.css({
                top: percent + "%"
            });
        }
    }
    public modifyActiveOrder() {
        let activeOrderItem = this.listBox.querySelector('.nav-list-footer ol li.active');
        if (activeOrderItem) {
            let activeOrder = strToInt(activeOrderItem.getAttribute("page-index")),
                pageWidth = this.pageWidth,
                endLeft = 0 - activeOrder * pageWidth;
            this.mvElm.elm.animate({
                left: endLeft + "px"
            });
        }
    }
    public resize() {
        this.setListBoxWidth();
        this.modifyActiveOrder();
        this.setMoveBallRange();
    }
}