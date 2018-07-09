import { Switcher } from "./Switcher";

$('.switcher, [data-type="switcher-input"]').each(function (index, elm) {
    elm["switcher"] = new Switcher(elm);
});