import "./copyable.less";
import * as Clipboard from "../../lib/clipboard.min.js";
let clipboard = new Clipboard(".copyable", {
    text: function (trigger) {
        let text = trigger.getAttribute("copy-text");
        if (text == undefined) {
            text = trigger.textContent;
        }
        return text;
    }
});
clipboard.on('success', function (evt)  {
    if (!$(evt.trigger).hasClass('success-copy')) {
        let rmClsDelay = 600;
        $(evt.trigger).addClass("success-copy");
        setTimeout(function () {
            $(evt.trigger).removeClass("success-copy");
        }, rmClsDelay);
    }
});