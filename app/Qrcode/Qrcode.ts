declare namespace QRCode{
    export interface CorrectLevel {
        [attr: string]: any;
    }
    export interface options{
        text: string,
        width: number,
        height: number;
        colorDark: string;
        colorLight: string;
        colorLevel: any;
    }
}
declare class QRCode{
    static CorrectLevel: any;
    constructor(elm: Element, opt: QRCode.options);
}

export class Qrcode{
    public elm;
    public qrcode;
    constructor(elm: HTMLElement) {
        this.elm = elm;
        elm["__stQrcode__"] = this;
        this.create();
    }
    public create() {
        let $this = this,
            elm = $this.elm;
        this.qrcode = new QRCode($this.elm, {
            text: $(elm).attr('data-encode') ? $(elm).attr('data-encode') : location.href,
            width: $(elm).width() ? $(elm).width() : 240,
            height: $(elm).height() ? $(elm).height() : 240,
            colorDark: $(elm).attr('data-dark') ? $(elm).attr('data-dark') : '#000000',
            colorLight: $(elm).attr('data-light') ? $(elm).attr('data-light') : '#fff',
            colorLevel: QRCode.CorrectLevel.H
        });
    }
}