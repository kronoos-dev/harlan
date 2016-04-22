module.exports = function(controller) {
    controller.registerCall("download", (blob) => {
        var url = (window.webkitURL || window.URL).createObjectURL(blob);
        location.href = url;
    });
};
