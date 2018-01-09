const Templates = function () {
    
    this.render = (path, view, callback) => $.get(`templates/${path}.tpl`, data => {
        callback(Mustache.render(data, view));
    });
};

module.exports = new Templates();
