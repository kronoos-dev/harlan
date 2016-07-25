/* global harlan, phantom */
var webpage = require('webpage');
var server = require('webserver');
var system = require('system');
var waitfor = require('./waitfor.js');

var listening = server.create().listen(8080, function(request, response) {

    var page = webpage.create();
    page.settings.loadImages = false;

    response.headers = {
        "Content-Type": "text/html; charset=UTF-8",
        "X-PhantomJS": "true"
    };
    page.onResourceRequested = function(requestData, request) {
        if (!/^https?:\/\/(www\.)?harlan\.com\.br/.test(requestData['url']) || requestData.headers['Content-Type'] == 'text/css') {
            request.abort();
        }
    };

    page.onResourceError = function(resourceError) {};
    page.onError = function(msg, trace) {};

    page.open("http://www.harlan.com.br" + request.url, "GET", function(status) {
        if (status !== 'success') {
            response.statusCode = 500;
            response.write(page.content);
            response.close();
            page.close();
            return;
        }

        waitfor(function() {
            return page.evaluate(function(arg) {

                if (typeof harlan === "undefined") {
                    return false;
                }

                if (typeof pageLoaded === "undefined") {
                    pageLoaded = false;
                }

                if (typeof registered === "undefined") {
                    harlan.registerTrigger("seo::ready", function(args, callback) {
                        pageLoaded = true; /* GLOBAL */
                        callback();
                    }); /* Harlan Global */
                    registered = true;
                }

                return pageLoaded || $(".result").length > 0;
            });
        }, function() {
            response.statusCode = 200;
            return page.evaluate(function () {
                $("body").children().not(".app").remove();
            });
            response.write(page.content);
            response.close();
            page.close();
        }, function() {
            response.statusCode = 500;
            response.write(page.content);
            response.close();
            page.close();
        }, 30000);
    });
});

if (!listening) {
    phantom.exit(1);
}
