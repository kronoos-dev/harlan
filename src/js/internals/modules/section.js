var factoryShowForm = function (section, button) {
    var minimized = section.hasClass("minimized"),
            iButton = button.find("i");

    return function (e) {
        if (e) {
            e.preventDefault();
        }

        if (!minimized) {
            iButton.removeClass().addClass("fa fa-plus-square-o");
            section.addClass("minimized");
            minimized = true;
        } else {
            iButton.removeClass().addClass("fa fa-minus-square-o");
            section.removeClass("minimized");
            minimized = false;
        }
    };
};

var factoryCloseSection = function (section) {
    return function (e) {
        e.preventDefault();
        section.remove();
    };
};


var header = function (name, description, subdescription, section, disableDefaultActions, minimized) {
    var header = $("<header />"),
            headerContainer = $("<div />").addClass("container"),
            headerContent = $("<div />").addClass("content"),
            metadataElements = $("<ul />").addClass("metadata"),
            actions = $("<ul />").addClass("actions"),
            formShow = null;

    if (!disableDefaultActions) {
        var maximizeButton = $("<li />").addClass("action-resize").append($("<i />").addClass("fa fa-minus-square-o"));
        actions.append(maximizeButton);
        actions.append($("<li />").addClass("action-close").append($("<i />").addClass("fa fa-times-circle")).click(factoryCloseSection(section)));
        formShow = factoryShowForm(section, maximizeButton);
        maximizeButton.click(formShow);
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


    headerContent.append(metadataElements);
    headerContent.append(actions);
    headerContainer.append(headerContent);
    header.append(headerContainer);

    if (minimized && formShow) {
        formShow();
    }

    return [header, actions, metadataElements];
};

var section = function (name, description, subdescription, disableDefaultActions, minimized) {
    var section = $("<section />").addClass("group-type");
    var results = $("<section />").addClass("results");

    var data = header(name, description, subdescription, section, disableDefaultActions, minimized);

    section.append(data[0]);
    section.append(results);

    return [section, results, data[1]];
};

module.exports = function (controller) {

    controller.registerCall("section", function (name, description, subdescription, disableDefaultActions, minimized) {
        return section(name, description, subdescription, disableDefaultActions, minimized);
    });

};
