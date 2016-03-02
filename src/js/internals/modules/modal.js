/* global module */

var Form = require("./lib/form");

var GAMIFICATION_IMAGE = "images/gamification.png";
new Image().src = GAMIFICATION_IMAGE; /* Preload Image */
var gamificationIcons = require("./data/gamification-icons");

var SAFARI_HACK_REFRESH_RATE = 500;

/**
 * Inicializa um modal
 */
module.exports = function (controller) {

    var Modal = function () {
        var modal = $("<div />").addClass("modal-content");
        var modalContainer = $("<div />").addClass("modal")
                .append($("<div />").append($("<div />").append(modal)));


        $("body").append(modalContainer);


        var webkitIOSandSafariHack = function () {
            var modalHeight = modal.outerHeight();
            modal.parent().css("height", window.innerHeight > modalHeight ?
                    modal.outerHeight() : window.innerHeight);
        };

        $(window).resize(webkitIOSandSafariHack);
        var interval = setInterval(webkitIOSandSafariHack, SAFARI_HACK_REFRESH_RATE);
        
        modal.on("remove", function () {
            clearInterval(interval);
        });

        this.gamification = function (type) {
            var image = $("<div />")
                    .addClass("gamification").addClass(gamificationIcons[type]);
            modal.append(image);
            return image;
        };

        this.title = function (content) {
            var h2 = $("<h2 />").text(content);
            modal.append(h2);
            return h2;
        };

        this.subtitle = function (content) {
            var h3 = $("<h3 />").text(content);
            modal.append(h3);
            return h3;
        };

        this.addParagraph = function (content) {
            var p = $("<p />").html(content);
            modal.append(p);
            return p;
        };

        this.addProgress = function (initProgress) {
            var progress = controller.call("progress::init", initProgress);
            modal.append(progress.element);
            return function (perc) {
                controller.call("progress::update", progress, perc);
            };
        };

        this.imageParagraph = function (image, content, imageTitle, imageAlternative) {
            var wizard = $("<div />").addClass("wizard")
                    .append($("<div />").addClass("item")
                            .append($("<div />").addClass("icon").append($("<img />").attr({
                                title: imageTitle,
                                alt: imageAlternative,
                                src: image
                            }))).append($("<p />").text(content)));

            modal.append(wizard);
            return wizard;
        };

        this.createActions = function () {
            var actions = $("<ul />").addClass("actions");
            modal.append(actions);
            return {
                add: function (name) {
                    var link = $("<a />").attr("href", "#").text(name),
                            item = $("<li> /").append(link);
                    actions.append(item);
                    return item;
                },
                observation: function (name) {
                    var item = $("<li> /").text(name);
                    actions.append(item);
                    return item;
                }
            };


        };

        this.createForm = function () {
            return new Form(this, controller);
        };

        this.element = function () {
            return modal;
        };

        this.modal = function () {
            return modalContainer;
        };

        this.close = function () {
            modalContainer.remove();
        };

        var close = this.close;

        return this;
    };

    controller.registerCall("modal", function () {
        return new Modal();
    });

};