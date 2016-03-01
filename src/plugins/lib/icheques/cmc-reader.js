module.exports = function (controller) {

    var group = 0;
    var cmcNumber = "";
    var onTerminator = false;
    
    window.onkeyup = function (e) {
        if (document.activeElement && document.activeElement.tagName.toLowerCase() !== "body") {
            return;
        }


        if (e.keyCode === 16) {
            onTerminator = true;
            return;
        }

        if (onTerminator) {
            onTerminator = false;
            if ((group === 0 && e.keyCode === 188 && cmcNumber.length === 0) ||
                    (group === 1 && e.keyCode === 188 && cmcNumber.length === 8) ||
                    (group === 2 && e.keyCode === 190 && cmcNumber.length === 18)) {
                group++;
                return;
            } else if (group === 3 && e.keyCode === 191 && cmcNumber.length === 30) {
                controller.trigger("icheques::newcheck", cmcNumber);
            }

            cmcNumber = "";
            group = 0;
            return;
        }

        cmcNumber += String.fromCharCode(e.keyCode);
    };
    
};
