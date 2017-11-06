import html2canvas from 'html2canvas';

module.exports = function(controller) {

    controller.registerBootstrap("watch::onerror", cb => {
        cb();
        window.onerror = function() {
            controller.trigger("logs::onerror", Array.from(arguments));
            return false;
        };
    });

    controller.registerTrigger("logs::onerror", "callhome", (args, cb) => {
        cb();
        html2canvas(document.body).then(function(canvas) {
            controller.server.call("INSERT INTO 'HARLANAUTHENTICATION'.'BROWSERERROR'", {
                method: "POST",
                data: {
                    navigator: navigator.userAgent,
                    payload: JSON.stringify(args),
                    canvas: canvas.toDataURL("image/jpeg")
                }
            });
        });
    });
};
