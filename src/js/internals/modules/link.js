module.exports = function (link) {

    let links = [];

    controller.registerCall("link::register", (regex, callback) => {
        links.push([regex, callback]);
    });

    controller.registerCall("link", (href, e) => {
        for (let [regex, callback] of links) {
            if (regex.test(href)) return callback(e);
        }
    });
};
