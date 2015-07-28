var clickLocation = null;
var closeAction = null;

module.exports = function (controller) {

    var headerNode = $(".iframe header"),
            iframeNode = $(".iframe iframe"),
            inputNode = $(".iframe input"),
            closeButtonNode = $(".iframe #action-close-iframe"),
            gotoButtonNode = $(".iframe .icon.url"),
            iframeLoaderNode = $(".iframe .q");

    /* 
     * Quando o módulo é colocado 
     * embedded a caixa de consulta deve desaparecer
     */
    controller.registerCall("iframeEmbed", function () {
        if (window !== window.top) {
            return true;
        }
        return false;
    });

    /**
     * Abre um iFrame
     */
    controller.registerCall("iframeEmbed::open", function (args) {
        var location = args[0],
                title = args[1];

        title = title || location;

        /* global module */
        controller.interface.helpers.activeWindow(".iframe");

        iframeLoaderNode.addClass("loading");
        clickLocation = location;
        iframeNode.attr("src", location);
        inputNode.val(title);
        onResize();
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

    /**
     * Quando é redimensionada a tela
     * @returns {undefined}
     */
    var onResize = function () {
        iframeNode.css("height", $(window).height() - headerNode.outerHeight());
    };

    /**
     * Abre um iFrame
     * @param {callback} callback Callback fnc
     */
    controller.registerBootstrap("iframeEmbed::open", function (callback) {
        callback();

        $(window).resize(onResize);

        closeButtonNode.click(function (e) {
            e.preventDefault();
            if (!closeAction) {
                controller.interface.helpers.activeWindow(".app");
            }
        });

        gotoButtonNode.click(function (e) {
            e.preventDefault();
            if (clickLocation) {
                window.open(clickLocation, "_blank");
            }
        });
        
        iframeNode.load(function () {
            iframeLoaderNode.removeClass("loading");
        });
    });


};