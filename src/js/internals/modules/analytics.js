module.exports = function (controller) {

    controller.registerBootstrap("analytics::mixpanel", function (callback) {
        (function (f, b) {
            if (!b.__SV) {
                var a, e, i, g;
                window.mixpanel = b;
                b._i = [];
                b.init = function (a, e, d) {

                    function f(b, h) {

                        var a = h.split(".");

                        if (a.length === 2) {
                            b = b[a[0]];
                            h = a[1];
                        }

                        b[h] = function () {
                            b.push([h].concat(Array.prototype.slice.call(arguments, 0)));
                        };
                    }

                    var c = b;
                    if ("undefined" !== typeof d) {
                        c = b[d] = [];
                    } else {
                        d = "mixpanel";
                    }
                    c.people = c.people || [];
                    c.toString = function (b) {
                        var a = "mixpanel";
                        if ("mixpanel" !== d) {
                            a += "." + d;
                        }
                        if (b) {
                            a += " (stub)";
                        }
                        return a;
                    };
                    c.people.toString = function () {
                        return c.toString(1) + ".people (stub)";
                    };
                    i = "disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
                    for (g = 0; g < i.length; g++)
                        f(c, i[g]);
                    b._i.push([a, e, d]);
                };
                b.__SV = 1.2;
                a = f.createElement("script");
                a.type = "text/javascript";
                a.async = !0;
                a.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
                e = f.getElementsByTagName("script")[0];
                e.parentNode.insertBefore(a, e);
            }
        })(document, window.mixpanel || []);
        mixpanel.init(controller.confs.mixPanel);
    });

    controller.registerBootstrap("analytics::google", function (callback) {
        callback();
        (function (h, a, r, l, n) {
            h.GoogleAnalyticsObject = r;
            if (!h[r]) {
                h[r] = function () {
                    (h[r].q = h[r].q || []).push(arguments);
                };
            }
            h[r].l = +new Date();
            l = a.createElement("script");
            n = a.scripts[0];
            l.src = "//www.google-analytics.com/analytics.js";
            n.parentNode.insertBefore(l, n);
        })(window, document, "googleAnalytics");

        googleAnalytics("create", controller.confs.googleAnalyticsId, "auto");
        googleAnalytics("send", "pageview");

    });
};