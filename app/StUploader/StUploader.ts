import { StPopAlert } from "../stpop/StPopAlert";
import {StUploaderProgress} from "./StUploaderProgress";
export class StUploader {
    readonly kByte: number = 1024;
    readonly mByte: number = 1024 * this.kByte;
    public upFileUrl: string = location.protocol + "//" + location.host + '/admin/basis/upimg';
    public maxUploadSize: number = 5 * this.mByte;
    public acceptTypes: [string, string] = ["image", "*"];
    public alert: StPopAlert = new StPopAlert({
        body: "",
        autoShow: false,
    });
    public progressor: StUploaderProgress = new StUploaderProgress();
    public canUpload(file: File): boolean {
        if (this.beyondSize(file)) {
            return false;
        }
        return this.isAcceptType(file);
    }
    public beyondSize(file: File): boolean {
        let size = file.size;
        if (file.size && this.maxUploadSize) {
            if (file.size > this.maxUploadSize) {
                return true;
            }
        }
        return false;
    }
    public isAcceptType(file: File): boolean {
        if (file.type) {
            let fileType = file.type,
                [type, ext] = fileType.split("/");
            if (
                (this.acceptTypes[0] == "*") ||
                (this.acceptTypes[0].toLowerCase() === type)
            ) {
                if (
                    (this.acceptTypes[1] === "*") ||
                    (this.acceptTypes[1].toLowerCase() === ext)
                ) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    public proxyData<FormData>(fileData): FormData {
        return fileData;
    }
    public upToServer(file: File): this {
        let uploader = this;
        let fileData = new FormData();
        fileData.append('upload_img', file);
        fileData = this.proxyData(fileData);
        $.ajax({
            url: uploader.upFileUrl,
            type: 'POST',
            data: fileData,
            mimeType: "multipart/form-data",
            contentType: false,
            processData: false,
            dataType: 'json',
            success(ans) {
                // console.log(ans);
                if (ans.code > 0) {
                    uploader.upFileSuccess(ans);
                } else {
                    uploader.upFileFail(ans);
                }
            },
            error(err) {
                console.error(err);
                uploader.alert.setBody("上传时,网络端口连接出错").setAlertType("error").show();
            }
        });
        return this;
    }
    public upFileSuccess(reply) {
    }
    public upFileFail(reply) {
        this.alert.setBody(reply.msg).setAlertType("error").show();
    }
    public getBtnElm(btnName: string = "上传图片"): HTMLElement {
        let btn = document.createElement("button");
        btn.setAttribute("class", "btn btn-file");
        btn.innerHTML = `
            <input type="file" accept="${this.acceptTypes.join('/')}">
            <span>${btnName}</span>
        `;
        this.initChangeEvt(btn);
        return btn;
    }
    private initChangeEvt(btn: HTMLElement) {
        let uploader = this;
        btn.querySelector('input[type="file"]').addEventListener("change", function () {
            uploader.evtFileChange(event, this);
        });
    }
    public evtFileChange(event: Event, elm: Element) {
        let files = <FileList>elm["files"];
        if (files) {
            let len = files.length,
                errorFiles = [];
            for (let i = 0; i < len; i++) {
                if (this.canUpload(files[i])) {
                    this.upToServer(files[i]);
                } else {
                    errorFiles.push(files[i].name);
                }
            }
            if (errorFiles.length) {
               let filenames =  errorFiles.join(',');
               this.alert.setBody(`${filenames}上传出错`).setAlertType('error').show();
               this.progressor.hide();
            }
        }
    }
}