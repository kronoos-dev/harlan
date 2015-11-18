var animationEvent = "animationend animationend webkitAnimationEnd oanimationend MSAnimationEnd";

/**
 * Comentário para a posteridade
 * Criei essa caralha quando não havia ECMAScript 6!
 */

module.exports = function (controller) {

    var counter = 0;
    var animationElement = null;
    var animations = ["animated rotateIn", "animated rotateOut"];

    controller.registerCall("loader::catchElement", function () {
        return $(".logo:visible span");
    });

    var afterExecution = function () {
        animationElement.removeClass(animations[counter++ % animations.length]);
        animationElement.addClass(animations[counter % animations.length]);
    };

    var loaderRegister = 0;

    controller.registerCall("loader::register", function () {
        loaderRegister++;
        
        animationElement = controller.call("loader::catchElement");
        if (!animationElement.length) {
            $(".q").addClass("loading");
            return;
        }
        animationElement.bind(animationEvent, afterExecution);
        animationElement.addClass(animations[counter % animations.length]);
    });

    controller.registerCall("loader::unregister", function () {
        if (--loaderRegister > 0) {
            return;
        }

        loaderRegister = 0;
        if (!animationElement.length) {
            $(".q").removeClass("loading");
            return;
        }
        animationElement.removeClass(animations[counter % animations.length]);
        if (animationElement && animationEvent) {
            animationElement.unbind(animationEvent);
        }
    });

    controller.registerCall("loader::ajax", function (dict) {
        var beforeSend = dict.beforeSend;
        var complete = dict.complete;

        dict.beforeSend = function () {
            controller.call("loader::register");
            if (beforeSend)
                beforeSend.apply(this, Array.from(arguments));
        };

        dict.complete = function (jqXHR, textStatus) {
            controller.call("loader::unregister");
            if (complete)
                complete.apply(this, Array.from(arguments));
        };

        return dict;
    });
};