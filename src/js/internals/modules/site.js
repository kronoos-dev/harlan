module.exports = function (controller) {

    controller.registerBootstrap("site::buttons", function (callback) {
        callback();
        controller.call("site::buttons");
    });

    controller.registerCall("site::buttons", function (callback) {
        var window = function (window) {
            return function (e) {
                e.preventDefault();
                controller.interface.helpers.activeWindow(window);
            };
        };

        var newWindow = function (href) {
            return function (e) {
                e.preventDefault();
                document.location.href = href;
            };
        };

        $(".action-home").click(function (e) {
            e.preventDefault();
            controller.call("default::page");
        });
        $("body > .site .action-login").click(window($(".login")));
        $("body > .site .action-sales").click(newWindow("http://www.bipbop.com.br/#contato"));
        $("body > .site .action-buy").click(newWindow("https://api.bipbop.com.br/checkout.html"));

        $("body > .site .action-evaluate").click(function (e) {
            e.preventDefault();
            controller.call("authentication::force", BIPBOP_FREE);
        });
    });

    controller.registerBootstrap("site::carrousel", function (callback) {
        callback();

        for (var i = 0; i <= 5; i++) {
            $("body > .site .carrousel").append($("<img />")
                    .attr("src", "images/site/screenshoots/" + i.toString() + ".png"));
        }


        controller.call("site::carrousel");
    });

    controller.registerCall("site::carrousel", function () {
        var carrousel = $("body > .site .carrousel");
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
