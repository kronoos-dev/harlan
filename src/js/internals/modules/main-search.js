module.exports = function (controller) {
    controller.registerBootstrap("mainSearch", function (callback) {
        callback();
        $(".main-search").each((i, v) => {
            $(v).submit(function (e) {
                e.preventDefault();
                controller.trigger("mainSearch::submit", $(this).find(".input-q").val());
            });
        });
    });
};
