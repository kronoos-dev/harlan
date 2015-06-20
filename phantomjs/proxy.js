var webpage = require('webpage');
var server = require('webserver')
var system = require('system');
var waitfor = require('./waitfor.js');

var listening = server.create().listen(8080, function (request, response) {

    var page = webpage.create();
    page.settings.loadImages = false;

    response.headers = {
        "Content-Type" : "text/html; charset=UTF-8",
        "X-PhantomJS" : "true"
    };
    page.onResourceRequested = function (requestData, request) {
        if ((/http:\/\/.+?\.css/gi).test(requestData['url']) ||
                requestData.headers['Content-Type'] == 'text/css') {
            console.log('The url of the request is matching. Aborting: ' + requestData['url']);
            request.abort();
        }
    };

    page.onResourceError = function (resourceError) {
        console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
        console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
    };

    page.onError = function (msg, trace) {

        var msgStack = ['ERROR: ' + msg];

        if (trace && trace.length) {
            msgStack.push('TRACE:');
            trace.forEach(function (t) {
                msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
            });
        }

        console.error(msgStack.join('\n'));

    }
    ;
    page.open("http://harlan.bipbop.com.br" + request.url, "GET", function (status) {
        if (status !== 'success') {
            response.statusCode = 500;
            response.write(page.content);
            response.close();
            page.close();
            return;
        }

        waitfor(function () {
            return page.evaluate(function (arg) {

                if (typeof harlan === "undefined") {
                    return false;
                }

                if (typeof pageLoaded === "undefined") {
                    pageLoaded = false;
                }

                if (typeof registered === "undefined") {
                    harlan.registerTrigger("call::loader::unregister", function (args, callback) {
                        pageLoaded = true; /* GLOBAL */
                        callback();
                    }); /* Harlan Global */
                    registered = true;
                }

                console.log("O status da página é " + (pageLoaded ? "true" : "false"));

                return pageLoaded || $(".result").length > 0;
            });
        }, function () {
            response.statusCode = 200;
            response.write(page.content);
            response.close();
            page.close();
        }, function () {
            response.statusCode = 500;
            response.write(page.content);
            response.close();
            page.close();
        }, 30000);
    });



});

if (!listening) {
    console.log("could not create web server listening on port 8080");
    phantom.exit(1);
}
