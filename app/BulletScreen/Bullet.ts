import { rand } from "../../func/num";
export class Bullet {
    static className() {
        return "bullet";
    };
    public stopped = false; //是否停止动画
    public startX = rand(window.innerWidth + 10, window.innerWidth * 1.25); //初始坐标的X
    public startY = rand(80, window.innerHeight - 80); //初始坐标的Y
    public stepDecrease = 2; //一帧修改的幅度
    public elm: HTMLElement;
    protected animeId;
    getRandStyleClass() {
        let randStyles = ["red", "cyan", "green", "blue"],
            randIndex = rand(randStyles.length);
        return randStyles[randIndex] + "-bullet";
    }
    constructor(material) {
        this.build(material);
    }
    private setClass(elm) {
        let cls = Bullet.className();
        cls += " " + this.getRandStyleClass();
        elm.setAttribute("class", cls);
    }
    private parseElm(elm) {
        this.setClass(elm);
        let bullet = this;
        $(elm).hover(function () {
            bullet.whenMouseOn();
        }, function () {
            bullet.whenMouseOut();
        });
    }
    whenMouseOn() {
        $(this.elm).addClass("on-hover");
        this.stopMove();
    }
    whenMouseOut() {
        let bullet = this;
        bullet.stopped = false;
        $(bullet.elm).removeClass("on-hover");
        bullet.move();
    }
    remove() {
        this.stopMove();
        this.elm.remove();
    }
    move() {
        if (this.stopped) {
            return;
        }
        let offsetLeft = this.elm.offsetLeft,
            width = this.elm.offsetWidth;   
        if (offsetLeft < -width) {
            this.remove();
        } else {
            this.elm.style.left = offsetLeft - this.stepDecrease + "px";
            let bullet = this;
            this.animeId = requestAnimationFrame(function () {
                bullet.move();
            });
        }
    }
    stopMove() {
        this.stopped = true;
        let animeId = this.animeId;
        cancelAnimationFrame(animeId);
    }
    private build(material) {
        let innerHTML = this.html(material),
            elm = document.createElement("div");
        elm.innerHTML = innerHTML;
        this.parseElm(elm);
        this.elm = elm;
        this.resetWidth();
    }
    public resetWidth() {
        
    }
    html(material) {
        return `
            <div class="avatar">
                <img src="${material.avatar}" alt="${material.nickname}">
            </div>
            <div class="content">
                <span class="nickname">${material.nickname}</span>
                <span class="said">${material.text}</span>   
            </div>
        `;
    }
    init(panel) {
        panel.appendChild(this.elm);
        this.setPosition();
    }
    setPosition() {
        this.elm.style.left = this.startX + "px";
        this.elm.style.top = this.startY + "px";
    }
}