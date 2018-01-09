module.exports = controller => {

    controller.registerBootstrap('analytics::google', callback => {
        callback();
        (((h, a, r, l, n) => {
            h.GoogleAnalyticsObject = r;
            if (!h[r]) {
                h[r] = function(...args) {
                    (h[r].q = h[r].q || []).push(args);
                };
            }
            h[r].l = +new Date();
            l = a.createElement('script');
            n = a.scripts[0];
            l.src = '//www.google-analytics.com/analytics.js';
            n.parentNode.insertBefore(l, n);
        }))(window, document, 'googleAnalytics');

        googleAnalytics('create', controller.confs.googleAnalyticsId, 'auto');
        googleAnalytics('send', 'pageview');

    });
};