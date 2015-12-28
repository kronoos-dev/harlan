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


var header = function (name, description, subdescription, section, disableDefaultActions, metadata) {
    var header = $("<header />"),
            headerContainer = $("<div />").addClass("container"),
            headerContent = $("<div />").addClass("content"),
            metadataElements = $("<ul />").addClass("metadata"),
            actions = $("<ul />").addClass("actions");

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


    if (metadata.length) {
        for (var i in metadata) {
            metadataElements.append($("<li />").text(metadata[i]));
        }
    }

    headerContent.append(metadataElements);
    headerContent.append(actions);
    headerContainer.append(headerContent);
    header.append(headerContainer);



    return [header, actions, metadataElements];
};

var section = function (name, description, subdescription, disableDefaultActions, metadata) {
    var section = $("<section />").addClass("group-type");
    var results = $("<section />").addClass("results");

    var data = header(name, description, subdescription, section, disableDefaultActions, metadata || []);

    section.append(data[0]);
    section.append(results);

    return [section, results, data[1]];
};

module.exports = function (controller) {

    controller.registerCall("section::spinner", function (element) {
        var item = $("<li />").addClass("display-loader").append($("<i />").addClass("fa fa-spinner fa-spin"));
        element.append(item);
        return function () {
            item.remove();
        };
    });

    controller.registerCall("section", function (name, description, subdescription, disableDefaultActions) {
        return section(name, description, subdescription, disableDefaultActions);
    });

};