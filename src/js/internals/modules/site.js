/* global module */

module.exports = function (controller) {

    controller.registerBootstrap("site::init", function () {
        var carrousel = $(".site .carrousel");
        var list = carrousel.find("ul");
        var images = carrousel.find("img");
        
        
        var first = true;
        images.each(function (idx, image) {
            var jimage = $(image);
            var item = $("<li />");
            if (first) {
                first = false;
                item.addClass("selected");
            }
            item.click(function (e) {
                e.preventDefault();
                list.find("li").removeClass("selected");
                item.addClass("selected");
                jimage.insertAfter(list);
            });
            list.append(item);
        });
    });
};