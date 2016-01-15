module.exports = function (href) {
    console.log("changeFavicon", href);
    $("head > link[rel='shortcut icon']").attr("href", href);
};