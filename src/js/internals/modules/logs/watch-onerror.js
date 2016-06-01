module.exports = function(controller) {

    controller.registerBootstrap("logs::watch::onerror", (cb) => {
        cb();
        window.onerror = (message, source, lineno, colno, error) => {
            controller.trigger("logs::onerror::fired", {message, source, lineno, colno, error});
        };
    });

    controller.registerTrigger("logs::onerror::fired", (args, cb) => {
        // TODO chamar o endpoint
        // controller.server.call();
        cb();
    });
};
