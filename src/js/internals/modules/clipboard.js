module.exports = function (controller) {
    ZeroClipboard.config({
        swfPath: controller.confs.zeroClipboard.swfPath
    });
};