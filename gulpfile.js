"use strict";

var fileinclude = require("gulp-file-include"),
        htmlhint = require("gulp-htmlhint"),
        compass = require("gulp-compass"),
        minifyCSS = require("gulp-minify-css"),
        rename = require("gulp-rename"),
        thotypous = require("gulp-uglify"), /* S2 */
        sass = require("gulp-sass"),
        htmlMinifier = require("gulp-html-minifier"),
        imageop = require("gulp-image-optimization"),
        jshint = require("gulp-jshint"),
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
        messageformat = require("gulp-messageformat"),
        autoprefixer = require("gulp-autoprefixer"),
        notify = require('gulp-notify'),
        hashsrc = require('gulp-hash-src');

var externalJsSources = [
    "bower_components/jquery/dist/jquery.js",
    "bower_components/jquery.bipbop/dist/jquery.bipbop.js",
    "bower_components/toastr/toastr.js",
    "bower_components/zeroclipboard/dist/ZeroClipboard.js",
    "bower_components/oauth.io/dist/oauth.min.js",
    "bower_components/jquery.finger/dist/jquery.finger.js",
    "bower_components/jquery.maskedinput/dist/jquery.maskedinput.js",
    "bower_components/d3/d3.js",
    "bower_components/mustache/mustache.js",
    "bower_components/nvd3/build/nv.d3.js",
    "bower_components/moment/min/moment-with-locales.js",
    "bower_components/numeral/numeral.js",
    "bower_components/numeral/languages.js",
    "bower_components/numeral/languages.js",
    "bower_components/material-design-lite/material.js",
    "bower_components/d3plus/d3plus.full.js"
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

gulp.task("build-external-scripts", ["i18n"], function () {
    return gulp.src("src/external-js/**/*.js")
            .pipe(jshint())
            .pipe(jshint.reporter(stylish))
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(thotypous())
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest("Server/web/js"))
            .pipe(livereload());
});

gulp.task("build-external-css", function () {
    return gulp.src("src/external-styles/**/*.css")
            .pipe(autoprefixer())
            .pipe(minifyCSS())
            .pipe(rename({suffix: ".min"}))
            .pipe(gulp.dest("Server/web/css"))
            .pipe(livereload());
});

gulp.task("build-external-scss", function () {
    return gulp.src("src/external-styles/**/*.scss")
            .pipe(sass())
            .pipe(autoprefixer())
            .pipe(minifyCSS())
            .pipe(rename({suffix: ".min"}))
            .pipe(gulp.dest("Server/web/css"))
            .pipe(livereload());
});

gulp.task("build-external-styles", ["build-external-scss", "build-external-css"]);


gulp.task("deploy", function () {
    return gulp.src("./Server/web/**/*").pipe(ghPages());
});

gulp.task("jshint", function () {
    return gulp.src(["src/js/**/*.js", "!src/js/internals/i18n/**/*"])
            .pipe(jshint())
            .pipe(jshint.reporter(stylish))
            .pipe(jshint.reporter('fail'));
});

gulp.task("build-tests", ["jshint"], function () {
    return browserify({
        entries: "./src/js/tests/index.js",
        debug: true
    })
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

gulp.task("build-scripts", ["jshint"], function () {
    return browserify({
        entries: "./src/js/app.js",
        debug: true
    })
            .bundle()
            .pipe(source("app.js"))
            .pipe(buffer())
            .pipe(addSource(externalJsSources))
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(thotypous())
            .pipe(concat("app.min.js"))
            .pipe(sourcemaps.write("."))
            .pipe(gulp.dest("Server/web/js"))
            .pipe(livereload())
            .pipe(notify({message: "JavaScript was constructed correctly and can now be used.", wait: true}));
});

gulp.task("app-images", function () {
    return streamqueue({objectMode: true}, gulp.src([
        "src/**/*.png",
        "src/**/*.jpg",
        "src/**/*.gif",
        "src/**/*.jpeg"
    ]).pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })).pipe(gulp.dest("Server/web")), gulp.src(["src/**/*.svg"]).pipe(gulp.dest("Server/web")));
});

gulp.task("watch", function () {
    livereload.listen();

    gulp.watch("src/js/internals/i18n/**/*.json", ["i18n", "build-scripts"]);
    gulp.watch("src/scss/*", ["build-styles"]);
    gulp.watch("src/scss/*.scss", ["build-styles"]);
    gulp.watch(["src/js/*.js", "src/js/internals/**/*.js"], ["jshint", "build-scripts"]);
    gulp.watch("src/js/tests/**/*.js", ["jshint", "build-tests"]);
    gulp.watch(["src/**/*.html", "src/**/*.tpl"], ["app-html", "templates"]);
    gulp.watch("src/external-js/**/*.js", ["build-external-scripts"]);
    gulp.watch("src/external-styles/**/*", ["build-external-styles"]);
});

gulp.task("app-fonts", function () {
    return gulp.src([
        "bower_components/font-awesome/fonts/**/*"
    ]).pipe(gulp.dest("Server/web/fonts"));
});

gulp.task("build-styles", function () {

    return streamqueue({objectMode: true}, gulp.src([
        "bower_components/font-awesome/scss/**/*.scss",
        "bower_components/toastr/*.scss"
    ]).pipe(sass()), gulp.src([
        "bower_components/animate.css/animate.css",
        "bower_components/nvd3/build/nv.d3.css",
        "bower_components/material-design-lite/material.css"
    ]), gulp.src([
        "src/scss/screen.scss"
    ])
            .pipe(compass({
                css: "temp/css",
                sass: "src/scss",
                image: "Server/web/img",
                sourcemap: false
            })))
            .pipe(concat("app.css"))
            .pipe(minifyCSS())
            .pipe(rename({suffix: ".min"}))
            .pipe(gulp.dest("Server/web/css"))
            .pipe(livereload());
});

gulp.task("build", [
    "jshint",
    "build-external-scripts",
    "build-external-styles",
    "manifest",
    "app-fonts",
    "build-scripts",
    "bower-swf",
    "build-styles",
    "app-images",
    "templates",
    "app-html",
    "build-tests"
]);

gulp.task("default", ["build", "watch"]);
