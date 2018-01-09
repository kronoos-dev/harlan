const factoryShowForm = (section, button) => {
    let minimized = section.hasClass('minimized');
    const iButton = button.find('i');

    return e => {
        if (e) {
            e.preventDefault();
        }

        if (!minimized) {
            iButton.removeClass().addClass('fa fa-plus-square-o');
            section.addClass('minimized');
            minimized = true;
        } else {
            iButton.removeClass().addClass('fa fa-minus-square-o');
            section.removeClass('minimized');
            minimized = false;
        }
    };
};

const factoryCloseSection = section => e => {
    e.preventDefault();
    section.remove();
};

const header = (
    name,
    description,
    subdescription,
    section,
    disableDefaultActions,
    minimized
) => {
    const header = $('<header />');
    const headerContainer = $('<div />').addClass('container');
    const headerContent = $('<div />').addClass('content');
    const metadataElements = $('<ul />').addClass('metadata');
    const actions = $('<ul />').addClass('actions');
    let formShow = null;

    headerContent.append(actions);

    if (!disableDefaultActions) {
        const maximizeButton = $('<li />').addClass('action-resize').append($('<i />').addClass('fa fa-minus-square-o'));
        actions.append(maximizeButton);
        actions.append($('<li />').addClass('action-close').append($('<i />').addClass('fa fa-times-circle')).click(factoryCloseSection(section)));
        formShow = factoryShowForm(section, maximizeButton);
        maximizeButton.click(formShow);
    }

    if (name) {
        headerContent.append($('<h2 />').text(name));
    }

    if (description) {
        headerContent.append($('<h3 />').text(description));
    }

    if (subdescription) {
        headerContent.append($('<div />').addClass('results-display').text(subdescription));
    }

    headerContent.append(metadataElements);
    headerContainer.append(headerContent);
    header.append(headerContainer);

    if (minimized && formShow) {
        formShow();
    }

    return [header, actions, metadataElements];
};

const section = (name, description, subdescription, disableDefaultActions, minimized) => {
    const section = $('<section />').addClass('group-type');
    const results = $('<section />').addClass('results');

    const data = header(name, description, subdescription, section, disableDefaultActions, minimized);

    section.append(data[0]);
    section.append(results);

    return [section, results, data[1]];
};

module.exports = controller => {

    controller.registerCall('section', (name, description, subdescription, disableDefaultActions, minimized) => section(name, description, subdescription, disableDefaultActions, minimized));

};
