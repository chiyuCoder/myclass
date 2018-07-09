import "./BulletScreen.less";
import { local } from "../StUrl/StUrl";
import { Bullet } from "./Bullet";
import { rand } from "../../func/num";
interface IMaterial{

};
type showStatus = "hide" | "show";
let timer;
export class BulletScreen {
    public divId:string = "bullet-screen";
    public dataUrl:string = local.updateTpAction('wallmessage-show-getAllMsgs').getPart("href");
    protected materials: IMaterial[] = []; //子弹原料（数据）组成的数组
    protected newMaterials:IMaterial[] = []; //新添加的子弹原料（数据）组成的数组
    public parentNode:HTMLElement = document.body; //父级节点，#type=>HTMLElement;
    public switcher:string = "#bullet-screen-switcher"; //切换是否显示此屏的开关，#type=>string
    public requestDelay:number = 400; //请求数据间隔时间
    public maxBulletId: number = 0; //最大子弹原料id
    public trackHeight: number = 80; //trackHeight
    public trackNum:number = 1; //全屏共分为多少个轨道
    public maxTrackNum: number = 8; //全屏最多分为多少个轨道
    public interval:number = 500; //每隔多少ms添加一个子弹
    protected prevBulletOnTrack:Bullet[] = []; //该轨道最新插入的子弹实例
    public marginLeftRange = { //同一轨道的两个子弹的间距范围,仅当两个子弹实例可能覆盖时有效
        min: 60,
        max: 200,
    };
    public maxShowBulletNum:number = 16; //最多同时有多少个子弹实例
    public screenPaddingTop: number = 120; //第一轨道距上部多少px
    public screenPaddingBottom: number = 80; //最后一条轨道距下部最少多少px
    public trackPaddingTop:number = 5; //track padding-top: 多少px;
    protected hasInstalled: boolean = false; //是否已经初始化
    protected hasPrepared:boolean = false;//是否已经准备好环境
    public storageKey:string =  `bullet_screen_${local.getQueryValue("acid")}`;
    protected screen: HTMLElement;
    public needData: boolean = true;//是否需要继续请求数据
    protected loadData() {
        return $.getJSON(this.dataUrl, { msgId: this.maxBulletId }).then(msgs => {
            let msgsList = msgs.msg;
            if (msgs.code > 0) {
                if ($.isArray(msgsList) && msgsList.length > 0) {
                    this.newMaterials = this.newMaterials.concat(msgsList);
                    this.maxBulletId = msgsList[msgsList.length - 1].id;
                }
                this.toLoadData();
            } else {
                this.hide();
                $(this.switcher).remove();
            }
        }).catch(err => {
            console.error(err);
            this.toLoadData();
        });
    }
    public toLoadData() {
        if (this.needData) {
            setTimeout(() => {
                this.loadData();
            }, this.requestDelay);
        }
    }
    protected getPanel(): HTMLElement {
        let panel = document.createElement("div");
        panel.id = this.divId;
        return panel;
    }
    protected divideTracks() {
        let height = this.screen.offsetHeight - this.screenPaddingTop - this.screenPaddingBottom,
            trackNum = Math.floor(height / this.trackHeight);
        if (trackNum > this.maxTrackNum) {
            trackNum = this.maxTrackNum;
            this.trackHeight = Math.floor(height / trackNum);
        }
        this.trackNum = trackNum;
    }
    public getShowStatus(): showStatus {
        return <showStatus>sessionStorage.getItem(this.storageKey);
    }
    public setShowStatus(nextStatus: showStatus) {
        $(this.switcher).attr("switch-to", nextStatus);
        sessionStorage.setItem(this.storageKey, nextStatus);
    }
    public init() {//程序启动入口
        if (!this.hasInstalled) {
            let panel = this.getPanel();
            this.parentNode.appendChild(panel);
            this.screen = panel;
            this.addSwitcherEvents();
            this.initShowStatus();
        }
    }
    private initShowStatus() {
        let nextStatus = this.getShowStatus();
        if (!nextStatus) {
            nextStatus = "show";
        }
        this.setShowStatus(nextStatus);
        if (nextStatus == "hide") {
            this.show();
        }
    }
    protected prepare() {
        this.toLoadData();
        this.divideTracks();
        this.hasPrepared = true;
    }
    public show() { 
        if (!this.hasPrepared) {
            this.prepare();
        }
        this.needData = true;
        $(this.screen).fadeIn();
        this.startEmit();  
        this.setShowStatus("hide");
    }        
    public hide() {
        if (timer) {
            clearTimeout(timer);
        }
        this.needData = false;
        
        $(this.screen).fadeOut();
        $(this.screen).empty();
        this.setShowStatus("show");
    }
    protected addSwitcherEvents() {
        $(this.switcher).on("click", () => {
            let status = $(this.switcher).attr("switch-to");
            if (status == "hide") {
                this.hide();
            } else {
                this.show();
            }
        });
    }
    public getNewFromOld(): IMaterial {
        let len = this.materials.length;
        if (len) {
            let index = rand(len);
            return this.materials[index];
        }
        return ;
    }
    public getMaterial():IMaterial {
        let newMsgsLen = this.newMaterials.length,
            material;
        if (newMsgsLen) {
            material = this.newMaterials.shift();
            this.materials.push(material);
        } else {
            material = this.getNewFromOld();
        }
        return material;
    }
    public getTrueWidth() {
        
    }
    public modifyBulletPosition(newBullet: Bullet, trackIndex: number) {
        let prevBullet = this.prevBulletOnTrack[trackIndex];
        newBullet.startY = this.trackHeight * trackIndex + this.trackPaddingTop + this.screenPaddingTop;
        if (prevBullet) {
            let prevElm = prevBullet.elm;
            if (newBullet.startX <= prevElm.offsetWidth + prevElm.offsetLeft + this.marginLeftRange.min) {
                newBullet.startX = prevElm.offsetWidth + prevElm.offsetLeft + rand(this.marginLeftRange.min, this.marginLeftRange.max);
            }
        }
    }
    protected beyondCapacity(): boolean {
        let className = Bullet.className(),
            num = this.screen.querySelectorAll(`.${className}`).length;
        if (num < this.maxShowBulletNum) {
            return false;
        } else {
            return true;
        }
    }
    protected scrollBullet() {
        if (!this.beyondCapacity()) {
            let material = this.getMaterial();
            if (material) {
                let bullet = new Bullet(material),
                    trackIndex = rand(this.trackNum);
                this.modifyBulletPosition(bullet, trackIndex);
                bullet.elm.setAttribute("track-index", trackIndex.toString());
                bullet.init(this.screen);
                bullet.move();
                this.prevBulletOnTrack[trackIndex] = bullet;
            }
        }
        this.startEmit();
    }
    public startEmit() {
        timer = setTimeout(() => {
            this.scrollBullet();
        }, this.interval);
    }
}