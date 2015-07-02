module.exports = function (controller) {

    /* 
     * Quando o módulo da NEOASSIST é colocado 
     * embedded a caixa de consulta deve desaparecer
     */
    controller.registerCall("iframeEmbed", function () {
        if (window != window.top) {
            return true;
        }
        return false;
    });
    
    /**
     * Quando o projeto se torna whitelabel
     */
    controller.registerBootstrap("iframeEmbed::whitelabel", function (callback) {
        callback();
        if (!controller.call("iframeEmbed") && controller.query.whitelabel) {
            $("#scroll-down").hide();
        }
    });
    
};