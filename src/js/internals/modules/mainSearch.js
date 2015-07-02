module.exports = function (controller) {
    controller.registerBootstrap("mainSearch", function (callback) {
        callback();
        $("#main-search").submit(function (e) {
            e.preventDefault();
            controller.trigger("mainSearch::submit", $("#input-q").val());
        });
    });
};