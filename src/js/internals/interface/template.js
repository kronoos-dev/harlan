var Templates = function () {
    
    this.render = function (path, view, callback) {
        return $.get("templates/" + path + ".tpl", function (data) {
            callback(Mustache.render(data, view));
        });
    };
};

module.exports = new Templates();
