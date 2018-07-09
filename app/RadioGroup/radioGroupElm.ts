import {RadioGroup} from "./RadioGroup";
$('[data-type="radio-group"]').each((index, elm) => {
    elm["radioGroup"] = new RadioGroup(elm);
});