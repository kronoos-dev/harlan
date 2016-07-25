'use strict';

var webpage = require('webpage');
var server = require('webserver');
var system = require('system');
var waitfor = require('./waitfor.js');

var onError = function(response, page) {
    response.statusCode = 500;
    response.closeGracefully();
    page.close();
};

var onSuccess = function(response, page, item) {
    response.setHeader("Cache-Control", "max-age=15552000");
    response.statusCode = 200;
    page.evaluate(function(item) {
        $("body").children().not("." + item).remove();
        $("body > ." + item).removeClass("hide");
        $("script").remove();
        $("style").remove();
    }, item);
    response.write(page.content);
    response.closeGracefully();
    page.close();
};

var listening = server.create().listen(8080, function(request, response) {

    var page = webpage.create();
    page.settings.loadImages = false;

    response.headers = {
        "Content-Type": "text/html; charset=UTF-8",
        "X-PhantomJS": "true"
    };
    
    page.onResourceRequested = function(requestData, request) {
        if (!/^https?:\/\/(www\.)?harlan\.com\.br/.test(requestData.url) || requestData.headers['Content-Type'] === 'text/css') {
            request.abort();
        }
    };

    if (request.url === "/") {
        page.open("https://www.harlan.com.br/development.html", "GET", function(status) {
            if (status !== 'success') {
                return onError(response, page);
            }

            waitfor(function() {
                return page.evaluate(function() {
                    if ($ === undefined) {
                        return false;
                    }
                    return $(".site").length;
                });
            }, function() {
                onSuccess(response, page, "site");
            }, function() {
                onError(response, page);
            }, 10000);
        });

        return;
    }

    page.open("https://www.harlan.com.br/" + request.url, "GET", function(status) {
        if (status !== 'success') {
            return onError(response, page);
        }

        waitfor(function() {
            return page.evaluate(function() {

                if (window.harlan === undefined) {
                    return false;
                }

                if (window.pageLoaded === undefined) {
                    window.pageLoaded = false;
                }

                if (window.registered === undefined) {
                    window.harlan.registerTrigger("seo::ready", function(args, callback) {
                        window.pageLoaded = true; /* GLOBAL */
                        callback();
                    }); /* Harlan Global */
                    window.registered = true;
                }

                return window.pageLoaded || $(".result").length > 0;
            });
        }, function() {
            onSuccess(response, page, "app");
        }, function() {
            onError(response, page);
        }, 15000);
    });
});

if (!listening) {
    phantom.exit(1);
}
