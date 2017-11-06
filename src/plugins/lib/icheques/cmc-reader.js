import { CMC7Validator } from './cmc7-validator';

module.exports = function (controller) {

    let group = 0;
    let cmcNumber = "";
    let onTerminator = false;
    let timeout;

    $(window).keypress(e => {
        if (document.activeElement && document.activeElement.tagName.toLowerCase() !== "body") {
            return;
        }

        let char = String.fromCharCode(e.keyCode);
        if (!/^[0-9]+$/.test(char)) {
            return;
        }

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            cmcNumber = "";
        }, 3000);

        cmcNumber += char;
        if (new CMC7Validator(cmcNumber).isValid()) {
            controller.trigger("icheques::newcheck", cmcNumber);
        }
    });

};
