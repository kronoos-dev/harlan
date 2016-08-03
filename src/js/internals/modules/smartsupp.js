module.exports = (controller) => {

    controller.registerTrigger('bootstrap::end', 'smartsupp', (data, cb, _smartsupp = {}) => {
        cb();

        window._smartsupp = _smartsupp;
        window._smartsupp.key = controller.confs.smartsupp;
        (window.smartsupp || (function(d) {
            var s, c, o = window.smartsupp = function() {
                o._.push(arguments);
            };
            o._ = [];
            s = d.getElementsByTagName('script')[0];
            c = d.createElement('script');
            c.type = 'text/javascript';
            c.charset = 'utf-8';
            c.async = true;
            c.src = '//www.smartsuppchat.com/loader.js?';
            s.parentNode.insertBefore(c, s);
        }))(document);

    });

};
