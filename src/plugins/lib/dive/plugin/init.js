module.exports = function (controller) {
    let pluginList = [];

    controller.registerCall("dive::plugin::register", (expr, callback) => {
        pluginList.push([expr, callback]);
    });

    controller.registerCall("dive::plugin", (url, data) => {
        for (let [expr, plugin] of pluginList) {
            if (!expr.test(url)) continue;
            return plugin(url, data);
        }
    });
};
