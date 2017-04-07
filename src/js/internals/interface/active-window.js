module.exports = function (windowSelector) {
    $("body > *").addClass("hide");
    $(windowSelector).not(function (i, e) {
        return $(e).parent().get(0).tagName.toLowerCase() !== "body";
    }).removeClass("hide");
};
