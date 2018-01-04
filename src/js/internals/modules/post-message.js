module.exports = function (controller) {

    let origin = controller.query.origin || window.location.origin;

    window.addEventListener('message', function (e) {
        controller.trigger('message', e);
    });

    controller.registerCall('parent', function (message, targetOrigin = null) {
        parent.postMessage(message, targetOrigin || origin);
    });
};
