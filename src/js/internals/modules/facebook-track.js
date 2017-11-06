module.exports = function(controller) {

    /** ugly facebook code */
    controller.registerBootstrap("facebook::track", callback => {

        !function(f, b, e, v, n, t, s) {
            if (f.fbq)
                return;
            n = f.fbq = function() {
                if (n.callMethod) n.callMethod.apply(n, arguments);
                else n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        fbq('init', controller.confs.facebookCode);
        fbq('track', 'PageView');

        $("body").append($("<noscript />").append($("<img />").attr({
            height: 1,
            width: 1,
            src: `https://www.facebook.com/tr?id=${controller.confs.facebookCode}&ev=PageView&noscript=1`
        }).css({
            display: 'none'
        })));

        callback();
    });

};
