import "./StPage.less";
export class StPage{
    readonly firstPageNum: number = 1;
    public nowPage: number;
    public maxShowNum: number = 6;
    public prevPage: string = "上一页";
    public nextPage: string = "下一页";
    public itemClass: string = "page-item";
    private html: string = "";
    public box: HTMLElement;
    public bindBox(elm: HTMLElement) {
        this.box = elm;
        this.bindEvt();
        console.log(elm);
    }
    public bindEvt() {
        let elm = this.box,
            selector = this.itemClass,
            pager = this;
        $(elm).on("click", `.${selector}`, function () {
            let index = $(this).attr("index");
            let indexNum = parseInt(index);
            pager.switchTo(indexNum);
        });
    }
    public switchTo(index: number) {
        console.log(index);
    }
    public build(totalPage: number, nowPage: number = 1) {
        console.log(totalPage);
        this.html = "";
        this.nowPage = nowPage;
        if (totalPage <= 1) {
            return ;
        }
        if (nowPage > 1) {
            this.addPrevPage(nowPage);
        }
        this.addMainPage(totalPage);
        if (nowPage !== totalPage) {
            this.addNextPage(nowPage, totalPage);
        }
        this.show();   
    }
    public show() {
        if (this.box) {
            this.box.innerHTML = this.html;
        }
        console.log(this.box);
    }
    protected addMainPage(totalPage: number) {
        let html = "";
        if (totalPage < this.maxShowNum) {
            html = this.addPages(this.firstPageNum, totalPage);
        } else {
            let frontHalf = Math.floor(this.maxShowNum / 2);
            if (this.nowPage < frontHalf) {
                html = this.addPages(this.firstPageNum, this.maxShowNum);
            } else {
                if (this.nowPage > totalPage - frontHalf) {
                    html = this.addPages(totalPage - this.maxShowNum + 1, totalPage);
                } else {
                    let start = this.nowPage - frontHalf + 1,
                        end = start + this.maxShowNum - 1;
                    html = this.addPages(start, end);
                }
            }
        }
        this.html += html;
    }   
    protected addPages(start: number, end: number): string {
        let html = "";
        for (let index = start; index < end; index ++) {
            html += this.addNumPage(index);
        }
        return html;
    }
    public addNumPage(num: number, name: string = ""): string {
        let active = "";
        if (num == this.nowPage) {
            active = "on-page";
        }
        if (!name) {
            name = num.toString();
        }
        return `<a href="javascript:;" class="${this.itemClass} ${active}" index="${num.toString()}">${name}</a>`; 
    }
    public addPrevPage(nowPage: number) {        
        this.html += this.addNumPage(nowPage - 1, this.prevPage);       
    }
    public addNextPage(nowPage: number, totalPage: number) {
        this.html += this.addNumPage(nowPage + 1, this.nextPage);    
    }
}