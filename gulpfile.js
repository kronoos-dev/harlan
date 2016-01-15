"use strict";

var fileinclude = require("gulp-file-include"),
        path = require("path"),
        texttojs = require('gulp-texttojs'),
        glob = require("glob"),
        util = require('gulp-util'),
        htmlhint = require("gulp-htmlhint"),
        compass = require("gulp-compass"),
        css2js = require("gulp-css2js"),
        minifyCSS = require("gulp-minify-css"),
        rename = require("gulp-rename"),
        thotypous = require("gulp-uglify"), /* S2 */
        sass = require("gulp-sass"),
        htmlMinifier = require("gulp-html-minifier"),
        imageop = require("gulp-image-optimization"),
        jshint = require("gulp-jshint"),
        babelify = require("babelify"),
        concat = require("gulp-concat"),
        browserify = require("browserify"),
        stylish = require("jshint-stylish"),
        transform = require("vinyl-transform"),
        source = require("vinyl-source-stream"),
        gulp = require("gulp"),
        addSource = require("gulp-add-src"),
        livereload = require("gulp-livereload"),
        ghPages = require("gulp-gh-pages"),
        streamqueue = require("streamqueue"),
        buffer = require("vinyl-buffer"),
        sourcemaps = require("gulp-sourcemaps"),
        gulpif = require("gulp-if"),
        messageformat = require("gulp-messageformat"),
        autoprefixer = require("gulp-autoprefixer"),
        notify = require('gulp-notify'),
        es = require('event-stream'),
        hashsrc = require('gulp-hash-src'),
        merge = require("merge-stream"),
        htmltojs = require('gulp-html-to-js');
;

var PRODUCTION = typeof util.env.production !== "undefined" ? true : false;
var DEVEL = !PRODUCTION;

var externalJsSources = [
    "bower_components/twin-bcrypt/twin-bcrypt.min.js",
    "bower_components/sql.js/js/sql.js",
    "bower_components/sql.js/js/worker.sql.js",
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
];

gulp.task("bower-swf", function () {
    return gulp.src([
        "bower_components/zeroclipboard/dist/ZeroClipboard.swf"
    ]).pipe(gulp.dest("Server/web/assets"));
});

gulp.task("manifest", function () {
    return gulp.src([
        "CNAME",
        "src/manifest.json",
        "src/robots.txt"
    ]).pipe(gulp.dest("Server/web"));
});

gulp.task("templates", function () {
    return gulp.src("src/templates/**/*.tpl")
            .pipe(gulp.dest("Server/web/templates"));
});

gulp.task("app-html", function () {
    return gulp.src("src/**/*.html")
            .pipe(fileinclude({
                prefix: "@@",
                basepath: "@file"
            }))
            .pipe(hashsrc({
                build_dir: "./Server/web",
                src_path: "./src"
            }))
            .pipe(htmlhint())
            .pipe(htmlhint.reporter())
            .pipe(htmlMinifier({
                collapseWhitespace: true,
                removeComments: true
            }))
            .pipe(gulp.dest("Server/web"))
            .pipe(livereload());
});

var i18n = function (locale) {
    return gulp.src("src/js/internals/i18n/" + locale + "/**/*.json")
            .pipe(messageformat({
                locale: locale,
                module: "commonJS"
            }))
            .pipe(gulp.dest("src/js/internals/i18n"));
};

gulp.task("i18n-en", function () {
    i18n("en");
});

gulp.task("i18n-pt", function () {
    i18n("pt");
});

gulp.task("i18n", ["i18n-pt", "i18n-en"]);

gulp.task("build-plugins-template", function () {
    return gulp.src('src/plugins/templates/**/*.html')
            .pipe(htmltojs())
            .pipe(gulp.dest('src/plugins/templates'));
});

gulp.task("build-plugins-sql", function () {
    return gulp.src('src/plugins/sql/**/*.sql')
            .pipe(texttojs({
                template: "module.exports = function (controller) { return controller.database.exec(<%= content %>); };"
            }))
            .pipe(gulp.dest('src/plugins/sql'));
});

gulp.task("build-plugins", ["build-plugins-template", "build-plugins-styles", "build-plugins-sql"], function () {
    var files = glob.sync("src/plugins/*.js");

    return merge(files.map(function (entry) {
        entry = "./" + entry;
        return browserify({
            entries: entry,
            debug: true
        })
                .transform(babelify, {presets: ["es2015", "react"]})
                .bundle()
                .pipe(source(path.basename(entry)))
                .pipe(buffer())
                .pipe(gulpif(DEVEL, sourcemaps.init({loadMaps: true})))
                .pipe(gulpif(PRODUCTION, thotypous()))
                .pipe(gulpif(DEVEL, sourcemaps.write(".")))
                .pipe(gulp.dest("Server/web/js"));
    }));

});

gulp.task("build-plugins-css", function () {
    return gulp.src("src/plugins/styles/**/*.css")
            .pipe(autoprefixer())
            .pipe(minifyCSS())
            .pipe(css2js())
            .pipe(gulp.dest("src/plugins/styles/"))
            .pipe(livereload());
});

gulp.task("build-plugins-sass", function () {
    return gulp.src("src/plugins/styles/**/*.scss")
            .pipe(sass())
            .pipe(autoprefixer())
            .pipe(minifyCSS())
            .pipe(css2js())
            .pipe(gulp.dest("src/plugins/styles"))
            .pipe(livereload());
});

gulp.task("build-plugins-styles", ["build-plugins-sass", "build-plugins-css"]);

gulp.task("deploy", function () {
    return gulp.src("./Server/web/**/*").pipe(ghPages());
});

gulp.task("jshint", function () {
    return gulp.src([
        "src/js/**/*.js",
        "!src/js/internals/i18n/**/*",
        "src/plugin-js/**/*.js"])
            .pipe(gulpif(PRODUCTION, jshint({esnext: true})))
            .pipe(gulpif(PRODUCTION, jshint.reporter(stylish)));
});

gulp.task("build-tests", ["jshint"], function () {
    return browserify({
        entries: "./src/js/tests/index.js",
        debug: true
    })
            .transform(babelify, {presets: ["es2015", "react"]})
            .bundle()
            .pipe(source("index.js"))
            .pipe(buffer())
            .pipe(addSource(externalJsSources.concat([
                "bower_components/chai/chai.js",
                "bower_components/mocha/mocha.js"
            ])))
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(concat("index.js"))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest("test/spec"))
            .pipe(livereload());
});

gulp.task("build-installer", function () {
    return browserify({
        entries: "./src/js/app-installer.js",
        debug: true
    })
            .transform(babelify, {presets: ["es2015", "react"]})
            .bundle()
            .pipe(source("app-installer.js"))
            .pipe(buffer())
            .pipe(gulpif(DEVEL, sourcemaps.init({loadMaps: true})))
            .pipe(gulpif(PRODUCTION, thotypous()))
            .pipe(concat("app-installer.js"))
            .pipe(gulpif(DEVEL, sourcemaps.write(".")))
            .pipe(gulp.dest("Server/web/js"))
            .pipe(livereload());
});

gulp.task("build-script", ["jshint", "i18n", "build-installer", "generate-service-worker"], function () {
    return browserify({
        entries: "./src/js/app.js",
        debug: true
    })
            .transform(babelify, {presets: ["es2015", "react"]})
            .bundle()
            .pipe(source("app.js"))
            .pipe(buffer())
            .pipe(addSource(externalJsSources))
            .pipe(gulpif(DEVEL, sourcemaps.init({loadMaps: true})))
            .pipe(gulpif(PRODUCTION, thotypous()))
            .pipe(concat("app.js"))
            .pipe(gulpif(DEVEL, sourcemaps.write(".")))
            .pipe(gulp.dest("Server/web/js"))
            .pipe(livereload())
            .pipe(notify({message: "JavaScript was constructed correctly and can now be used.", wait: false}));
});

gulp.task("app-images-vector", function () {
    gulp.src(["src/**/*.svg"])
            .pipe(gulp.dest("Server/web"));
});

gulp.task("app-images-no-vector", function () {
    return gulp.src([
        "src/**/*.png",
        "src/**/*.jpg",
        "src/**/*.gif",
        "src/**/*.jpeg"
    ])
            .pipe(gulpif(PRODUCTION, imageop({
                optimizationLevel: 5,
                progressive: true,
                interlaced: true
            })))
            .pipe(gulp.dest("Server/web"));
});

gulp.task("app-images", ["app-images-no-vector", "app-images-vector"]);

gulp.task("app-fonts", function () {
    return gulp.src([
        "bower_components/font-awesome/fonts/**/*"
    ]).pipe(gulp.dest("Server/web/fonts"));
});

gulp.task("build-styles", function () {
    return gulp.src([
        "src/scss/screen.scss"
    ])
            .pipe(gulpif(PRODUCTION, compass({
                css: "Server/web/css",
                sass: "src/scss",
                image: "Server/web/images"
            })))
            .pipe(gulpif(DEVEL, compass({
                css: "Server/web/css",
                sass: "src/scss",
                image: "Server/web/images",
                sourcemap: true
            })))
            .pipe(concat("app.css"))
            .pipe(autoprefixer())
            .pipe(minifyCSS())
            .pipe(gulp.dest("Server/web/css"))
            .pipe(livereload());
});

gulp.task("build", [
    "jshint",
    "build-plugins",
    "manifest",
    "app-fonts",
    "build-script",
    "bower-swf",
    "build-styles",
    "app-images",
    "templates",
    "app-html",
    "build-tests",
    "generate-service-worker"
]);

gulp.task('export-service-worker', function (callback) {
    var path = require('path');
    var swPrecache = require('sw-precache');

    swPrecache.write("src/js/sw.js", {
        staticFileGlobs: ['Server/web/**/*.{js,html,css,png,jpg,gif,svg}'],
        stripPrefix: "Server/web/"
    }, callback);
});

gulp.task('generate-service-worker', ['export-service-worker'], function () {
    return gulp.src(['src/js/sw.js'])
            .pipe(gulpif(DEVEL, sourcemaps.init({loadMaps: true})))
            .pipe(gulpif(PRODUCTION, thotypous()))
            .pipe(gulpif(DEVEL, sourcemaps.write(".")))
            .pipe(gulp.dest("Server/web/js"));
});

gulp.task("default", ["build", "watch"]);

gulp.task("watch", function () {
    livereload.listen();
    gulp.watch("src/js/internals/i18n/**/*.json", ["i18n", "build-script"]);
    gulp.watch(["src/scss/*", "src/scss/*.scss"], ["build-styles"]);
    gulp.watch(["src/js/*.js", "src/js/internals/**/*.js", "!src/js/app-installer.js", "!src/js/internals/i18n/**/*.js"], ["jshint", "build-script"]);
    gulp.watch("src/js/app-installer.js", ["jshint", "build-installer"]);
    gulp.watch("src/js/tests/**/*.js", ["jshint", "build-tests"]);
    gulp.watch(["src/**/*.html", "src/**/*.tpl"], ["app-html", "templates"]);
    gulp.watch([
        "src/plugins/styles/**/*.{css,scss}",
        "src/plugins/templates/**/*.html",
        "src/plugins/sql/**/*.sql",
        "src/plugins/**/*.js",
        "!src/plugins/templates/**/*.js",
        "!src/plugins/sql/**/*.js",
        "!src/plugins/styles/**/*.js"
    ], ["build-plugins"]);
});