"use strict";

import browserSync from "browser-sync";
import gulp from "gulp";
import gulpLoadPlugins from "gulp-load-plugins";
import runSequence from "run-sequence";

const $ = gulpLoadPlugins(),
    reload = browserSync.reload,
    externalJsSources = [
        "bower_components/twin-bcrypt/twin-bcrypt.min.js",
        "bower_components/sql.js/js/sql.js",
        "bower_components/react/react.js",
        "bower_components/react/react-dom.js",
        "bower_components/jquery/dist/jquery.js",
        "bower_components/jquery/dist/jquery.js",
        "bower_components/jquery.bipbop/dist/jquery.bipbop.js",
        "bower_components/jquery.payment/lib/jquery.payment.js",
        "bower_components/jquery-mask-plugin/src/jquery.mask.js",
        "bower_components/oauth.io/dist/oauth.min.js",
        "bower_components/zeroclipboard/dist/ZeroClipboard.js",
        "bower_components/toastr/toastr.js",
        "bower_components/mustache/mustache.js",
        "bower_components/moment/min/moment-with-locales.js",
        "bower_components/numeral/numeral.js",
        "bower_components/numeral/languages.js",
        "bower_components/material-design-lite/material.js",
        "bower_components/pikaday/pikaday.js",
        "bower_components/pikaday/plugins/pikaday.jquery.js"
    ],
    PRODUCTION = typeof util.env.production !== "undefined" ? true : false,
    DEVEL = !PRODUCTION,
    PREPROCESSOR_CONTEXT = {
        context: {
            CONTEXT: PRODUCTION ? "PRODUCTION" : "DEVELOPMENT"
        }
    };
