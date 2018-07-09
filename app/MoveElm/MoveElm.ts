import { strToInt } from "../../func/func";
import { Point } from "./Point";
import { animate } from "../../func/timer";
export class MoveElm {
    public elm: JQuery<HTMLElement>;
    public moveable: boolean = false;
    public canBeyondX: boolean = true;
    public canBeyondY: boolean = true;
    public minMove:Point = {
        x: 0,
        y: 0,
    }
    public minLeft: number = 0;
    public maxLeft: number;
    public minTop: number;
    public maxTop: number;
    public events: string[] = ["touchStart", "touchMove", "touchEnd"];
    protected elmAxis: Point;
    protected start: Point;
    constructor(elm, moveType = "both") {
        this.elm = $(elm);
        this.moveable = false;
        this.resetSetPositionsFunc(moveType);
        this.bindEvts();
    }
    public setLeftRange(min = 0, max = window.innerWidth): this {
        this.minLeft = min;
        this.maxLeft = max;
        this.canBeyondX = false;
        return this;
    }
    public setTopRange(min = 0, max = window.innerHeight): this {
        this.minTop = min;
        this.maxTop = max;
        this.canBeyondY = false;
        return this;
    }
    protected bindEvts() {
        let $this = this,
            events = this.events;        
        events.forEach(evt => {
            $($this.elm).on(evt.toLowerCase(), function(event) {
                event.stopPropagation();
                ($this[evt])(event);
            });
        });
    }
    protected resetSetPositionsFunc(moveType) {
        if (moveType == "both") {
            return;
        }
        if (moveType == "left") {
            this.setPosition = (x, y) => {
                this.setAxis("left", x);
            }
        } else if (moveType == "top") {
            this.setPosition = (x, y) => {
                this.setAxis("top", y);
            }
        }
    }
    setPosition(x, y) {
        this.setAxis("left", x);
        this.setAxis("top", y);
    }
    getAxis(attr = "left") {
        let num = $(this.elm).css(attr);
        return strToInt(num);
    }
    setAxis(attr, num) {
        $(this.elm).css(attr, num + 'px');
    }
    animeLeft(leftEndAt, duration = 600) {
        return this.animeAttr("left", leftEndAt, duration);
    }
    animeTop(endAt, duration = 600) {
        return this.animeAttr("top", endAt, duration);
    }
    animeAttr(attr, endAt, duration = 600) {
        let opt = {};
        opt[attr] = endAt;
        $(this.elm).animate(opt, duration);
        return this;
    }
    moveEnd(endPoint: Point) {

    }
    touchStart(event) {
        let touch = event.touches[0];
        this.moveable = true;
        this.elmAxis = {x: 0, y: 0};
        this.elmAxis.x = this.getAxis("left");
        this.elmAxis.y = this.getAxis("top");
        this.start = {
            x: touch.clientX,
            y: touch.clientY
        };
    }
    touchEnd(event) {
        this.moveable = false;
        let endPoint = new Point(this.getAxis("left"), this.getAxis("top"));
        this.moveEnd(endPoint);
    }
    touchMove(event) {
        if (this.moveable) {
            let touchData = event.touches[0],
                movePoint = new Point(touchData.clientX - this.start.x, touchData.clientY - this.start.y);
            if (Math.abs(movePoint.x) < this.minMove.x) {
                movePoint.x = 0;
            }
            if (Math.abs(movePoint.y) < this.minMove.y) {
                movePoint.y = 0;
            }
            let endLeft = movePoint.x + this.elmAxis.x,
                endTop = movePoint.y + this.elmAxis.y;
            endLeft = this.getPropLeft(endLeft);
            endTop = this.getPropTop(endTop);
            this.setPosition(endLeft, endTop);          
        }
    }
    getPropTop(endTop) {
        if (!this.canBeyondX) {
            if (endTop < this.minTop) {
                return this.minTop;
            }
            if (endTop > this.maxTop) {
                return this.maxTop;
            }
        }
        return endTop;
    }
    getPropLeft(endLeft) {
        if (!this.canBeyondX) {
            if (endLeft < this.minLeft) {
                return this.minLeft;
            }
            if (endLeft > this.maxLeft) {
                return this.maxLeft;
            }
        }
        return endLeft;
    }
}