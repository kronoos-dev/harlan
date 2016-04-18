(function () {
    "use strict";

    var fs = require("fs"),
            crypto = require('crypto'),
            pako = require("gulp-pako"),
            bg = require("gulp-image-resize"),
            preprocess = require("gulp-preprocess"),
            fileinclude = require("gulp-file-include"),
            path = require("path"),
            texttojs = require('gulp-texttojs'),
            glob = require("glob"),
            util = require('gulp-util'),
            htmlhint = require("gulp-htmlhint"),
            compass = require("gulp-compass"),
            css2js = require("gulp-css2js"),
            cssjoin = require('gulp-import-css'),
            nano = require("gulp-cssnano"),
            thotypous = require("gulp-uglify"), /* S2 */
            sass = require("gulp-sass"),
            htmlMinifier = require("gulp-html-minifier"),
            imageop = require("gulp-image-optimization"),
            jshint = require("gulp-jshint"),
            babelify = require("babelify"),
            concat = require("gulp-concat"),
            markdown = require("gulp-markdown"),
            browserify = require("browserify"),
            stylish = require("jshint-stylish"),
            source = require("vinyl-source-stream"),
            gulp = require("gulp"),
            filter = require('gulp-filter'),
            imageResize = require("gulp-image-resize"),
            addSource = require("gulp-add-src"),
            livereload = require("gulp-livereload"),
            ghPages = require("gulp-gh-pages"),
            buffer = require("vinyl-buffer"),
            sourcemaps = require("gulp-sourcemaps"),
            gulpif = require("gulp-if"),
            messageformat = require("gulp-messageformat"),
            autoprefixer = require("gulp-autoprefixer"),
            hashsrc = require('gulp-hash-src'),
            merge = require("merge-stream"),
            htmltojs = require('gulp-html-to-js');

    var PRODUCTION = typeof util.env.production !== "undefined" ? true : false,
            DEVEL = !PRODUCTION,
            PREPROCESSOR_CONTEXT = {
                context: {
                    CONTEXT: PRODUCTION ? "PRODUCTION" : "DEVELOPMENT"
                }
            };

    var externalJsSources = [
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
    ];

    gulp.task("bower-swf", function () {
        return gulp.src([
            "bower_components/zeroclipboard/dist/ZeroClipboard.swf"
        ]).pipe(gulp.dest("Server/web/assets"));
    });

    gulp.task("legal", function () {
        return gulp.src([
            "legal/**/*.pdf"
        ]).pipe(gulp.dest("Server/web/legal"));
    });

    gulp.task("manifest", function () {
        return gulp.src([
            "manifest.json",
            "CNAME",
            "src/robots.txt"
        ]).pipe(gulp.dest("Server/web"));
    });

    gulp.task("templates", function () {
        return gulp.src("src/templates/**/*.tpl")
                .pipe(gulp.dest("Server/web/templates"));
    });

    gulp.task("build-html", function () {
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
                .pipe(htmlMinifier({
                    collapseWhitespace: true,
                    removeComments: true
                }))
                .pipe(htmltojs())
                .pipe(gulp.dest('src/plugins/templates'));
    });

    gulp.task("build-plugins-markdown", function () {
        return gulp.src('src/plugins/markdown/**/*.md')
                .pipe(markdown())
                .pipe(htmlMinifier({
                    collapseWhitespace: true,
                    removeComments: true
                }))
                .pipe(htmltojs())
                .pipe(gulp.dest('src/plugins/markdown'));
    });


    gulp.task("build-plugins-sql", function () {
        return gulp.src('src/plugins/sql/**/*.sql')
                .pipe(texttojs({
                    template: "module.exports = function (controller) { return controller.database.exec(<%= content %>); };"
                }))
                .pipe(gulp.dest('src/plugins/sql'));
    });

    gulp.task("build-plugins", [
        "build-plugins-template",
        "build-plugins-markdown",
        "build-plugins-styles",
        "build-plugins-sql"
    ], function () {
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
                    .pipe(gulp.dest("Server/web/js"))
                    .pipe(livereload());
        }));

    });

    gulp.task("build-plugins-css", function () {
        return gulp.src("src/plugins/styles/**/*.css")
                .pipe(autoprefixer())
                .pipe(cssjoin())
                .pipe(nano())
                .pipe(css2js())
                .pipe(gulp.dest("src/plugins/styles/"));
    });

    gulp.task("build-plugins-sass", function () {
        return gulp.src("src/plugins/styles/**/*.scss")
                .pipe(sass())
                .pipe(autoprefixer())
                .pipe(cssjoin())
                .pipe(nano())
                .pipe(css2js())
                .pipe(gulp.dest("src/plugins/styles"));
    });

    gulp.task("build-plugins-styles", ["build-plugins-sass", "build-plugins-css"]);

    gulp.task("deploy", function () {
        return gulp.src("./Server/web/**/*").pipe(ghPages());
    });

    gulp.task("jshint", function () {
        return gulp.src([
            "src/js/**/*.js",
            "!src/js/internals/i18n/**/*",
            "src/plugins/**/*.js"])
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
                .pipe(gulp.dest("test/spec"));
    });

    gulp.task("build-inflate", function () {
        return browserify({
            entries: "./src/js/app-inflate.js",
            debug: true
        })
                .transform(babelify, {presets: ["es2015", "react"]})
                .bundle()
                .pipe(source("app-inflate.js"))
                .pipe(buffer())
                .pipe(gulpif(DEVEL, sourcemaps.init({loadMaps: true})))
                .pipe(gulpif(PRODUCTION, thotypous()))
                .pipe(concat("app-inflate.js"))
                .pipe(gulpif(DEVEL, sourcemaps.write(".")))
                .pipe(gulp.dest("Server/web/js"));
    });

    gulp.task("build-service-worker", function () {
        return browserify({
            entries: "./src/js/service-worker.js",
            debug: true
        })
                .transform(babelify, {presets: ["es2015", "react"]})
                .bundle()
                .pipe(source("service-worker.js"))
                .pipe(buffer())
                .pipe(gulpif(DEVEL, sourcemaps.init({loadMaps: true})))
                .pipe(gulpif(PRODUCTION, thotypous()))
                .pipe(concat("service-worker.js"))
                .pipe(gulpif(DEVEL, sourcemaps.write(".")))
                .pipe(gulp.dest("Server/web"));
    });

    gulp.task("build-installer", ["build-application"], function () {
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
                .pipe(preprocess({context: {
                        COMPRESSED_SIZE: fs.statSync("./Server/web/js/app.js.gz").size,
                        APP_SIZE: fs.statSync("./Server/web/js/app.js").size,
                        MD5: crypto.createHash('md5').update(fs.readFileSync("./Server/web/js/app.js")).digest("hex")
                    }}))
                .pipe(gulpif(DEVEL, sourcemaps.write(".")))
                .pipe(gulp.dest("Server/web/js"));
    });

    gulp.task("build-application", ["jshint", "i18n"], function () {
        return browserify({
            entries: "./src/js/app.js",
            debug: true
        })
                .transform(babelify, {presets: ["es2015", "react"]})
                .bundle()
                .pipe(source("app.js"))
                .pipe(buffer())
                .pipe(preprocess(PREPROCESSOR_CONTEXT))
                .pipe(addSource(externalJsSources))
                .pipe(gulpif(DEVEL, sourcemaps.init({loadMaps: true})))
                .pipe(gulpif(PRODUCTION, thotypous()))
                .pipe(concat("app.js"))
                .pipe(gulpif(DEVEL, sourcemaps.write(".")))
                .pipe(gulp.dest("Server/web/js"))
                .pipe(pako.gzip())
                .pipe(gulp.dest("Server/web/js"))
                .pipe(livereload());
    });

    gulp.task("build-images-vector", function () {
        gulp.src(["src/**/*.svg"])
                .pipe(gulp.dest("Server/web"));
    });

    gulp.task("build-images-backgrounds", function () {

        return gulp.src([
            "src/images/bg/*.{jpg,jpeg}"
        ])
                .pipe(imageResize({
                    width: 4096,
                    quality: 0.8,
                    format: "jpg"
                }))
                .pipe(gulpif(PRODUCTION, imageop({
                    optimizationLevel: 5,
                    progressive: true,
                    interlaced: true
                })))
                .pipe(gulp.dest("Server/web/images/bg"));
    });

    gulp.task("build-images-no-vector", function () {

        return gulp.src([
            "src/**/*.png",
            "src/**/*.jpg",
            "src/**/*.gif",
            "src/**/*.jpeg",
            "!src/images/bg/*.jpg"
        ])
                .pipe(gulpif(PRODUCTION, imageop({
                    optimizationLevel: 5,
                    progressive: true,
                    interlaced: true
                })))
                .pipe(gulp.dest("Server/web"));
    });

    gulp.task("build-images", ["build-images-no-vector", "build-images-vector", "build-images-backgrounds"]);

    gulp.task("build-fonts", function () {
        return gulp.src([
            "bower_components/font-awesome/fonts/**/*"
        ]).pipe(gulp.dest("Server/web/fonts"));
    });

    gulp.task("build-styles", function () {
        return gulp.src([
            "src/scss/screen.scss"
        ])
                .pipe(compass({
                    css: "Server/web/css",
                    sass: "src/scss",
                    image: "Server/web/images"
                }))
                .pipe(buffer())
                .pipe(autoprefixer())
                .pipe(cssjoin())
                .pipe(concat("app.css"))
                .pipe(nano({
                    reduceIdents: false,
                    mergeIdents: false
                }))
                .pipe(gulp.dest("Server/web/css"))
                .pipe(livereload());
    });

    gulp.task("build", [
        "build-service-worker",
        "manifest",
        "legal",
        "jshint",
        "build-plugins",
        "build-fonts",
        "build-application",
        "bower-swf",
        "build-styles",
        "build-images",
        "templates",
        "build-html",
        "build-tests",
        "build-inflate",
        "build-installer"
    ]);

    gulp.task("default", ["build", "watch"]);

    gulp.task("watch", function () {
        livereload.listen();
        gulp.watch("src/js/internals/i18n/**/*.json", ["i18n", "build-installer", "build-application"]);
        gulp.watch(["src/scss/*", "src/scss/*.scss"], ["build-styles"]);
        gulp.watch(["src/js/service-worker.js"], ["build-service-worker"]);
        gulp.watch([
            "src/js/*.js",
            "src/js/internals/**/*.js",
            "!src/js/service-worker.js",
            "!src/js/app-installer.js",
            "!src/js/app-inflate.js",
            "!src/js/internals/i18n/**/*.js"], ["jshint", "build-application", "build-installer"]);
        gulp.watch("src/js/app-inflate.js", ["jshint", "build-inflate"]);
        gulp.watch("src/js/app-installer.js", ["jshint", "build-installer"]);
        gulp.watch("src/js/tests/**/*.js", ["jshint", "build-tests"]);
        gulp.watch(["src/**/*.html", "src/**/*.tpl"], ["build-html", "templates"]);
        gulp.watch([
            "src/plugins/styles/**/*.{css,scss}",
            "src/plugins/templates/**/*.html",
            "src/plugins/sql/**/*.sql",
            "src/plugins/**/*.js",
            "src/plugins/markdown/**/*.md",
            "!src/plugins/markdown/**/*.js",
            "!src/plugins/templates/**/*.js",
            "!src/plugins/sql/**/*.js",
            "!src/plugins/styles/**/*.js"
        ], ["build-plugins"]);
    });

}());
