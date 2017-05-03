module.exports = function (controller) => {

    let origin = controller.query.origin || window.location.origin;

    window.addEventListener('message', (e) => {
        targetOrigin = e.origin;
        controller.trigger("message", e);
    });

    controller.registerCall("parent", (message, targetOrigin = null) => {
        parent.postMessage(targetOrigin || origin);
    });
}
