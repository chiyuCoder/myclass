import {StPopConfirmOption, StPopConfirm} from "./StPopConfirm";
import {StPopAlertOptions, StPopAlert} from "./StPopAlert";

class StPopLoader{
    constructor() {

    }
    alert(options: StPopAlertOptions | string, alertType: string = ""): StPopAlert{
        return new StPopAlert(options, alertType);
    }
    confirm(opt: StPopConfirmOption | string = "") {
        return new StPopConfirm(opt);
    }
}
let stpopLoader = new StPopLoader()
export {stpopLoader};

