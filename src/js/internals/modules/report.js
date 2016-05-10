/* global module */
var gamificationIcons = require("./data/gamification-icons"),
    Form = require("./lib/form");

var ReportModel =function (closeable) {
    var universalContainer = $("<div />"),
        elementNews = $("<div />").addClass("report"),
        elementContainer = $("<div />").addClass("container"),
        elementActions = $("<ul />").addClass("r-actions"),
        elementContent = $("<div />").addClass("content"),
        elementOpen = null;

    universalContainer.append(elementNews.append(elementContainer
        .append(elementActions)
        .append(elementContent)));

    var buttonElement = () => {
        if (!elementOpen) {
            elementOpen = $("<div />").addClass("open");
            elementContent.append(elementOpen);
        }
        return elementOpen;
    };

    this.newContent = () => {
        elementContent = $("<div />").addClass("content");
        elementContainer.prepend(elementContent);
        return this;
    };

    this.title = (title) => {
        elementContent.append($("<h2 />").text(title));
        return this;
    };

    this.subtitle = (subtitle) => {
        elementContent.append($("<h3 />").text(subtitle));
        return this;
    };

    this.label = (content) => {
        var span = $("<span />").addClass("label").text(content);
        elementContent.append(span);
        return span;
    };

    this.canvas = (width, height) => {
        width = width || 250;
        height = height || 250;
        var canvas = $("<canvas />").attr({
            width: width,
            height: height
        }).addClass("chart");
        elementContent.append(canvas);
        return canvas.get(0);
    };

    this.gamification = (type) => {
        this.newContent();
        var icon = $("<i />")
            .addClass(gamificationIcons[type] || type)
            .addClass("gamification");
        elementContent.append(icon).addClass("container-gamification");
        return icon;
    };

    this.paragraph = (text) => {
        var p = $("<p />").html(text);
        elementContent.append(p);
        return p;
    };

    this.timeline = (controller) => {
        var timeline = controller.call("timeline");
        elementContent.append(timeline.element());
        return timeline;
    };

    this.form = (controller) => {
        return new Form({
            element: this.content,
            close: this.close
        }, controller);
    };

    this.button = (name, action) => {
        var button = $("<button />").text(name).click((e) => {
            e.preventDefault();
            action();
        }).addClass("button");
        buttonElement().append(button);
        return button;
    };

    this.content = () => {
        return elementContent;
    };

    this.element = () => {
        return universalContainer;
    };

    this.newAction = (icon, action) => {
        elementActions.prepend($("<li />").append($("<i />").addClass("fa " + icon)).click((e) => {
            e.preventDefault();
            action();
        }));
        return this;
    };

    this.action = this.newAction;

    this.close = () => {
        if (this.onClose) {
            this.onClose();
        }
        universalContainer.remove();
    };

    if (typeof closeable === "undefined" || closeable) {
        /* closeable */
        this.newAction("fa-times", () => {
            this.close();
        });
    }

    return this;
};

module.exports = (controller) => {

    controller.registerCall("report", (title, subtitle, paragraph, closeable) => {
        var model = new ReportModel(closeable);
        if (title) {
            model.title(title);
        }

        if (subtitle) {
            model.subtitle(subtitle);
        }

        if (paragraph) {
            model.paragraph(paragraph);
        }

        return model;
    });

};
