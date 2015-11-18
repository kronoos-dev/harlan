var factoryShowForm = function (section, button) {
    return function (e) {
        e.preventDefault();
        var iButton = button.find("i");
        var flipElements = section.find("form, section, footer");
        if (iButton.hasClass("fa-minus-square-o")) {
            flipElements.hide();
            iButton.removeClass().addClass("fa fa-plus-square-o");
        } else {
            iButton.removeClass().addClass("fa fa-minus-square-o");
            flipElements.show();
        }
    };
};

var factoryCloseSection = function (section) {
    return function (e) {
        e.preventDefault();
        section.remove();
    };
};


var header = function (name, description, subdescription, disableDefaultActions, section) {
    var header = $("<header />");
    var headerContainer = $("<div />").addClass("container");
    var headerContent = $("<div />").addClass("content");

    var actions = $("<ul />").addClass("actions");

    if (!disableDefaultActions) {

        if (section) {
            var maximizeButton = $("<li />").addClass("action-resize").append($("<i />").addClass("fa fa-minus-square-o"));
            actions.append(maximizeButton);
            maximizeButton.click(factoryShowForm(section, maximizeButton));
            actions.append($("<li />").addClass("action-close").append($("<i />").addClass("fa fa-times-circle")).click(factoryCloseSection(section)));
        }

    }

    if (name) {
        headerContent.append($("<h2 />").text(name));
    }

    if (description) {
        headerContent.append($("<h3 />").text(description));
    }

    if (subdescription) {
        headerContent.append($("<div />").addClass("results-display").text(subdescription));
    }

    headerContent.append(actions);


    headerContainer.append(headerContent);
    header.append(headerContainer);

    return [header, actions];
};

var section = function (name, description, subdescription, disableDefaultActions) {
    var section = $("<section />").addClass("group-type");
    var results = $("<section />").addClass("results");

    var data = header(name, description, subdescription, disableDefaultActions, section);

    section.append(data[0]);
    section.append(results);

    return [section, results, data[1]];
};

module.exports = function (controller) {

    controller.registerCall("section", function (name, description, subdescription, disableDefaultActions) {
        return section(name, description, subdescription, disableDefaultActions);
    });

};