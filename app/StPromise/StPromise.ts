declare namespace StPromise{
    export type statusType = "pending" | "resolved" | "rejected";
    export type errorType = "ajaxFailed" |　"failedCode";
    export interface IBaseFunc{
        (data?: any): void
    }
    export interface IBindFunc{
        (resolve: StPromise.IBaseFunc, reject: StPromise.IFailFunc): void
    }
    export interface IFailFunc{
        (error: any, type?: StPromise.errorType): void
    }
}

export class StPromise{
    private status: StPromise.statusType = "pending";
    public errorType: StPromise.errorType = "failedCode";
    constructor(bindFunc: StPromise.IBindFunc) {
        bindFunc((data) => {
            this.resolve(data);
        }, (error, errorType = "failedCode") => {
            this.reject(error, errorType);
        });        
    }
    private resolve(data?: any) {
        this.whenSuccess(data);
        this.whenEnd();
    };
    private whenSuccess(data?: any) {

    }
    private reject(err: any, errorType: StPromise.errorType = "failedCode") {
        this.whenFail(err, errorType);
        this.whenEnd();
    };
    private whenFail(err: any, type: StPromise.errorType) {

    }
    private whenEnd() {

    }
    public then(func: StPromise.IBaseFunc): this {
        this.whenSuccess = (data) => {
            func(data);
        };
        return this;
    }
    public success(func: StPromise.IBaseFunc): this {
        return this.then(func);
    }
    public catch(func: StPromise.IFailFunc): this {
        this.whenFail = (error, errorType) => {
            func(error, errorType);
        };
        return this;
    }
    public fail(func: StPromise.IFailFunc): this {
        return this.catch(func);
    }
}