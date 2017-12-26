(function(factory) {
    if (typeof define == 'function' && define.amd) {
        define(function() {
            return factory();
        });
    } else {
        window.VerifyCode = factory();
    }
})(function() {
    class VerifyCode {
        constructor(elm, width = 200, height = 40, otherOption = null) {
            let options = {
                background: "rand",
                dotNum: 200,
                randCharType: 'all',
                strLen: 4,
            };
            for (let o in otherOption) {
                options[o] = otherOption[o];
            }
            this.elms = document.querySelectorAll(elm);
            this.width = width;
            this.height = height;
            this.options = options;
            let canvas = document.createElement("canvas");
            this.canvas = canvas;
            this.drawer = canvas.getContext("2d");
            this.codeString = '';
            this.initCanvas();                    
        }
        draw() {
            this.drawBackground();
            this.drawPixel();
            this.writeCode();
        }
        drawBackground() {
            let coder = this;
            if (coder.options.background.toLowerCase() == 'rand') {
                coder.drawer.fillStyle = coder.getRandColor();
            } else {
                coder.drawer.fillStyle = coder.options.background;
            }
            coder.drawer.fillRect(0, 0, coder.width, coder.height);
        }
        drawPixel() {
            let dotNum = this.options.dotNum,
                coder = this;
            while(dotNum --) {
                coder.drawer.beginPath();
                coder.drawer.fillStyle = coder.getRandColor("rgba");
                coder.drawer.arc(coder.rand(0, coder.width), coder.rand(0, coder.height), 2, 0, Math.PI * 2);
                coder.drawer.fill();
            }
        }
        initCanvas() {
            let coder = this,
                canvas = coder.canvas;
            canvas.width = coder.width;
            canvas.height = coder.height;
            this.draw();
            for (let i = 0, l = this.elms.length; i < l; i++) {
                let el = this.elms[i];
                el.append(canvas);
                el.addEventListener('click', function () {
                    coder.draw();
                });
            }
        }
        writeCode() {
            let randArr = this.getRandArr(),
                coder = this,
                averageWidthCenter = Math.floor((coder.width - 20)/ coder.options.strLen),
                averageMiddle = coder.height;
            coder.codeString = "";
            for (let index = 0, len = coder.options.strLen; index < len; index ++) {
                let theCharIndex = coder.rand(randArr.length - 1),
                    theChar = randArr[theCharIndex],
                    theCharX = averageWidthCenter * (index + 1) + coder.rand(-averageWidthCenter / 2, 0),
                    theCharY = averageMiddle / 2;
                coder.codeString += theChar;
                coder.drawer.beginPath();
                coder.drawer.fillStyle = "white";
                coder.drawer.font = `${coder.rand(20, 50)}px Arial`;
                coder.drawer.fillText(theChar, theCharX,  theCharY + coder.rand(10, 20)); 
            }
        }
        getRandArr() {
            let numChar = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                engChar = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's' ,'t', 'u', 'v', 'w', 'x', 'y', 'z'],
                engCharUpper = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
                randArr = [],
                coder = this;
            if (this.options.randCharType == 'all') {
                randArr = numChar.concat(engChar, engCharUpper);
            } else {
                if (this.options.randCharType.match(/(\s|\&|^)num(\s|\&|$)/)) {
                    randArr = randArr.concat(numChar);
                }
                if (this.options.randCharType.match(/(\s|\&|^)eng(\s|\&|$)/)) {
                    randArr = randArr.concat(engChar);
                }
                if (this.options.randCharType.match(/(\s|\&|^)ENG(\s|\&|$)/)) {
                    randArr = randArr.concat(engCharUpper);
                }
                if (this.options.randCharType.match(/(\s|\&|^)auto(\s|\&|$)/)) {
                    if (coder.options.randArr){
                        randArr = randArr.concat(coder.options.randArr);
                    }
                }
            }
            return randArr;           
        }
        getRandColor(sym = "rgb") {
            let color,
                coder = this;
            switch (sym) {
                case 'rgb':
                    color = `rgb(${coder.rand(0, 255)}, ${coder.rand(0, 255)}, ${coder.rand(0, 255)})`;
                    break;
                case 'rgba':
                    color = `rgba(${coder.rand(0, 255)}, ${coder.rand(0, 255)}, ${coder.rand(0, 255)}, ${Math.random().toFixed(2)})`;
                    break;
                case 'hsl':
                case 'hsv':
                    color = `hsl(${coder.rand(0, 360)}, ${coder.rand(0, 100)}, ${coder.rand(0, 100)})`;
                    break;
                case 'hsla':
                    color = `hsla(${coder.rand(0, 360)}, ${coder.rand(0, 100)}, ${coder.rand(0, 100)}, ${Math.random().toFixed(2)})`;
                    break
            }
            return color;
        }
        rand(min, max = 0) {
            min = parseInt(min);
            max = parseInt(max);
            if (min > max) {
                let tmp = max;
                max = min;
                min = tmp;
            }
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
    return VerifyCode;
})