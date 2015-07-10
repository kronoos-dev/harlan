/* global module */

module.exports = function (controller) {

    controller.registerBootstrap("site::buttons", function (callback) {
        callback();
        
        var window = function (window) {
            return function (e) {
                e.preventDefault();
                $("body > *").addClass("hide");
                window.removeClass("hide");
            };
        };
        
        var newWindow = function (href) {
            return function (e) {
                e.preventDefault();
                document.location.href = href;
            };
        };
        
        $(".action-home").click(window($(".site")));
        $(".action-login").click(window($(".login")));
        $(".action-sales").click(newWindow("http://www.bipbop.com.br/#contato"));
        $(".action-buy").click(newWindow("https://api.bipbop.com.br/checkout.html"));
        
        $(".action-evaluate").click(function (e) {
            e.preventDefault();
            controller.call("authentication::force", BIPBOP_FREE);
        });
        
    });

    controller.registerBootstrap("site::carrousel", function (callback) {
        callback();
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
