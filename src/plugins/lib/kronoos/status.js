module.exports = controller => {

    const searchBar = $('.kronoos-application .search-bar');
    const searchBarContainer = $('.kronoos-application .search-bar .container');
    const loader = $('.kronoos-application .kronoos-q-container i.status-icon');
    const logo = $('.kronoos-application .kronoos-q-container img.kronoos-logo');

    var iterations = 0;

    controller.registerCall('kronoos::status::ajax', (icon, status, dict = {}) => {
        let kronoosStatus = controller.call('kronoos::status', icon, status, dict);
        let complete = dict.complete;

        dict.complete = function () {
            if (complete) complete(...arguments);
            kronoosStatus();
        };

        return dict;
    });

    controller.registerCall('kronoos::status', (icon, status, obj = {}) => {
        var it = iterations++;
        if (!it) {
            loader.show();
            logo.hide();
        }

        var statusMessage = $('<div />').addClass('status-message');
        var container = $('<div />').addClass('container');
        var content = $('<div />').addClass('content');
        var iconElement = $('<i />').addClass(`fa ${icon}`);

        iconElement.click(e => {
            e.preventDefault();
            if (searchBar.hasClass('showAll')) {
                searchBar.removeClass('showAll');
            } else {
                searchBar.addClass('showAll');
            }
        });

        statusMessage.append(container.append(content.text(status).prepend(iconElement)))
            .insertAfter(searchBarContainer);

        obj.statusElement = statusMessage;

        return () => {
            statusMessage.remove();
            if (!--iterations) {
                loader.hide();
                logo.show();
            }
        };
    });
};
