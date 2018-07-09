import { getCopy } from "../../func/obj";
import { rand } from "../../func/num";
export class VerifyCode {
    readonly elm: HTMLElement;
    private canvas;
    private drawer;
    public opt = {
        width: 142,
        height: 44,
        bg: '#fff',
        dots: 100,
        dotSize: 1,
        lines: 3,
        fontSize: 30,
        fontFamily: ['Times New Roman', '黑体', 'Miscrosoft Yahei', '微软雅黑', '楷体'],
        codeLen: 4,
        maxWidthRange: 0.85,
        maxBottomRange: 0.23,
    };
    private codeStr: string;
    private fontWidth: number = 0;
    public randChars: string[] = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g',
        'h', 'j', 'k', 'm', 'n',
        'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G',
        'H', 'J', 'K', 'M', 'N',
        'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
    ];
    public initCanvasOn(elm: HTMLElement) {
        let canvas = document.createElement("canvas");
        canvas.width = this.opt.width;
        canvas.height = this.opt.height;
        this.canvas = canvas;
        this.drawer = canvas.getContext("2d");
        elm.appendChild(canvas);
        this.listenClickEvt();
    }
    private listenClickEvt() {
        let canvas = this.canvas;
        canvas.onclick = () => {
            this.drawChars();
        }
    }
    private initDrawer() {
        let drawer = this.drawer;
        drawer.clearRect(0, 0, this.canvas.width, this.canvas.height);
        drawer.beginPath();
        drawer.fillStyle = this.opt.bg;
        drawer.fillRect(0, 0, this.canvas.width, this.canvas.height);
        drawer.beginPath();
    }
    private toDrawDots() {
        if (this.opt.dots > 0) {
            let dotNum = this.opt.dots;
            while (dotNum--) {
                this.drawDot();
            }
        }
    }
    private toDrawLines() {
        if (this.opt.lines > 0) {
            let linesNum = this.opt.lines;
            while(linesNum --) {
                this.DrawLine();
            }
        }
    }
    public drawChars(): string {        
        this.initDrawer();
        this.toDrawDots();
        this.toDrawLines();
        let codeStrLen = this.opt.codeLen,
            charsRange = this.randChars,
            charsRangeLen = charsRange.length;
        this.codeStr = '';
        this.fontWidth = this.canvas.width / codeStrLen;
        while (codeStrLen--) {
            let charIndex = rand(charsRangeLen),
                char = charsRange[charIndex],
                codeIndex = this.opt.codeLen - codeStrLen;
            this.drawCharOnCanvas(char, codeIndex);
            this.codeStr += char;
        }
        return this.codeStr;
    }
    public getCode(): string {
        return this.codeStr;
    }
    private getFontFamily() {
        let fontFamilies = this.opt.fontFamily;
        if (<any>fontFamilies instanceof Array) {
            let len = fontFamilies.length,
            index = rand(len);
            return  fontFamilies[index];
        }
        return fontFamilies;
    }
    private drawCharOnCanvas(char: string, codeIndex: number) {
        let drawer = this.drawer;
        let x = (codeIndex - 1) * this.fontWidth + this.fontWidth * Math.random() * this.opt.maxWidthRange,
            y = Math.floor(this.canvas.height * (1 - Math.random() * this.opt.maxBottomRange)),
            fontFamily = this.getFontFamily();
        drawer.fillStyle = this.getRandColor();
        
        drawer.font = `${this.opt.fontSize}px ${fontFamily}`;
        drawer.fillText(char, x, y);
    }
    public DrawLine() {
        let drawer = this.drawer,
            x = Math.floor(this.canvas.width * Math.random()),
            y = Math.floor(this.canvas.height * Math.random()),
            width = Math.floor(this.canvas.width * Math.random()),
            height = rand(1, 4);
        drawer.beginPath();
        drawer.fillStyle = this.getRandLineColor();
        drawer.fillRect(x, y, width, height);
    }
    public drawDot() {
        let drawer = this.drawer,
            x = Math.floor(this.canvas.width * Math.random()),
            y = Math.floor(this.canvas.height * Math.random());
        drawer.beginPath();
        drawer.fillStyle = this.getRandColor();
        drawer.arc(x, y, this.opt.dotSize, 0, Math.PI * 2);
        drawer.fill();
    }
    public getRandColor(): string {
        let red = rand(255),
            green = rand(255),
            blue = rand(255);
        return `rgb(${red}, ${green}, ${blue})`;
    }
    public getRandLineColor() {
        let lineColors = ["blue", "green", "red", '#555dff'],
            len = lineColors.length,
            index = rand(len);
        return lineColors[index];
    }
}