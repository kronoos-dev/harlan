var KronoosElement = function(title, subtitle, sidenote) {

    var container = $("<div />").addClass("container"),
        content = $("<div />").addClass("content"),
        element = $("<div />").addClass("kronoos-element"),
        sideContent = $("<div />").addClass("kronoos-side-content full");

    sideContent.append($("<h3 />").text(title).addClass("kronoos-element-title"))
        .append($("<h4 />").text(subtitle).addClass("kronoos-element-subtitle"))
        .append($("<h5 />").text(sidenote).addClass("kronoos-element-sidenote"));

    container.append(content.append(element.append(sideContent)));

    var label = (label) => {
        return $("<label />").text(label);
    };

    this.table = (...header) => {
        var table = $("<table />").addClass("multi-label"),
            thead = $("<thead />"),
            headRow = $("<tr />"),
            tbody = $("<tbody />");

        for (let item of header) {
            headRow.append($("<td />").append(label(item)));
        }

        table.append(thead.append(headRow)).append(tbody);

        let addItem = (...items) => {
            let row = $("<tr />");
            for (let item of items) {
                row.append($("<td />").html(item));
            }
            tbody.append(row);
            return addItem;
        };

        sideContent.append(table);

        return addItem;
    }

    this.picture = (url) => {
        var image = new Image();
        image.onload = () => {
            let picture = $("<div />")
                .addClass("kronoos-picture")
                .css("background-image", `url(${url})`);
            sideContent.removeClass("full");
            $("<div />").addClass("kronoos-side-picture").append(picture).insertBefore(sideContent);
        };
        image.src = url;
    };

    this.list = (name) => {
        let title = label(name),
            list = $("<ul />");

        sideContent.append(title).append(list);

        let addItem = (content) => {
            list.append($("<li />").html(content));
            return addItem;
        };

        return addItem;
    };

    this.paragraph = (content) => {
        sideContent.append($("<p />").html(content));
        return this;
    };

    this.element = () => {
        return container;
    };

    return this;
}

module.exports = (controller) => {
    controller.registerCall("kronoos::element", function() {
        return new KronoosElement(...arguments);
    });
}
