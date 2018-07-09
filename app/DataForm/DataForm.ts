import { StPopMsg } from "../stpop/StPopMsg";
import { StPopAlert } from "../stpop/StPopAlert";
export class DataForm {
    public action: string = location.href;
    public method: string = "POST";
    public data: any;
    public elm: HTMLFormElement;
    public btnSelector: string = '[data-type="submit"]';
    public alert: StPopAlert = new StPopAlert({
        body: "",
        autoShow: false
    });
    public note: StPopMsg = new StPopMsg({
        msg: 'form-submit-msg',
        autoShow: false,
    });
    constructor(elm: HTMLFormElement) {
        this.elm = elm;
        if (this.elm.getAttribute("action")) {
            this.action = this.elm.getAttribute("action");
        }
        if (this.elm.getAttribute("method")) {
            this.method = this.elm.getAttribute("method");
        }
        this.listenSubmit();
        this.listenEnterDown();
    }
    protected listenSubmit() {
        let dataForm = this;
        $(dataForm.btnSelector).on('click', function () {           
            dataForm.prepareToSubmit();
            console.log(dataForm);
            return false;
        });
    }
    protected prepareToSubmit() {
        let dataForm = this;
        let stopHere = dataForm.validate();     
        if (stopHere != undefined) {
            return false;
        }
        dataForm.submitForm();
    }
    public validate() {

    };
    public getData(): string {
        return $(this.elm).serialize();
    }
    public submitForm() {
        let dataForm = this;
        console.log(dataForm);
        $.ajax({
            url: dataForm.action,
            type: dataForm.method,
            data: dataForm.getData(),
            dataType: 'json',
            success(reply) {
                if (reply.code < 0) {
                    dataForm.repliedError(reply);
                } else {
                    dataForm.repliedSuccess(reply);
                }
            },
            error(err) {
                dataForm.errorSubmit(err);
            }
        });
        return this;
    }
    public repliedError(reply: any) {
        this.alert.setBody(reply.msg).setAlertType("error").show(this.elm);
    }
    public repliedSuccess(reply: any) {
        this.note.updateMsg(reply.msg).updateType("normal").show(this.elm);
    }
    public errorSubmit(err) {
        console.error(err);
    }
    protected listenEnterDown() {
        let enterKeyCode = 13,
            dataForm = this;
        $(document.body).on('keydown', function (evt) {
            if (evt.keyCode === enterKeyCode) {
                dataForm.prepareToSubmit();
            }
        });
    }
}