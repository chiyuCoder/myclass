import { DataForm } from "./DataForm";

$('form[data-type="form"]').each((index, elm) => {
    elm['dataForm'] = new DataForm(<HTMLFormElement>elm);
});