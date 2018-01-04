var animationEvent = 'animationend animationend webkitAnimationEnd oanimationend MSAnimationEnd';

/**
 * Comentário para a posteridade
 * Criei essa caralha quando não havia ECMAScript 6!
 */

module.exports = function(controller) {

    var counter = 0;
    var animationElement = null;

    controller.confs.loader = {
        animations: ['animated rotateIn', 'animated rotateOut']
    };

    controller.registerCall('loader::catchElement', function() {
        return $('.logo:visible span');
    });

    var afterExecution = function() {
        animationElement.removeClass(controller.confs.loader.animations[counter++ % controller.confs.loader.animations.length]);
        animationElement.addClass(controller.confs.loader.animations[counter % controller.confs.loader.animations.length]);
    };

    var loaderRegister = 0;

    controller.registerCall('loader::register', function() {
        if (!loaderRegister) {
            animationElement = controller.call('loader::catchElement');
            if (!animationElement.length) {
                $('.q').addClass('loading');
                return;
            }
            animationElement.bind(animationEvent, afterExecution);
            animationElement.addClass(controller.confs.loader.animations[counter % controller.confs.loader.animations.length]);
        }
        loaderRegister++;
    });

    controller.registerCall('loader::unregister', function() {
        if (--loaderRegister > 0) {
            return;
        }

        loaderRegister = 0;
        if (!animationElement.length) {
            $('.q').removeClass('loading');
            return;
        }
        animationElement.removeClass(controller.confs.loader.animations[counter % controller.confs.loader.animations.length]);
        if (animationElement && animationEvent) {
            animationElement.unbind(animationEvent);
        }
    });

    controller.registerCall('loader::ajax', function(dict, bipbop = false) {
        var beforeSend = dict.beforeSend,
            complete = dict.complete,
            bipbopRegister = null;
        dict.beforeSend = function(...ag) {
            if (bipbop) {
                bipbopRegister = $.bipbopLoader.register();
            } else {
                controller.call('loader::register');
            }

            if (beforeSend)
                beforeSend(...ag);
        };

        dict.complete = function(jqXHR, textStatus, ...ag) {
            if (bipbopRegister) {
                bipbopRegister();
                bipbopRegister = null;
            } else {
                controller.call('loader::unregister');
            }
            if (complete)
                complete(jqXHR, textStatus, ...ag);
        };

        return dict;
    });
};
