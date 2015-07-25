/* global module */

module.exports = function (windowSelector) {
    $("body > *").addClass("hide");
    $(windowSelector).removeClass("hide");
};