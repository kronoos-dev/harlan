/* global module */

module.exports = function (controller) {

    controller.registerCall("instantSearch", function (input, callback) {
        var autocomplete = controller.call("autocomplete", input);

        var searchLength;
        var searchId;

        input.keyup(function () {
            var search = input.val();
            var newLength = search.length;

            if (newLength === searchLength)
                return;

            autocomplete.empty();
            searchLength = newLength;

            if (searchId) {
                clearTimeout(searchId);
            }

            searchId = setTimeout(function () {
                input.addClass("loading");
                callback(search, autocomplete, function () {
                    $(".q").removeClass("loading");
                });
            }, controller.confs.instantSearchDelay);
        });
    });
};