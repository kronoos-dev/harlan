/* global module */

var Form = require("./lib/form");

var GAMIFICATION_IMAGE = "/images/gamification.png";
new Image().src = GAMIFICATION_IMAGE; /* Preload Image */
var gamificationIcons = require("./data/gamification-icons");

var SAFARI_HACK_REFRESH_RATE = 500;

/**
 * Inicializa um modal
 */
module.exports = (controller) =>  {

    var Modal = function () {
        var modal = $("<div />").addClass("modal-content");
        var modalContainer = $("<div />").addClass("modal")
                .append($("<div />").append($("<div />").append(modal)));

        var onEsc = (e) => {
            if (e.keyCode == 27) {
                this.close();
            }
        };

        $(document).one("keyup", onEsc);

        $(controller.confs.container).append(modalContainer);

        var webkitIOSandSafariHack = () =>  {
            var modalHeight = modal.outerHeight();
            modal.parent().css("height", window.innerHeight > modalHeight ?
                    modal.outerHeight() : window.innerHeight);
        };

        $(window).resize(webkitIOSandSafariHack);
        var interval = setInterval(webkitIOSandSafariHack, SAFARI_HACK_REFRESH_RATE);

        modal.on("remove", () =>  {
            clearInterval(interval);
        });

        this.gamification = (type) =>  {
            var image = $("<div />")
                    .addClass("gamification").addClass(gamificationIcons[type] || type);
            modal.append(image);
            return image;
        };

        this.title = (content) =>  {
            var h2 = $("<h2 />").text(content);
            modal.append(h2);
            return h2;
        };

        this.subtitle = (content) =>  {
            var h3 = $("<h3 />").text(content);
            modal.append(h3);
            return h3;
        };

        this.paragraph = (content) =>  {
            var p = $("<p />").html(content);
            modal.append(p);
            return p;
        };

        this.addParagraph = this.paragraph;

        this.addProgress = (initProgress) =>  {
            var progress = controller.call("progress::init", initProgress);
            modal.append(progress.element);
            return (perc) =>  {
                controller.call("progress::update", progress, perc);
            };
        };

        this.imageParagraph = (image, content, imageTitle, imageAlternative) =>  {
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

        this.createForm = () =>  {
            return new Form(this, controller);
        };

        this.fullscreen = () => {
            modalContainer.addClass("fullscreen");
        };

        this.element = () =>  {
            return modal;
        };

        this.modal = () =>  {
            return modalContainer;
        };

        this.onClose = null;

        this.close = () => {
            $(document).unbind("keyup", onEsc);
            if (this.onClose) {
                this.onClose();
            }
            modalContainer.remove();
        };

        this.createActions = () =>  {
            var actions = $("<ul />").addClass("actions");
            modal.append(actions);
            var add = (name) => {
                var link = $("<a />").attr("href", "#").html(name),
                        item = $("<li> /").append(link);
                actions.append(item);
                return item;
            };
            return {
                add: add,
                cancel: (onExit, text) =>  {
                    add(text || controller.i18n.system.cancel()).click((e) => {
                        e.preventDefault();
                        if (onExit) onExit();
                        this.close();
                    });
                },
                observation: (name) =>  {
                    var item = $("<li> /").html(name);
                    actions.append(item);
                    return item;
                }
            };
        };


        return this;
    };

    controller.registerCall("modal", controller.modal = () =>  {
        return new Modal();
    });

};
