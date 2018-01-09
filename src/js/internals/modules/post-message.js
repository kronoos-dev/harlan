module.exports = controller => {

    let origin = controller.query.origin || window.location.origin;

    window.addEventListener('message', e => {
        controller.trigger('message', e);
    });

    controller.registerCall('parent', (message, targetOrigin = null) => {
        parent.postMessage(message, targetOrigin || origin);
    });
};
