import { CMC7Validator } from './cmc7-validator';

module.exports = controller => {

    let group = 0;
    let cmcNumber = '';
    let onTerminator = false;
    let timeout;

    $(window).keypress(({keyCode}) => {
        if (document.activeElement && document.activeElement.tagName.toLowerCase() !== 'body') {
            return;
        }

        let char = String.fromCharCode(keyCode);
        if (!/^[0-9]+$/.test(char)) {
            return;
        }

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            cmcNumber = '';
        }, 3000);

        cmcNumber += char;
        if (new CMC7Validator(cmcNumber).isValid()) {
            controller.trigger('icheques::newcheck', cmcNumber);
        }
    });

};
