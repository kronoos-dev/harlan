module.exports = function (controller) {
    controller.registerBootstrap("mainSearch", function () {
        $("#main-search").submit(function (e) {
            e.preventDefault();
            controller.trigger("mainSearch::submit", $("#input-q").val());
        });
    });
};